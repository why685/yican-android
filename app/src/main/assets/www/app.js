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
const Core = window.YiCanCore;
const detailedRecipes = Core.applyRecipeEnrichments(window.SUIPO_RECIPES || [], window.LAOCP_ENRICHMENTS || {});
const detailedRecipeIds = new Set(detailedRecipes.map(recipe => recipe.id));
const builtInRecipes = [
  ...legacyBuiltInRecipes.filter(recipe => !detailedRecipeIds.has(recipe.id)),
  ...detailedRecipes
];

for (const recipe of builtInRecipes) Object.assign(recipe, Core.classifyRecipe(recipe));
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
const customRecipes = loadCustomRecipes();
const recipeOverrides = loadRecipeOverrides();
const builtInRefs = new Set(builtInRecipes.map(Core.recipeRef));
let favorites = Core.parseStoredArray(localStorage, Core.FAVORITES_STORAGE_KEY);
let recent = Core.parseStoredArray(localStorage, Core.RECENT_STORAGE_KEY);
let inbox = Core.parseStoredArray(localStorage, Core.INBOX_STORAGE_KEY).map(Core.normalizeInboxItem).filter(Boolean).slice(0,200);
const ROOT_VIEWS = ["discover","library","mine"];
const VALID_VIEWS = [...ROOT_VIEWS,"data","import","collect","help","about","update","recipe","editor","cooking"];
const state = {view:"discover", returnView:"discover", libraryTab:"favorites", query:"", time:"all", category:"all", ingredient:"all", activeRecipe:null, activeInboxId:null, pendingCollection:null, appVersion:"unknown", updatePoll:null, searchTimer:null, resizeTimer:null, navStack:["discover"], viewScroll:{}, ignorePopCount:0, editorStep:0, editorReturnView:"library", editorDraftKey:"", editorDraftTimer:null, editorDraftPaused:false, editorDirty:false, detailPanel:"overview", targetServings:1, pages:{discover:1,favorites:1,recent:1,personal:1,inbox:1}, cooking:{ref:null,index:0,completed:new Set(),remaining:0,running:false,deadline:0,tick:null}};

const els = {
  views:[...document.querySelectorAll(".page-view")], nav:[...document.querySelectorAll("[data-view-target]")],
  form:document.querySelector("#search-form"), input:document.querySelector("#search-input"), searchClear:document.querySelector("#search-clear"), grid:document.querySelector("#recipe-grid"),
  count:document.querySelector("#result-count"), empty:document.querySelector("#discover-empty"), summary:document.querySelector("#ingredient-summary"),
  title:document.querySelector("#results-title"), kicker:document.querySelector("#result-kicker"), time:document.querySelector("#time-filter"), category:document.querySelector("#category-filter"), ingredient:document.querySelector("#ingredient-filter"), quick:document.querySelector("#quick-picks"),
  favoritesGrid:document.querySelector("#favorites-grid"), favoritesEmpty:document.querySelector("#favorites-empty"),
  recentGrid:document.querySelector("#recent-grid"), recentEmpty:document.querySelector("#recent-empty"),
  personalGrid:document.querySelector("#personal-grid"), personalEmpty:document.querySelector("#personal-empty"), personalCount:document.querySelector("#personal-count"),
  inboxGrid:document.querySelector("#inbox-grid"), inboxEmpty:document.querySelector("#inbox-empty"), inboxCount:document.querySelector("#inbox-count"),
  pagers:{discover:document.querySelector("#discover-pagination"),favorites:document.querySelector("#favorites-pagination"),recent:document.querySelector("#recent-pagination"),personal:document.querySelector("#personal-pagination"),inbox:document.querySelector("#inbox-pagination")},
  recipeContent:document.querySelector("#recipe-page-content"),
  editorForm:document.querySelector("#editor-form"), editorStatus:document.querySelector("#editor-status"), editorDraftStatus:document.querySelector("#editor-draft-status"), editorDraftBanner:document.querySelector("#editor-draft-banner"),
  importForm:document.querySelector("#import-form"), importFile:document.querySelector("#recipe-file"), importJson:document.querySelector("#recipe-json"), importStatus:document.querySelector("#import-status"),
  dataStatus:document.querySelector("#data-status"), updateStatus:document.querySelector("#update-status"), currentVersion:document.querySelector("#current-version"), updateCurrentVersion:document.querySelector("#update-current-version"), updateBadge:document.querySelector("#update-badge"),
  updateVersion:document.querySelector("#update-version"), updateMessage:document.querySelector("#update-message"), releaseNotes:document.querySelector("#release-notes"),
  updateProgress:document.querySelector("#update-progress"), cancelUpdate:document.querySelector("#cancel-update"), retryUpdate:document.querySelector("#retry-update"), installUpdate:document.querySelector("#install-update"), downloadUpdate:document.querySelector("#download-update"),
  collectForm:document.querySelector("#collect-form"), collectTitle:document.querySelector("#collect-title"), collectUrl:document.querySelector("#collect-url"), collectText:document.querySelector("#collect-text"), collectStatus:document.querySelector("#collect-status"), collectImages:document.querySelector("#collect-images"), collectShareState:document.querySelector("#collect-share-state"), collectShareSummary:document.querySelector("#collect-share-summary")
};
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

function loadRecipeOverrides() {
  const raw = Core.parseStoredArray(localStorage, Core.OVERRIDES_STORAGE_KEY);
  const validIds = new Set(builtInRecipes.map(recipe => recipe.id));
  const byId = new Map();
  raw.forEach((item, index) => {
    try { const recipe=Core.normalizeRecipeOverride(item,index); if(validIds.has(recipe.id))byId.set(recipe.id,recipe); } catch (_) {}
  });
  return [...byId.values()];
}

function allRecipes() {
  const overrides = new Map(recipeOverrides.map(recipe => [recipe.id, recipe]));
  return [...builtInRecipes.map(recipe => {
    const override = overrides.get(recipe.id);
    return override ? {...override, reference:override.reference || recipe.reference || null} : recipe;
  }), ...customRecipes];
}
function validRefs() { return new Set(allRecipes().map(Core.recipeRef)); }
function findRecipe(refOrId) {
  if (typeof refOrId === "string" && refOrId.includes(":")) return allRecipes().find(recipe => Core.recipeRef(recipe) === refOrId);
  return allRecipes().find(recipe => recipe.id === Number(refOrId));
}

function sanitizeAndPersist() {
  const valid = validRefs();
  favorites = Core.uniqueValidRefs(favorites, valid);
  recent = Core.uniqueValidRefs(recent, valid, Core.RECENT_LIMIT);
  const validBuiltInIds = new Set(builtInRecipes.map(recipe => recipe.id));
  const uniqueOverrides = new Map();
  for (const recipe of recipeOverrides) if (validBuiltInIds.has(recipe.id)) uniqueOverrides.set(recipe.id, recipe);
  recipeOverrides.splice(0, recipeOverrides.length, ...uniqueOverrides.values());
  localStorage.setItem(Core.CUSTOM_STORAGE_KEY, JSON.stringify(customRecipes));
  localStorage.setItem(Core.OVERRIDES_STORAGE_KEY, JSON.stringify(recipeOverrides));
  localStorage.setItem(Core.FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  localStorage.setItem(Core.RECENT_STORAGE_KEY, JSON.stringify(recent));
  inbox=inbox.map(Core.normalizeInboxItem).filter(Boolean).slice(0,200);
  localStorage.setItem(Core.INBOX_STORAGE_KEY,JSON.stringify(inbox));
}

function getDiscoverResults() {
  let list = Core.searchRecipesByKeyword(allRecipes(), state.query);
  if (state.category !== "all") list = list.filter(({recipe}) => recipe.category === state.category);
  if (state.ingredient !== "all") list = list.filter(({recipe}) => recipe.mainIngredients.includes(state.ingredient));
  if (state.time !== "all") list = list.filter(({recipe}) => recipe.time <= Number(state.time));
  return list;
}

function cardHtml(recipe, context = "default", match = null) {
  const ref = Core.recipeRef(recipe);
  const isFavorite = favorites.includes(ref);
  const badge = match && state.query && match.matches?.length
    ? `<span class="match-badge">${escapeHtml(match.matches.slice(0,2).join(" · "))}</span>`
    : `<span class="match-badge">${escapeHtml(recipe.category)}</span>`;
  const tags = [...new Set(recipe.mainIngredients || [])].slice(0,2).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  return `<article class="recipe-card" data-action="open" data-ref="${ref}" role="button" tabindex="0" aria-label="查看${escapeHtml(recipe.name)}的做法">
    <div class="card-top" style="--card-a:${escapeHtml(recipe.colors[0])};--card-b:${escapeHtml(recipe.colors[1])}">
      <span class="dish-emoji" aria-hidden="true">${escapeHtml(recipe.emoji)}</span><div class="card-top-actions">${badge}<button class="heart-button ${isFavorite ? "active" : ""}" data-action="favorite" data-ref="${ref}" aria-label="${isFavorite ? "取消收藏" : "收藏"}">${isFavorite ? "♥" : "♡"}</button></div>
    </div>
    <div class="card-body"><div class="card-meta"><span>⏱ ${recipe.time} 分钟</span><span>● ${escapeHtml(recipe.difficulty)}</span></div><h3>${escapeHtml(recipe.name)}</h3><div class="creator-line">${recipe.custom ? "本机保存" : "来自"} ${escapeHtml(recipe.source)}</div><p>${escapeHtml(recipe.description)}</p><div class="tag-row">${tags}</div></div>
  </article>`;
}

function inboxCardHtml(item) {
  const parsed=Core.parseCollectedRecipe(item), status=item.status==="completed"?"已完成":item.issues?.length?"待确认":"待整理";
  const preview=(item.ocrText||item.sharedText||"尚未添加配方文字").replace(/https?:\/\/\S+/g,"").trim().slice(0,120);
  return `<article class="inbox-card"><div><span class="inbox-status ${item.status}">${status}</span><h3>${escapeHtml(item.title||parsed.name||"待整理菜谱")}</h3><p>${escapeHtml(preview)}</p>${item.sourceUrl?`<small>${escapeHtml(parsed.source)} · 已保存来源链接</small>`:"<small>本机收集</small>"}</div><div class="inbox-actions">${item.recipeRef?`<button type="button" data-action="open" data-ref="${escapeHtml(item.recipeRef)}">打开菜谱</button>`:`<button class="primary-action" type="button" data-action="collect-edit" data-ref="${escapeHtml(item.id)}">完善菜谱</button>`}<button class="text-button danger" type="button" data-action="collect-delete" data-ref="${escapeHtml(item.id)}">删除</button></div></article>`;
}

function renderDiscover() {
  renderCategoryFilters();
  const results = getDiscoverResults();
  const pageData = Core.paginate(results, state.pages.discover, pageSize());
  state.pages.discover = pageData.page;
  const searching = Boolean(state.query.trim());
  els.count.textContent = `${results.length} 道菜谱`;
  els.grid.hidden = results.length === 0;
  els.empty.hidden = results.length !== 0;
  els.kicker.textContent = searching ? "搜索结果" : "为你推荐";
  els.title.textContent = searching ? `与“${state.query}”有关` : "家常好味道";
  els.summary.hidden = !(searching && results.length);
  if (!els.summary.hidden) els.summary.textContent = "关键词会同时匹配菜名、食材、口味、介绍和做法，结果已按相关度排序。";
  els.grid.innerHTML = pageData.items.map(item => cardHtml(item.recipe, "default", item)).join("");
  renderPagination(els.pagers.discover, pageData, "discover");
}

function renderCategoryFilters() {
  if (!els.category || !els.ingredient) return;
  els.category.value = state.category;
  const source = allRecipes().filter(recipe => state.category === "all" || recipe.category === state.category);
  const options = [...new Set(source.flatMap(recipe => recipe.mainIngredients || []))].sort((a,b)=>a.localeCompare(b,"zh-CN"));
  if (state.ingredient !== "all" && !options.includes(state.ingredient)) state.ingredient = "all";
  els.ingredient.innerHTML = `<option value="all">全部食材</option>${options.map(value=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
  els.ingredient.value = state.ingredient;
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

  const inboxPage=Core.paginate(inbox,state.pages.inbox,pageSize());state.pages.inbox=inboxPage.page;
  els.inboxGrid.innerHTML=inboxPage.items.map(inboxCardHtml).join("");
  renderPagination(els.pagers.inbox,inboxPage,"inbox");
  els.inboxGrid.hidden=inbox.length===0;
  els.inboxEmpty.hidden=inbox.length!==0;
  els.inboxCount.textContent=String(inbox.filter(item=>item.status!=="completed").length);
  document.querySelectorAll("[data-library-tab]").forEach(button=>button.classList.toggle("active",button.dataset.libraryTab===state.libraryTab));
  document.querySelectorAll("[data-library-panel]").forEach(panel=>{const active=panel.dataset.libraryPanel===state.libraryTab;panel.hidden=!active;panel.classList.toggle("active",active);});
}

function renderAll() { renderDiscover(); renderLibrary(); }

function renderQuickPicks() {
  const picks = ["番茄","鸡蛋","下饭","快手","汤"];
  els.quick.innerHTML = picks.map(item => `<button type="button" data-query="${item}">${item}</button>`).join("");
}

function setCollectStatus(message="",type="") {
  els.collectStatus.textContent=message;
  els.collectStatus.className=`import-status${type?` ${type}`:""}`;
}

function openCollect(payload=null) {
  state.activeInboxId=null;
  state.pendingCollection=payload;
  els.collectForm.reset();
  els.collectImages.innerHTML="";
  els.collectImages.hidden=true;
  els.collectShareState.hidden=!payload;
  els.collectShareSummary.textContent="";
  setCollectStatus("");
  if(payload){
    els.collectTitle.value=payload.subject||"";
    els.collectUrl.value=payload.sourceUrl||"";
    els.collectText.value=[payload.sharedText,payload.ocrText].filter(Boolean).join("\n\n");
    const images=Array.isArray(payload.images)?payload.images:[];
    els.collectShareSummary.textContent=`${payload.sourceUrl?"视频链接 · ":""}${images.length?`${images.length} 张截图已完成本机识别`:"已收到分享文字"}`;
    if(images.length){
      els.collectImages.hidden=false;
      els.collectImages.innerHTML=images.map((image,index)=>{let data="";try{data=window.YiCanAndroid?.getSharedImageData?.(image.token)||"";}catch(_){}return `<figure>${data?`<img src="${data}" alt="配方截图 ${index+1}">`:""}<figcaption>截图 ${index+1}${image.text?" · 已识别":" · 未识别"}</figcaption></figure>`;}).join("");
    }
    const errors=Array.isArray(payload.errors)?payload.errors.filter(Boolean):[];
    setCollectStatus(errors.length?errors.join("；"):"已完成本机处理，请确认内容后保存",errors.length?"error":"success");
  }
  if(state.view!=="collect")navigateTo("collect");
}

function collectionFromForm() {
  const raw={id:state.pendingCollection?.batchId?`inbox-${state.pendingCollection.batchId}`:`inbox-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,status:"pending",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),title:els.collectTitle.value,subject:state.pendingCollection?.subject||els.collectTitle.value,sourceUrl:els.collectUrl.value,sharedText:els.collectText.value,ocrText:state.pendingCollection?.ocrText||"",imageTokens:(state.pendingCollection?.images||[]).map(image=>image.token),issues:[]};
  const parsed=Core.parseCollectedRecipe(raw);
  raw.title=raw.title.trim()||parsed.name;
  raw.issues=parsed.issues;
  raw.status=raw.issues.length?"review":"pending";
  return Core.normalizeInboxItem(raw);
}

function saveCollection(improve=false) {
  const item=collectionFromForm();
  if(!item||(!item.sourceUrl&&!item.sharedText&&!item.ocrText)){setCollectStatus("请先粘贴链接、文案，或从视频/相册分享截图","error");return;}
  const duplicateIndex=inbox.findIndex(value=>(item.sourceUrl&&value.sourceUrl===item.sourceUrl)||value.id===item.id);
  if(duplicateIndex>=0){item.id=inbox[duplicateIndex].id;item.createdAt=inbox[duplicateIndex].createdAt;inbox.splice(duplicateIndex,1,item);}else inbox.unshift(item);
  state.pages.inbox=1;
  sanitizeAndPersist();
  renderLibrary();
  state.pendingCollection=null;
  if(improve){openCollectedEditor(item.id);return;}
  state.libraryTab="inbox";
  navigateRoot("library");
  renderLibrary();
}

function openCollectedEditor(id) {
  const item=inbox.find(value=>value.id===id);if(!item)return;
  const parsed=Core.parseCollectedRecipe(item);
  state.activeInboxId=id;
  openEditor({...parsed,id:Date.now(),custom:true,colors:["#8a5141","#d48250"]});
  if(parsed.issues.length){els.editorStatus.textContent=`有 ${parsed.issues.length} 处文字需要重点复核`;els.editorStatus.className="import-status error";}
}

function deleteCollection(id) {
  const item=inbox.find(value=>value.id===id);if(!item||!window.confirm(`确定删除“${item.title||"这条收集"}”吗？`))return;
  inbox=inbox.filter(value=>value.id!==id);
  sanitizeAndPersist();renderLibrary();
}

function viewScrollContainer(view = state.view) {
  const page=document.querySelector(`[data-view="${view}"]`);
  return page?.querySelector(".section-shell") || document.scrollingElement;
}

function captureViewScroll() {
  const container=viewScrollContainer();
  if(container)state.viewScroll[state.view]=container.scrollTop || 0;
}

function restoreViewScroll(view) {
  requestAnimationFrame(()=>{const container=viewScrollContainer(view);if(container)container.scrollTop=state.viewScroll[view]||0;});
}

function applyView(view) {
  if (!VALID_VIEWS.includes(view) || (view === "recipe" && !state.activeRecipe) || (view === "cooking" && !state.cooking.ref)) return;
  state.view = view;
  document.body.classList.toggle("editing", view === "editor");
  document.body.classList.toggle("secondary-page", !ROOT_VIEWS.includes(view));
  document.body.classList.toggle("cooking-page-open", view === "cooking");
  els.views.forEach(element => { const active = element.dataset.view === view; element.hidden = !active; element.classList.toggle("active", active); });
  const rootView=state.navStack.find(item=>ROOT_VIEWS.includes(item)) || "discover";
  els.nav.forEach(button => { const active = button.dataset.viewTarget === rootView; button.classList.toggle("active", active); if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current"); });
  renderLibrary();
  restoreViewScroll(view);
}

function navigateRoot(view) {
  if(!ROOT_VIEWS.includes(view))return;
  captureViewScroll();
  state.navStack=[view];
  history.replaceState({view}, "", `#${view}`);
  applyView(view);
}

function navigateTo(view) {
  if(!VALID_VIEWS.includes(view)||view===state.view)return;
  captureViewScroll();
  state.navStack.push(view);
  history.pushState({view}, "", `#${view}`);
  applyView(view);
}

function replaceCurrentView(view) {
  if(!VALID_VIEWS.includes(view))return;
  captureViewScroll();
  state.navStack[state.navStack.length-1]=view;
  history.replaceState({view}, "", `#${view}`);
  applyView(view);
}

function switchView(view) { ROOT_VIEWS.includes(view) ? navigateRoot(view) : navigateTo(view); }

function goBackPage() {
  if(state.view==="cooking")pauseCooking();
  if(state.navStack.length>1){
    captureViewScroll();
    state.navStack.pop();
    const target=state.navStack[state.navStack.length-1];
    state.ignorePopCount+=1;
    history.back();
    applyView(target);
    return;
  }
  if(state.view!=="discover")navigateRoot("discover");
}

window.addEventListener("popstate",event=>{
  if(state.ignorePopCount>0){state.ignorePopCount-=1;return;}
  captureViewScroll();
  if(state.navStack.length>1)state.navStack.pop();
  const target=event.state?.view || state.navStack[state.navStack.length-1] || "discover";
  if(!VALID_VIEWS.includes(target))return;
  if(!state.navStack.length)state.navStack=[target];
  else state.navStack[state.navStack.length-1]=target;
  applyView(target);
});

function toggleFavorite(ref) {
  if (!findRecipe(ref)) return;
  favorites = favorites.includes(ref) ? favorites.filter(item => item !== ref) : [ref, ...favorites];
  sanitizeAndPersist();
  renderAll();
  if (state.activeRecipe === ref && state.view === "recipe") renderRecipePage(findRecipe(ref));
}

function openRecipe(ref) {
  const recipe = findRecipe(ref);
  if (!recipe) return;
  state.returnView = state.view === "recipe" ? state.returnView : state.view;
  state.activeRecipe = Core.recipeRef(recipe);
  state.detailPanel = "overview";
  state.targetServings = Core.normalizeBaseServings(recipe.baseServings);
  recent = Core.addRecent(recent, state.activeRecipe, validRefs());
  sanitizeAndPersist();
  renderLibrary();
  renderRecipePage(recipe);
  switchView("recipe");
}

function renderRecipePage(recipe) {
  const ref = Core.recipeRef(recipe);
  const isFavorite = favorites.includes(ref);
  const sourceUrl = recipe.video || (!recipe.custom ? `https://search.bilibili.com/all?keyword=${encodeURIComponent(`${recipe.source} ${recipe.name}`)}` : "");
  const seekableVideo = /bilibili\.com\/video\//i.test(sourceUrl);
  const panel = state.detailPanel;
  const baseServings = Core.normalizeBaseServings(recipe.baseServings);
  const targetServings = Math.max(.5, Math.min(50, Number(state.targetServings) || baseServings));
  state.targetServings = targetServings;
  const ratio = targetServings / baseServings;
  const displayServings = Number.isInteger(targetServings) ? targetServings : Number(targetServings.toFixed(1));
  const sourceLinks = [];
  if (sourceUrl) sourceLinks.push('<a class="original-link" href="' + escapeHtml(sourceUrl) + '" target="_blank" rel="noopener">查看 ' + escapeHtml(recipe.source) + ' 的来源视频</a>');
  if (recipe.reference) sourceLinks.push('<a class="reference-link" href="' + escapeHtml(recipe.reference.url) + '" target="_blank" rel="noopener">查看 ' + escapeHtml(recipe.reference.title) + ' 的老菜谱参考</a>');
  const sourceMarkup = sourceLinks.length
    ? '<div class="source-links">' + sourceLinks.join("") + (recipe.reference?.note ? '<small>' + escapeHtml(recipe.reference.note) + ' · 参考配方可能与来源视频不同</small>' : "") + '</div>'
    : '<p class="imported-note">这是一份保存在本机的个人菜谱。</p>';
  const hasReferenceAmounts = recipe.ingredients.some(item => String(item.amount || "").includes("老菜谱参考"));
  els.recipeContent.innerHTML = `<article class="recipe-page"><div class="dialog-hero compact" style="--dialog-a:${escapeHtml(recipe.colors[0])};--dialog-b:${escapeHtml(recipe.colors[1])}"><span class="dish-emoji" aria-hidden="true">${escapeHtml(recipe.emoji)}</span><div><p>${escapeHtml(recipe.source)}</p><h2>${escapeHtml(recipe.name)}</h2></div></div>
    <div class="dialog-body"><div class="detail-actions"><button class="favorite-action ${isFavorite ? "active" : ""}" data-action="favorite" data-ref="${ref}">${isFavorite ? "♥ 已收藏" : "♡ 收藏"}</button><button class="primary-action" data-action="cook" data-ref="${ref}">开始烹饪</button><button data-action="edit" data-ref="${ref}">修改</button>${recipe.override || recipe.custom ? `<details class="detail-more"><summary>更多</summary><div>${recipe.override?`<button data-action="restore" data-ref="${ref}">恢复原版</button>`:""}${recipe.custom ? `<button class="danger" data-action="delete" data-ref="${ref}">删除</button>` : ""}</div></details>` : ""}</div>
    <div class="detail-tabs" role="tablist">${[["overview","概览"],["ingredients","食材"],["steps","步骤"]].map(([key,label])=>`<button type="button" data-detail-panel="${key}" class="${panel===key?"active":""}">${label}</button>`).join("")}</div>
    <section class="detail-panel" ${panel!=="overview"?"hidden":""}><p>${escapeHtml(recipe.description)}</p><div class="detail-facts"><span>约 ${recipe.time} 分钟</span><span>${escapeHtml(recipe.difficulty)}</span><span>${escapeHtml(recipe.category)}</span><span>原配方 ${baseServings} 份</span>${recipe.mainIngredients.map(value => `<span>${escapeHtml(value)}</span>`).join("")}${recipe.flavors.map(value => `<span>${escapeHtml(value)}</span>`).join("")}</div>${sourceMarkup}</section>
    <section class="detail-panel" ${panel!=="ingredients"?"hidden":""}><div class="serving-control"><div><strong>${displayServings} 份</strong><small>原配方 ${baseServings} 份 · 当前 ${Number(ratio.toFixed(2))} 倍</small></div><div class="serving-presets">${[[.5,"半份"],[1,"原配方"],[1.5,"1.5 倍"],[2,"双份"]].map(([value,label])=>`<button type="button" data-serving-ratio="${value}" class="${Math.abs(ratio-value)<.001?"active":""}">${label}</button>`).join("")}</div><div class="serving-stepper"><button type="button" data-serving-action="minus" aria-label="减少半份">−</button><span>${displayServings} 份</span><button type="button" data-serving-action="plus" aria-label="增加半份">＋</button></div></div><ul class="ingredient-list">${recipe.ingredients.map(item => `<li><span>${escapeHtml(item.name)}${item.optional ? "（可选）" : ""}</span>${item.amount?`<b>${escapeHtml(Core.scaleAmount(item.amount,ratio))}</b>`:""}</li>`).join("")}</ul>${hasReferenceAmounts?'<p class="reference-note">标有“老菜谱参考”的用量来自同名传统菜谱，仅供与来源视频对照。</p>':""}</section>
    <section class="detail-panel" ${panel!=="steps"?"hidden":""}><ol class="steps">${recipe.steps.map((step,index) => `<li><div class="step-heading"><strong>${escapeHtml(step[0])}</strong><span class="step-meta">${step[3]!=null?(seekableVideo?`<a href="${escapeHtml(videoAt(sourceUrl,step[3]))}" target="_blank" rel="noopener">视频 ${formatTimestamp(step[3])}</a>`:`<span>视频 ${formatTimestamp(step[3])}</span>`):""}${step[2]?`<small>建议 ${formatDuration(step[2])}</small>`:""}</span></div><p>${escapeHtml(step[1])}</p><button type="button" data-action="cook-step" data-ref="${ref}" data-step-index="${index}">从这一步开始</button></li>`).join("")}</ol>${recipe.tips?.length?`<aside class="recipe-tips"><strong>Tips</strong><ul>${recipe.tips.map(tip=>`<li>${escapeHtml(tip)}</li>`).join("")}</ul></aside>`:""}</section></div></article>`;
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
  row.innerHTML = `<input class="ingredient-name" maxlength="50" required placeholder="食材名称" value="${escapeHtml(value.name || "")}"><input class="ingredient-amount" maxlength="80" placeholder="用量，如 200克" value="${escapeHtml(value.amount || "")}"><label class="check-label"><input class="ingredient-optional" type="checkbox" ${value.optional ? "checked" : ""}>可选</label><div class="row-tools"><button type="button" data-row-action="up" title="上移">↑</button><button type="button" data-row-action="down" title="下移">↓</button><button type="button" data-row-action="duplicate" title="复制">⧉</button><button type="button" class="danger" data-row-action="remove" title="删除">×</button></div>`;
  document.querySelector("#ingredient-rows").appendChild(row);
  return row;
}

function addStepRow(value = []) {
  const duration = Number(value[2]) || 0;
  const row = document.createElement("div");
  row.className = "dynamic-row step-row";
  row.innerHTML = `<input class="step-title" maxlength="50" placeholder="步骤标题" value="${escapeHtml(value[0] || "")}"><textarea class="step-description" maxlength="800" rows="2" required placeholder="具体怎么做">${escapeHtml(value[1] || "")}</textarea><label class="duration-field">分钟<input class="step-minutes" type="number" min="0" max="240" value="${duration ? Math.floor(duration/60) : ""}" placeholder="0"></label><label class="duration-field">秒钟<input class="step-seconds" type="number" min="0" max="59" value="${duration ? duration%60 : ""}" placeholder="0"></label><label class="duration-field">视频时间点<input class="step-timestamp" inputmode="numeric" maxlength="8" value="${value[3] != null ? formatTimestamp(value[3]) : ""}" placeholder="03:12"></label><div class="row-tools"><button type="button" data-row-action="up" title="上移">↑</button><button type="button" data-row-action="down" title="下移">↓</button><button type="button" data-row-action="duplicate" title="复制">⧉</button><button type="button" class="danger" data-row-action="remove" title="删除">×</button></div>`;
  document.querySelector("#step-rows").appendChild(row);
  return row;
}

function editorDraftKey(recipe) { return recipe ? Core.recipeRef(recipe) : "new"; }
function getEditorDrafts() { return Core.parseEditorDrafts(localStorage); }
function writeEditorDrafts(drafts) { localStorage.setItem(Core.EDITOR_DRAFTS_STORAGE_KEY, JSON.stringify(drafts)); }
function removeEditorDraft(key = state.editorDraftKey) {
  const drafts = getEditorDrafts();
  if (drafts[key]) { delete drafts[key]; writeEditorDrafts(drafts); }
}

function parseEditorTimestamp(value) {
  const raw=String(value||"").trim();
  if(!raw)return null;
  const parts=raw.split(":").map(item=>Number(item));
  if(parts.length<2||parts.length>3||parts.some(item=>!Number.isInteger(item)||item<0))throw new Error("视频时间点请填写为 03:12 或 1:03:12");
  const seconds=parts.reduce((total,item)=>total*60+item,0);
  if(seconds>86400)throw new Error("视频时间点不能超过 24 小时");
  return seconds;
}

function readIngredientRows() {
  return [...document.querySelectorAll(".ingredient-row")].map(row => ({name:row.querySelector(".ingredient-name").value,amount:row.querySelector(".ingredient-amount").value,optional:row.querySelector(".ingredient-optional").checked}));
}

function readStepRows(validate = false) {
  return [...document.querySelectorAll(".step-row")].map(row => {
    const minutes=Number(row.querySelector(".step-minutes").value||0), seconds=Number(row.querySelector(".step-seconds").value||0);
    const duration=minutes*60+seconds;
    if(validate&&(minutes<0||seconds<0||seconds>59||duration>14400))throw new Error("单步计时必须在 1 秒到 240 分钟内");
    let timestamp=null;
    try { timestamp=parseEditorTimestamp(row.querySelector(".step-timestamp").value); } catch(error) { if(validate)throw error; }
    const result=[row.querySelector(".step-title").value,row.querySelector(".step-description").value];
    if(duration||timestamp!=null)result.push(duration||null);
    if(timestamp!=null){if(result.length<3)result.push(null);result.push(timestamp);}
    return result;
  });
}

function collectEditorSnapshot() {
  return {editorStep:state.editorStep,id:document.querySelector("#editor-id").value,name:document.querySelector("#editor-name").value,emoji:document.querySelector("#editor-emoji").value,time:document.querySelector("#editor-time").value,difficulty:document.querySelector("#editor-difficulty").value,category:document.querySelector("#editor-category").value,baseServings:document.querySelector("#editor-base-servings").value,source:document.querySelector("#editor-source").value,video:document.querySelector("#editor-video").value,mainIngredients:document.querySelector("#editor-main-ingredients").value,flavors:document.querySelector("#editor-flavors").value,description:document.querySelector("#editor-description").value,tips:document.querySelector("#editor-tips").value,ingredients:readIngredientRows(),steps:readStepRows(false)};
}

function applyEditorSnapshot(snapshot) {
  if(!snapshot||typeof snapshot!=="object")return;
  const values={"editor-id":snapshot.id,"editor-name":snapshot.name,"editor-emoji":snapshot.emoji,"editor-time":snapshot.time,"editor-difficulty":snapshot.difficulty,"editor-category":snapshot.category,"editor-base-servings":snapshot.baseServings,"editor-source":snapshot.source,"editor-video":snapshot.video,"editor-main-ingredients":snapshot.mainIngredients,"editor-flavors":snapshot.flavors,"editor-description":snapshot.description,"editor-tips":snapshot.tips};
  Object.entries(values).forEach(([id,value])=>{const field=document.querySelector(`#${id}`);if(field&&value!=null)field.value=value;});
  document.querySelector("#ingredient-rows").innerHTML="";
  document.querySelector("#step-rows").innerHTML="";
  (Array.isArray(snapshot.ingredients)&&snapshot.ingredients.length?snapshot.ingredients:[{}]).forEach(addIngredientRow);
  (Array.isArray(snapshot.steps)&&snapshot.steps.length?snapshot.steps:[["",""]]).forEach(addStepRow);
  setEditorStep(Number(snapshot.editorStep)||0);
}

function persistEditorDraft() {
  if(state.editorDraftPaused||!state.editorDraftKey)return;
  const drafts=getEditorDrafts();
  drafts[state.editorDraftKey]={ref:state.editorDraftKey,updatedAt:new Date().toISOString(),snapshot:collectEditorSnapshot()};
  writeEditorDrafts(drafts);
  state.editorDirty=false;
  els.editorDraftStatus.textContent="草稿已自动保存";
}

function markEditorDirty() {
  if(state.editorDraftPaused)return;
  state.editorDirty=true;
  els.editorDraftStatus.textContent="正在保存…";
  clearTimeout(state.editorDraftTimer);
  state.editorDraftTimer=setTimeout(persistEditorDraft,500);
}

function populateEditor(recipe) {
  els.editorForm.reset();
  els.editorStatus.textContent = "";
  document.querySelector("#ingredient-rows").innerHTML = "";
  document.querySelector("#step-rows").innerHTML = "";
  document.querySelector("#editor-ref").value = recipe ? Core.recipeRef(recipe) : "";
  document.querySelector("#editor-id").value = recipe ? recipe.id : "";
  document.querySelector("#editor-title").textContent = recipe ? "修改菜谱" : "新建菜谱";
  document.querySelector("#editor-origin-note").textContent = recipe && !recipe.custom ? "修改只保存在本机，随时可以恢复内置原版。" : "";
  document.querySelector("#editor-name").value = recipe?.name || "";
  document.querySelector("#editor-emoji").value = recipe?.emoji || "🍽️";
  document.querySelector("#editor-time").value = recipe?.time || 20;
  document.querySelector("#editor-difficulty").value = recipe?.difficulty || "简单";
  document.querySelector("#editor-source").value = recipe?.source || "我的菜谱";
  document.querySelector("#editor-category").value = recipe?.category || "素";
  document.querySelector("#editor-base-servings").value = Core.normalizeBaseServings(recipe?.baseServings);
  document.querySelector("#editor-video").value = recipe?.video || "";
  document.querySelector("#editor-main-ingredients").value = recipe?.mainIngredients?.join("，") || "";
  document.querySelector("#editor-flavors").value = recipe?.flavors?.join("，") || "";
  document.querySelector("#editor-description").value = recipe?.description || "";
  document.querySelector("#editor-tips").value = recipe?.tips?.join("\n") || "";
  (recipe?.ingredients || [{}]).forEach(addIngredientRow);
  (recipe?.steps || [["",""]]).forEach(addStepRow);
  setEditorStep(0);
}

function openEditor(recipe) {
  state.editorReturnView=state.view;
  if(state.view!=="recipe")state.returnView=state.view;
  state.editorDraftKey=editorDraftKey(recipe);
  state.editorDraftPaused=false;
  state.editorDirty=false;
  clearTimeout(state.editorDraftTimer);
  populateEditor(recipe);
  const draft=getEditorDrafts()[state.editorDraftKey];
  state.editorDraftPaused=Boolean(draft);
  els.editorDraftBanner.hidden=!draft;
  els.editorForm.classList.toggle("draft-paused",Boolean(draft));
  els.editorDraftStatus.textContent=draft?"有未完成草稿":"尚未修改";
  switchView("editor");
}

function resumeEditorDraft() {
  const draft=getEditorDrafts()[state.editorDraftKey];
  if(draft)applyEditorSnapshot(draft.snapshot);
  state.editorDraftPaused=false;
  els.editorDraftBanner.hidden=true;
  els.editorForm.classList.remove("draft-paused");
  els.editorDraftStatus.textContent="已恢复草稿";
}

function discardEditorDraft() {
  const existing=state.editorDraftKey==="new"?null:findRecipe(state.editorDraftKey);
  removeEditorDraft();
  state.editorDraftPaused=false;
  els.editorDraftBanner.hidden=true;
  els.editorForm.classList.remove("draft-paused");
  populateEditor(existing);
  els.editorDraftStatus.textContent="草稿已丢弃";
}

function leaveEditor() {
  clearTimeout(state.editorDraftTimer);
  if(state.editorDirty&&!state.editorDraftPaused)persistEditorDraft();
  goBackPage();
}

function saveEditor() {
  const editingRef = document.querySelector("#editor-ref").value;
  const idValue = Number(document.querySelector("#editor-id").value);
  const ingredients = readIngredientRows();
  const steps = readStepRows(true);
  const existing = editingRef ? findRecipe(editingRef) : null;
  const raw = {...(existing || {}), id:idValue || Date.now(), name:document.querySelector("#editor-name").value, emoji:document.querySelector("#editor-emoji").value, time:document.querySelector("#editor-time").value, difficulty:document.querySelector("#editor-difficulty").value, category:document.querySelector("#editor-category").value, baseServings:document.querySelector("#editor-base-servings").value, mainIngredients:document.querySelector("#editor-main-ingredients").value.split(/[，,、]/), source:document.querySelector("#editor-source").value, video:document.querySelector("#editor-video").value, flavors:document.querySelector("#editor-flavors").value.split(/[，,]/), description:document.querySelector("#editor-description").value, tips:document.querySelector("#editor-tips").value.split(/\r?\n/), ingredients, steps};
  if (editingRef.startsWith("builtin:")) {
    const base = builtInRecipes.find(recipe => recipe.id === Number(editingRef.split(":")[1]));
    if (!base) throw new Error("找不到要修改的内置菜谱");
    const normalized = Core.normalizeRecipeOverride({...base,...raw,id:base.id},0);
    const overrideIndex = recipeOverrides.findIndex(recipe => recipe.id === base.id);
    if (overrideIndex >= 0) recipeOverrides.splice(overrideIndex,1,normalized); else recipeOverrides.push(normalized);
    sanitizeAndPersist();
    renderAll();
    removeEditorDraft();
    finishEditorSave(`builtin:${base.id}`);
    return;
  }
  const normalized = Core.normalizeImportedRecipe(raw, 0, true);
  const duplicate = customRecipes.find(item => item.id !== normalized.id && Core.recipeIdentity(item) === Core.recipeIdentity(normalized));
  if (duplicate) throw new Error("已有同名且来源相同的个人菜谱");
  const index = customRecipes.findIndex(item => item.id === normalized.id);
  if (index >= 0) customRecipes.splice(index, 1, normalized); else customRecipes.unshift(normalized);
  sanitizeAndPersist();
  renderAll();
  removeEditorDraft();
  finishEditorSave(Core.recipeRef(normalized));
  setGlobalStatus(index >= 0 ? "菜谱已更新" : "菜谱已保存", "success");
}

function finishEditorSave(ref) {
  clearTimeout(state.editorDraftTimer);
  state.editorDirty=false;
  state.activeRecipe=ref;
  if(state.activeInboxId){const item=inbox.find(value=>value.id===state.activeInboxId);if(item){item.status="completed";item.recipeRef=ref;item.updatedAt=new Date().toISOString();}state.activeInboxId=null;}
  recent=Core.addRecent(recent,ref,validRefs());
  sanitizeAndPersist();
  renderAll();
  renderRecipePage(findRecipe(ref));
  if(state.editorReturnView==="recipe")goBackPage();
  else replaceCurrentView("recipe");
}

function setEditorStep(index) {
  state.editorStep=Math.max(0,Math.min(2,index));
  document.querySelectorAll("[data-editor-panel]").forEach(panel=>{const active=Number(panel.dataset.editorPanel)===state.editorStep;panel.hidden=!active;panel.classList.toggle("active",active);});
  document.querySelectorAll("[data-editor-step]").forEach((item,i)=>item.classList.toggle("active",i===state.editorStep));
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
  markEditorDirty();
}

function handleEditorRowAction(button) {
  const row=button.closest(".dynamic-row"), container=row?.parentElement;
  if(!row||!container)return;
  const action=button.dataset.rowAction;
  if(action==="remove") {
    if(container.children.length>1)row.remove();
    else els.editorStatus.textContent="至少保留一项";
  } else if(action==="up"&&row.previousElementSibling)container.insertBefore(row,row.previousElementSibling);
  else if(action==="down"&&row.nextElementSibling)container.insertBefore(row.nextElementSibling,row);
  else if(action==="duplicate") {
    const index=[...container.children].indexOf(row);
    const duplicate=container.id==="ingredient-rows"?addIngredientRow(readIngredientRows()[index]):addStepRow(readStepRows(false)[index]);
    container.insertBefore(duplicate,row.nextElementSibling);
  }
  markEditorDirty();
}

function updateServingControl(target) {
  const recipe=findRecipe(state.activeRecipe);if(!recipe)return;
  state.targetServings=Math.max(.5,Math.min(50,Math.round(Number(target)*2)/2));
  state.detailPanel="ingredients";
  renderRecipePage(recipe);
}

function deleteRecipe(ref) {
  const recipe = findRecipe(ref);
  if (!recipe?.custom || !window.confirm(`确定删除“${recipe.name}”吗？此操作无法撤销。`)) return;
  const index = customRecipes.findIndex(item => item.id === recipe.id);
  if (index >= 0) customRecipes.splice(index, 1);
  favorites = favorites.filter(item => item !== ref);
  recent = recent.filter(item => item !== ref);
  sanitizeAndPersist();
  renderAll();
  if (state.view === "recipe") goBackPage();
  setGlobalStatus("个人菜谱已删除", "success");
}

function restoreRecipe(ref) {
  const recipe = findRecipe(ref);
  if (!recipe?.override || !window.confirm(`恢复“${recipe.name}”的内置原版吗？本机修改将被删除。`)) return;
  const index = recipeOverrides.findIndex(item => item.id === recipe.id);
  if (index >= 0) recipeOverrides.splice(index,1);
  sanitizeAndPersist();
  renderAll();
  state.activeRecipe = ref;
  renderRecipePage(findRecipe(ref));
}

function handleAction(action, ref, button) {
  if (action === "open") openRecipe(ref);
  if (action === "favorite") toggleFavorite(ref);
  if (action === "edit") {state.activeInboxId=null;openEditor(findRecipe(ref));}
  if (action === "delete") deleteRecipe(ref);
  if (action === "restore") restoreRecipe(ref);
  if (action === "cook") openCooking(ref, 0);
  if (action === "cook-step") openCooking(ref, Number(button?.dataset.stepIndex || 0));
  if (action === "collect-edit") openCollectedEditor(ref);
  if (action === "collect-delete") deleteCollection(ref);
}

function openCooking(ref, stepIndex = 0) {
  const recipe=findRecipe(ref); if(!recipe)return;
  let stored=null;
  try { stored=JSON.parse(localStorage.getItem(Core.TIMER_STORAGE_KEY)||"null"); } catch (_) {}
  state.cooking.ref=ref;
  state.cooking.index=Math.max(0,Math.min(recipe.steps.length-1,stepIndex));
  state.cooking.completed=new Set(stored?.recipeRef===ref&&Array.isArray(stored.completedSteps)?stored.completedSteps.filter(index=>Number.isInteger(index)&&index>=0&&index<recipe.steps.length):[]);
  state.cooking.running=false;
  state.cooking.remaining=recipe.steps[state.cooking.index][2]||0;
  if(stored?.recipeRef===ref&&Number(stored.stepIndex)===state.cooking.index){
    state.cooking.deadline=Number(stored.deadline)||0;
    state.cooking.running=Boolean(stored.running&&state.cooking.deadline>Date.now());
    state.cooking.remaining=state.cooking.running?Math.max(0,Math.ceil((state.cooking.deadline-Date.now())/1000)):Math.max(0,Number(stored.durationSeconds)||state.cooking.remaining);
  }
  try {
    const native=window.YiCanAndroid?.getStepTimerState?JSON.parse(window.YiCanAndroid.getStepTimerState()):null;
    if(native?.recipeRef===ref&&native.stepIndex===state.cooking.index&&native.remainingSeconds>0){state.cooking.remaining=native.remainingSeconds;state.cooking.deadline=native.deadline;state.cooking.running=true;}
  } catch (_) {}
  state.activeRecipe=ref;
  state.detailPanel="steps";
  renderRecipePage(recipe);
  renderCooking();
  navigateTo("cooking");
  startCookingTick();
}

function renderCooking() {
  const recipe=findRecipe(state.cooking.ref); if(!recipe)return;
  const index=state.cooking.index, step=recipe.steps[index], done=state.cooking.completed.has(index);
  const seconds=state.cooking.running?Math.max(0,Math.ceil((state.cooking.deadline-Date.now())/1000)):state.cooking.remaining;
  els.cookingContent.innerHTML=`<header><button type="button" data-cook-action="close">← 返回</button><div><small>${escapeHtml(recipe.name)}</small><strong>第 ${index+1} / ${recipe.steps.length} 步</strong></div><button type="button" data-cook-action="complete" class="${done?"active":""}">${done?"✓ 已完成":"完成步骤"}</button></header><main><p class="cooking-kicker">${escapeHtml(step[0])}</p><h2>${escapeHtml(step[1])}</h2><div class="timer-display ${seconds===0&&state.cooking.running?"finished":""}">${formatClock(seconds)}</div><label class="manual-timer">计时秒数<input id="cooking-seconds" type="number" min="1" max="14400" value="${Math.max(1,seconds||step[2]||300)}"></label><p id="timer-note">${state.cooking.running?(seconds?"计时中；结束后只提醒，不会自动跳步":"时间到，请按自己的节奏继续"):step[2]?`建议 ${formatDuration(step[2])}`:"这一步没有预设时间，可手动输入"}</p><div class="timer-actions"><button type="button" data-cook-action="reset">重置</button><button type="button" data-cook-action="toggle" class="primary-action">${state.cooking.running?"暂停":"开始"}</button><button type="button" data-cook-action="add">＋1 分钟</button></div></main><footer><button type="button" data-cook-action="prev" ${index===0?"disabled":""}>上一步</button><button type="button" data-cook-action="next" ${index===recipe.steps.length-1?"disabled":""}>下一步</button></footer>`;
}

function formatClock(seconds){const value=Math.max(0,Math.ceil(Number(seconds)||0));return `${String(Math.floor(value/60)).padStart(2,"0")}:${String(value%60).padStart(2,"0")}`;}
function persistCookingTimer(){const c=state.cooking;if(!c.ref){localStorage.removeItem(Core.TIMER_STORAGE_KEY);return;}localStorage.setItem(Core.TIMER_STORAGE_KEY,JSON.stringify({recipeRef:c.ref,stepIndex:c.index,deadline:c.deadline,durationSeconds:Math.max(1,c.remaining||Math.ceil((c.deadline-Date.now())/1000)||1),running:c.running,completedSteps:[...c.completed].sort((a,b)=>a-b)}));}
function startCookingTick(){if(state.cooking.tick)clearInterval(state.cooking.tick);state.cooking.tick=setInterval(()=>{if(!state.cooking.running)return;state.cooking.remaining=Math.max(0,Math.ceil((state.cooking.deadline-Date.now())/1000));if(state.cooking.remaining===0){state.cooking.running=false;clearInterval(state.cooking.tick);state.cooking.tick=null;}persistCookingTimer();renderCooking();},1000);}
function pauseCooking(){if(state.cooking.running)state.cooking.remaining=Math.max(0,Math.ceil((state.cooking.deadline-Date.now())/1000));state.cooking.running=false;window.YiCanAndroid?.cancelStepTimer?.();persistCookingTimer();}
function changeCookingStep(delta){const recipe=findRecipe(state.cooking.ref);if(!recipe)return;pauseCooking();state.cooking.index=Math.max(0,Math.min(recipe.steps.length-1,state.cooking.index+delta));state.cooking.remaining=recipe.steps[state.cooking.index][2]||0;state.cooking.deadline=0;persistCookingTimer();renderCooking();}
function handleCookingAction(action){const recipe=findRecipe(state.cooking.ref);if(!recipe)return;if(action==="close"){pauseCooking();goBackPage();return;}if(action==="prev")changeCookingStep(-1);if(action==="next")changeCookingStep(1);if(action==="complete"){state.cooking.completed.has(state.cooking.index)?state.cooking.completed.delete(state.cooking.index):state.cooking.completed.add(state.cooking.index);persistCookingTimer();renderCooking();}if(action==="reset"){pauseCooking();state.cooking.remaining=recipe.steps[state.cooking.index][2]||0;state.cooking.deadline=0;persistCookingTimer();renderCooking();}if(action==="add"){const current=state.cooking.running?Math.max(0,Math.ceil((state.cooking.deadline-Date.now())/1000)):Number(document.querySelector("#cooking-seconds")?.value||state.cooking.remaining||0);state.cooking.remaining=Math.min(14400,current+60);if(state.cooking.running){state.cooking.deadline=Date.now()+state.cooking.remaining*1000;window.YiCanAndroid?.startStepTimer?.(state.cooking.ref,state.cooking.index,state.cooking.remaining);}persistCookingTimer();renderCooking();}if(action==="toggle"){if(state.cooking.running){pauseCooking();renderCooking();}else{const seconds=Math.max(1,Math.min(14400,Number(document.querySelector("#cooking-seconds")?.value||state.cooking.remaining||recipe.steps[state.cooking.index][2]||300)));state.cooking.remaining=seconds;state.cooking.deadline=Date.now()+seconds*1000;state.cooking.running=true;persistCookingTimer();window.YiCanAndroid?.startStepTimer?.(state.cooking.ref,state.cooking.index,seconds);startCookingTick();renderCooking();}}}

function importFromText(text) {
  const result = Core.importFromText({customRecipes, recipeOverrides, favorites, recent, inbox}, text, builtInRefs);
  customRecipes.splice(0, customRecipes.length, ...result.customRecipes);
  recipeOverrides.splice(0, recipeOverrides.length, ...(result.recipeOverrides || []));
  favorites = result.favorites;
  recent = result.recent;
  inbox = result.inbox || inbox;
  sanitizeAndPersist();
  renderAll();
  return result;
}

function exportBackup() {
  const backup = Core.createBackup(customRecipes, favorites, recent, undefined, state.appVersion, recipeOverrides, inbox);
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
      els.releaseNotes.hidden = false;
    }
    const downloading = result.status === "downloading" || result.status === "verifying";
    const canRetry = ["error","cancelled"].includes(result.status) && Boolean(result.versionName);
    els.updateProgress.hidden = !downloading;
    els.updateProgress.value = Number(result.progress || 0);
    els.cancelUpdate.hidden = result.status !== "downloading";
    els.retryUpdate.hidden = !canRetry;
    els.installUpdate.hidden = !["verified","permission","installing"].includes(result.status);
    els.downloadUpdate.hidden = result.status !== "available";
    if(result.status==="available"&&result.versionName)els.updateBadge.innerHTML=`有新版本 <b>${escapeHtml(result.versionName)}</b>`;
    else if(["latest","up-to-date"].includes(result.status))els.updateBadge.innerHTML=`当前 <b>${escapeHtml(state.appVersion)}</b>`;
    if (downloading && !state.updatePoll) state.updatePoll = setInterval(pollUpdateState, 1000);
    if (!downloading && state.updatePoll) { clearInterval(state.updatePoll); state.updatePoll = null; }
  },
  onSharedRecipe(result) {
    openCollect(result || {});
  },
  onNativeStatus(event) {
    if(event?.type!=="timer")return;
    const payload=event.payload||{};
    if(payload.notificationAllowed===false)document.querySelector("#timer-note")?.replaceChildren(document.createTextNode("前台计时可用；未开启通知，后台可能无法提醒"));
  },
  onTimerOpen(recipeRef, stepIndex) {
    const recipe=findRecipe(recipeRef);if(!recipe)return;
    if(state.view!=="recipe"){state.activeRecipe=recipeRef;state.detailPanel="steps";renderRecipePage(recipe);navigateTo("recipe");}
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
    els.currentVersion.textContent = info.versionName || "1.9.0";
    els.updateCurrentVersion.textContent = info.versionName || "1.9.0";
    state.appVersion = info.versionName || "unknown";
    pollUpdateState();
  } catch (_) {}
}

function registerRecipeTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const register = tool => { try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch (_) {} };
  register({name:"search_recipes",title:"关键词搜索菜谱",description:"在一餐中同时搜索菜名、食材、口味、介绍和做法。",inputSchema:{type:"object",properties:{query:{type:"string",minLength:1}},required:["query"],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){ if(!input?.query?.trim()) throw new Error("query 必须是非空字符串");state.query=input.query.trim();els.input.value=state.query;state.pages.discover=1;switchView("discover");renderDiscover();return {count:getDiscoverResults().length,recipes:getDiscoverResults().map(item=>({name:item.recipe.name,matches:item.matches}))}; }});
}

document.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) handleAction(actionButton.dataset.action, actionButton.dataset.ref, actionButton);
  const detailButton=event.target.closest("[data-detail-panel]");
  if(detailButton){state.detailPanel=detailButton.dataset.detailPanel;const recipe=findRecipe(state.activeRecipe);if(recipe)renderRecipePage(recipe);}
  const servingPreset=event.target.closest("[data-serving-ratio]");
  if(servingPreset){const recipe=findRecipe(state.activeRecipe);if(recipe)updateServingControl(Core.normalizeBaseServings(recipe.baseServings)*Number(servingPreset.dataset.servingRatio));}
  const servingAction=event.target.closest("[data-serving-action]");
  if(servingAction)updateServingControl(state.targetServings+(servingAction.dataset.servingAction==="plus"?.5:-.5));
  const mineButton=event.target.closest("[data-mine-target]");if(mineButton)switchView(mineButton.dataset.mineTarget);
  const libraryTab=event.target.closest("[data-library-tab]");if(libraryTab){state.libraryTab=libraryTab.dataset.libraryTab;renderLibrary();viewScrollContainer("library")?.scrollTo({top:0,behavior:"smooth"});}
  if(event.target.closest("[data-open-collect]"))openCollect();
  if(event.target.closest("[data-page-back]"))goBackPage();
  const pageButton=event.target.closest("[data-page-scope]");if(pageButton&&!pageButton.disabled){state.pages[pageButton.dataset.pageScope]=Number(pageButton.dataset.page);renderAll();const grid=document.querySelector(`#${pageButton.dataset.pageScope==='discover'?'recipe':pageButton.dataset.pageScope}-grid`);grid?.scrollIntoView({block:"start",behavior:"smooth"});}
  const cookButton=event.target.closest("[data-cook-action]");if(cookButton)handleCookingAction(cookButton.dataset.cookAction);
  const viewButton = event.target.closest("[data-view-target], [data-go]");
  if (viewButton) switchView(viewButton.dataset.viewTarget || viewButton.dataset.go);
  const closeButton = event.target.closest("[data-close]");
  if (closeButton) document.querySelector(`#${closeButton.dataset.close}`)?.close();
  const queryButton = event.target.closest("[data-query]");
  if (queryButton) { els.input.value=queryButton.dataset.query; state.query=queryButton.dataset.query; state.pages.discover=1; renderDiscover(); document.querySelector("#results-title").scrollIntoView({behavior:"smooth"}); }
  const rowAction=event.target.closest("[data-row-action]");if(rowAction)handleEditorRowAction(rowAction);
  const editorStep=event.target.closest("[data-editor-step]");if(editorStep){const target=Number(editorStep.dataset.editorStep);if(target<=state.editorStep)setEditorStep(target);else while(state.editorStep<target){const before=state.editorStep;advanceEditor(1);if(state.editorStep===before)break;}}
});

document.querySelector("#brand-home").addEventListener("click", () => switchView("discover"));
function applySearchInput(scroll=false){clearTimeout(state.searchTimer);state.query=els.input.value.trim();state.pages.discover=1;els.searchClear.hidden=!state.query;renderDiscover();if(scroll)document.querySelector("#results-title").scrollIntoView({behavior:"smooth"});}
els.input.addEventListener("input",()=>{els.searchClear.hidden=!els.input.value;clearTimeout(state.searchTimer);state.searchTimer=setTimeout(()=>applySearchInput(false),250);});
els.searchClear.addEventListener("click",()=>{els.input.value="";applySearchInput(false);els.input.focus();});
els.form.addEventListener("submit", event => {event.preventDefault();applySearchInput(true);});
els.time.addEventListener("change",()=>{state.time=els.time.value;state.pages.discover=1;renderDiscover();});
els.category.addEventListener("change",()=>{state.category=els.category.value;state.ingredient="all";state.pages.discover=1;renderDiscover();});
els.ingredient.addEventListener("change",()=>{state.ingredient=els.ingredient.value;state.pages.discover=1;renderDiscover();});
window.addEventListener("resize",()=>{clearTimeout(state.resizeTimer);state.resizeTimer=setTimeout(renderAll,120);});
document.querySelector("#reset-button").addEventListener("click",()=>{state.query="";state.time="all";state.category="all";state.ingredient="all";state.pages.discover=1;els.input.value="";els.time.value="all";els.category.value="all";renderDiscover();});
document.querySelector("#new-recipe").addEventListener("click",()=>{state.activeInboxId=null;openEditor(null);});
document.querySelector("#add-ingredient").addEventListener("click",()=>{addIngredientRow();markEditorDirty();});
document.querySelector("#add-step").addEventListener("click",()=>{addStepRow();markEditorDirty();});
document.querySelector("#editor-prev").addEventListener("click",()=>advanceEditor(-1));
document.querySelector("#editor-next").addEventListener("click",()=>advanceEditor(1));
document.querySelector("#editor-exit").addEventListener("click",leaveEditor);
document.querySelector("#resume-draft").addEventListener("click",resumeEditorDraft);
document.querySelector("#discard-draft").addEventListener("click",discardEditorDraft);
els.editorForm.addEventListener("input",markEditorDirty);
els.editorForm.addEventListener("change",markEditorDirty);
els.editorForm.addEventListener("submit",event=>{event.preventDefault();try{saveEditor();}catch(error){els.editorStatus.textContent=error.message||"无法保存菜谱";els.editorStatus.className="import-status error";}});
document.querySelector("#clear-recent").addEventListener("click",()=>{if(!recent.length||!window.confirm("确定清空最近浏览吗？"))return;recent=[];state.pages.recent=1;sanitizeAndPersist();renderLibrary();});
document.querySelector("#collect-save").addEventListener("click",()=>saveCollection(false));
els.collectForm.addEventListener("submit",event=>{event.preventDefault();saveCollection(true);});
document.querySelector("#open-import").addEventListener("click",()=>{els.importForm.reset();setImportStatus("");navigateTo("import");});
els.importFile.addEventListener("change",async()=>{const file=els.importFile.files?.[0];if(!file)return;if(file.size>5*1024*1024){setImportStatus("文件不能超过 5 MB","error");return;}try{els.importJson.value=await file.text();setImportStatus(`已读取 ${file.name}，请确认导入`,"success");}catch(_){setImportStatus("无法读取这个文件","error");}});
els.importForm.addEventListener("submit",event=>{event.preventDefault();try{const result=importFromText(els.importJson.value);const message=`成功加入 ${result.added} 份菜谱${result.overridesAdded?`，恢复 ${result.overridesAdded} 份内置菜谱修改`:""}${result.skipped?`，跳过 ${result.skipped} 份重复菜谱`:""}`;setImportStatus(message,"success");setGlobalStatus(message,"success");setTimeout(goBackPage,700);}catch(error){setImportStatus(error.message||"导入失败","error");}});
document.querySelector("#export-backup").addEventListener("click",exportBackup);
document.querySelector("#check-update").addEventListener("click",()=>checkForUpdate(true));
els.downloadUpdate.addEventListener("click",()=>{if(window.YiCanAndroid?.downloadUpdate)window.YiCanAndroid.downloadUpdate();});
els.cancelUpdate.addEventListener("click",()=>{if(window.YiCanAndroid?.cancelUpdate)window.YiCanAndroid.cancelUpdate();});
els.retryUpdate.addEventListener("click",()=>{if(window.YiCanAndroid?.retryUpdate)window.YiCanAndroid.retryUpdate();});
els.installUpdate.addEventListener("click",()=>{if(window.YiCanAndroid?.resumeInstall)window.YiCanAndroid.resumeInstall();});
document.addEventListener("keydown",event=>{const card=event.target.closest?.(".recipe-card[data-action='open']"),interactive=event.target.closest?.("button,a,input,select,textarea");if(card&&!interactive&&(event.key==="Enter"||event.key===" ")){event.preventDefault();openRecipe(card.dataset.ref);}});

window.recipeApp = {
  search(query){state.query=query||"";state.pages.discover=1;switchView("discover");renderDiscover();return getDiscoverResults().map(item=>({name:item.recipe.name,matches:item.matches}));},
  searchDish(query){return this.search(query).map(item=>item.name);},
  searchByIngredients(ingredients){return this.search(Array.isArray(ingredients)?ingredients.join(" "):ingredients||"");},
  openRecipe,
  importRecipes(data){return importFromText(typeof data==="string"?data:JSON.stringify(data));},
  collect(data){openCollect(data||null);return "handled";},
  handleBack(){if(state.navStack.length>1){goBackPage();return "handled";}if(state.view!=="discover"){navigateRoot("discover");return "handled";}return "none";}
};

sanitizeAndPersist();
renderQuickPicks();
renderAll();
initializeAppInfo();
registerRecipeTools();
const requestedInitialView=location.hash.slice(1)==="favorites"?"library":location.hash.slice(1);
const initialView=ROOT_VIEWS.includes(requestedInitialView)?requestedInitialView:"discover";
state.navStack=[initialView];
history.replaceState({view:initialView},"",`#${initialView}`);
applyView(initialView);
setTimeout(()=>checkForUpdate(false),1200);
