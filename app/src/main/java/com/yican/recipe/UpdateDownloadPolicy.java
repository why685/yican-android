package com.yican.recipe;

import android.app.DownloadManager;

final class UpdateDownloadPolicy {
    static String failureMessage(int reason) {
        if (reason == DownloadManager.ERROR_INSUFFICIENT_SPACE) return "下载失败：设备空间不足";
        if (reason == DownloadManager.ERROR_HTTP_DATA_ERROR || reason == DownloadManager.ERROR_CANNOT_RESUME) {
            return "下载失败：网络中断，请重试";
        }
        if (reason >= 400 && reason < 600) return "下载失败：服务器返回 " + reason;
        return "下载失败（代码 " + reason + "），请重试";
    }

    static boolean mayResumeInstall(String state) {
        return "verified".equals(state) || "permission".equals(state) || "installing".equals(state);
    }
}
