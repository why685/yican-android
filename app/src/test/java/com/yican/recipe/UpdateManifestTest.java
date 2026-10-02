package com.yican.recipe;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import org.json.JSONObject;
import org.junit.Test;

public class UpdateManifestTest {
    private JSONObject validManifest() throws Exception {
        return new JSONObject()
                .put("schemaVersion", 1)
                .put("versionCode", 4)
                .put("versionName", "1.2.1")
                .put("apkUrl", "https://github.com/why685/yican-android/releases/download/v1.2.1/YiCan-1.2.1.apk")
                .put("sha256", "a".repeat(64));
    }

    @Test
    public void parsesAndRoundTripsManifest() throws Exception {
        UpdateManifest manifest = UpdateManifest.parse(validManifest(), "修复说明");
        UpdateManifest restored = UpdateManifest.fromPersisted(manifest.toJson().toString());
        assertEquals(4, restored.versionCode);
        assertEquals("1.2.1", restored.versionName);
        assertEquals("修复说明", restored.releaseNotes);
        assertTrue(restored.isNewerThan(3));
        assertFalse(restored.isNewerThan(4));
    }

    @Test
    public void rejectsUnsupportedSchemaAndMalformedHash() {
        assertThrows(Exception.class, () -> UpdateManifest.parse(validManifest().put("schemaVersion", 2), ""));
        assertThrows(Exception.class, () -> UpdateManifest.parse(validManifest().put("sha256", "1234"), ""));
    }

    @Test
    public void acceptsOnlyRepositoryReleaseUrls() {
        assertThrows(Exception.class, () -> UpdateManifest.validateUrl("http://github.com/why685/yican-android/releases/download/v1/a.apk"));
        assertThrows(Exception.class, () -> UpdateManifest.validateUrl("https://example.com/why685/yican-android/releases/download/v1/a.apk"));
        assertThrows(Exception.class, () -> UpdateManifest.validateUrl("https://github.com/other/repo/releases/download/v1/a.apk"));
    }
}
