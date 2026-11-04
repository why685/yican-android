const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../app/src/main/assets/www");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

test("import and cooking are independent pages instead of dialogs", () => {
  assert.match(html, /id="view-import"[^>]+data-view="import"/);
  assert.match(html, /id="view-cooking"[^>]+data-view="cooking"/);
  assert.doesNotMatch(html, /id="import-dialog"|id="cooking-dialog"|id="update-dialog"/);
  assert.match(script, /"import","update","recipe","editor","cooking"/);
});

test("secondary pages hide the bottom navigation", () => {
  assert.match(script, /classList\.toggle\("secondary-page",\s*!ROOT_VIEWS\.includes\(view\)\)/);
  assert.match(styles, /\.secondary-page \.bottom-nav\s*\{\s*display:\s*none/);
});

test("mobile recipe grids remain two columns", () => {
  const finalOverride = styles.slice(styles.lastIndexOf("Final mobile overrides"));
  assert.match(finalOverride, /repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(finalOverride, /repeat\(3,minmax\(0,1fr\)\)/);
});

test("keyword input uses a 250 millisecond debounce", () => {
  assert.match(script, /setTimeout\(\(\)=>applySearchInput\(false\),250\)/);
  assert.match(html, /id="search-clear"/);
});

test("recipe cards open as a whole and keep favorite separate", () => {
  assert.match(script, /<article class="recipe-card" data-action="open"/);
  assert.match(script, /class="heart-button[^`]+data-action="favorite"/);
  assert.doesNotMatch(script, /class="card-open"/);
});

test("update controls live inside the update page", () => {
  assert.match(html, /id="view-update"[\s\S]+id="update-progress"[\s\S]+id="download-update"/);
  assert.doesNotMatch(script, /updateDialog|showModal\(\)/);
});
