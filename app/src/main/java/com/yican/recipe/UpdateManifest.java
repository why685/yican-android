package com.yican.recipe;

import org.json.JSONObject;

import java.net.URI;
import java.util.Locale;

final class UpdateManifest {
    private static final int SCHEMA_VERSION = 1;
    private static final String RELEASE_PATH = "/why685/yican-android/releases/download/";

    final int versionCode;
    final String versionName;
    final String apkUrl;
    final String sha256;
    final String releaseNotes;

    UpdateManifest(int versionCode, String versionName, String apkUrl, String sha256, String releaseNotes) {
        this.versionCode = versionCode;
        this.versionName = versionName;
        this.apkUrl = apkUrl;
        this.sha256 = sha256;
        this.releaseNotes = releaseNotes;
    }

    static UpdateManifest parse(JSONObject json, String fallbackNotes) throws Exception {
        if (json.optInt("schemaVersion") != SCHEMA_VERSION) throw new Exception("不支持的更新清单版本");
        int code = json.optInt("versionCode", 0);
        String name = json.optString("versionName", "").trim();
        String url = json.optString("apkUrl", "").trim();
        String hash = json.optString("sha256", "").trim().toLowerCase(Locale.ROOT);
        String notes = json.optString("releaseNotes", fallbackNotes == null ? "" : fallbackNotes).trim();
        if (code <= 0 || name.isEmpty() || name.length() > 40 || url.isEmpty()
                || !hash.matches("[0-9a-f]{64}")) {
            throw new Exception("更新清单字段无效");
        }
        validateUrl(url);
        return new UpdateManifest(code, name, url, hash, notes);
    }

    static UpdateManifest fromPersisted(String value) throws Exception {
        if (value == null || value.trim().isEmpty()) return null;
        return parse(new JSONObject(value), "");
    }

    boolean isNewerThan(long installedVersionCode) {
        return versionCode > installedVersionCode;
    }

    JSONObject toJson() {
        JSONObject json = new JSONObject();
        try {
            json.put("schemaVersion", SCHEMA_VERSION);
            json.put("versionCode", versionCode);
            json.put("versionName", versionName);
            json.put("apkUrl", apkUrl);
            json.put("sha256", sha256);
            json.put("releaseNotes", releaseNotes);
        } catch (Exception ignored) {
        }
        return json;
    }

    static void validateUrl(String value) throws Exception {
        URI uri;
        try {
            uri = new URI(value);
        } catch (Exception error) {
            throw new Exception("更新地址无效");
        }
        String host = uri.getHost();
        String path = uri.getPath();
        if (!"https".equalsIgnoreCase(uri.getScheme()) || !"github.com".equalsIgnoreCase(host)
                || path == null || !path.startsWith(RELEASE_PATH) || uri.getUserInfo() != null) {
            throw new Exception("更新地址不受信任");
        }
    }
}
