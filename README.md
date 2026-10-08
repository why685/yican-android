# 一餐 Android

一餐是一款离线可用的 Android 菜谱 App。它支持统一关键词搜索、收藏、最近浏览、个人菜谱管理、完整数据备份，以及通过 GitHub Releases 检查并安装更新。

## 1.6.0 功能

- 菜谱详情页增加“修改”；内置菜谱的食材、用量、步骤等修改保存在本机，并可一键恢复原版。
- 本机修改使用稳定的内置菜谱引用，收藏和最近浏览不会产生重复项目。
- 完整备份新增内置菜谱修改内容，恢复时继续采用合并策略。
- 增加“荤 / 素”大类和主要食材小类筛选；内置菜谱自动归类，个人菜谱可手动调整。

## 1.5.1 功能

- 检查更新不再依赖单一 GitHub API，依次使用加速清单、jsDelivr、GitHub 固定清单和 API 备用线路。
- 更新清单使用 Latest Release 固定地址，后续发布无需修改应用内地址。
- 自动检查只有成功后才记录 24 小时间隔，临时断网不会阻止下次启动重试。
- APK 仍执行 SHA-256、包名、版本号和签名证书校验。

## 1.5.0 功能

- 菜谱详情、“个人菜谱”“最近浏览”“数据管理”和“应用更新”改为独立页面，不再以弹窗、卡片展开或页内下拉内容展示。
- 搜索改为单一关键词入口，同时匹配菜名、食材、口味、介绍和做法，并按相关度排序。
- 多个关键词采用同时满足的方式筛选，可用空格或逗号分隔。

## 1.4.2 功能

- 全量重新识别隋坡菜谱卡，修复做法中的错别字、漏字、方框字和半句话。
- 正确保留红色用量数字，并合并被“视频状态”时间点拆断的步骤。

## 1.4.1 功能

- 应用内更新优先使用受信任的 GitHub 加速线路，失败或 30 秒无进度时自动回退 GitHub。
- 下载完成后仍强制校验 SHA-256、包名、版本号和签名证书，镜像只负责传输文件。
- `update.json` 同时保留单地址 `apkUrl` 和有序多地址 `apkUrls`，兼容旧版本。

## 1.4.0 功能

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
- 手机菜谱列表每行显示 2 个，540px 以上显示 3 个；详情包含精确用量、视频时间点和 Tips。
- 内置“特厨做饭_”中隋坡的 132 份做菜内容，并保留原视频或账号搜索入口。

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

创建标签格式为 `v1.6.0` 的 GitHub Release，并上传：

- `YiCan-1.6.0.apk`
- `YiCan-1.6.0.apk.sha256`
- `YiCan-Android-Source-1.6.0.zip`
- `update.json`

`update.json` 格式：

```json
{
  "schemaVersion": 1,
  "versionCode": 12,
  "versionName": "1.6.0",
  "apkUrl": "https://github.com/why685/yican-android/releases/download/v1.6.0/YiCan-1.6.0.apk",
  "apkUrls": [
    "https://gh-proxy.org/https://github.com/why685/yican-android/releases/download/v1.6.0/YiCan-1.6.0.apk",
    "https://github.com/why685/yican-android/releases/download/v1.6.0/YiCan-1.6.0.apk"
  ],
  "sha256": "APK_SHA256",
  "releaseNotes": "版本说明"
}
```

应用只接受 GitHub 原始地址或内置受信任加速域名中、指向该仓库 Release 路径的 HTTPS APK，并要求 APK 包名、版本号和签名与当前应用一致。普通 Android 应用不能静默更新，校验通过后仍需用户在系统安装界面确认。

仓库根目录同时保留当前 `update.json`，供 jsDelivr 备用检查线路读取。每次发布后应清理 `@main/update.json` 与 `@latest/update.json` 的 CDN 缓存。

## 菜谱 JSON

传统导入格式的必填字段为 `name`、`ingredients` 和 `steps`；可选字段包括 `time`、`difficulty`、`description`、`flavors`、`source`、`video`、`emoji` 和 `tips`。步骤支持 `[标题, 描述, durationSeconds?, videoTimestampSeconds?]`，计时时长范围为 1–14,400 秒；旧字符串、二元素数组和对象步骤仍可导入。完整备份继续使用 `formatVersion: 1`，恢复时合并并去重，不覆盖现有个人数据。
