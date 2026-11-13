(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.YiCanCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CUSTOM_STORAGE_KEY = "yican_custom_recipes_v1";
  const FAVORITES_STORAGE_KEY = "yican_favorites_v1";
  const RECENT_STORAGE_KEY = "yican_recent_v1";
  const TIMER_STORAGE_KEY = "yican_cooking_timer_v1";
  const OVERRIDES_STORAGE_KEY = "yican_recipe_overrides_v1";
  const EDITOR_DRAFTS_STORAGE_KEY = "yican_recipe_editor_drafts_v1";
  const INBOX_STORAGE_KEY = "yican_recipe_inbox_v1";
  const BACKUP_FORMAT = "yican-backup";
  const BACKUP_VERSION = 1;
  const RECENT_LIMIT = 20;
  const IMPORT_COLORS = [["#8a5141", "#d48250"], ["#3f6a5c", "#77a87d"], ["#65518a", "#a477a8"]];

  function clean(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizeRecipeReference(raw) {
    if (!raw || typeof raw !== "object") return null;
    const title = clean(raw.title).slice(0, 120);
    const url = clean(raw.url);
    const note = clean(raw.note).slice(0, 120);
    if (!title || !/^https:\/\/laocp\.tech\/\?recipe=[a-z0-9_-]+$/i.test(url)) return null;
    return {title, url, note};
  }

  function applyRecipeEnrichments(recipes, enrichments) {
    const source = Array.isArray(recipes) ? recipes : [];
    const overlays = enrichments && typeof enrichments === "object" ? enrichments : {};
    return source.map(recipe => {
      const overlay = overlays[String(recipe?.id)];
      if (!overlay || typeof overlay !== "object") return recipe;
      const ingredients = (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map(item => ({...item}));
      const operations = (Array.isArray(overlay.operations) ? overlay.operations : [])
        .map(operation => ({...operation, at:Number(operation?.at)}))
        .filter(operation => Number.isInteger(operation.at) && operation.at >= 0 && operation.at < ingredients.length && Array.isArray(operation.with))
        .sort((left, right) => right.at - left.at);
      for (const operation of operations) {
        const replacements = operation.with.map(item => ({
          name:clean(item?.name).slice(0, 120),
          amount:clean(item?.amount).slice(0, 160),
          optional:Boolean(item?.optional)
        })).filter(item => item.name);
        if (replacements.length) ingredients.splice(operation.at, 1, ...replacements);
      }
      const reference = normalizeRecipeReference(overlay.reference);
      return {...recipe, ingredients, ...(reference ? {reference} : {})};
    });
  }

  function normalizeBaseServings(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 1;
    return Math.max(0.5, Math.min(50, Math.round(number * 2) / 2));
  }

  function formatScaledNumber(value) {
    if (!Number.isFinite(value)) return "";
    const rounded = Math.abs(value - Math.round(value)) < 0.0001
      ? Math.round(value)
      : Number(value.toFixed(Math.abs(value) < 10 ? 2 : 1));
    return String(rounded);
  }

  function scaleAmount(amount, ratio) {
    const source = clean(amount);
    const multiplier = Number(ratio);
    if (!source || !Number.isFinite(multiplier) || multiplier <= 0 || Math.abs(multiplier - 1) < 0.0001) return source;
    return source.replace(/\d+(?:\.\d+)?\s*(?:[-–~至到]\s*\d+(?:\.\d+)?|\/\s*\d+)|\d+(?:\.\d+)?|半/g, (token, offset, whole) => {
      const before = whole[offset - 1] || "";
      const after = whole[offset + token.length] || "";
      if (before === ":" || after === ":" || /[%℃°]/.test(after)) return token;
      if (token === "半") return formatScaledNumber(0.5 * multiplier);
      const range = token.match(/^(\d+(?:\.\d+)?)\s*([-–~至到])\s*(\d+(?:\.\d+)?)$/);
      if (range) return `${formatScaledNumber(Number(range[1]) * multiplier)}${range[2]}${formatScaledNumber(Number(range[3]) * multiplier)}`;
      const fraction = token.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (fraction && Number(fraction[2])) return formatScaledNumber((Number(fraction[1]) / Number(fraction[2])) * multiplier);
      return formatScaledNumber(Number(token) * multiplier);
    });
  }

  function normalizeEditorDraft(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const ref = clean(raw.ref) || "new";
    if (ref !== "new" && !/^(builtin|custom):\d+$/.test(ref)) return null;
    if (!raw.snapshot || typeof raw.snapshot !== "object" || Array.isArray(raw.snapshot)) return null;
    const updatedAt = clean(raw.updatedAt) || new Date().toISOString();
    return {ref, updatedAt, snapshot:raw.snapshot};
  }

  function parseEditorDrafts(storage) {
    let value;
    try { value = JSON.parse(storage.getItem(EDITOR_DRAFTS_STORAGE_KEY) || "{}"); } catch (_) { return {}; }
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const result = {};
    for (const [key, raw] of Object.entries(value)) {
      const draft = normalizeEditorDraft(raw);
      if (draft && key === draft.ref) result[key] = draft;
    }
    return result;
  }

  function normalizeInboxItem(raw, index = 0) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const id = clean(raw.id) || `inbox-${Date.now()}-${index}`;
    if (!/^[a-zA-Z0-9_-]{6,100}$/.test(id)) return null;
    const status = ["pending","review","completed"].includes(raw.status) ? raw.status : "pending";
    const imageTokens = (Array.isArray(raw.imageTokens) ? raw.imageTokens : []).map(clean).filter(value=>/^[a-f0-9-]{36}-\d+\.jpg$/.test(value)).slice(0,6);
    const issues = (Array.isArray(raw.issues) ? raw.issues : []).map(clean).filter(Boolean).slice(0,30);
    const recipeRefValue = /^(builtin|custom):\d+$/.test(clean(raw.recipeRef)) ? clean(raw.recipeRef) : "";
    return {
      id,
      status,
      createdAt:clean(raw.createdAt) || new Date().toISOString(),
      updatedAt:clean(raw.updatedAt) || clean(raw.createdAt) || new Date().toISOString(),
      title:clean(raw.title).slice(0,120),
      subject:clean(raw.subject).slice(0,240),
      sourceUrl:extractFirstUrl(raw.sourceUrl || raw.sharedText || ""),
      sharedText:clean(raw.sharedText).slice(0,30000),
      ocrText:clean(raw.ocrText).slice(0,30000),
      imageTokens,
      issues,
      recipeRef:recipeRefValue
    };
  }

  function extractFirstUrl(value) {
    const match=clean(value).match(/https?:\/\/[^\s<>"']+/i);
    return match ? match[0].replace(/[，。；、）)]+$/,"") : "";
  }

  function collectedSource(url) {
    try {
      const host=new URL(url).hostname.toLowerCase();
      if(host.includes("bilibili.com")||host==="b23.tv")return "哔哩哔哩";
      if(host.includes("douyin.com"))return "抖音";
      if(host.includes("xiaohongshu.com")||host==="xhslink.com")return "小红书";
      if(host.includes("kuaishou.com"))return "快手";
      return host.replace(/^www\./,"").slice(0,40) || "视频分享";
    } catch (_) { return "视频分享"; }
  }

  function parseCollectedRecipe(raw) {
    const item=normalizeInboxItem({...raw,id:clean(raw?.id)||`inbox-${Date.now()}`}) || {};
    const combined=[item.sharedText,item.ocrText].filter(Boolean).join("\n");
    const lines=combined.split(/\r?\n/).map(value=>clean(value).replace(/^[•·●▪◆◇★*-]+\s*/,"")).filter(Boolean);
    let mode="", title=clean(item.title||item.subject).replace(/https?:\/\/\S+/g,"").replace(/[|｜].*$/,"").trim();
    if(!title){const candidate=lines.find(line=>line.length<=40&&!/食材|用料|配料|步骤|做法|tips?/i.test(line));title=candidate||"待整理菜谱";}
    title=title.replace(/^(分享|转发)[:：]?\s*/,"").slice(0,60) || "待整理菜谱";
    const ingredients=[], steps=[], tips=[], issues=[];
    const ingredientKeys=new Set();
    const amountPattern=/([^，,；;。:\n]{1,18}?)[：:\s]*((?:\d+(?:\.\d+)?(?:[-–~至到]\d+(?:\.\d+)?)?\s*(?:克|g|kg|千克|毫升|ml|升|l|个|只|根|颗|勺|片|粒|斤|两|碗|杯|盒|块|张)|半(?:个|根|只|颗|勺|斤)?|适量|少许))/gi;
    for(const original of lines){
      const line=original.replace(/\s+/g," ").trim();
      if(/[�□■▢]/.test(line)||(/\b[a-z]\b/i.test(line)&&/[\u4e00-\u9fff]/.test(line)))issues.push(`请复核：${line}`);
      if(/^(食材|用料|配料|原料)/i.test(line)){mode="ingredients";continue;}
      if(/^(步骤|做法|制作|烹饪)/i.test(line)){mode="steps";continue;}
      if(/^tips?[:：]?/i.test(line)){mode="tips";const value=line.replace(/^tips?[:：]?/i,"").trim();if(value)tips.push(value);continue;}
      if(mode==="tips"){tips.push(line);continue;}
      let matched=false, match;
      amountPattern.lastIndex=0;
      while((match=amountPattern.exec(line))){
        const name=match[1].replace(/^[，,；;。\s]+/,"").replace(/[（(].*$/,"").trim().slice(-18);
        const amount=match[2].trim();
        const key=name.toLowerCase();
        if(name&&amount&&!ingredientKeys.has(key)&&!/时间|分钟|小时/.test(name)){ingredients.push({name,amount,optional:false});ingredientKeys.add(key);matched=true;}
      }
      if(mode==="ingredients"&&matched)continue;
      const stepLike=mode==="steps"||/^[(（]?\d{1,2}[:：.]\d{1,2}[)）]?/.test(line)||/^(第?\d+[步、.：:]|一、|二、|三、|四、|五、)/.test(line);
      if(stepLike||(!matched&&line.length>=14&&/放入|加入|倒入|切|炒|煮|焯|烧|蒸|腌|搅拌|调味/.test(line))){
        const cleaned=line.replace(/^[(（]?\d{1,2}[:：.]\d{1,2}[)）]?\s*/,"").replace(/^(第?\d+[步、.：:]|[一二三四五六七八九十]+、)\s*/,"");
        const parts=cleaned.split(/[：:]/,2);steps.push([parts.length>1&&parts[0].length<=12?parts[0]:`第 ${steps.length+1} 步`,parts.length>1&&parts[0].length<=12?cleaned.slice(parts[0].length+1).trim():cleaned]);
      }
    }
    if(!ingredients.length)ingredients.push({name:"待补充食材",amount:"适量",optional:false});
    if(!steps.length)steps.push(["第 1 步","请根据原视频或配方截图补充具体做法"]);
    const sourceUrl=item.sourceUrl||extractFirstUrl(combined);
    const classified=classifyRecipe({name:title,ingredients});
    return {id:Date.now(),name:title,emoji:"🍽️",time:20,difficulty:"简单",baseServings:1,source:collectedSource(sourceUrl),video:sourceUrl,description:"通过快速收集导入，请在保存前核对食材和步骤。",flavors:["待整理"],ingredients,steps,tips,category:classified.category,mainIngredients:classified.mainIngredients,issues};
  }

  const MEAT_GROUPS = [
    ["猪肉", /猪|五花肉|里脊|通脊|排骨|肘子|猪蹄|猪手|大肠|肥肠|猪肝|腰花|肉馅|肉丸|肉丝|酥肉|腐乳肉|红烧肉|扣肉|回锅肉|咕佬肉|樱桃肉|焖肉/],
    ["牛肉", /牛肉|牛腩|牛肋|牛板腱|肥牛|牛外脊/],
    ["羊肉", /羊肉|羊排|羊腿|羊外脊/],
    ["鸡肉", /鸡/],
    ["鸭肉", /鸭肉|整鸭|老鸭/],
    ["鱼类", /鱼|鳜鱼|桂鱼|鲤鱼|鲫鱼|鲈鱼|带鱼|黄鱼|鱼头/],
    ["虾类", /虾|虾仁|小龙虾/],
    ["蟹类", /蟹|螃蟹/],
    ["海鲜", /鲍鱼|海参|海蜇|鱿鱼|贝|蛤|蚌/]
  ];
  const MAIN_GROUPS = [
    ["豆制品", /豆腐|豆干|干豆腐|腐竹|豆皮/], ["鸡蛋", /鸡蛋|蛋花|炒蛋|荷包蛋|茶叶蛋|咸蛋|皮蛋|松花蛋|金钱蛋/],
    ["土豆", /土豆|洋芋/], ["番茄", /番茄|西红柿/], ["茄子", /茄子/], ["白菜", /白菜|娃娃菜|莲花白|菜心/],
    ["辣椒", /青椒|尖椒|辣椒|椒/], ["黄瓜", /黄瓜/], ["萝卜", /萝卜/], ["菌菇", /蘑菇|香菇|金针菇|菌/],
    ["面食", /面条|炒面|拌面|疙瘩|馒头|面粉|菜蟒/], ["米类", /米饭|大米|糯米|黄米|焖饭|炒饭|粽子|锅巴/],
    ["豆芽", /豆芽/], ["冬瓜", /冬瓜/], ["韭菜", /韭菜/], ["菠菜", /菠菜/], ["西兰花", /西兰花/],
    ["绿豆", /绿豆/], ["卷心菜", /圆白菜|卷心菜/], ["笋", /鲜笋|冬笋|青笋|莴笋/], ["大蒜", /腊八蒜/]
  ];
  const NON_MAIN = /^(水|油|食用油|葱油|盐|糖|白糖|冰糖|味精|鸡精|淀粉|生粉|面粉|葱|姜|蒜|花椒|大料|八角|酱油|生抽|老抽|醋|料酒|花雕酒|胡椒粉|调料|用量详见来源视频)$/;

  function classifyRecipe(recipe) {
    const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
    const names = [clean(recipe?.name), ...ingredients.map(item => clean(typeof item === "string" ? item : item?.name))].filter(Boolean);
    const combined = names.join(" ").replace(/鸡精/g, "").replace(/鸡蛋|鸭蛋|鹌鹑蛋|咸蛋|皮蛋|松花蛋/g, "蛋").replace(/鱼香/g, "");
    const detectedMeat = MEAT_GROUPS.filter(([, pattern]) => pattern.test(combined)).map(([label]) => label);
    const requestedCategory = clean(recipe?.category);
    const category = requestedCategory === "荤" || requestedCategory === "素" ? requestedCategory : (detectedMeat.length ? "荤" : "素");
    const explicit = (Array.isArray(recipe?.mainIngredients) ? recipe.mainIngredients : clean(recipe?.mainIngredients).split(/[，,、]/))
      .map(clean).filter(Boolean).filter((value, index, values) => values.indexOf(value) === index).slice(0, 6);
    if (explicit.length) return {category, mainIngredients:explicit};

    const inferred = [];
    const add = value => { if (value && !inferred.includes(value)) inferred.push(value); };
    if (category === "荤") detectedMeat.forEach(add);
    for (const value of [names[0], ...names.slice(1,5)]) {
      const group = MAIN_GROUPS.find(([, pattern]) => pattern.test(value));
      if (group) add(group[0]);
      if (inferred.length >= 2) break;
    }
    if (!inferred.length) {
      for (const item of ingredients) {
        const value = clean(typeof item === "string" ? item : item?.name).replace(/[（(].*$/, "").replace(/^[:：]/, "").trim();
        if (!value || NON_MAIN.test(value) || /详见|配料|调料|腌制|和面/.test(value)) continue;
        add(value.slice(0, 10));
        if (inferred.length >= 2) break;
      }
    }
    return {category, mainIngredients:inferred.length ? inferred.slice(0, 2) : ["其他"]};
  }

  function normalizeImportedRecipe(raw, index = 0, preserveId = false) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error(`第 ${index + 1} 份菜谱不是有效对象`);
    const name = clean(raw.name);
    if (!name) throw new Error(`第 ${index + 1} 份菜谱缺少 name`);
    if (!Array.isArray(raw.ingredients) || !raw.ingredients.length) throw new Error(`${name} 缺少 ingredients`);
    if (!Array.isArray(raw.steps) || !raw.steps.length) throw new Error(`${name} 缺少 steps`);

    const ingredients = raw.ingredients.map((item, itemIndex) => {
      if (typeof item === "string") {
        const ingredientName = clean(item);
        if (!ingredientName) throw new Error(`${name} 的第 ${itemIndex + 1} 项食材无效`);
        return {name: ingredientName, amount: "适量", optional: false};
      }
      if (!item || typeof item !== "object" || !clean(item.name)) throw new Error(`${name} 的第 ${itemIndex + 1} 项食材无效`);
      return {name: clean(item.name), amount: clean(item.amount) || "适量", optional: Boolean(item.optional)};
    });
    const steps = raw.steps.map((item, stepIndex) => {
      if (typeof item === "string" && clean(item)) return [`第 ${stepIndex + 1} 步`, clean(item)];
      if (Array.isArray(item) && item.length >= 2 && clean(item[1])) {
        return withStepMeta([clean(item[0]) || `第 ${stepIndex + 1} 步`, clean(item[1])], item[2], item[3]);
      }
      if (item && typeof item === "object" && clean(item.description || item.content)) {
        return withStepMeta(
          [clean(item.title) || `第 ${stepIndex + 1} 步`, clean(item.description || item.content)],
          item.durationSeconds ?? item.duration,
          item.videoTimestampSeconds ?? item.videoTimestamp ?? item.timestamp
        );
      }
      throw new Error(`${name} 的第 ${stepIndex + 1} 个步骤无效`);
    });
    const time = Math.max(1, Math.min(1440, Number.parseInt(raw.time, 10) || 20));
    const flavors = Array.isArray(raw.flavors)
      ? raw.flavors.slice(0, 6).map(clean).filter(Boolean)
      : ["我的菜谱"];
    const savedId = Number(raw.id);
    const id = preserveId && Number.isSafeInteger(savedId) && savedId > 0 ? savedId : Date.now() + index;
    const normalized = {
      id,
      name,
      emoji: clean(raw.emoji || "🍽️").slice(0, 8),
      time,
      difficulty: clean(raw.difficulty || "简单").slice(0, 12),
      flavors: flavors.length ? flavors : ["我的菜谱"],
      source: clean(raw.source || "我的菜谱").slice(0, 40),
      description: clean(raw.description || "保存在本机的个人菜谱").slice(0, 500),
      baseServings: normalizeBaseServings(raw.baseServings),
      ingredients,
      steps,
      tips: (Array.isArray(raw.tips) ? raw.tips : (clean(raw.tips) ? [raw.tips] : []))
        .slice(0, 12).map(value => clean(value).slice(0, 300)).filter(Boolean),
      video: typeof raw.video === "string" && /^https:\/\//i.test(raw.video) ? raw.video : "",
      reference: normalizeRecipeReference(raw.reference),
      colors: Array.isArray(raw.colors) && raw.colors.length >= 2
        ? [clean(raw.colors[0]), clean(raw.colors[1])]
        : IMPORT_COLORS[index % IMPORT_COLORS.length],
      custom: true
    };
    Object.assign(normalized, classifyRecipe({...normalized, category:raw.category, mainIngredients:raw.mainIngredients}));
    return normalized;
  }

  function normalizeRecipeOverride(raw, index = 0) {
    const normalized = normalizeImportedRecipe(raw, index, true);
    if (!Number.isSafeInteger(Number(raw?.id)) || Number(raw.id) <= 0) throw new Error("修改菜谱缺少有效 ID");
    normalized.id = Number(raw.id);
    normalized.custom = false;
    normalized.override = true;
    return normalized;
  }

  function withDuration(step, rawDuration) {
    if (rawDuration == null || rawDuration === "") return step;
    const seconds = Number.parseInt(rawDuration, 10);
    return Number.isInteger(seconds) && seconds >= 1 && seconds <= 14400 ? [...step, seconds] : step;
  }

  function parseTimestamp(rawTimestamp) {
    if (rawTimestamp == null || rawTimestamp === "") return null;
    if (typeof rawTimestamp === "string" && rawTimestamp.includes(":")) {
      const parts = rawTimestamp.split(":").map(value => Number.parseInt(value, 10));
      if (parts.some(value => !Number.isInteger(value) || value < 0) || parts.length < 2 || parts.length > 3) return null;
      const seconds = parts.reduce((total, value) => total * 60 + value, 0);
      return seconds <= 86400 ? seconds : null;
    }
    const seconds = Number.parseInt(rawTimestamp, 10);
    return Number.isInteger(seconds) && seconds >= 0 && seconds <= 86400 ? seconds : null;
  }

  function withStepMeta(step, rawDuration, rawTimestamp) {
    const timed = withDuration(step, rawDuration);
    const timestamp = parseTimestamp(rawTimestamp);
    if (timestamp == null) return timed;
    if (timed.length < 3) timed.push(null);
    timed.push(timestamp);
    return timed;
  }

  function keywordTerms(query) {
    return clean(query).toLowerCase().split(/[\s，、,；;]+/).filter(Boolean);
  }

  function searchRecipesByKeyword(recipes, query) {
    const list = Array.isArray(recipes) ? recipes : [];
    const terms = keywordTerms(query);
    if (!terms.length) return list.map(recipe => ({recipe, score:0, matches:[]}));
    return list.map(recipe => {
      const fields = [
        {label:"菜名", weight:100, values:[recipe.name]},
        {label:"食材", weight:70, values:(recipe.ingredients || []).flatMap(item => [item?.name, item?.amount])},
        {label:"口味", weight:55, values:recipe.flavors || []},
        {label:"做法", weight:40, values:(recipe.steps || []).flatMap(step => Array.isArray(step) ? [step[0], step[1]] : [step?.title, step?.description, step?.content])},
        {label:"介绍", weight:30, values:[recipe.description]},
        {label:"提示", weight:25, values:recipe.tips || []},
        {label:"来源", weight:15, values:[recipe.source]}
      ].map(field => ({...field, values:field.values.map(value => clean(value).toLowerCase()).filter(Boolean)}));
      let score = 0;
      const matches = new Set();
      for (const term of terms) {
        let best = 0;
        let bestLabel = "";
        for (const field of fields) {
          for (const value of field.values) {
            if (!value.includes(term)) continue;
            const candidate = field.weight + (value === term ? 20 : value.startsWith(term) ? 8 : 0);
            if (candidate > best) { best = candidate; bestLabel = field.label; }
          }
        }
        if (!best) return null;
        score += best;
        matches.add(bestLabel);
      }
      return {recipe, score, matches:[...matches]};
    }).filter(Boolean).sort((a, b) => b.score - a.score || Number(a.recipe.time || 0) - Number(b.recipe.time || 0) || clean(a.recipe.name).localeCompare(clean(b.recipe.name), "zh-CN"));
  }

  function paginate(items, requestedPage, requestedPageSize) {
    const list = Array.isArray(items) ? items : [];
    const pageSize = Math.max(1, Math.min(100, Number.parseInt(requestedPageSize, 10) || 6));
    const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
    const page = Math.max(1, Math.min(totalPages, Number.parseInt(requestedPage, 10) || 1));
    const start = (page - 1) * pageSize;
    return {items:list.slice(start, start + pageSize), page, pageSize, totalPages, totalItems:list.length};
  }

  function normalizeTimerState(raw, now = Date.now()) {
    if (!raw || typeof raw !== "object") return null;
    const recipeRef = clean(raw.recipeRef);
    const stepIndex = Number.parseInt(raw.stepIndex, 10);
    const durationSeconds = Number.parseInt(raw.durationSeconds, 10);
    const deadline = Number(raw.deadline);
    if (!/^(builtin|custom):\d+$/.test(recipeRef) || !Number.isInteger(stepIndex) || stepIndex < 0
      || !Number.isInteger(durationSeconds) || durationSeconds < 1 || durationSeconds > 14400
      || !Number.isFinite(deadline) || deadline <= 0) return null;
    const completedSteps=[...new Set((Array.isArray(raw.completedSteps)?raw.completedSteps:[])
      .map(value=>Number.parseInt(value,10)).filter(value=>Number.isInteger(value)&&value>=0))].sort((a,b)=>a-b);
    return {recipeRef, stepIndex, durationSeconds, deadline, remainingSeconds:Math.max(0, Math.ceil((deadline - now) / 1000)), completedSteps};
  }

  function recipeRef(recipe) {
    return `${recipe.custom ? "custom" : "builtin"}:${recipe.id}`;
  }

  function recipeIdentity(recipe) {
    return `${clean(recipe.name).toLowerCase()}|${clean(recipe.source).toLowerCase()}`;
  }

  function uniqueValidRefs(values, validRefs, limit) {
    const result = [];
    for (const value of Array.isArray(values) ? values : []) {
      const ref = clean(value);
      if (ref && validRefs.has(ref) && !result.includes(ref)) result.push(ref);
      if (limit && result.length >= limit) break;
    }
    return result;
  }

  function addRecent(recent, ref, validRefs) {
    if (!validRefs.has(ref)) return uniqueValidRefs(recent, validRefs, RECENT_LIMIT);
    return [ref, ...uniqueValidRefs(recent, validRefs).filter(item => item !== ref)].slice(0, RECENT_LIMIT);
  }

  function createBackup(customRecipes, favorites, recent, exportedAt, appVersion, recipeOverrides, inbox) {
    const normalized = (Array.isArray(customRecipes) ? customRecipes : []).map((recipe, index) => normalizeImportedRecipe(recipe, index, true));
    const normalizedOverrides = (Array.isArray(recipeOverrides) ? recipeOverrides : []).map(normalizeRecipeOverride);
    const validRefs = new Set(normalized.map(recipeRef));
    for (const ref of Array.isArray(favorites) ? favorites : []) if (String(ref).startsWith("builtin:")) validRefs.add(String(ref));
    for (const ref of Array.isArray(recent) ? recent : []) if (String(ref).startsWith("builtin:")) validRefs.add(String(ref));
    return {
      format: BACKUP_FORMAT,
      formatVersion: BACKUP_VERSION,
      exportedAt: exportedAt || new Date().toISOString(),
      appVersion: clean(appVersion) || "unknown",
      customRecipes: normalized,
      recipeOverrides: normalizedOverrides,
      favorites: uniqueValidRefs(favorites, validRefs),
      recent: uniqueValidRefs(recent, validRefs, RECENT_LIMIT),
      inbox:(Array.isArray(inbox)?inbox:[]).map(normalizeInboxItem).filter(Boolean).slice(0,200)
    };
  }

  function mergeBackup(current, backup, builtinRefs) {
    if (!backup || backup.format !== BACKUP_FORMAT || Number(backup.formatVersion) !== BACKUP_VERSION) {
      throw new Error("这不是受支持的一餐完整备份");
    }
    const currentRecipes = (current.customRecipes || []).map((recipe, index) => normalizeImportedRecipe(recipe, index, true));
    const incoming = Array.isArray(backup.customRecipes) ? backup.customRecipes : [];
    if (incoming.length > 1000) throw new Error("备份中的个人菜谱超过 1000 份");
    const resultRecipes = [...currentRecipes];
    const byId = new Map(resultRecipes.map(recipe => [recipe.id, recipe]));
    const byIdentity = new Map(resultRecipes.map(recipe => [recipeIdentity(recipe), recipe]));
    const mappedRefs = new Map();
    let added = 0;
    let skipped = 0;

    incoming.forEach((raw, index) => {
      const normalized = normalizeImportedRecipe(raw, index, true);
      const originalRef = `custom:${normalized.id}`;
      const sameIdentity = byIdentity.get(recipeIdentity(normalized));
      if (sameIdentity) {
        mappedRefs.set(originalRef, recipeRef(sameIdentity));
        skipped += 1;
        return;
      }
      if (byId.has(normalized.id)) normalized.id = nextAvailableId(byId, Date.now() + index);
      resultRecipes.push(normalized);
      byId.set(normalized.id, normalized);
      byIdentity.set(recipeIdentity(normalized), normalized);
      mappedRefs.set(originalRef, recipeRef(normalized));
      added += 1;
    });

    const validRefs = new Set([...(builtinRefs || []), ...resultRecipes.map(recipeRef)]);
    const mapRef = ref => mappedRefs.get(clean(ref)) || clean(ref);
    const favorites = uniqueValidRefs([
      ...(current.favorites || []),
      ...(backup.favorites || []).map(mapRef)
    ], validRefs);
    const recent = uniqueValidRefs([
      ...(backup.recent || []).map(mapRef),
      ...(current.recent || [])
    ], validRefs, RECENT_LIMIT);
    const currentOverrides = (current.recipeOverrides || []).map(normalizeRecipeOverride);
    const overridesById = new Map(currentOverrides.map(recipe => [recipe.id, recipe]));
    let overridesAdded = 0;
    for (const raw of Array.isArray(backup.recipeOverrides) ? backup.recipeOverrides : []) {
      const normalized = normalizeRecipeOverride(raw);
      if (!(builtinRefs || new Set()).has(`builtin:${normalized.id}`) || overridesById.has(normalized.id)) continue;
      overridesById.set(normalized.id, normalized);
      overridesAdded += 1;
    }
    const currentInbox=(Array.isArray(current.inbox)?current.inbox:[]).map(normalizeInboxItem).filter(Boolean);
    const inboxById=new Map(currentInbox.map(item=>[item.id,item]));
    const inboxByUrl=new Map(currentInbox.filter(item=>item.sourceUrl).map(item=>[item.sourceUrl,item]));
    for(const raw of Array.isArray(backup.inbox)?backup.inbox:[]){
      const normalized=normalizeInboxItem(raw,inboxById.size);
      if(!normalized||inboxById.has(normalized.id)||(normalized.sourceUrl&&inboxByUrl.has(normalized.sourceUrl)))continue;
      inboxById.set(normalized.id,normalized);
      if(normalized.sourceUrl)inboxByUrl.set(normalized.sourceUrl,normalized);
      if(inboxById.size>=200)break;
    }
    return {customRecipes: resultRecipes, recipeOverrides:[...overridesById.values()], favorites, recent, inbox:[...inboxById.values()], added, skipped, overridesAdded};
  }

  function importLegacy(current, value, builtinRefs) {
    const list = Array.isArray(value) ? value : [value];
    if (!list.length) throw new Error("文件中没有菜谱");
    if (list.length > 100) throw new Error("一次最多导入 100 份菜谱");
    const backup = createBackup(list.map((item, index) => normalizeImportedRecipe(item, index, false)), [], []);
    return mergeBackup(current, backup, builtinRefs);
  }

  function importFromText(current, text, builtinRefs) {
    if (!clean(text)) throw new Error("请先选择文件或粘贴 JSON 数据");
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (_) {
      throw new Error("JSON 格式有误，请检查括号、引号和逗号");
    }
    return parsed && parsed.format === BACKUP_FORMAT
      ? mergeBackup(current, parsed, builtinRefs)
      : importLegacy(current, parsed, builtinRefs);
  }

  function nextAvailableId(byId, initial) {
    let value = Math.max(1, Number(initial) || Date.now());
    while (byId.has(value)) value += 1;
    return value;
  }

  function parseStoredArray(storage, key) {
    try {
      const value = JSON.parse(storage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  }

  return {
    CUSTOM_STORAGE_KEY,
    FAVORITES_STORAGE_KEY,
    RECENT_STORAGE_KEY,
    TIMER_STORAGE_KEY,
    OVERRIDES_STORAGE_KEY,
    EDITOR_DRAFTS_STORAGE_KEY,
    INBOX_STORAGE_KEY,
    BACKUP_FORMAT,
    BACKUP_VERSION,
    RECENT_LIMIT,
    normalizeImportedRecipe,
    normalizeRecipeOverride,
    normalizeRecipeReference,
    applyRecipeEnrichments,
    normalizeBaseServings,
    scaleAmount,
    normalizeEditorDraft,
    parseEditorDrafts,
    normalizeInboxItem,
    extractFirstUrl,
    parseCollectedRecipe,
    classifyRecipe,
    recipeRef,
    recipeIdentity,
    uniqueValidRefs,
    addRecent,
    keywordTerms,
    searchRecipesByKeyword,
    paginate,
    normalizeTimerState,
    createBackup,
    mergeBackup,
    importFromText,
    parseStoredArray
  };
});
