package com.ecoPoints.App;

import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Force clear cache for development. This ensures the latest JS is always loaded.
    WebView webView = this.bridge.getWebView();
    if (savedInstanceState == null) {
        webView.clearCache(true);
        webView.clearHistory();
    }

    // Set a custom WebChromeClient to handle permission requests from the WebView
    this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {
      @Override
      public void onPermissionRequest(final PermissionRequest request) {
        // Grant permission for video capture (camera).
        // This is REQUIRED for JavaScript libraries like html5-qrcode to work inside a WebView.
        request.grant(request.getResources());
      }
    });
  }
}
