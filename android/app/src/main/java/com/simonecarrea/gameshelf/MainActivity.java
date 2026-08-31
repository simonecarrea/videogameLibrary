package com.simonecarrea.gameshelf;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  private WebView webView;

  @Override public void onCreate(Bundle savedInstanceState){
    super.onCreate(savedInstanceState);
    webView=new WebView(this);
    webView.setBackgroundColor(0xFF080A0F);

    WebSettings s=webView.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setMediaPlaybackRequiresUserGesture(false);

    webView.setWebViewClient(new WebViewClient());

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      webView.setOnApplyWindowInsetsListener((v, insets) -> {
        int top = insets.getSystemWindowInsetTop();
        int bottom = insets.getSystemWindowInsetBottom();
        v.setPadding(0, top, 0, bottom);
        return insets;
      });
      webView.requestApplyInsets();
    }

    webView.loadUrl("https://simonecarrea.github.io/videogameLibrary/");
    setContentView(webView);
  }

  @Override public void onBackPressed(){
    if(webView.canGoBack()) webView.goBack();
    else super.onBackPressed();
  }
}