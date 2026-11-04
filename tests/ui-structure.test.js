const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../app/src/main/assets/www");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const manifest = fs.readFileSync(path.resolve(__dirname, "../app/src/main/AndroidManifest.xml"), "utf8");
const gradle = fs.readFileSync(path.resolve(__dirname, "../app/build.gradle"), "utf8");

test("import and cooking are independent pages instead of dialogs", () => {
  assert.match(html, /id="view-import"[^>]+data-view="import"/);
  assert.match(html, /id="view-cooking"[^>]+data-view="cooking"/);
  assert.doesNotMatch(html, /id="import-dialog"|id="cooking-dialog"|id="update-dialog"/);
  assert.match(script, /"import","collect","help","about","update","recipe","editor","cooking"/);
});

test("root navigation uses discover, recipe library and mine", () => {
  assert.match(script, /const ROOT_VIEWS = \["discover","library","mine"\]/);
  assert.match(html, /id="view-library"[^>]+data-view="library"/);
  assert.match(html, /data-view-target="library"[\s\S]{0,300}菜谱库/);
  assert.doesNotMatch(html, /data-view-target="favorites"/);
  for (const tab of ["favorites", "recent", "personal", "inbox"]) {
    assert.match(html, new RegExp(`data-library-tab="${tab}"`));
  }
});

test("quick collection has an independent page and inbox actions", () => {
  assert.match(html, /id="view-collect"[^>]+data-view="collect"/);
  assert.match(html, /id="collect-url"/);
  assert.match(html, /id="collect-text"/);
  assert.match(html, /id="collect-save"/);
  assert.match(html, /<button class="primary-action" type="submit">识别并完善<\/button>/);
  assert.match(script, /onSharedRecipe\(result\)/);
  assert.match(script, /function saveCollection\(improve=false\)/);
  assert.match(script, /data-action="collect-edit"/);
});

test("Android accepts text and image shares and bundles Chinese OCR", () => {
  assert.match(manifest, /android\.intent\.action\.SEND/);
  assert.match(manifest, /android\.intent\.action\.SEND_MULTIPLE/);
  assert.match(manifest, /android:mimeType="text\/plain"/);
  assert.match(manifest, /android:mimeType="image\/\*"/);
  assert.match(gradle, /com\.google\.mlkit:text-recognition-chinese:16\.0\.1/);
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
