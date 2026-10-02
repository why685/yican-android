package com.yican.recipe;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import android.app.DownloadManager;

import org.junit.Test;

public class UpdateDownloadPolicyTest {
    @Test
    public void mapsImportantFailuresToActionableMessages() {
        assertTrue(UpdateDownloadPolicy.failureMessage(DownloadManager.ERROR_INSUFFICIENT_SPACE).contains("空间不足"));
        assertTrue(UpdateDownloadPolicy.failureMessage(DownloadManager.ERROR_CANNOT_RESUME).contains("网络中断"));
        assertTrue(UpdateDownloadPolicy.failureMessage(404).contains("404"));
    }

    @Test
    public void identifiesInstallStatesThatCanRecoverAfterRestart() {
        assertTrue(UpdateDownloadPolicy.mayResumeInstall("verified"));
        assertTrue(UpdateDownloadPolicy.mayResumeInstall("permission"));
        assertTrue(UpdateDownloadPolicy.mayResumeInstall("installing"));
        assertFalse(UpdateDownloadPolicy.mayResumeInstall("downloading"));
        assertFalse(UpdateDownloadPolicy.mayResumeInstall("cancelled"));
    }
}
