package com.simonecarrea.gameshelf;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  private static final String LOCAL_APP_URL = "file:///android_asset/index.html";
  private WebView webView;

  @Override public void onCreate(Bundle savedInstanceState){
    super.onCreate(savedInstanceState);

    Window window = getWindow();
    window.setStatusBarColor(Color.rgb(8,10,15));
    window.setNavigationBarColor(Color.rgb(8,10,15));
    window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
    window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);

    webView = new WebView(this);
    webView.setBackgroundColor(Color.rgb(8,10,15));
    webView.setFitsSystemWindows(true);

    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setMediaPlaybackRequiresUserGesture(false);
    settings.setAllowFileAccess(true);
    settings.setAllowContentAccess(false);

    webView.setWebViewClient(new WebViewClient());
    setContentView(webView);
    webView.loadUrl(LOCAL_APP_URL);
  }

  @Override public void onBackPressed(){
    if (webView != null && webView.canGoBack()) webView.goBack();
    else super.onBackPressed();
  }
}
