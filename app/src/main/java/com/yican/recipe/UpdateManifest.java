package com.yican.recipe;

import org.json.JSONObject;
import org.json.JSONArray;

import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

final class UpdateManifest {
    private static final int SCHEMA_VERSION = 1;
    private static final String RELEASE_PATH = "/why685/yican-android/releases/download/";
    private static final String GITHUB_HOST = "github.com";
    private static final String ACCELERATOR_HOST = "gh-proxy.org";
    private static final String ACCELERATOR_PATH_PREFIX = "/https://github.com" + RELEASE_PATH;
    private static final int MAX_DOWNLOAD_SOURCES = 4;

    final int versionCode;
    final String versionName;
    final String apkUrl;
    final List<String> apkUrls;
    final String sha256;
    final String releaseNotes;

    UpdateManifest(int versionCode, String versionName, List<String> apkUrls, String sha256, String releaseNotes) {
        this.versionCode = versionCode;
        this.versionName = versionName;
        this.apkUrls = Collections.unmodifiableList(new ArrayList<>(apkUrls));
        this.apkUrl = this.apkUrls.get(0);
        this.sha256 = sha256;
        this.releaseNotes = releaseNotes;
    }

    static UpdateManifest parse(JSONObject json, String fallbackNotes) throws Exception {
        if (json.optInt("schemaVersion") != SCHEMA_VERSION) throw new Exception("不支持的更新清单版本");
        int code = json.optInt("versionCode", 0);
        String name = json.optString("versionName", "").trim();
        String url = json.optString("apkUrl", "").trim();
        JSONArray urlArray = json.optJSONArray("apkUrls");
        String hash = json.optString("sha256", "").trim().toLowerCase(Locale.ROOT);
        String notes = json.optString("releaseNotes", fallbackNotes == null ? "" : fallbackNotes).trim();
        List<String> urls = parseDownloadUrls(urlArray, url);
        if (code <= 0 || name.isEmpty() || name.length() > 40 || urls.isEmpty()
                || !hash.matches("[0-9a-f]{64}")) {
            throw new Exception("更新清单字段无效");
        }
        for (String downloadUrl : urls) validateUrl(downloadUrl);
        return new UpdateManifest(code, name, urls, hash, notes);
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
            json.put("apkUrls", new JSONArray(apkUrls));
            json.put("sha256", sha256);
            json.put("releaseNotes", releaseNotes);
        } catch (Exception ignored) {
        }
        return json;
    }

    String downloadUrl(int index) {
        return apkUrls.get(index);
    }

    int downloadSourceCount() {
        return apkUrls.size();
    }

    private static List<String> parseDownloadUrls(JSONArray values, String fallback) throws Exception {
        Set<String> unique = new LinkedHashSet<>();
        if (values != null) {
            if (values.length() > MAX_DOWNLOAD_SOURCES) throw new Exception("下载线路过多");
            for (int index = 0; index < values.length(); index++) {
                String value = values.optString(index, "").trim();
                if (!value.isEmpty()) unique.add(value);
            }
        }
        if (unique.isEmpty() && !fallback.isEmpty()) unique.add(fallback);
        return new ArrayList<>(unique);
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
        boolean directGithub = GITHUB_HOST.equalsIgnoreCase(host)
                && path != null && path.startsWith(RELEASE_PATH);
        boolean trustedAccelerator = ACCELERATOR_HOST.equalsIgnoreCase(host)
                && path != null && path.startsWith(ACCELERATOR_PATH_PREFIX);
        if (!"https".equalsIgnoreCase(uri.getScheme()) || (!directGithub && !trustedAccelerator)
                || uri.getUserInfo() != null || uri.getFragment() != null) {
            throw new Exception("更新地址不受信任");
        }
    }
}
