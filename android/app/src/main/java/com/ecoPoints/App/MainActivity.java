package com.ecoPoints.App;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

// Import all the plugins found in the project
import com.capacitorjs.plugins.camera.CameraPlugin;
import com.capacitorjs.plugins.device.DevicePlugin;
import com.capacitorjs.plugins.geolocation.GeolocationPlugin;
import com.capacitorjs.plugins.keyboard.KeyboardPlugin;
import com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;
import com.capacitorjs.plugins.splashscreen.SplashScreenPlugin;
import com.capacitorjs.plugins.statusbar.StatusBarPlugin;
import com.capawesome.capacitor.androidedgetoedge.AndroidEdgeToEdgePlugin;

public class MainActivity extends BridgeActivity {

  @Override
  public ArrayList<Class<? extends Plugin>> getPlugins() {
    ArrayList<Class<? extends Plugin>> plugins = new ArrayList<>();
    // Add all the plugins you want to use here.
    // This is the modern way to manually register plugins when auto-detection fails.
    plugins.add(CameraPlugin.class);
    plugins.add(DevicePlugin.class);
    plugins.add(GeolocationPlugin.class);
    plugins.add(KeyboardPlugin.class);
    plugins.add(LocalNotificationsPlugin.class);
    plugins.add(PushNotificationsPlugin.class);
    plugins.add(SplashScreenPlugin.class);
    plugins.add(StatusBarPlugin.class);
    plugins.add(AndroidEdgeToEdgePlugin.class);
    return plugins;
  }

}
