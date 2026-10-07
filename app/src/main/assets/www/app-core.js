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
  const BACKUP_FORMAT = "yican-backup";
  const BACKUP_VERSION = 1;
  const RECENT_LIMIT = 20;
  const IMPORT_COLORS = [["#8a5141", "#d48250"], ["#3f6a5c", "#77a87d"], ["#65518a", "#a477a8"]];

  function clean(value) {
    return String(value == null ? "" : value).trim();
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
    return {
      id,
      name,
      emoji: clean(raw.emoji || "🍽️").slice(0, 8),
      time,
      difficulty: clean(raw.difficulty || "简单").slice(0, 12),
      flavors: flavors.length ? flavors : ["我的菜谱"],
      source: clean(raw.source || "我的菜谱").slice(0, 40),
      description: clean(raw.description || "保存在本机的个人菜谱").slice(0, 500),
      ingredients,
      steps,
      tips: (Array.isArray(raw.tips) ? raw.tips : (clean(raw.tips) ? [raw.tips] : []))
        .slice(0, 12).map(value => clean(value).slice(0, 300)).filter(Boolean),
      video: typeof raw.video === "string" && /^https:\/\//i.test(raw.video) ? raw.video : "",
      colors: Array.isArray(raw.colors) && raw.colors.length >= 2
        ? [clean(raw.colors[0]), clean(raw.colors[1])]
        : IMPORT_COLORS[index % IMPORT_COLORS.length],
      custom: true
    };
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
    return {recipeRef, stepIndex, durationSeconds, deadline, remainingSeconds:Math.max(0, Math.ceil((deadline - now) / 1000))};
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

  function createBackup(customRecipes, favorites, recent, exportedAt, appVersion) {
    const normalized = (Array.isArray(customRecipes) ? customRecipes : []).map((recipe, index) => normalizeImportedRecipe(recipe, index, true));
    const validRefs = new Set(normalized.map(recipeRef));
    for (const ref of Array.isArray(favorites) ? favorites : []) if (String(ref).startsWith("builtin:")) validRefs.add(String(ref));
    for (const ref of Array.isArray(recent) ? recent : []) if (String(ref).startsWith("builtin:")) validRefs.add(String(ref));
    return {
      format: BACKUP_FORMAT,
      formatVersion: BACKUP_VERSION,
      exportedAt: exportedAt || new Date().toISOString(),
      appVersion: clean(appVersion) || "unknown",
      customRecipes: normalized,
      favorites: uniqueValidRefs(favorites, validRefs),
      recent: uniqueValidRefs(recent, validRefs, RECENT_LIMIT)
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
    return {customRecipes: resultRecipes, favorites, recent, added, skipped};
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
    BACKUP_FORMAT,
    BACKUP_VERSION,
    RECENT_LIMIT,
    normalizeImportedRecipe,
    recipeRef,
    recipeIdentity,
    uniqueValidRefs,
    addRecent,
    paginate,
    normalizeTimerState,
    createBackup,
    mergeBackup,
    importFromText,
    parseStoredArray
  };
});
