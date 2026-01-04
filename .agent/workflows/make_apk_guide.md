---
description: How to generate an APK using Android Studio for the Payment Soft web app.
---

# Generate APK with Android Studio

Since you have Android Studio installed, you can create a real APK file in 5 minutes.
We will create a simple "WebView App" that shows your live website.

## Step 1: Create New Project
1.  Open **Android Studio**.
2.  Click **New Project**.
3.  Select **"Empty Views Activity"** (or just "Empty Activity").
4.  Click **Next**.
5.  **Name**: `Payment Soft`
6.  **Package name**: `com.aaryatechnologies.paymentsoft`
7.  **Language**: `Java`
8.  Click **Finish**.

## Step 2: Add Internet Permission
1.  On the left side, open `app` > `manifests` > `AndroidManifest.xml`.
2.  Add this line **above** the `<application>` tag:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## Step 3: Design the Screen (XML)
1.  Open `app` > `res` > `layout` > `activity_main.xml`.
2.  Delete everything and paste this code:

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</RelativeLayout>
```

## Step 4: Add Logic (Java or Kotlin)

### Option A: If you selected "Java" (Recommended)
1.  Open `app` > `java` > `com...paymentsoft` > `MainActivity.java`.
2.  Replace with:
```java
package com.aaryatechnologies.paymentsoft;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {
    private WebView myWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        myWebView = (WebView) findViewById(R.id.webview);
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        myWebView.setWebViewClient(new WebViewClient());
        myWebView.loadUrl("https://aaryatechnologies.vercel.app");
    }

    @Override
    public void onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
```

### Option B: If you kept "Kotlin" (Default)
1.  Open `app` > `java` > `com...paymentsoft` > `MainActivity.kt`.
2.  Replace with:
```kotlin
package com.aaryatechnologies.paymentsoft

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : AppCompatActivity() {
    private lateinit var myWebView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        myWebView = findViewById(R.id.webview)
        myWebView.settings.javaScriptEnabled = true
        myWebView.settings.domStorageEnabled = true
        
        myWebView.webViewClient = WebViewClient()
        myWebView.loadUrl("https://aaryatechnologies.vercel.app")
    }

    override fun onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
```

## Step 5: Build APK
1.  Go to the top menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2.  Wait for the process to finish.
3.  Click **"locate"** in the popup (bottom right) to find your `app-debug.apk` file.
4.  Copy this file to your phone and install!
