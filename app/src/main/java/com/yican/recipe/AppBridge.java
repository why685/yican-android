package com.yican.recipe;

import android.app.AlarmManager;
import android.app.DownloadManager;
import android.app.PendingIntent;
import android.content.ActivityNotFoundException;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.content.FileProvider;
import androidx.core.content.ContextCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

final class AppBridge {
    static final int EXPORT_REQUEST = 1002;
    static final int INSTALL_PERMISSION_REQUEST = 1003;

    private static final String UPDATE_ASSET = "update.json";
    private static final String PREFS = "yican_native_v1";
    private static final String LAST_UPDATE_CHECK = "last_update_check";
    private static final String PENDING_MANIFEST = "pending_manifest";
    private static final String PENDING_DOWNLOAD_ID = "pending_download_id";
    private static final String PENDING_DOWNLOAD_PATH = "pending_download_path";
    private static final String PENDING_DOWNLOAD_SOURCE = "pending_download_source";
    private static final String PENDING_DOWNLOAD_BYTES = "pending_download_bytes";
    private static final String PENDING_DOWNLOAD_PROGRESS_AT = "pending_download_progress_at";
    private static final String UPDATE_STATE = "update_state";
    private static final String UPDATE_MESSAGE = "update_message";
    private static final long CHECK_INTERVAL_MS = 24L * 60L * 60L * 1000L;
    private static final long DOWNLOAD_STALL_MS = 30L * 1000L;
    private static final int JSON_LIMIT_BYTES = 2 * 1024 * 1024;
    private static final int BACKUP_LIMIT_CHARS = 5 * 1024 * 1024;

    private final MainActivity activity;
    private final WebView webView;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final DownloadManager downloadManager;
    private final AlarmManager alarmManager;
    private final SharedPreferences preferences;
    private final BroadcastReceiver downloadReceiver;
    private UpdateManifest pendingUpdate;
    private long pendingDownloadId = -1L;
    private int pendingDownloadSource;
    private long pendingDownloadedBytes;
    private long pendingDownloadProgressAt;
    private File pendingDownloadFile;
    private File pendingInstallFile;
    private File pendingExportFile;
    private boolean receiverRegistered;
    private boolean verifyingDownload;

    AppBridge(MainActivity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.downloadManager = (DownloadManager) activity.getSystemService(Context.DOWNLOAD_SERVICE);
        this.alarmManager = (AlarmManager) activity.getSystemService(Context.ALARM_SERVICE);
        this.preferences = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        restorePendingState();
        this.downloadReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(intent.getAction())
                        && intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L) == pendingDownloadId) {
                    sendUpdateResult(queryUpdateState(true));
                }
            }
        };
        IntentFilter filter = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        ContextCompat.registerReceiver(activity, downloadReceiver, filter, ContextCompat.RECEIVER_EXPORTED);
        receiverRegistered = true;
    }

    @JavascriptInterface
    public String getAppInfo() {
        JSONObject result = new JSONObject();
        try {
            result.put("versionCode", BuildConfig.VERSION_CODE);
            result.put("versionName", BuildConfig.VERSION_NAME);
            result.put("repository", "why685/yican-android");
        } catch (Exception ignored) {
        }
        return result.toString();
    }

    @JavascriptInterface
    public void exportBackup(String json) {
        if (json == null || json.isEmpty() || json.length() > BACKUP_LIMIT_CHARS) {
            sendExportResult(false, "备份内容为空或超过 5 MB");
            return;
        }
        executor.execute(() -> {
            try {
                File directory = new File(activity.getCacheDir(), "exports");
                if (!directory.exists() && !directory.mkdirs()) throw new Exception("无法创建临时目录");
                File file = new File(directory, "yican-backup.json");
                try (OutputStream output = new FileOutputStream(file)) {
                    output.write(json.getBytes(StandardCharsets.UTF_8));
                }
                pendingExportFile = file;
                activity.runOnUiThread(() -> {
                    try {
                        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                        intent.addCategory(Intent.CATEGORY_OPENABLE);
                        intent.setType("application/json");
                        intent.putExtra(Intent.EXTRA_TITLE, "yican-backup-" + System.currentTimeMillis() + ".json");
                        activity.startActivityForResult(intent, EXPORT_REQUEST);
                    } catch (ActivityNotFoundException error) {
                        sendExportResult(false, "没有可用于保存文件的应用");
                    }
                });
            } catch (Exception error) {
                sendExportResult(false, "准备备份失败：" + safeMessage(error));
            }
        });
    }

    @JavascriptInterface
    public void checkForUpdate(boolean manual) {
        long now = System.currentTimeMillis();
        if (!manual && now - preferences.getLong(LAST_UPDATE_CHECK, 0L) < CHECK_INTERVAL_MS) return;
        if (manual) sendUpdateResult(status("checking", "正在检查新版本…"));
        executor.execute(() -> {
            try {
                UpdateManifest info = fetchLatestManifest();
                preferences.edit().putLong(LAST_UPDATE_CHECK, System.currentTimeMillis()).apply();
                pendingUpdate = info;
                persistManifest(info);
                if (info.isNewerThan(BuildConfig.VERSION_CODE)) {
                    JSONObject payload = status("available", "发现新版本 " + info.versionName);
                    payload.put("versionCode", info.versionCode);
                    payload.put("versionName", info.versionName);
                    payload.put("releaseNotes", info.releaseNotes);
                    sendUpdateResult(payload);
                } else if (manual) {
                    sendUpdateResult(status("current", "当前已是最新版本"));
                }
            } catch (Exception error) {
                if (manual) sendUpdateResult(status("error", "检查更新失败：" + safeMessage(error)));
            }
        });
    }

    private UpdateManifest fetchLatestManifest() throws Exception {
        Exception lastError = null;
        for (String source : UpdateSources.manifestUrls(System.currentTimeMillis())) {
            try {
                return UpdateManifest.parse(readJson(source), "");
            } catch (Exception error) {
                lastError = error;
            }
        }
        try {
            JSONObject release = readJson(UpdateSources.RELEASE_API);
            String manifestUrl = findAssetUrl(release.optJSONArray("assets"), UPDATE_ASSET);
            if (manifestUrl.isEmpty()) throw new Exception("最新 Release 缺少 update.json");
            return UpdateManifest.parse(readJson(manifestUrl), release.optString("body", ""));
        } catch (Exception error) {
            lastError = error;
        }
        String detail = lastError == null ? "未知网络错误" : safeMessage(lastError);
        throw new Exception("所有更新线路均不可用，请检查网络后重试（" + detail + "）");
    }

    @JavascriptInterface
    public void downloadUpdate() {
        UpdateManifest info = pendingUpdate;
        if (info == null || !info.isNewerThan(BuildConfig.VERSION_CODE)) {
            sendUpdateResult(status("error", "没有可下载的新版本"));
            return;
        }
        pendingDownloadSource = 0;
        startDownloadSource(true, true);
    }

    private void startDownloadSource(boolean deleteExisting, boolean send) {
        UpdateManifest info = pendingUpdate;
        if (info == null || pendingDownloadSource < 0 || pendingDownloadSource >= info.downloadSourceCount()) {
            updateState("error", "没有可用的更新下载线路", send);
            return;
        }
        activity.runOnUiThread(() -> {
            try {
                String downloadUrl = info.downloadUrl(pendingDownloadSource);
                UpdateManifest.validateUrl(downloadUrl);
                cancelActiveDownload(deleteExisting);
                File directory = activity.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (directory == null) throw new Exception("无法访问下载目录");
                String filename = "YiCan-" + info.versionName + "-" + System.currentTimeMillis() + ".apk";
                pendingDownloadFile = new File(directory, filename);
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(downloadUrl));
                request.setTitle("一餐 " + info.versionName);
                request.setDescription("正在通过" + downloadSourceLabel(downloadUrl) + "下载安全更新");
                request.setMimeType("application/vnd.android.package-archive");
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setAllowedOverMetered(true);
                request.setDestinationInExternalFilesDir(activity, Environment.DIRECTORY_DOWNLOADS, filename);
                pendingDownloadId = downloadManager.enqueue(request);
                pendingDownloadedBytes = 0L;
                pendingDownloadProgressAt = System.currentTimeMillis();
                String message = "正在通过" + downloadSourceLabel(downloadUrl) + "下载，完成后会自动校验";
                JSONObject payload = status("downloading", message);
                payload.put("downloadId", pendingDownloadId);
                payload.put("progress", 0);
                addDownloadSourceFields(payload);
                persistDownloadState("downloading", message);
                if (send) sendUpdateResult(payload);
            } catch (Exception error) {
                if (!switchToNextDownloadSource("线路连接失败", send)) {
                    updateState("error", "无法开始下载：" + safeMessage(error), send);
                }
            }
        });
    }

    private static String downloadSourceLabel(String value) {
        try {
            return "gh-proxy.org".equalsIgnoreCase(new URL(value).getHost()) ? "加速线路" : "GitHub 备用线路";
        } catch (Exception ignored) {
            return "安全线路";
        }
    }

    @JavascriptInterface
    public String getUpdateState() {
        return queryUpdateState(true).toString();
    }

    @JavascriptInterface
    public void cancelUpdate() {
        activity.runOnUiThread(() -> {
            cancelActiveDownload(true);
            updateState("cancelled", "已取消更新下载，可随时重试", true);
        });
    }

    @JavascriptInterface
    public void retryUpdate() {
        downloadUpdate();
    }

    @JavascriptInterface
    public void resumeInstall() {
        activity.runOnUiThread(this::requestInstallPermissionOrInstall);
    }

    @JavascriptInterface
    public void startStepTimer(String recipeRef, int stepIndex, int seconds) {
        activity.runOnUiThread(() -> {
            try {
                StepTimerState state = StepTimerState.create(recipeRef, stepIndex, seconds, System.currentTimeMillis());
                activity.getSharedPreferences(TimerReceiver.PREFS, Context.MODE_PRIVATE).edit()
                        .putString(TimerReceiver.TIMER_STATE, state.toJson(System.currentTimeMillis()).toString()).apply();
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, state.deadline, timerPendingIntent());
                boolean notificationsAllowed = activity.ensureTimerNotificationPermission();
                JSONObject payload = state.toJson(System.currentTimeMillis());
                payload.put("status", "running");
                payload.put("notificationAllowed", notificationsAllowed);
                sendNativeStatus("timer", payload);
            } catch (Exception error) {
                JSONObject payload = status("error", safeMessage(error));
                sendNativeStatus("timer", payload);
            }
        });
    }

    @JavascriptInterface
    public void cancelStepTimer() {
        activity.runOnUiThread(() -> {
            alarmManager.cancel(timerPendingIntent());
            activity.getSharedPreferences(TimerReceiver.PREFS, Context.MODE_PRIVATE).edit()
                    .remove(TimerReceiver.TIMER_STATE).apply();
            sendNativeStatus("timer", status("cancelled", "计时已暂停或重置"));
        });
    }

    @JavascriptInterface
    public String getStepTimerState() {
        try {
            StepTimerState state = StepTimerState.fromJson(activity
                    .getSharedPreferences(TimerReceiver.PREFS, Context.MODE_PRIVATE)
                    .getString(TimerReceiver.TIMER_STATE, ""));
            return state == null ? "null" : state.toJson(System.currentTimeMillis()).toString();
        } catch (Exception ignored) {
            activity.getSharedPreferences(TimerReceiver.PREFS, Context.MODE_PRIVATE).edit()
                    .remove(TimerReceiver.TIMER_STATE).apply();
            return "null";
        }
    }

    private PendingIntent timerPendingIntent() {
        Intent intent = new Intent(activity, TimerReceiver.class);
        return PendingIntent.getBroadcast(activity, 2201, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    boolean handleActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == EXPORT_REQUEST) {
            if (resultCode != MainActivity.RESULT_OK || data == null || data.getData() == null) {
                sendExportResult(false, "已取消保存备份");
                return true;
            }
            Uri target = data.getData();
            File source = pendingExportFile;
            executor.execute(() -> {
                if (source == null || !source.isFile()) {
                    sendExportResult(false, "备份临时文件不存在");
                    return;
                }
                try (InputStream input = new FileInputStream(source);
                     OutputStream output = activity.getContentResolver().openOutputStream(target)) {
                    if (output == null) throw new Exception("无法打开目标文件");
                    copy(input, output);
                    sendExportResult(true, "备份已保存");
                } catch (Exception error) {
                    sendExportResult(false, "保存失败：" + safeMessage(error));
                }
            });
            return true;
        }
        if (requestCode == INSTALL_PERMISSION_REQUEST) {
            if (Build.VERSION.SDK_INT < 26 || activity.getPackageManager().canRequestPackageInstalls()) {
                installValidatedUpdate();
            } else {
                updateState("permission", "尚未允许安装未知应用，更新包已保留", true);
            }
            return true;
        }
        return false;
    }

    void destroy() {
        if (receiverRegistered) {
            try {
                activity.unregisterReceiver(downloadReceiver);
            } catch (Exception ignored) {
            }
            receiverRegistered = false;
        }
        executor.shutdownNow();
    }

    void onHostResume() {
        if ("installing".equals(preferences.getString(UPDATE_STATE, ""))
                && pendingInstallFile != null && pendingInstallFile.isFile()) {
            persistDownloadState("verified", "安装尚未完成，可再次打开系统安装界面");
        }
        JSONObject state = queryUpdateState(true);
        if (!"idle".equals(state.optString("status"))) sendUpdateResult(state);
    }

    void onNotificationPermissionResult(boolean allowed) {
        JSONObject payload = status(allowed ? "ready" : "warning",
                allowed ? "后台计时提醒已开启" : "通知权限未开启；前台计时可用，后台可能无法提醒");
        try {
            payload.put("notificationAllowed", allowed);
        } catch (Exception ignored) {
        }
        sendNativeStatus("timer", payload);
    }

    private void restorePendingState() {
        try {
            pendingUpdate = UpdateManifest.fromPersisted(preferences.getString(PENDING_MANIFEST, ""));
            if (pendingUpdate == null || !pendingUpdate.isNewerThan(BuildConfig.VERSION_CODE)) {
                clearPersistedDownload();
                pendingUpdate = null;
                return;
            }
            pendingDownloadId = preferences.getLong(PENDING_DOWNLOAD_ID, -1L);
            pendingDownloadSource = Math.max(0, preferences.getInt(PENDING_DOWNLOAD_SOURCE, 0));
            if (pendingDownloadSource >= pendingUpdate.downloadSourceCount()) pendingDownloadSource = 0;
            pendingDownloadedBytes = Math.max(0L, preferences.getLong(PENDING_DOWNLOAD_BYTES, 0L));
            pendingDownloadProgressAt = preferences.getLong(PENDING_DOWNLOAD_PROGRESS_AT, System.currentTimeMillis());
            String path = preferences.getString(PENDING_DOWNLOAD_PATH, "");
            pendingDownloadFile = safePersistedFile(path);
            String state = preferences.getString(UPDATE_STATE, "idle");
            if (UpdateDownloadPolicy.mayResumeInstall(state)
                    && pendingDownloadFile != null && pendingDownloadFile.isFile()) {
                pendingInstallFile = pendingDownloadFile;
            }
        } catch (Exception ignored) {
            clearPersistedDownload();
            pendingUpdate = null;
        }
    }

    private File safePersistedFile(String path) throws Exception {
        if (path == null || path.trim().isEmpty()) return null;
        File base = activity.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (base == null) return null;
        File file = new File(path);
        String basePath = base.getCanonicalPath() + File.separator;
        return file.getCanonicalPath().startsWith(basePath) ? file : null;
    }

    private void persistManifest(UpdateManifest manifest) {
        preferences.edit().putString(PENDING_MANIFEST, manifest.toJson().toString()).apply();
    }

    private void persistDownloadState(String state, String message) {
        SharedPreferences.Editor editor = preferences.edit()
                .putString(UPDATE_STATE, state)
                .putString(UPDATE_MESSAGE, message)
                .putLong(PENDING_DOWNLOAD_ID, pendingDownloadId)
                .putInt(PENDING_DOWNLOAD_SOURCE, pendingDownloadSource)
                .putLong(PENDING_DOWNLOAD_BYTES, pendingDownloadedBytes)
                .putLong(PENDING_DOWNLOAD_PROGRESS_AT, pendingDownloadProgressAt);
        if (pendingUpdate != null) editor.putString(PENDING_MANIFEST, pendingUpdate.toJson().toString());
        if (pendingDownloadFile != null) editor.putString(PENDING_DOWNLOAD_PATH, pendingDownloadFile.getAbsolutePath());
        else editor.remove(PENDING_DOWNLOAD_PATH);
        editor.apply();
    }

    private void clearPersistedDownload() {
        preferences.edit()
                .remove(PENDING_DOWNLOAD_ID)
                .remove(PENDING_DOWNLOAD_PATH)
                .remove(PENDING_DOWNLOAD_SOURCE)
                .remove(PENDING_DOWNLOAD_BYTES)
                .remove(PENDING_DOWNLOAD_PROGRESS_AT)
                .remove(PENDING_MANIFEST)
                .remove(UPDATE_STATE)
                .remove(UPDATE_MESSAGE)
                .apply();
        pendingDownloadId = -1L;
        pendingDownloadSource = 0;
        pendingDownloadedBytes = 0L;
        pendingDownloadProgressAt = 0L;
        pendingDownloadFile = null;
        pendingInstallFile = null;
    }

    private void cancelActiveDownload(boolean deleteFiles) {
        if (pendingDownloadId >= 0L) {
            try {
                downloadManager.remove(pendingDownloadId);
            } catch (Exception ignored) {
            }
        }
        pendingDownloadId = -1L;
        if (deleteFiles) {
            deleteFile(pendingDownloadFile);
            if (pendingInstallFile != pendingDownloadFile) deleteFile(pendingInstallFile);
            pendingDownloadFile = null;
            pendingInstallFile = null;
        }
        preferences.edit().remove(PENDING_DOWNLOAD_ID).remove(PENDING_DOWNLOAD_PATH).apply();
    }

    private JSONObject queryUpdateState(boolean triggerVerification) {
        String savedState = preferences.getString(UPDATE_STATE, "idle");
        String savedMessage = preferences.getString(UPDATE_MESSAGE, "");
        JSONObject payload = status(savedState, savedMessage);
        addManifestFields(payload);
        if (pendingDownloadId < 0L) return payload;

        try (Cursor cursor = downloadManager.query(new DownloadManager.Query().setFilterById(pendingDownloadId))) {
            if (cursor == null || !cursor.moveToFirst()) {
                if (switchToNextDownloadSource("当前线路未能建立下载任务", true)) {
                    payload = status("downloading", "当前线路不可用，正在切换备用线路");
                } else {
                    pendingDownloadId = -1L;
                    persistDownloadState("error", "找不到下载任务，请重试");
                    payload = status("error", "找不到下载任务，请重试");
                }
            } else {
                int state = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
                long downloaded = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
                long total = cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
                int progress = total > 0 ? (int) Math.min(100L, downloaded * 100L / total) : 0;
                updateDownloadProgress(downloaded);
                if (state == DownloadManager.STATUS_SUCCESSFUL) {
                    payload = status("verifying", "下载完成，正在验证更新包");
                    payload.put("progress", 100);
                    if (triggerVerification) verifyDownloadedUpdate();
                } else if (state == DownloadManager.STATUS_FAILED) {
                    int reason = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_REASON));
                    String message = UpdateDownloadPolicy.failureMessage(reason);
                    if (switchToNextDownloadSource(message, true)) {
                        payload = status("downloading", message + "，正在切换备用线路");
                    } else {
                        cancelActiveDownload(true);
                        persistDownloadState("error", message);
                        payload = status("error", message);
                    }
                } else if (downloadHasStalled()) {
                    if (switchToNextDownloadSource("当前线路 30 秒无下载进度", true)) {
                        payload = status("downloading", "当前线路响应较慢，正在切换备用线路");
                    } else {
                        payload = status("downloading", "下载暂时没有进度，正在等待 GitHub 响应");
                        payload.put("progress", progress);
                    }
                } else {
                    String message = state == DownloadManager.STATUS_PAUSED ? "下载已暂停，等待网络恢复" : "新版正在后台下载";
                    payload = status("downloading", message);
                    payload.put("progress", progress);
                    payload.put("downloadedBytes", downloaded);
                    payload.put("totalBytes", total);
                }
            }
        } catch (Exception error) {
            payload = status("error", "读取下载状态失败：" + safeMessage(error));
        }
        addManifestFields(payload);
        addDownloadSourceFields(payload);
        return payload;
    }

    private void updateDownloadProgress(long downloaded) {
        if (downloaded <= pendingDownloadedBytes) return;
        pendingDownloadedBytes = downloaded;
        pendingDownloadProgressAt = System.currentTimeMillis();
        preferences.edit()
                .putLong(PENDING_DOWNLOAD_BYTES, pendingDownloadedBytes)
                .putLong(PENDING_DOWNLOAD_PROGRESS_AT, pendingDownloadProgressAt)
                .apply();
    }

    private boolean downloadHasStalled() {
        return pendingDownloadProgressAt > 0L
                && System.currentTimeMillis() - pendingDownloadProgressAt >= DOWNLOAD_STALL_MS
                && pendingUpdate != null
                && pendingDownloadSource + 1 < pendingUpdate.downloadSourceCount();
    }

    private boolean switchToNextDownloadSource(String reason, boolean send) {
        if (pendingUpdate == null || pendingDownloadSource + 1 >= pendingUpdate.downloadSourceCount()) return false;
        cancelActiveDownload(true);
        pendingDownloadSource++;
        pendingDownloadedBytes = 0L;
        pendingDownloadProgressAt = System.currentTimeMillis();
        String message = reason + "，正在切换到第 " + (pendingDownloadSource + 1) + " 条线路";
        persistDownloadState("downloading", message);
        if (send) {
            JSONObject payload = status("downloading", message);
            addManifestFields(payload);
            addDownloadSourceFields(payload);
            sendUpdateResult(payload);
        }
        startDownloadSource(true, send);
        return true;
    }

    private void addDownloadSourceFields(JSONObject payload) {
        if (pendingUpdate == null) return;
        try {
            payload.put("downloadSource", pendingDownloadSource + 1);
            payload.put("downloadSourceCount", pendingUpdate.downloadSourceCount());
        } catch (Exception ignored) {
        }
    }

    private void addManifestFields(JSONObject payload) {
        if (pendingUpdate == null) return;
        try {
            payload.put("versionCode", pendingUpdate.versionCode);
            payload.put("versionName", pendingUpdate.versionName);
            payload.put("releaseNotes", pendingUpdate.releaseNotes);
        } catch (Exception ignored) {
        }
    }

    private void updateState(String state, String message, boolean send) {
        persistDownloadState(state, message);
        JSONObject payload = status(state, message);
        addManifestFields(payload);
        if (send) sendUpdateResult(payload);
    }

    private static void deleteFile(File file) {
        if (file != null && file.isFile()) file.delete();
    }

    private void verifyDownloadedUpdate() {
        UpdateManifest info = pendingUpdate;
        File file = pendingDownloadFile;
        if (info == null || file == null || verifyingDownload) return;
        verifyingDownload = true;
        executor.execute(() -> {
            try {
                if (!file.isFile() || file.length() == 0) throw new Exception("下载文件不存在");
                String actualHash = sha256(file);
                if (!actualHash.equalsIgnoreCase(info.sha256)) throw new Exception("SHA-256 校验失败");
                PackageInfo archive = getArchivePackageInfo(file);
                if (archive == null || !activity.getPackageName().equals(archive.packageName)) throw new Exception("APK 包名不匹配");
                if (longVersionCode(archive) != info.versionCode || info.versionCode <= BuildConfig.VERSION_CODE) throw new Exception("APK 版本号不匹配");
                PackageInfo installed = getInstalledPackageInfo();
                if (!certificateDigests(archive).equals(certificateDigests(installed))) throw new Exception("APK 签名与当前应用不一致");
                pendingInstallFile = file;
                pendingDownloadId = -1L;
                persistDownloadState("verified", "更新包校验通过，准备安装");
                sendUpdateResult(status("verified", "更新包校验通过，准备安装"));
                activity.runOnUiThread(this::requestInstallPermissionOrInstall);
            } catch (Exception error) {
                deleteFile(file);
                pendingDownloadId = -1L;
                pendingDownloadFile = null;
                pendingInstallFile = null;
                updateState("error", "更新包不安全：" + safeMessage(error), true);
            } finally {
                verifyingDownload = false;
            }
        });
    }

    private void requestInstallPermissionOrInstall() {
        if (Build.VERSION.SDK_INT >= 26 && !activity.getPackageManager().canRequestPackageInstalls()) {
            updateState("permission", "请允许一餐安装更新，然后返回应用", true);
            Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + activity.getPackageName()));
            activity.startActivityForResult(intent, INSTALL_PERMISSION_REQUEST);
        } else {
            installValidatedUpdate();
        }
    }

    private void installValidatedUpdate() {
        File file = pendingInstallFile;
        if (file == null || !file.isFile()) {
            sendUpdateResult(status("error", "已校验的更新包不存在"));
            return;
        }
        try {
            Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".files", file);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            persistDownloadState("installing", "请在系统界面确认覆盖安装");
            activity.startActivity(intent);
        } catch (Exception error) {
            updateState("error", "无法打开系统安装界面：" + safeMessage(error), true);
        }
    }

    private JSONObject readJson(String url) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setConnectTimeout(6_000);
        connection.setReadTimeout(12_000);
        connection.setInstanceFollowRedirects(true);
        connection.setRequestProperty("Accept", "application/vnd.github+json, application/json");
        connection.setRequestProperty("User-Agent", "YiCan-Android/" + BuildConfig.VERSION_NAME);
        connection.setRequestProperty("Cache-Control", "no-cache");
        int code = connection.getResponseCode();
        if (code < 200 || code >= 300) throw new Exception("服务器返回 " + code);
        try (InputStream input = new BufferedInputStream(connection.getInputStream())) {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int total = 0;
            int read;
            while ((read = input.read(buffer)) != -1) {
                total += read;
                if (total > JSON_LIMIT_BYTES) throw new Exception("更新信息过大");
                output.write(buffer, 0, read);
            }
            return new JSONObject(output.toString(StandardCharsets.UTF_8.name()));
        } finally {
            connection.disconnect();
        }
    }

    private static String findAssetUrl(JSONArray assets, String name) {
        if (assets == null) return "";
        for (int i = 0; i < assets.length(); i++) {
            JSONObject asset = assets.optJSONObject(i);
            if (asset != null && name.equals(asset.optString("name"))) {
                return asset.optString("browser_download_url", "");
            }
        }
        return "";
    }

    @SuppressWarnings("deprecation")
    private PackageInfo getArchivePackageInfo(File file) {
        int flags = Build.VERSION.SDK_INT >= 28 ? PackageManager.GET_SIGNING_CERTIFICATES : PackageManager.GET_SIGNATURES;
        return activity.getPackageManager().getPackageArchiveInfo(file.getAbsolutePath(), flags);
    }

    @SuppressWarnings("deprecation")
    private PackageInfo getInstalledPackageInfo() throws Exception {
        int flags = Build.VERSION.SDK_INT >= 28 ? PackageManager.GET_SIGNING_CERTIFICATES : PackageManager.GET_SIGNATURES;
        return activity.getPackageManager().getPackageInfo(activity.getPackageName(), flags);
    }

    @SuppressWarnings("deprecation")
    private static long longVersionCode(PackageInfo info) {
        return Build.VERSION.SDK_INT >= 28 ? info.getLongVersionCode() : info.versionCode;
    }

    @SuppressWarnings("deprecation")
    private static Set<String> certificateDigests(PackageInfo info) throws Exception {
        Signature[] signatures;
        if (Build.VERSION.SDK_INT >= 28 && info.signingInfo != null) {
            signatures = info.signingInfo.hasMultipleSigners()
                    ? info.signingInfo.getApkContentsSigners()
                    : info.signingInfo.getSigningCertificateHistory();
        } else {
            signatures = info.signatures;
        }
        Set<String> result = new HashSet<>();
        if (signatures != null) {
            for (Signature signature : signatures) result.add(hex(MessageDigest.getInstance("SHA-256").digest(signature.toByteArray())));
        }
        if (result.isEmpty()) throw new Exception("无法读取 APK 签名");
        return result;
    }

    private static String sha256(File file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream input = new FileInputStream(file)) {
            byte[] buffer = new byte[8192];
            int read;
            while ((read = input.read(buffer)) != -1) digest.update(buffer, 0, read);
        }
        return hex(digest.digest());
    }

    private static String hex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) builder.append(String.format(Locale.ROOT, "%02x", value));
        return builder.toString();
    }

    private static void copy(InputStream input, OutputStream output) throws Exception {
        byte[] buffer = new byte[8192];
        int read;
        while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
    }

    private static JSONObject status(String status, String message) {
        JSONObject result = new JSONObject();
        try {
            result.put("status", status);
            result.put("message", message);
        } catch (Exception ignored) {
        }
        return result;
    }

    private void sendUpdateResult(JSONObject payload) {
        evaluate("window.YiCanNative&&window.YiCanNative.onUpdateResult(" + payload.toString() + ");");
    }

    private void sendNativeStatus(String type, JSONObject payload) {
        JSONObject envelope = new JSONObject();
        try {
            envelope.put("type", type);
            envelope.put("payload", payload);
        } catch (Exception ignored) {
        }
        evaluate("window.YiCanNative&&window.YiCanNative.onNativeStatus(" + envelope.toString() + ");");
    }

    private void sendExportResult(boolean success, String message) {
        JSONObject payload = status(success ? "success" : "error", message);
        evaluate("window.YiCanNative&&window.YiCanNative.onExportResult(" + payload.toString() + ");");
    }

    private void evaluate(String script) {
        activity.runOnUiThread(() -> {
            if (!activity.isFinishing()) webView.evaluateJavascript(script, null);
        });
    }

    private static String safeMessage(Exception error) {
        String message = error.getMessage();
        return message == null || message.trim().isEmpty() ? "未知错误" : message;
    }

}
