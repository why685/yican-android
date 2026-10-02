package com.yican.recipe;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.content.pm.PackageManager;
import android.view.Window;
import android.webkit.WebResourceRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 1001;
    private static final int TIMER_NOTIFICATION_REQUEST = 1004;
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private AppBridge appBridge;
    private String pendingTimerRecipeRef;
    private int pendingTimerStepIndex = -1;
    private boolean pageReady;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();
        window.setStatusBarColor(Color.rgb(251, 247, 240));
        window.setNavigationBarColor(Color.rgb(251, 247, 240));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(251, 247, 240));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isTrustedOfflinePage(uri)) return false;
                openExternal(uri);
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageReady = url != null && url.startsWith("file:///android_asset/www/");
                deliverTimerDestination();
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri uri = Uri.parse(url);
                if (isTrustedOfflinePage(uri)) return false;
                openExternal(uri);
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), FILE_CHOOSER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException error) {
                    filePathCallback = null;
                    return false;
                }
            }
        });

        appBridge = new AppBridge(this, webView);
        webView.addJavascriptInterface(appBridge, "YiCanAndroid");

        captureTimerDestination(getIntent());
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    boolean ensureTimerNotificationPermission() {
        if (Build.VERSION.SDK_INT < 33 || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
            return true;
        }
        requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, TIMER_NOTIFICATION_REQUEST);
        return false;
    }

    private void captureTimerDestination(Intent intent) {
        if (intent == null) return;
        String recipeRef = intent.getStringExtra(TimerReceiver.EXTRA_RECIPE_REF);
        int stepIndex = intent.getIntExtra(TimerReceiver.EXTRA_STEP_INDEX, -1);
        if (recipeRef != null && stepIndex >= 0) {
            pendingTimerRecipeRef = recipeRef;
            pendingTimerStepIndex = stepIndex;
        }
    }

    private void deliverTimerDestination() {
        if (!pageReady || pendingTimerRecipeRef == null || pendingTimerStepIndex < 0 || webView == null) return;
        String script = "window.YiCanNative&&window.YiCanNative.onTimerOpen("
                + JSONObject.quote(pendingTimerRecipeRef) + "," + pendingTimerStepIndex + ");";
        pendingTimerRecipeRef = null;
        pendingTimerStepIndex = -1;
        webView.evaluateJavascript(script, null);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        captureTimerDestination(intent);
        deliverTimerDestination();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == TIMER_NOTIFICATION_REQUEST && appBridge != null) {
            appBridge.onNotificationPermissionResult(grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED);
        }
    }

    private void openExternal(Uri uri) {
        if (uri == null || !("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ignored) {
            // Keep the offline recipe experience available even without a browser.
        }
    }

    private static boolean isTrustedOfflinePage(Uri uri) {
        return uri != null && WebNavigationPolicy.isTrustedOfflineUrl(uri.toString());
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (appBridge != null && appBridge.handleActivityResult(requestCode, resultCode, data)) return;
        if (requestCode == FILE_CHOOSER_REQUEST && filePathCallback != null) {
            Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript(
            "window.recipeApp?.handleBack?.() || 'none'",
            result -> {
                if (!"\"handled\"".equals(result)) {
                    if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
                }
            }
        );
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (appBridge != null) appBridge.onHostResume();
    }

    @Override
    protected void onDestroy() {
        if (appBridge != null) appBridge.destroy();
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.destroy();
        }
        super.onDestroy();
    }
}
