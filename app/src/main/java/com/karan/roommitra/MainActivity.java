package com.karan.roommitra;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.window.OnBackInvokedDispatcher;

public class MainActivity extends Activity {

    private static final String HOME = "file:///android_asset/www/index.html";
    private static final int PICK_FILES = 41;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private int insetTop = 0, insetBottom = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#F6F9F7"));
        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        if (Build.VERSION.SDK_INT >= 30) {
            // Draw behind status/navigation bars; the web page pads itself using the insets we send it.
            w.setDecorFitsSystemWindows(false);
            w.setStatusBarColor(Color.TRANSPARENT);
            w.setNavigationBarColor(Color.TRANSPARENT);
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                android.graphics.Insets ime = insets.getInsets(WindowInsets.Type.ime());
                boolean kb = insets.isVisible(WindowInsets.Type.ime());
                FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) web.getLayoutParams();
                lp.bottomMargin = kb ? ime.bottom : 0;
                web.setLayoutParams(lp);
                insetTop = bars.top;
                insetBottom = kb ? 0 : bars.bottom;
                pushInsets();
                return WindowInsets.CONSUMED;
            });
            setStatusIconsDark(false);
        } else {
            w.setStatusBarColor(Color.parseColor("#073824"));
            w.setNavigationBarColor(Color.BLACK);
        }

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(true);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setBackgroundColor(Color.parseColor("#073824"));
        web.addJavascriptInterface(new Bridge(), "RMNative");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                String url = req.getUrl().toString();
                if (url.startsWith("file:///android_asset/")) return false;
                openExternal(url);
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pushInsets();
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("image/*");
                i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                try {
                    startActivityForResult(Intent.createChooser(i, "फोटो चुनें"), PICK_FILES);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(HOME);
    }

    private void pushInsets() {
        if (web == null) return;
        float d = getResources().getDisplayMetrics().density;
        web.evaluateJavascript("window.rmInsets&&rmInsets(" + Math.round(insetTop / d) + "," + Math.round(insetBottom / d) + ")", null);
    }

    private void handleBack() {
        web.evaluateJavascript("window.rmBack?rmBack():false", r -> {
            if (!"true".equals(r)) finish();
        });
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        handleBack();
    }

    private void setStatusIconsDark(boolean dark) {
        if (Build.VERSION.SDK_INT < 30) return;
        WindowInsetsController c = getWindow().getInsetsController();
        if (c == null) return;
        int status = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS;
        int nav = WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
        c.setSystemBarsAppearance((dark ? status : 0) | nav, status | nav);
    }

    private void openExternal(String url) {
        try {
            Intent i;
            if (url.startsWith("tel:")) i = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
            else if (url.startsWith("mailto:")) i = new Intent(Intent.ACTION_SENDTO, Uri.parse(url));
            else i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(i);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "इसके लिए कोई ऐप नहीं मिला", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != PICK_FILES || fileCallback == null) return;
        Uri[] result = null;
        if (resultCode == RESULT_OK && data != null) {
            if (data.getClipData() != null) {
                int n = data.getClipData().getItemCount();
                result = new Uri[n];
                for (int k = 0; k < n; k++) result[k] = data.getClipData().getItemAt(k).getUri();
            } else if (data.getData() != null) {
                result = new Uri[]{data.getData()};
            }
        }
        fileCallback.onReceiveValue(result);
        fileCallback = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    /** Small set of native helpers the web UI can call as window.RMNative.* */
    public class Bridge {
        @JavascriptInterface
        public void share(String text) {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(i, "शेयर करें"));
            });
        }

        @JavascriptInterface
        public void openExternal(String url) {
            runOnUiThread(() -> MainActivity.this.openExternal(url));
        }

        @JavascriptInterface
        public void setLightStatus(boolean darkIcons) {
            runOnUiThread(() -> setStatusIconsDark(darkIcons));
        }
    }
}
