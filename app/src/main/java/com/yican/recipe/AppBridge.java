package com.yican.recipe;

import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
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

    private static final String RELEASE_API = "https://api.github.com/repos/why685/yican-android/releases/latest";
    private static final String UPDATE_ASSET = "update.json";
    private static final String PREFS = "yican_native_v1";
    private static final String LAST_UPDATE_CHECK = "last_update_check";
    private static final long CHECK_INTERVAL_MS = 24L * 60L * 60L * 1000L;
    private static final int JSON_LIMIT_BYTES = 2 * 1024 * 1024;
    private static final int BACKUP_LIMIT_CHARS = 5 * 1024 * 1024;

    private final MainActivity activity;
    private final WebView webView;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final DownloadManager downloadManager;
    private final SharedPreferences preferences;
    private final BroadcastReceiver downloadReceiver;
    private UpdateInfo pendingUpdate;
    private long pendingDownloadId = -1L;
    private File pendingDownloadFile;
    private File pendingInstallFile;
    private File pendingExportFile;
    private boolean receiverRegistered;

    AppBridge(MainActivity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.downloadManager = (DownloadManager) activity.getSystemService(Context.DOWNLOAD_SERVICE);
        this.preferences = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        this.downloadReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(intent.getAction())
                        && intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L) == pendingDownloadId) {
                    verifyDownloadedUpdate();
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
        preferences.edit().putLong(LAST_UPDATE_CHECK, now).apply();
        if (manual) sendUpdateResult(status("checking", "正在检查新版本…"));
        executor.execute(() -> {
            try {
                JSONObject release = readJson(RELEASE_API);
                String manifestUrl = findAssetUrl(release.optJSONArray("assets"), UPDATE_ASSET);
                if (manifestUrl.isEmpty()) throw new Exception("最新 Release 缺少 update.json");
                JSONObject manifest = readJson(manifestUrl);
                UpdateInfo info = UpdateInfo.from(manifest, release.optString("body", ""));
                validateUpdateUrl(info.apkUrl);
                pendingUpdate = info;
                if (info.versionCode > BuildConfig.VERSION_CODE) {
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

    @JavascriptInterface
    public void downloadUpdate() {
        UpdateInfo info = pendingUpdate;
        if (info == null || info.versionCode <= BuildConfig.VERSION_CODE) {
            sendUpdateResult(status("error", "没有可下载的新版本"));
            return;
        }
        activity.runOnUiThread(() -> {
            try {
                validateUpdateUrl(info.apkUrl);
                String filename = "YiCan-" + info.versionName + "-" + System.currentTimeMillis() + ".apk";
                pendingDownloadFile = new File(activity.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), filename);
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(info.apkUrl));
                request.setTitle("一餐 " + info.versionName);
                request.setDescription("正在下载安全更新");
                request.setMimeType("application/vnd.android.package-archive");
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setAllowedOverMetered(true);
                request.setDestinationInExternalFilesDir(activity, Environment.DIRECTORY_DOWNLOADS, filename);
                pendingDownloadId = downloadManager.enqueue(request);
                JSONObject payload = status("downloading", "新版正在后台下载，完成后会自动校验");
                payload.put("downloadId", pendingDownloadId);
                sendUpdateResult(payload);
            } catch (Exception error) {
                sendUpdateResult(status("error", "无法开始下载：" + safeMessage(error)));
            }
        });
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
                sendUpdateResult(status("error", "未获得安装未知应用权限"));
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

    private void verifyDownloadedUpdate() {
        UpdateInfo info = pendingUpdate;
        File file = pendingDownloadFile;
        if (info == null || file == null) return;
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
                sendUpdateResult(status("verified", "更新包校验通过，准备安装"));
                activity.runOnUiThread(this::requestInstallPermissionOrInstall);
            } catch (Exception error) {
                if (file.exists()) file.delete();
                sendUpdateResult(status("error", "更新包不安全：" + safeMessage(error)));
            }
        });
    }

    private void requestInstallPermissionOrInstall() {
        if (Build.VERSION.SDK_INT >= 26 && !activity.getPackageManager().canRequestPackageInstalls()) {
            sendUpdateResult(status("permission", "请允许一餐安装更新，然后返回应用"));
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
            activity.startActivity(intent);
        } catch (Exception error) {
            sendUpdateResult(status("error", "无法打开系统安装界面：" + safeMessage(error)));
        }
    }

    private JSONObject readJson(String url) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setConnectTimeout(10_000);
        connection.setReadTimeout(15_000);
        connection.setInstanceFollowRedirects(true);
        connection.setRequestProperty("Accept", "application/vnd.github+json, application/json");
        connection.setRequestProperty("User-Agent", "YiCan-Android/" + BuildConfig.VERSION_NAME);
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

    private static void validateUpdateUrl(String value) throws Exception {
        Uri uri = Uri.parse(value);
        String host = uri.getHost();
        String path = uri.getPath();
        if (!"https".equalsIgnoreCase(uri.getScheme()) || !"github.com".equalsIgnoreCase(host)
                || path == null || !path.startsWith("/why685/yican-android/releases/download/")) {
            throw new Exception("更新地址不受信任");
        }
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

    private static final class UpdateInfo {
        final int versionCode;
        final String versionName;
        final String apkUrl;
        final String sha256;
        final String releaseNotes;

        UpdateInfo(int versionCode, String versionName, String apkUrl, String sha256, String releaseNotes) {
            this.versionCode = versionCode;
            this.versionName = versionName;
            this.apkUrl = apkUrl;
            this.sha256 = sha256;
            this.releaseNotes = releaseNotes;
        }

        static UpdateInfo from(JSONObject json, String fallbackNotes) throws Exception {
            if (json.optInt("schemaVersion") != 1) throw new Exception("不支持的更新清单版本");
            int code = json.optInt("versionCode", 0);
            String name = json.optString("versionName", "").trim();
            String url = json.optString("apkUrl", "").trim();
            String hash = json.optString("sha256", "").trim().toLowerCase(Locale.ROOT);
            String notes = json.optString("releaseNotes", fallbackNotes).trim();
            if (code <= 0 || name.isEmpty() || url.isEmpty() || !hash.matches("[0-9a-f]{64}")) {
                throw new Exception("更新清单字段无效");
            }
            return new UpdateInfo(code, name, url, hash, notes);
        }
    }
}
