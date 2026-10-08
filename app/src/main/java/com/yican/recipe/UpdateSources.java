package com.yican.recipe;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

final class UpdateSources {
    static final String RELEASE_API = "https://api.github.com/repos/why685/yican-android/releases/latest";
    private static final String PROXIED_LATEST = "https://gh-proxy.org/https://github.com/why685/yican-android/releases/latest/download/update.json";
    private static final String JSDELIVR_MAIN = "https://cdn.jsdelivr.net/gh/why685/yican-android@main/update.json";
    private static final String JSDELIVR_LATEST = "https://cdn.jsdelivr.net/gh/why685/yican-android@latest/update.json";
    private static final String GITHUB_LATEST = "https://github.com/why685/yican-android/releases/latest/download/update.json";

    private UpdateSources() {
    }

    static List<String> manifestUrls(long nowMillis) {
        String cacheKey = "?check=" + Math.max(0L, nowMillis / 3_600_000L);
        return Collections.unmodifiableList(Arrays.asList(
                PROXIED_LATEST + cacheKey,
                JSDELIVR_MAIN + cacheKey,
                JSDELIVR_LATEST + cacheKey,
                GITHUB_LATEST + cacheKey
        ));
    }
}
