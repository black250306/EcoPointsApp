package com.ecoPoints.App;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

// Import the Camera plugin class
import com.capacitorjs.plugins.camera.CameraPlugin;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Manually add the Camera plugin here
      add(CameraPlugin.class);
    }});
  }
}
