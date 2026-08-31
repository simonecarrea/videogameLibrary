package com.simonecarrea.gameshelf;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  private static final String LOCAL_APP_URL = "file:///android_asset/index.html";
  private WebView webView;

  @Override public void onCreate(Bundle savedInstanceState){
    super.onCreate(savedInstanceState);

    webView = new WebView(this);
    webView.setBackgroundColor(0xFF080A0F);

    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setMediaPlaybackRequiresUserGesture(false);
    settings.setAllowFileAccess(true);
    settings.setAllowContentAccess(false);

    webView.setWebViewClient(new WebViewClient());

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      webView.setOnApplyWindowInsetsListener((view, insets) -> {
        int top = insets.getSystemWindowInsetTop();
        int bottom = insets.getSystemWindowInsetBottom();
        view.setPadding(0, top, 0, bottom);
        return insets;
      });
      webView.requestApplyInsets();
    }

    webView.loadUrl(LOCAL_APP_URL);
    setContentView(webView);
  }

  @Override public void onBackPressed(){
    if (webView != null && webView.canGoBack()) webView.goBack();
    else super.onBackPressed();
  }
}