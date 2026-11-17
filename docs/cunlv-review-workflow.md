# 村驴全量核对工作流

## 发布约束

范围截至2026-11-16，作者B站UID417298480。全部适用教程核对通过后统一发布。含广告的完整教程保留菜谱、删除推广；非菜谱须记录排除原因和原始证据。

`docs/cunlv-review.json` 是逐条复核清单，不能根据采集或转写成功自动批准。数据中的 `community-transcript` 不等于 `video-reviewed`。每条批准须核对食材、数字/单位、分用途量、步骤、火候、时长、视频位置、Tips、推广清理，并保存内容哈希和证据哈希。

原始媒体、转写、模型、缓存与截图均在 `E:\一餐`，不随源码提交到GitHub。原始证据目录为 `E:\一餐\quality-assurance\cunlv`。

## 当前阶段

- 已完整遍历400个可枚举BV号，重复快照集合一致。接口计数在400/401间变化、跳过序号202；没有据此编造已删除的视频。差异保留在原始接口响应和清单中，仍阻止正式发布。
- 400条投稿均已成功采集音轨与作者/来源信息；本地medium CPU INT8批量转写已启动，底稿是待复核资料。
- 当前原视频复核菜谱包括火山土豆泥、羊肉萝卜煲、莲藕肉丸、清汤牛腩，另有318道社区底稿；以逐条复核清单的状态和覆盖清单数量为准。
- 已排除3条纯商品介绍或日常，逐条原因及哈希在复核清单中；其余仍待处理，不能用转写底稿代替完成复核。
- Node回归测试随新增菜谱补充；Android单元测试、Debug/Release Lint及Debug构建通过；360×640、390×844、800×1024、1280×800界面检查通过。
- 已验证 `verifyCunlvRelease` 在当前未完成状态下失败，这是预期的发布拦截。版本配置仍为1.9.1/code16，没有创建新Release。

## 工具顺序

下列命令均在源码根目录执行。首次抓取已完成，继续时先查看现有证据，不要覆盖冻结快照。

```powershell
node tools/cunlv/capture-catalog.mjs E:\一餐\quality-assurance\cunlv
node tools/cunlv/init-review.mjs E:\一餐\quality-assurance\cunlv\catalog-verified.json E:\一餐\quality-assurance\cunlv\upstream-recipes.jsonl
```

采集与转写均可断点继续。先检查 `acquisition-progress.json`、`transcription-progress.json` 是否仍在更新，避免重复启动任务。转写仅处理本机音轨，不向外部服务上传。

2026-11-17确认旧转写进程停止于49条后，以隐藏独立进程恢复。`transcription-job.json`记录PID、心跳、当前视频与已处理音频秒数；必须同时确认进程存在和心跳更新，不能仅看旧文件中的running字段。新增文件锁阻止重复批任务，stdout/stderr日志保存在核对目录。当前原视频复核数量以逐条清单为准，仍未发布。

```powershell
$env:TEMP='E:\一餐\quality-assurance\cunlv\temp'
$env:TMP=$env:TEMP
$env:PYTHONDONTWRITEBYTECODE='1'
& D:\python\python.exe tools/cunlv/acquire-evidence.py
& D:\python\python.exe tools/cunlv/transcribe.py --batch
```

转写程序使用隔离安装的依赖和下载好的medium模型，以CPU INT8执行。音频经已有FFmpeg解码，避开当前PyAV接口不兼容。程序输出时间轴、词级置信度和音轨哈希，不自动批准复核。

逐条人工/代理查看原始画面与音轨，修正结构化资料后写入 `data/cunlv-reviewed.jsonl`；不明确的数字保留原文或标记“原视频未明确”。复核决定JSON保存在对应原始证据目录。先生成候选，记录批准，再重新生成，以绑定步骤时间点和计时的内容哈希。

```powershell
node tools/build-cunlv-recipes.mjs E:\一餐\quality-assurance\cunlv\upstream-recipes.jsonl E:\一餐\quality-assurance\cunlv\catalog-verified.json E:\一餐\quality-assurance\cunlv\coverage-report.json
node tools/cunlv/record-review.mjs E:\一餐\quality-assurance\cunlv\evidence\BV号\review-decision.json
node tools/build-cunlv-recipes.mjs E:\一餐\quality-assurance\cunlv\upstream-recipes.jsonl E:\一餐\quality-assurance\cunlv\catalog-verified.json E:\一餐\quality-assurance\cunlv\coverage-report.json
```

每个证据引用均为相对核对目录的路径和SHA-256。批准后修改配方会使内容哈希失效，必须重新核对对应修改。未知时长不得从转写中的任意数字推断计时。

## 最终验收

完成目录差异说明和全部逐条状态后，执行 `node tools/cunlv/check-release.cjs`，同时检查本地证据实际哈希。正式assemble/bundle Release依赖同一检查，私下发布脚本在读GitHub凭据前也先执行检查。

再执行完整Node测试、Android单元测试、双变体Lint、Debug和签名Release构建及四种屏幕验收。连接设备后执行旧版覆盖升级并核对本机数据；无设备时不能声明已完成真机验收。

全量通过后才确定新版本号、生成四个标准资产、推送标签和Release，并核验公开Latest Release与加速线路。不能为了发布把待核对或不可访问状态改为排除。
