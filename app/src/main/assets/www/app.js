const legacyBuiltInRecipes = [
  {id:1,name:"番茄炒蛋",emoji:"🍅",time:12,difficulty:"简单",flavors:["家常","下饭"],source:"特厨隋坡",description:"酸甜多汁，鸡蛋蓬松，是十几分钟就能上桌的家常菜。",ingredients:[{name:"番茄",amount:"2个"},{name:"鸡蛋",amount:"3个"},{name:"葱",amount:"1根",optional:true},{name:"盐",amount:"适量"},{name:"糖",amount:"少许",optional:true}],steps:[["炒鸡蛋","鸡蛋加少许盐打散，热锅热油炒至蓬松后盛出。"],["炒番茄","原锅放番茄块，中火炒出汁水。"],["合炒","倒回鸡蛋，加盐和少许糖翻匀，撒葱花出锅。"]],colors:["#e67d38","#c64332"]},
  {id:2,name:"宫保鸡丁",emoji:"🍗",time:28,difficulty:"适中",flavors:["川味","下饭"],source:"老饭骨",description:"鸡肉滑嫩、花生酥香，酸甜微辣的经典川味。",ingredients:[{name:"鸡胸肉",amount:"250克"},{name:"花生",amount:"50克"},{name:"黄瓜",amount:"半根"},{name:"干辣椒",amount:"6个"},{name:"生抽",amount:"1勺"},{name:"醋",amount:"1勺"}],steps:[["腌鸡丁","鸡肉切丁，加生抽和淀粉抓匀，腌10分钟。"],["爆香","锅中放油，下干辣椒小火炒香。"],["快速合炒","加入鸡丁炒熟，再放黄瓜、料汁和花生，大火收汁。"]],colors:["#7e2b22","#d47735"]},
  {id:3,name:"青椒肉丝",emoji:"🫑",time:20,difficulty:"简单",flavors:["快手","下饭"],source:"特厨隋坡",description:"青椒清脆，肉丝嫩滑，厨房新手也容易成功。",ingredients:[{name:"猪里脊",amount:"200克"},{name:"青椒",amount:"2个"},{name:"蒜",amount:"2瓣"},{name:"生抽",amount:"1勺"},{name:"淀粉",amount:"1小勺"}],steps:[["处理食材","里脊和青椒切丝，肉丝用生抽、淀粉腌制。"],["滑炒肉丝","热锅放油，将肉丝快速炒至变色后盛出。"],["合炒调味","爆香蒜末，炒青椒至断生，加入肉丝和盐翻匀。"]],colors:["#426a3e","#85a93a"]},
  {id:4,name:"麻婆豆腐",emoji:"🥘",time:25,difficulty:"适中",flavors:["川味","香辣"],source:"老饭骨",video:"https://www.bilibili.com/video/BV1it4y1X75m/",description:"豆腐嫩滑，酱香浓郁，一勺汤汁就能拌一碗饭。",ingredients:[{name:"嫩豆腐",amount:"1盒"},{name:"肉末",amount:"100克"},{name:"豆瓣酱",amount:"1勺"},{name:"花椒",amount:"少许"},{name:"蒜",amount:"2瓣"}],steps:[["豆腐焯水","豆腐切块，在淡盐水中焯一分钟。"],["炒制肉酱","肉末炒散，加入豆瓣酱、蒜末炒出红油。"],["烧制收汁","加水和豆腐烧5分钟，勾薄芡，撒花椒粉。"]],colors:["#a62f28","#e56c2e"]},
  {id:5,name:"可乐鸡翅",emoji:"🍖",time:35,difficulty:"简单",flavors:["甜咸","人气"],source:"老饭骨",description:"色泽红亮、甜咸入味，大人孩子都喜欢。",ingredients:[{name:"鸡翅",amount:"8个"},{name:"可乐",amount:"300毫升"},{name:"姜",amount:"3片"},{name:"生抽",amount:"2勺"},{name:"料酒",amount:"1勺"}],steps:[["煎鸡翅","鸡翅划刀，冷水焯净后煎至两面微黄。"],["加入调味","放姜、生抽和料酒，倒入可乐没过鸡翅。"],["焖煮收汁","中小火焖20分钟，最后大火收至汤汁浓稠。"]],colors:["#6c2e25","#b86232"]},
  {id:6,name:"蒜蓉西兰花",emoji:"🥦",time:12,difficulty:"简单",flavors:["清淡","素食"],source:"特厨隋坡",description:"清脆爽口，蒜香足，是荤菜旁边最舒服的一抹绿。",ingredients:[{name:"西兰花",amount:"1颗"},{name:"蒜",amount:"4瓣"},{name:"盐",amount:"适量"},{name:"蚝油",amount:"半勺",optional:true}],steps:[["焯西兰花","西兰花掰小朵，盐水浸泡后焯至翠绿。"],["爆香蒜末","热油小火炒香一半蒜末。"],["快速翻炒","放入西兰花、盐和蚝油，大火翻匀，出锅前放剩余蒜末。"]],colors:["#3c6b49","#73a942"]},
  {id:7,name:"土豆炖牛肉",emoji:"🍲",time:75,difficulty:"适中",flavors:["炖菜","浓香"],source:"特厨隋坡",description:"牛肉软烂，土豆吸满汤汁，适合周末慢慢炖一锅。",ingredients:[{name:"牛腩",amount:"500克"},{name:"土豆",amount:"2个"},{name:"胡萝卜",amount:"1根"},{name:"番茄",amount:"1个"},{name:"姜",amount:"4片"},{name:"八角",amount:"1个"}],steps:[["处理牛肉","牛腩冷水下锅焯净浮沫，捞出沥干。"],["炒香底料","炒香姜片和番茄，加入牛腩翻炒上色。"],["慢炖入味","加热水炖50分钟，再放土豆和胡萝卜炖至软烂。"]],colors:["#805034","#c98545"]},
  {id:8,name:"虾仁炒饭",emoji:"🍤",time:18,difficulty:"简单",flavors:["主食","快手"],source:"老饭骨",description:"粒粒分明又鲜香，一碗剩米饭也能华丽变身。",ingredients:[{name:"米饭",amount:"1碗"},{name:"虾仁",amount:"100克"},{name:"鸡蛋",amount:"1个"},{name:"胡萝卜",amount:"半根"},{name:"豌豆",amount:"30克"}],steps:[["炒散鸡蛋","热锅放油，倒入蛋液快速炒散。"],["炒配料","加入虾仁、胡萝卜丁和豌豆炒熟。"],["加入米饭","倒入米饭压散，大火翻炒，加盐和生抽调味。"]],colors:["#d68a35","#efbd50"]},
  {id:9,name:"葱油拌面",emoji:"🍜",time:15,difficulty:"简单",flavors:["主食","快手"],source:"老饭骨",description:"葱香浓郁、咸甜适口，忙碌时也能认真吃一碗面。",ingredients:[{name:"面条",amount:"200克"},{name:"小葱",amount:"1把"},{name:"生抽",amount:"2勺"},{name:"老抽",amount:"半勺"},{name:"糖",amount:"1小勺"}],steps:[["熬葱油","小葱切段，冷油下锅小火炸至焦黄。"],["调酱汁","加入生抽、老抽和糖，小火煮至冒泡。"],["拌面","面条煮熟沥水，浇上葱油酱汁拌匀。"]],colors:["#69533b","#c39a51"]},
  {id:10,name:"冬瓜排骨汤",emoji:"🥣",time:65,difficulty:"简单",flavors:["汤羹","清淡"],source:"老饭骨",description:"汤清味鲜，冬瓜软嫩，简单调味就很舒服。",ingredients:[{name:"排骨",amount:"400克"},{name:"冬瓜",amount:"500克"},{name:"姜",amount:"3片"},{name:"葱",amount:"1根"},{name:"盐",amount:"适量"}],steps:[["排骨焯水","排骨冷水下锅，煮开后撇去浮沫。"],["炖煮汤底","排骨、姜片加足量热水，小火炖40分钟。"],["加入冬瓜","放冬瓜再炖15分钟，加盐，撒葱花。"]],colors:["#61897f","#99b79a"]},
  {id:11,name:"酸辣土豆丝",emoji:"🥔",time:15,difficulty:"简单",flavors:["酸辣","素食"],source:"特厨隋坡",description:"清爽脆嫩、酸辣开胃，关键是泡去淀粉和大火快炒。",ingredients:[{name:"土豆",amount:"2个"},{name:"青椒",amount:"1个"},{name:"干辣椒",amount:"3个"},{name:"醋",amount:"1勺"},{name:"蒜",amount:"2瓣"}],steps:[["处理土豆","土豆切细丝，多冲洗几遍后泡入清水。"],["爆香配料","热油爆香蒜末和干辣椒。"],["大火快炒","沥干土豆丝，大火炒至断生，沿锅边淋醋并加盐。"]],colors:["#d5a83c","#7d9d43"]},
  {id:12,name:"紫菜蛋花汤",emoji:"🍵",time:8,difficulty:"简单",flavors:["汤羹","快手"],source:"特厨隋坡",description:"清鲜暖胃，八分钟上桌，是忙碌晚餐的好搭档。",ingredients:[{name:"紫菜",amount:"1小把"},{name:"鸡蛋",amount:"1个"},{name:"虾皮",amount:"少许",optional:true},{name:"葱",amount:"1根"},{name:"盐",amount:"适量"}],steps:[["煮汤底","锅中加水烧开，放入紫菜和虾皮。"],["淋蛋液","蛋液沿筷子缓慢淋入沸水，静置几秒。"],["调味","轻轻推散蛋花，加盐，撒葱花即可。"]],colors:["#536d59","#a38555"]}
];
const detailedRecipeIds = new Set((window.SUIPO_RECIPES || []).map(recipe => recipe.id));
const builtInRecipes = [
  ...legacyBuiltInRecipes.filter(recipe => !detailedRecipeIds.has(recipe.id)),
  ...(window.SUIPO_RECIPES || [])
];

const Core = window.YiCanCore;
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
const customRecipes = loadCustomRecipes();
const builtInRefs = new Set(builtInRecipes.map(Core.recipeRef));
let favorites = Core.parseStoredArray(localStorage, Core.FAVORITES_STORAGE_KEY);
let recent = Core.parseStoredArray(localStorage, Core.RECENT_STORAGE_KEY);
const state = {view:"discover", mode:"dish", query:"", time:"all", activeRecipe:null, appVersion:"unknown", updatePoll:null, minePanel:null, editorStep:0, detailPanel:"overview", pages:{discover:1,favorites:1,recent:1,personal:1}, cooking:{ref:null,index:0,completed:new Set(),remaining:0,running:false,deadline:0,tick:null}};

const els = {
  views:[...document.querySelectorAll(".page-view")], nav:[...document.querySelectorAll("[data-view-target]")],
  form:document.querySelector("#search-form"), input:document.querySelector("#search-input"), grid:document.querySelector("#recipe-grid"),
  count:document.querySelector("#result-count"), empty:document.querySelector("#discover-empty"), summary:document.querySelector("#ingredient-summary"),
  title:document.querySelector("#results-title"), kicker:document.querySelector("#result-kicker"), time:document.querySelector("#time-filter"), quick:document.querySelector("#quick-picks"),
  favoritesGrid:document.querySelector("#favorites-grid"), favoritesEmpty:document.querySelector("#favorites-empty"),
  recentGrid:document.querySelector("#recent-grid"), recentEmpty:document.querySelector("#recent-empty"),
  personalGrid:document.querySelector("#personal-grid"), personalEmpty:document.querySelector("#personal-empty"), personalCount:document.querySelector("#personal-count"),
  pagers:{discover:document.querySelector("#discover-pagination"),favorites:document.querySelector("#favorites-pagination"),recent:document.querySelector("#recent-pagination"),personal:document.querySelector("#personal-pagination")},
  dialog:document.querySelector("#recipe-dialog"), dialogContent:document.querySelector("#dialog-content"),
  editorDialog:document.querySelector("#editor-dialog"), editorForm:document.querySelector("#editor-form"), editorStatus:document.querySelector("#editor-status"),
  importDialog:document.querySelector("#import-dialog"), importForm:document.querySelector("#import-form"), importFile:document.querySelector("#recipe-file"), importJson:document.querySelector("#recipe-json"), importStatus:document.querySelector("#import-status"),
  dataStatus:document.querySelector("#data-status"), updateStatus:document.querySelector("#update-status"), currentVersion:document.querySelector("#current-version"),
  updateDialog:document.querySelector("#update-dialog"), updateVersion:document.querySelector("#update-version"), updateMessage:document.querySelector("#update-message"), releaseNotes:document.querySelector("#release-notes"),
  updateProgress:document.querySelector("#update-progress"), cancelUpdate:document.querySelector("#cancel-update"), retryUpdate:document.querySelector("#retry-update"), installUpdate:document.querySelector("#install-update"), downloadUpdate:document.querySelector("#download-update")
};
els.cookingDialog=document.querySelector("#cooking-dialog");
els.cookingContent=document.querySelector("#cooking-content");

function pageSize() { return matchMedia("(min-width: 900px)").matches ? 12 : 6; }
function renderPagination(container, pageData, scope) {
  if (!container) return;
  container.hidden = pageData.totalPages <= 1;
  container.innerHTML = pageData.totalPages <= 1 ? "" : `<button type="button" data-page-scope="${scope}" data-page="${pageData.page - 1}" ${pageData.page <= 1 ? "disabled" : ""}>上一页</button><span>${pageData.page} / ${pageData.totalPages}</span><button type="button" data-page-scope="${scope}" data-page="${pageData.page + 1}" ${pageData.page >= pageData.totalPages ? "disabled" : ""}>下一页</button>`;
}

function loadCustomRecipes() {
  const raw = Core.parseStoredArray(localStorage, Core.CUSTOM_STORAGE_KEY);
  const result = [];
  raw.forEach((item, index) => {
    try { result.push(Core.normalizeImportedRecipe(item, index, true)); } catch (_) {}
  });
  return result;
}

function allRecipes() { return [...builtInRecipes, ...customRecipes]; }
function validRefs() { return new Set(allRecipes().map(Core.recipeRef)); }
function findRecipe(refOrId) {
  if (typeof refOrId === "string" && refOrId.includes(":")) return allRecipes().find(recipe => Core.recipeRef(recipe) === refOrId);
  return allRecipes().find(recipe => recipe.id === Number(refOrId));
}

function sanitizeAndPersist() {
  const valid = validRefs();
  favorites = Core.uniqueValidRefs(favorites, valid);
  recent = Core.uniqueValidRefs(recent, valid, Core.RECENT_LIMIT);
  localStorage.setItem(Core.CUSTOM_STORAGE_KEY, JSON.stringify(customRecipes));
  localStorage.setItem(Core.FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  localStorage.setItem(Core.RECENT_STORAGE_KEY, JSON.stringify(recent));
}

function normalizeQuery(value) {
  return String(value || "").trim().toLowerCase().replace(/[，、；;\s]+/g, ",").split(",").filter(Boolean);
}

function getDiscoverResults() {
  let list = allRecipes().map(recipe => ({recipe, score:0, missing:[]}));
  const terms = normalizeQuery(state.query);
  if (terms.length) {
    if (state.mode === "dish") {
      list = list.filter(({recipe}) => terms.some(term => recipe.name.toLowerCase().includes(term) || recipe.flavors.some(tag => tag.toLowerCase().includes(term))));
    } else {
      list = list.map(item => {
        const required = item.recipe.ingredients.filter(ingredient => !ingredient.optional).map(ingredient => ingredient.name.toLowerCase());
        const matched = required.filter(name => terms.some(term => name.includes(term) || term.includes(name)));
        return {...item, score:required.length ? matched.length / required.length : 0, missing:required.filter(name => !matched.includes(name))};
      }).filter(item => item.score > 0).sort((a,b) => b.score - a.score || a.recipe.time - b.recipe.time);
    }
  }
  if (state.time !== "all") list = list.filter(({recipe}) => recipe.time <= Number(state.time));
  return list;
}

function cardHtml(recipe, context = "default", match = null) {
  const ref = Core.recipeRef(recipe);
  const isFavorite = favorites.includes(ref);
  const badge = match && state.mode === "ingredient" && state.query
    ? (match.missing.length ? `<span class="match-badge missing">还缺 ${match.missing.length} 样</span>` : `<span class="match-badge">食材齐全</span>`)
    : `<span class="match-badge">${escapeHtml(recipe.difficulty)}</span>`;
  const tags = match && state.mode === "ingredient" && state.query
    ? (match.missing.length ? match.missing.slice(0,3).map(name => `<span class="tag">缺 ${escapeHtml(name)}</span>`).join("") : `<span class="tag">现在就能做</span>`)
    : recipe.flavors.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const actions = context === "personal"
    ? `<div class="card-actions"><button data-action="edit" data-ref="${ref}">编辑</button><button class="danger" data-action="delete" data-ref="${ref}">删除</button></div>`
    : "";
  return `<article class="recipe-card" data-ref="${ref}">
    <div class="card-top" style="--card-a:${escapeHtml(recipe.colors[0])};--card-b:${escapeHtml(recipe.colors[1])}">
      <span class="dish-emoji" aria-hidden="true">${escapeHtml(recipe.emoji)}</span><div class="card-top-actions">${badge}<button class="heart-button ${isFavorite ? "active" : ""}" data-action="favorite" data-ref="${ref}" aria-label="${isFavorite ? "取消收藏" : "收藏"}">${isFavorite ? "♥" : "♡"}</button></div>
    </div>
    <div class="card-body"><div class="card-meta"><span>⏱ ${recipe.time} 分钟</span><span>● ${escapeHtml(recipe.difficulty)}</span></div><h3>${escapeHtml(recipe.name)}</h3><div class="creator-line">${recipe.custom ? "本机保存" : "来自"} ${escapeHtml(recipe.source)}</div><p>${escapeHtml(recipe.description)}</p><div class="tag-row">${tags}</div><button class="card-open" data-action="open" data-ref="${ref}">查看做法</button>${actions}</div>
  </article>`;
}

function renderDiscover() {
  const results = getDiscoverResults();
  const pageData = Core.paginate(results, state.pages.discover, pageSize());
  state.pages.discover = pageData.page;
  const searching = Boolean(state.query.trim());
  els.count.textContent = `${results.length} 道菜谱`;
  els.grid.hidden = results.length === 0;
  els.empty.hidden = results.length !== 0;
  els.kicker.textContent = searching ? "搜索结果" : "为你推荐";
  els.title.textContent = searching ? (state.mode === "dish" ? `与“${state.query}”有关` : "这些菜你可以试试") : "家常好味道";
  els.summary.hidden = !(state.mode === "ingredient" && searching && results.length);
  if (!els.summary.hidden) els.summary.innerHTML = `已按食材匹配度排序。最高匹配 <strong>${Math.round(results[0].score * 100)}%</strong>，卡片会告诉你还缺什么。`;
  els.grid.innerHTML = pageData.items.map(item => cardHtml(item.recipe, "default", item)).join("");
  renderPagination(els.pagers.discover, pageData, "discover");
}

function renderLibrary() {
  const favoriteRecipes = favorites.map(findRecipe).filter(Boolean);
  const favoritePage = Core.paginate(favoriteRecipes, state.pages.favorites, pageSize()); state.pages.favorites=favoritePage.page;
  els.favoritesGrid.innerHTML = favoritePage.items.map(recipe => cardHtml(recipe)).join("");
  renderPagination(els.pagers.favorites, favoritePage, "favorites");
  els.favoritesGrid.hidden = favoriteRecipes.length === 0;
  els.favoritesEmpty.hidden = favoriteRecipes.length !== 0;

  const recentRecipes = recent.map(findRecipe).filter(Boolean);
  const recentPage = Core.paginate(recentRecipes, state.pages.recent, pageSize()); state.pages.recent=recentPage.page;
  els.recentGrid.innerHTML = recentPage.items.map(recipe => cardHtml(recipe, "compact")).join("");
  renderPagination(els.pagers.recent, recentPage, "recent");
  els.recentGrid.hidden = recentRecipes.length === 0;
  els.recentEmpty.hidden = recentRecipes.length !== 0;
  document.querySelector("#clear-recent").hidden = recentRecipes.length === 0;

  const personalPage = Core.paginate(customRecipes, state.pages.personal, pageSize()); state.pages.personal=personalPage.page;
  els.personalGrid.innerHTML = personalPage.items.map(recipe => cardHtml(recipe, "personal")).join("");
  renderPagination(els.pagers.personal, personalPage, "personal");
  els.personalGrid.hidden = customRecipes.length === 0;
  els.personalEmpty.hidden = customRecipes.length !== 0;
  els.personalCount.textContent = `${customRecipes.length} 份`;
}

function renderAll() { renderDiscover(); renderLibrary(); }

function renderQuickPicks() {
  const picks = state.mode === "dish" ? ["番茄炒蛋","快手","汤羹"] : ["鸡蛋 番茄","土豆 青椒","鸡蛋 米饭"];
  els.quick.innerHTML = picks.map(item => `<button type="button" data-query="${item}">${item}</button>`).join("");
}

function switchView(view) {
  if (!['discover','favorites','mine'].includes(view)) return;
  state.view = view;
  if(view==="mine"){state.minePanel=null;document.querySelector("#mine-dashboard").hidden=false;document.querySelectorAll("[data-mine-panel]").forEach(panel=>panel.hidden=true);}
  if (window.location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
  els.views.forEach(element => { const active = element.dataset.view === view; element.hidden = !active; element.classList.toggle("active", active); });
  els.nav.forEach(button => { const active = button.dataset.viewTarget === view; button.classList.toggle("active", active); if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current"); });
  window.scrollTo({top:0, behavior:"smooth"});
  renderLibrary();
}

function showMinePanel(name) {
  state.minePanel = name || null;
  document.querySelector("#mine-dashboard").hidden = Boolean(name);
  document.querySelectorAll("[data-mine-panel]").forEach(panel => { panel.hidden = panel.dataset.minePanel !== name; });
  renderLibrary();
  window.scrollTo({top:0, behavior:"smooth"});
}

function toggleFavorite(ref) {
  if (!findRecipe(ref)) return;
  favorites = favorites.includes(ref) ? favorites.filter(item => item !== ref) : [ref, ...favorites];
  sanitizeAndPersist();
  renderAll();
  if (state.activeRecipe === ref && els.dialog.open) renderRecipeDialog(findRecipe(ref));
}

function openRecipe(ref) {
  const recipe = findRecipe(ref);
  if (!recipe) return;
  state.activeRecipe = Core.recipeRef(recipe);
  state.detailPanel = "overview";
  recent = Core.addRecent(recent, state.activeRecipe, validRefs());
  sanitizeAndPersist();
  renderLibrary();
  renderRecipeDialog(recipe);
  if (!els.dialog.open) els.dialog.showModal();
}

function renderRecipeDialog(recipe) {
  const ref = Core.recipeRef(recipe);
  const isFavorite = favorites.includes(ref);
  const sourceUrl = recipe.video || (!recipe.custom ? `https://search.bilibili.com/all?keyword=${encodeURIComponent(`${recipe.source} ${recipe.name}`)}` : "");
  const seekableVideo = /bilibili\.com\/video\//i.test(sourceUrl);
  const panel = state.detailPanel;
  els.dialogContent.innerHTML = `<div class="dialog-hero compact" style="--dialog-a:${escapeHtml(recipe.colors[0])};--dialog-b:${escapeHtml(recipe.colors[1])}"><span class="dish-emoji" aria-hidden="true">${escapeHtml(recipe.emoji)}</span><h2>${escapeHtml(recipe.name)}</h2></div>
    <div class="dialog-body"><div class="detail-actions"><button class="favorite-action ${isFavorite ? "active" : ""}" data-action="favorite" data-ref="${ref}">${isFavorite ? "♥ 已收藏" : "♡ 收藏"}</button><button class="primary-action" data-action="cook" data-ref="${ref}">开始烹饪</button>${recipe.custom ? `<button data-action="edit" data-ref="${ref}">编辑</button><button class="danger" data-action="delete" data-ref="${ref}">删除</button>` : ""}</div>
    <div class="detail-tabs" role="tablist">${[["overview","概览"],["ingredients","食材"],["steps","步骤"]].map(([key,label])=>`<button type="button" data-detail-panel="${key}" class="${panel===key?"active":""}">${label}</button>`).join("")}</div>
    <section class="detail-panel" ${panel!=="overview"?"hidden":""}><p>${escapeHtml(recipe.description)}</p><div class="detail-facts"><span>约 ${recipe.time} 分钟</span><span>${escapeHtml(recipe.difficulty)}</span>${recipe.flavors.map(value => `<span>${escapeHtml(value)}</span>`).join("")}</div>${sourceUrl ? `<a class="original-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener">查看 ${escapeHtml(recipe.source)} 的来源视频</a>` : `<p class="imported-note">这是一份保存在本机的个人菜谱。</p>`}</section>
    <section class="detail-panel" ${panel!=="ingredients"?"hidden":""}><ul class="ingredient-list">${recipe.ingredients.map(item => `<li><span>${escapeHtml(item.name)}${item.optional ? "（可选）" : ""}</span>${item.amount?`<b>${escapeHtml(item.amount)}</b>`:""}</li>`).join("")}</ul></section>
    <section class="detail-panel" ${panel!=="steps"?"hidden":""}><ol class="steps">${recipe.steps.map((step,index) => `<li><div class="step-heading"><strong>${escapeHtml(step[0])}</strong><span class="step-meta">${step[3]!=null?(seekableVideo?`<a href="${escapeHtml(videoAt(sourceUrl,step[3]))}" target="_blank" rel="noopener">视频 ${formatTimestamp(step[3])}</a>`:`<span>视频 ${formatTimestamp(step[3])}</span>`):""}${step[2]?`<small>建议 ${formatDuration(step[2])}</small>`:""}</span></div><p>${escapeHtml(step[1])}</p><button type="button" data-action="cook-step" data-ref="${ref}" data-step-index="${index}">从这一步开始</button></li>`).join("")}</ol>${recipe.tips?.length?`<aside class="recipe-tips"><strong>Tips</strong><ul>${recipe.tips.map(tip=>`<li>${escapeHtml(tip)}</li>`).join("")}</ul></aside>`:""}</section></div>`;
}

function formatTimestamp(seconds) {
  const value=Math.max(0,Number(seconds)||0), hours=Math.floor(value/3600), minutes=Math.floor((value%3600)/60), rest=value%60;
  return hours ? `${hours}:${String(minutes).padStart(2,"0")}:${String(rest).padStart(2,"0")}` : `${String(minutes).padStart(2,"0")}:${String(rest).padStart(2,"0")}`;
}

function videoAt(url, seconds) {
  try { const target=new URL(url); target.searchParams.set("t",String(Math.max(0,Number(seconds)||0))); return target.toString(); }
  catch (_) { return url; }
}

function formatDuration(seconds) {
  const value=Math.max(0,Number(seconds)||0), minutes=Math.floor(value/60), rest=value%60;
  return minutes ? `${minutes} 分${rest?`${rest} 秒`:""}` : `${rest} 秒`;
}

function addIngredientRow(value = {}) {
  const row = document.createElement("div");
  row.className = "dynamic-row ingredient-row";
  row.innerHTML = `<input class="ingredient-name" maxlength="50" required placeholder="食材名称" value="${escapeHtml(value.name || "")}"><input class="ingredient-amount" maxlength="40" placeholder="用量" value="${escapeHtml(value.amount || "")}"><label class="check-label"><input class="ingredient-optional" type="checkbox" ${value.optional ? "checked" : ""}>可选</label><button type="button" class="remove-row" aria-label="删除食材">×</button>`;
  document.querySelector("#ingredient-rows").appendChild(row);
}

function addStepRow(value = []) {
  const row = document.createElement("div");
  row.className = "dynamic-row step-row";
  row.innerHTML = `<input class="step-title" maxlength="50" placeholder="步骤标题" value="${escapeHtml(value[0] || "")}"><textarea class="step-description" maxlength="500" rows="2" required placeholder="具体怎么做">${escapeHtml(value[1] || "")}</textarea><label class="duration-field">计时（秒，可选）<input class="step-duration" type="number" min="1" max="14400" value="${value[2] || ""}" placeholder="例如 300"></label><button type="button" class="remove-row" aria-label="删除步骤">×</button>`;
  document.querySelector("#step-rows").appendChild(row);
}

function openEditor(recipe) {
  els.editorForm.reset();
  els.editorStatus.textContent = "";
  document.querySelector("#ingredient-rows").innerHTML = "";
  document.querySelector("#step-rows").innerHTML = "";
  document.querySelector("#editor-id").value = recipe ? recipe.id : "";
  document.querySelector("#editor-title").textContent = recipe ? "编辑菜谱" : "新建菜谱";
  document.querySelector("#editor-name").value = recipe?.name || "";
  document.querySelector("#editor-emoji").value = recipe?.emoji || "🍽️";
  document.querySelector("#editor-time").value = recipe?.time || 20;
  document.querySelector("#editor-difficulty").value = recipe?.difficulty || "简单";
  document.querySelector("#editor-source").value = recipe?.source || "我的菜谱";
  document.querySelector("#editor-flavors").value = recipe?.flavors?.join("，") || "";
  document.querySelector("#editor-description").value = recipe?.description || "";
  (recipe?.ingredients || [{}]).forEach(addIngredientRow);
  (recipe?.steps || [["",""]]).forEach(addStepRow);
  setEditorStep(0);
  if (els.dialog.open) els.dialog.close();
  els.editorDialog.showModal();
}

function saveEditor() {
  const idValue = Number(document.querySelector("#editor-id").value);
  const ingredients = [...document.querySelectorAll(".ingredient-row")].map(row => ({name:row.querySelector(".ingredient-name").value, amount:row.querySelector(".ingredient-amount").value, optional:row.querySelector(".ingredient-optional").checked}));
  const steps = [...document.querySelectorAll(".step-row")].map(row => {
    const base=[row.querySelector(".step-title").value,row.querySelector(".step-description").value];
    const duration=row.querySelector(".step-duration").value;
    return duration ? [...base,Number(duration)] : base;
  });
  const raw = {id:idValue || Date.now(), name:document.querySelector("#editor-name").value, emoji:document.querySelector("#editor-emoji").value, time:document.querySelector("#editor-time").value, difficulty:document.querySelector("#editor-difficulty").value, source:document.querySelector("#editor-source").value, flavors:document.querySelector("#editor-flavors").value.split(/[，,]/), description:document.querySelector("#editor-description").value, ingredients, steps};
  const normalized = Core.normalizeImportedRecipe(raw, 0, true);
  const duplicate = customRecipes.find(item => item.id !== normalized.id && Core.recipeIdentity(item) === Core.recipeIdentity(normalized));
  if (duplicate) throw new Error("已有同名且来源相同的个人菜谱");
  const index = customRecipes.findIndex(item => item.id === normalized.id);
  if (index >= 0) customRecipes.splice(index, 1, normalized); else customRecipes.unshift(normalized);
  sanitizeAndPersist();
  renderAll();
  els.editorDialog.close();
  switchView("mine");
  showMinePanel("personal");
  setGlobalStatus(index >= 0 ? "菜谱已更新" : "菜谱已保存", "success");
}

function setEditorStep(index) {
  state.editorStep=Math.max(0,Math.min(2,index));
  document.querySelectorAll("[data-editor-panel]").forEach(panel=>{const active=Number(panel.dataset.editorPanel)===state.editorStep;panel.hidden=!active;panel.classList.toggle("active",active);});
  document.querySelectorAll(".editor-progress span").forEach((item,i)=>item.classList.toggle("active",i===state.editorStep));
  document.querySelector("#editor-prev").hidden=state.editorStep===0;
  document.querySelector("#editor-next").hidden=state.editorStep===2;
  document.querySelector("#editor-save").hidden=state.editorStep!==2;
}

function advanceEditor(direction) {
  if (direction>0) {
    const panel=document.querySelector(`[data-editor-panel="${state.editorStep}"]`);
    const invalid=[...panel.querySelectorAll("input,textarea,select")].find(input=>!input.checkValidity());
    if(invalid){invalid.reportValidity();return;}
  }
  setEditorStep(state.editorStep+direction);
}

function deleteRecipe(ref) {
  const recipe = findRecipe(ref);
  if (!recipe?.custom || !window.confirm(`确定删除“${recipe.name}”吗？此操作无法撤销。`)) return;
  const index = customRecipes.findIndex(item => item.id === recipe.id);
  if (index >= 0) customRecipes.splice(index, 1);
  favorites = favorites.filter(item => item !== ref);
  recent = recent.filter(item => item !== ref);
  sanitizeAndPersist();
  if (els.dialog.open) els.dialog.close();
  renderAll();
  setGlobalStatus("个人菜谱已删除", "success");
}

function handleAction(action, ref, button) {
  if (action === "open") openRecipe(ref);
  if (action === "favorite") toggleFavorite(ref);
  if (action === "edit") openEditor(findRecipe(ref));
  if (action === "delete") deleteRecipe(ref);
  if (action === "cook") openCooking(ref, 0);
  if (action === "cook-step") openCooking(ref, Number(button?.dataset.stepIndex || 0));
}

function openCooking(ref, stepIndex = 0) {
  const recipe=findRecipe(ref); if(!recipe)return;
  state.cooking.ref=ref;
  state.cooking.index=Math.max(0,Math.min(recipe.steps.length-1,stepIndex));
  state.cooking.completed=new Set();
  state.cooking.running=false;
  state.cooking.remaining=recipe.steps[state.cooking.index][2]||0;
  try {
    const native=window.YiCanAndroid?.getStepTimerState?JSON.parse(window.YiCanAndroid.getStepTimerState()):null;
    if(native?.recipeRef===ref&&native.stepIndex===state.cooking.index&&native.remainingSeconds>0){state.cooking.remaining=native.remainingSeconds;state.cooking.deadline=native.deadline;state.cooking.running=true;}
  } catch (_) {}
  if(els.dialog.open)els.dialog.close();
  renderCooking();
  if(!els.cookingDialog.open)els.cookingDialog.showModal();
  startCookingTick();
}

function renderCooking() {
  const recipe=findRecipe(state.cooking.ref); if(!recipe)return;
  const index=state.cooking.index, step=recipe.steps[index], done=state.cooking.completed.has(index);
  const seconds=state.cooking.running?Math.max(0,Math.ceil((state.cooking.deadline-Date.now())/1000)):state.cooking.remaining;
  els.cookingContent.innerHTML=`<header><button type="button" data-cook-action="close">×</button><div><small>${escapeHtml(recipe.name)}</small><strong>第 ${index+1} / ${recipe.steps.length} 步</strong></div><button type="button" data-cook-action="complete" class="${done?"active":""}">${done?"✓ 已完成":"完成步骤"}</button></header><main><p class="cooking-kicker">${escapeHtml(step[0])}</p><h2>${escapeHtml(step[1])}</h2><div class="timer-display ${seconds===0&&state.cooking.running?"finished":""}">${formatClock(seconds)}</div><label class="manual-timer">计时秒数<input id="cooking-seconds" type="number" min="1" max="14400" value="${Math.max(1,seconds||step[2]||300)}"></label><p id="timer-note">${state.cooking.running?(seconds?"计时中；结束后只提醒，不会自动跳步":"时间到，请按自己的节奏继续"):step[2]?`建议 ${formatDuration(step[2])}`:"这一步没有预设时间，可手动输入"}</p><div class="timer-actions"><button type="button" data-cook-action="reset">重置</button><button type="button" data-cook-action="toggle" class="primary-action">${state.cooking.running?"暂停":"开始"}</button><button type="button" data-cook-action="add">＋1 分钟</button></div></main><footer><button type="button" data-cook-action="prev" ${index===0?"disabled":""}>上一步</button><button type="button" data-cook-action="next" ${index===recipe.steps.length-1?"disabled":""}>下一步</button></footer>`;
}

function formatClock(seconds){const value=Math.max(0,Math.ceil(Number(seconds)||0));return `${String(Math.floor(value/60)).padStart(2,"0")}:${String(value%60).padStart(2,"0")}`;}
function persistCookingTimer(){const c=state.cooking;if(!c.ref){localStorage.removeItem(Core.TIMER_STORAGE_KEY);return;}localStorage.setItem(Core.TIMER_STORAGE_KEY,JSON.stringify({recipeRef:c.ref,stepIndex:c.index,deadline:c.deadline,durationSeconds:Math.max(1,c.remaining||Math.ceil((c.deadline-Date.now())/1000)||1),running:c.running}));}
function startCookingTick(){if(state.cooking.tick)clearInterval(state.cooking.tick);state.cooking.tick=setInterval(()=>{if(!state.cooking.running)return;state.cooking.remaining=Math.max(0,Math.ceil((state.cooking.deadline-Date.now())/1000));persistCookingTimer();renderCooking();if(state.cooking.remaining===0){state.cooking.running=false;clearInterval(state.cooking.tick);state.cooking.tick=null;persistCookingTimer();}},1000);}
function pauseCooking(){if(state.cooking.running)state.cooking.remaining=Math.max(0,Math.ceil((state.cooking.deadline-Date.now())/1000));state.cooking.running=false;window.YiCanAndroid?.cancelStepTimer?.();persistCookingTimer();}
function changeCookingStep(delta){const recipe=findRecipe(state.cooking.ref);if(!recipe)return;pauseCooking();state.cooking.index=Math.max(0,Math.min(recipe.steps.length-1,state.cooking.index+delta));state.cooking.remaining=recipe.steps[state.cooking.index][2]||0;state.cooking.deadline=0;renderCooking();}
function handleCookingAction(action){const recipe=findRecipe(state.cooking.ref);if(!recipe)return;if(action==="close"){pauseCooking();els.cookingDialog.close();return;}if(action==="prev")changeCookingStep(-1);if(action==="next")changeCookingStep(1);if(action==="complete"){state.cooking.completed.has(state.cooking.index)?state.cooking.completed.delete(state.cooking.index):state.cooking.completed.add(state.cooking.index);renderCooking();}if(action==="reset"){pauseCooking();state.cooking.remaining=recipe.steps[state.cooking.index][2]||0;state.cooking.deadline=0;persistCookingTimer();renderCooking();}if(action==="add"){const current=state.cooking.running?Math.max(0,Math.ceil((state.cooking.deadline-Date.now())/1000)):Number(document.querySelector("#cooking-seconds")?.value||state.cooking.remaining||0);state.cooking.remaining=Math.min(14400,current+60);if(state.cooking.running){state.cooking.deadline=Date.now()+state.cooking.remaining*1000;window.YiCanAndroid?.startStepTimer?.(state.cooking.ref,state.cooking.index,state.cooking.remaining);}persistCookingTimer();renderCooking();}if(action==="toggle"){if(state.cooking.running){pauseCooking();renderCooking();}else{const seconds=Math.max(1,Math.min(14400,Number(document.querySelector("#cooking-seconds")?.value||state.cooking.remaining||recipe.steps[state.cooking.index][2]||300)));state.cooking.remaining=seconds;state.cooking.deadline=Date.now()+seconds*1000;state.cooking.running=true;persistCookingTimer();window.YiCanAndroid?.startStepTimer?.(state.cooking.ref,state.cooking.index,seconds);startCookingTick();renderCooking();}}}

function importFromText(text) {
  const result = Core.importFromText({customRecipes, favorites, recent}, text, builtInRefs);
  customRecipes.splice(0, customRecipes.length, ...result.customRecipes);
  favorites = result.favorites;
  recent = result.recent;
  sanitizeAndPersist();
  renderAll();
  return result;
}

function exportBackup() {
  const backup = Core.createBackup(customRecipes, favorites, recent, undefined, state.appVersion);
  const json = JSON.stringify(backup, null, 2);
  if (window.YiCanAndroid?.exportBackup) {
    window.YiCanAndroid.exportBackup(json);
  } else {
    const blob = new Blob([json], {type:"application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `yican-backup-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    setGlobalStatus("备份已生成", "success");
  }
}

function setGlobalStatus(message, type = "") {
  els.dataStatus.textContent = message;
  els.dataStatus.className = `global-status ${type}`.trim();
}

function setImportStatus(message, type = "") {
  els.importStatus.textContent = message;
  els.importStatus.className = `import-status ${type}`.trim();
}

function checkForUpdate(manual) {
  if (window.YiCanAndroid?.checkForUpdate) window.YiCanAndroid.checkForUpdate(Boolean(manual));
  else if (manual) els.updateStatus.textContent = "网页版无法安装 Android 更新";
}

window.YiCanNative = {
  onExportResult(result) {
    setGlobalStatus(result.message || "", result.status === "success" ? "success" : "error");
  },
  onUpdateResult(result) {
    els.updateStatus.textContent = result.message || "";
    if (result.versionName) {
      els.updateVersion.textContent = `一餐 ${result.versionName}`;
      els.updateMessage.textContent = result.message;
      els.releaseNotes.textContent = result.releaseNotes || "包含功能改进和问题修复。";
    }
    const downloading = result.status === "downloading" || result.status === "verifying";
    const canRetry = ["error","cancelled"].includes(result.status) && Boolean(result.versionName);
    els.updateProgress.hidden = !downloading;
    els.updateProgress.value = Number(result.progress || 0);
    els.cancelUpdate.hidden = result.status !== "downloading";
    els.retryUpdate.hidden = !canRetry;
    els.installUpdate.hidden = !["verified","permission","installing"].includes(result.status);
    els.downloadUpdate.hidden = result.status !== "available";
    if (["available","downloading","verifying","verified","permission","installing","error","cancelled"].includes(result.status) && result.versionName && !els.updateDialog.open) els.updateDialog.showModal();
    if (downloading && !state.updatePoll) state.updatePoll = setInterval(pollUpdateState, 1000);
    if (!downloading && state.updatePoll) { clearInterval(state.updatePoll); state.updatePoll = null; }
  },
  onNativeStatus(event) {
    if(event?.type!=="timer")return;
    const payload=event.payload||{};
    if(payload.notificationAllowed===false)document.querySelector("#timer-note")?.replaceChildren(document.createTextNode("前台计时可用；未开启通知，后台可能无法提醒"));
  },
  onTimerOpen(recipeRef, stepIndex) {
    openCooking(recipeRef, Number(stepIndex)||0);
  }
};

function pollUpdateState() {
  if (!window.YiCanAndroid?.getUpdateState) return;
  try { window.YiCanNative.onUpdateResult(JSON.parse(window.YiCanAndroid.getUpdateState())); } catch (_) {}
}

function initializeAppInfo() {
  if (!window.YiCanAndroid?.getAppInfo) return;
  try {
    const info = JSON.parse(window.YiCanAndroid.getAppInfo());
    els.currentVersion.textContent = info.versionName || "1.4.1";
    state.appVersion = info.versionName || "unknown";
    pollUpdateState();
  } catch (_) {}
}

function registerRecipeTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const register = tool => { try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch (_) {} };
  register({name:"search_recipes_by_name",title:"按菜名找菜谱",description:"在一餐中按菜名或口味关键词搜索菜谱。",inputSchema:{type:"object",properties:{query:{type:"string",minLength:1}},required:["query"],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){ if(!input?.query?.trim()) throw new Error("query 必须是非空字符串"); state.mode="dish";state.query=input.query.trim();els.input.value=state.query;switchView("discover");renderDiscover();return {count:getDiscoverResults().length,recipes:getDiscoverResults().map(item=>item.recipe.name)}; }});
  register({name:"search_recipes_by_ingredients",title:"按食材找菜谱",description:"根据已有食材搜索菜谱，返回匹配度和缺少的食材。",inputSchema:{type:"object",properties:{ingredients:{type:"array",items:{type:"string",minLength:1},minItems:1}},required:["ingredients"],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){ if(!Array.isArray(input?.ingredients)||!input.ingredients.length) throw new Error("ingredients 必须是非空数组");state.mode="ingredient";state.query=input.ingredients.join(" ");els.input.value=state.query;switchView("discover");renderDiscover();return {count:getDiscoverResults().length,recipes:getDiscoverResults().map(item=>({name:item.recipe.name,match:Math.round(item.score*100),missing:item.missing}))}; }});
}

document.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) handleAction(actionButton.dataset.action, actionButton.dataset.ref, actionButton);
  const detailButton=event.target.closest("[data-detail-panel]");
  if(detailButton){state.detailPanel=detailButton.dataset.detailPanel;const recipe=findRecipe(state.activeRecipe);if(recipe)renderRecipeDialog(recipe);}
  const mineButton=event.target.closest("[data-mine-target]");if(mineButton)showMinePanel(mineButton.dataset.mineTarget);
  if(event.target.closest("[data-mine-back]"))showMinePanel(null);
  const pageButton=event.target.closest("[data-page-scope]");if(pageButton&&!pageButton.disabled){state.pages[pageButton.dataset.pageScope]=Number(pageButton.dataset.page);renderAll();window.scrollTo({top:0,behavior:"smooth"});}
  const cookButton=event.target.closest("[data-cook-action]");if(cookButton)handleCookingAction(cookButton.dataset.cookAction);
  const viewButton = event.target.closest("[data-view-target], [data-go]");
  if (viewButton) switchView(viewButton.dataset.viewTarget || viewButton.dataset.go);
  const closeButton = event.target.closest("[data-close]");
  if (closeButton) document.querySelector(`#${closeButton.dataset.close}`)?.close();
  const queryButton = event.target.closest("[data-query]");
  if (queryButton) { els.input.value=queryButton.dataset.query; state.query=queryButton.dataset.query; state.pages.discover=1; renderDiscover(); document.querySelector("#results-title").scrollIntoView({behavior:"smooth"}); }
  if (event.target.classList.contains("remove-row")) {
    const container = event.target.closest("#ingredient-rows, #step-rows");
    if (container && container.children.length > 1) event.target.closest(".dynamic-row").remove();
  }
});

els.nav.forEach(button => button.addEventListener("click", () => switchView(button.dataset.viewTarget)));
document.querySelector("#brand-home").addEventListener("click", () => switchView("discover"));
document.querySelectorAll(".mode-tab").forEach(tab => tab.addEventListener("click", () => {
  state.mode=tab.dataset.mode;state.query="";els.input.value="";els.input.placeholder=state.mode==="dish"?"例如：番茄炒蛋":"输入食材，用空格或逗号分开";
  document.querySelectorAll(".mode-tab").forEach(item=>{const active=item===tab;item.classList.toggle("active",active);item.setAttribute("aria-selected",String(active));});
  state.pages.discover=1;renderQuickPicks();renderDiscover();els.input.focus();
}));
els.form.addEventListener("submit", event => {event.preventDefault();state.query=els.input.value.trim();state.pages.discover=1;renderDiscover();document.querySelector("#results-title").scrollIntoView({behavior:"smooth"});});
els.time.addEventListener("change",()=>{state.time=els.time.value;state.pages.discover=1;renderDiscover();});
document.querySelector("#reset-button").addEventListener("click",()=>{state.query="";state.time="all";state.pages.discover=1;els.input.value="";els.time.value="all";renderDiscover();});
document.querySelector("#new-recipe").addEventListener("click",()=>openEditor(null));
document.querySelector("#add-ingredient").addEventListener("click",()=>addIngredientRow());
document.querySelector("#add-step").addEventListener("click",()=>addStepRow());
document.querySelector("#editor-prev").addEventListener("click",()=>advanceEditor(-1));
document.querySelector("#editor-next").addEventListener("click",()=>advanceEditor(1));
els.editorForm.addEventListener("submit",event=>{event.preventDefault();try{saveEditor();}catch(error){els.editorStatus.textContent=error.message||"无法保存菜谱";els.editorStatus.className="import-status error";}});
document.querySelector("#clear-recent").addEventListener("click",()=>{if(!recent.length||!window.confirm("确定清空最近浏览吗？"))return;recent=[];state.pages.recent=1;sanitizeAndPersist();renderLibrary();});
document.querySelector("#open-import").addEventListener("click",()=>{els.importForm.reset();setImportStatus("");els.importDialog.showModal();});
els.importFile.addEventListener("change",async()=>{const file=els.importFile.files?.[0];if(!file)return;if(file.size>5*1024*1024){setImportStatus("文件不能超过 5 MB","error");return;}try{els.importJson.value=await file.text();setImportStatus(`已读取 ${file.name}，请确认导入`,"success");}catch(_){setImportStatus("无法读取这个文件","error");}});
els.importForm.addEventListener("submit",event=>{event.preventDefault();try{const result=importFromText(els.importJson.value);setImportStatus(`成功加入 ${result.added} 份菜谱${result.skipped?`，跳过 ${result.skipped} 份重复菜谱`:""}`,"success");setTimeout(()=>{els.importDialog.close();switchView("mine");},700);}catch(error){setImportStatus(error.message||"导入失败","error");}});
document.querySelector("#export-backup").addEventListener("click",exportBackup);
document.querySelector("#check-update").addEventListener("click",()=>checkForUpdate(true));
els.downloadUpdate.addEventListener("click",()=>{if(window.YiCanAndroid?.downloadUpdate)window.YiCanAndroid.downloadUpdate();});
els.cancelUpdate.addEventListener("click",()=>{if(window.YiCanAndroid?.cancelUpdate)window.YiCanAndroid.cancelUpdate();});
els.retryUpdate.addEventListener("click",()=>{if(window.YiCanAndroid?.retryUpdate)window.YiCanAndroid.retryUpdate();});
els.installUpdate.addEventListener("click",()=>{if(window.YiCanAndroid?.resumeInstall)window.YiCanAndroid.resumeInstall();});
[els.dialog,els.editorDialog,els.importDialog,els.updateDialog].forEach(dialog=>dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();}));

window.recipeApp = {
  searchDish(query){state.mode="dish";state.query=query||"";switchView("discover");renderDiscover();return getDiscoverResults().map(item=>item.recipe.name);},
  searchByIngredients(ingredients){state.mode="ingredient";state.query=Array.isArray(ingredients)?ingredients.join(" "):ingredients||"";switchView("discover");renderDiscover();return getDiscoverResults().map(item=>({name:item.recipe.name,match:Math.round(item.score*100),missing:item.missing}));},
  openRecipe,
  importRecipes(data){return importFromText(typeof data==="string"?data:JSON.stringify(data));},
  handleBack(){if(els.cookingDialog.open){pauseCooking();els.cookingDialog.close();return "handled";}const open=[els.updateDialog,els.importDialog,els.editorDialog,els.dialog].find(dialog=>dialog.open);if(open){open.close();return "handled";}if(state.view==="mine"&&state.minePanel){showMinePanel(null);return "handled";}if(state.view!=="discover"){switchView("discover");return "handled";}return "none";}
};

sanitizeAndPersist();
renderQuickPicks();
renderAll();
initializeAppInfo();
registerRecipeTools();
if (["discover","favorites","mine"].includes(location.hash.slice(1))) switchView(location.hash.slice(1));
setTimeout(()=>checkForUpdate(false),1200);
