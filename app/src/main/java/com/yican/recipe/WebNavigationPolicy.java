package com.yican.recipe;

final class WebNavigationPolicy {
    private static final String TRUSTED_PREFIX = "file:///android_asset/www/";

    static boolean isTrustedOfflineUrl(String value) {
        if (value == null || !value.startsWith(TRUSTED_PREFIX)) return false;
        String tail = value.substring(TRUSTED_PREFIX.length());
        return !tail.startsWith("../") && !tail.contains("/../") && !tail.contains("\\");
    }
}
