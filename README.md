# 一餐 Android

一餐是一款离线可用的 Android 菜谱 App。它支持按菜名或食材搜索、收藏、最近浏览、个人菜谱管理、完整数据备份，以及通过 GitHub Releases 检查并安装更新。

## 1.3.1 功能

- “发现 / 收藏 / 我的”三栏导航。
- 按菜名、口味或已有食材搜索，并按烹饪时间筛选。
- 新建、编辑、删除个人菜谱；导入传统菜谱 JSON。
- 导出和合并恢复个人菜谱、收藏与最近浏览。
- 每 24 小时自动检查一次 `why685/yican-android` 的最新 Release，也可手动检查。
- 下载后校验 SHA-256、包名、版本号和签名证书，再交给 Android 系统覆盖安装。
- 下载支持进度显示、取消、重试和重启恢复；安装中断后可继续安装。
- 首页与列表使用固定内容区和分页，手机每页 6 条、宽屏每页 12 条。
- “我的”使用四个一屏入口；详情使用概览、食材、步骤分面；编辑器使用三步向导。
- 全屏烹饪模式支持逐步操作、完成标记和前后台计时提醒。
- 手机端采用更紧凑的字号、间距、搜索区、菜谱卡片和底部导航；电脑端布局保持不变。

应用继续使用 `com.yican.recipe` 和 `yican_custom_recipes_v1`，使用相同签名覆盖安装时会保留 1.1.0 的已导入菜谱。

## 构建

要求：JDK 17 或更高版本、Android SDK 35。

1. 复制 `signing.properties.example` 为 `signing.properties`。
2. 将 `storeFile` 指向私下保存的连续性签名密钥，填写密码。不要把密钥或密码提交到 Git。
3. 使用 Android Studio 打开本目录，或运行：

```powershell
.\gradlew.bat testDebugUnitTest lintDebug assembleDebug
.\gradlew.bat lintRelease assembleRelease
node --test tests/app-core.test.js
```

正式 APK 位于 `app/build/outputs/apk/release/app-release.apk`。

## 发布更新

创建标签格式为 `v1.3.1` 的 GitHub Release，并上传：

- `YiCan-1.3.1.apk`
- `YiCan-1.3.1.apk.sha256`
- `YiCan-Android-Source-1.3.1.zip`
- `update.json`

`update.json` 格式：

```json
{
  "schemaVersion": 1,
  "versionCode": 6,
  "versionName": "1.3.1",
  "apkUrl": "https://github.com/why685/yican-android/releases/download/v1.3.1/YiCan-1.3.1.apk",
  "sha256": "APK_SHA256",
  "releaseNotes": "版本说明"
}
```

应用只接受该仓库 Release 路径下的 HTTPS APK，并要求 APK 包名、版本号和签名与当前应用一致。普通 Android 应用不能静默更新，校验通过后仍需用户在系统安装界面确认。

## 菜谱 JSON

传统导入格式的必填字段为 `name`、`ingredients` 和 `steps`；可选字段包括 `time`、`difficulty`、`description`、`flavors`、`source`、`video` 和 `emoji`。步骤支持 `[标题, 描述, durationSeconds?]`，时长范围为 1–14,400 秒；旧字符串、二元素数组和对象步骤仍可导入。完整备份继续使用 `formatVersion: 1`，恢复时合并并去重，不覆盖现有个人数据。
