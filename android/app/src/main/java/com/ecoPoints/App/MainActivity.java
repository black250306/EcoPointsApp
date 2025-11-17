package com.ecoPoints.App;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;

// Import the plugins we need to manually register
import com.capacitorjs.plugins.camera.CameraPlugin;
import com.capacitorjs.plugins.device.DevicePlugin;
import com.capacitorjs.plugins.geolocation.GeolocationPlugin;
import com.capacitorjs.plugins.keyboard.KeyboardPlugin;
import com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;
import com.capacitorjs.plugins.splashscreen.SplashScreenPlugin;
import com.capacitorjs.plugins.statusbar.StatusBarPlugin;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // The correct, modern way to manually register plugins
    ArrayList<Class<? extends Plugin>> plugins = new ArrayList<>();
    plugins.add(CameraPlugin.class);
    plugins.add(DevicePlugin.class);
    plugins.add(GeolocationPlugin.class);
    plugins.add(KeyboardPlugin.class);
    plugins.add(LocalNotificationsPlugin.class);
    plugins.add(PushNotificationsPlugin.class);
    plugins.add(SplashScreenPlugin.class);
    plugins.add(StatusBarPlugin.class);

    registerPlugins(plugins);
  }
}
