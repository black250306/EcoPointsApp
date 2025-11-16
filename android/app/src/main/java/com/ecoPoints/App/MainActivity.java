
package com.ecoPoints.App;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import androidx.core.app.ActivityCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

// Import Camera plugin
import com.getcapacitor.camera.Camera;

public class MainActivity extends BridgeActivity {
    // Request code for camera permission
    private static final int CAMERA_PERMISSION_REQUEST_CODE = 101;
    private PermissionRequest permissionRequest;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(Camera.class);

        // Get the WebView
        WebView webView = getBridge().getWebView();

        // Set a custom WebChromeClient
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                // We are only interested in camera permissions
                boolean isCameraRequest = false;
                for (String resource : request.getResources()) {
                    if (resource.equals(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) {
                        isCameraRequest = true;
                        break;
                    }
                }

                if (isCameraRequest) {
                    permissionRequest = request;
                    // Check if we already have permission
                    if (ActivityCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                        // Grant permission to the WebView
                        request.grant(request.getResources());
                    } else {
                        // Request permission from the user
                        ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST_CODE);
                    }
                } else {
                    // For other permission requests, deny them
                    super.onPermissionRequest(request);
                }
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        // Handle the result of the camera permission request
        if (requestCode == CAMERA_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission was granted, grant it to the WebView
                if (permissionRequest != null) {
                    permissionRequest.grant(permissionRequest.getResources());
                }
            } else {
                // Permission was denied, deny it in the WebView
                if (permissionRequest != null) {
                    permissionRequest.deny();
                }
            }
            permissionRequest = null;
        }
        
        // Forward the result to the Capacitor bridge as well
        bridge.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
}
