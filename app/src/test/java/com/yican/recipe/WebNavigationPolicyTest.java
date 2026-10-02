package com.yican.recipe;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class WebNavigationPolicyTest {
    @Test
    public void allowsOnlyPackagedOfflinePages() {
        assertTrue(WebNavigationPolicy.isTrustedOfflineUrl("file:///android_asset/www/index.html"));
        assertTrue(WebNavigationPolicy.isTrustedOfflineUrl("file:///android_asset/www/styles.css"));
        assertFalse(WebNavigationPolicy.isTrustedOfflineUrl("https://example.com/"));
        assertFalse(WebNavigationPolicy.isTrustedOfflineUrl("file:///sdcard/untrusted.html"));
        assertFalse(WebNavigationPolicy.isTrustedOfflineUrl("file:///android_asset/www/../secret.html"));
    }
}
