package com.yican.recipe;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

import java.util.HashSet;
import java.util.List;

public class UpdateSourcesTest {
    @Test
    public void manifestSourcesPreferProxyAndKeepIndependentFallbacks() {
        List<String> sources = UpdateSources.manifestUrls(7_200_000L);
        assertEquals(4, sources.size());
        assertEquals(sources.size(), new HashSet<>(sources).size());
        assertTrue(sources.get(0).startsWith("https://gh-proxy.org/"));
        assertTrue(sources.stream().anyMatch(value -> value.startsWith("https://cdn.jsdelivr.net/")));
        assertTrue(sources.stream().anyMatch(value -> value.startsWith("https://github.com/")));
        assertTrue(sources.stream().allMatch(value -> value.endsWith("?check=2")));
    }

    @Test
    public void releaseApiRemainsTheLastFallback() {
        assertEquals("https://api.github.com/repos/why685/yican-android/releases/latest", UpdateSources.RELEASE_API);
    }
}
