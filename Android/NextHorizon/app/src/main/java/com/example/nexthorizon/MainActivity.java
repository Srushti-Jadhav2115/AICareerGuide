
package com.example.nexthorizon;

import android.app.DownloadManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "NextHorizon";

    private static final String DEFAULT_EMULATOR_URL =
            "http://10.0.2.2:8080/B46-77/index.jsp";
    private static final String DEFAULT_LAN_URL =
            "http://10.97.221.193:8080/B46-77/index.jsp";

    private String configuredHost = "10.0.2.2";

    private WebView webView;
    private boolean isActivityDestroyed = false;

    // File picker callback & launcher for HTML <input type="file">
    private ValueCallback<Uri[]> fileUploadCallback;
    private ActivityResultLauncher<Intent> fileChooserLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);

        if (webView == null) {
            Log.e(TAG, "WebView not found in activity_main.xml");
            Toast.makeText(
                    this,
                    "WebView not found. Check activity_main.xml",
                    Toast.LENGTH_LONG
            ).show();
            finish();
            return;
        }

        setupFileChooserLauncher();
        configureWebView();
        configureDownloads();
        configureBackNavigation();

        String targetUrl = isEmulator() ? DEFAULT_EMULATOR_URL : DEFAULT_LAN_URL;
        if (getIntent() != null && getIntent().getData() != null) {
            String incoming = getIntent().getData().toString();
            if (incoming.contains(":8080/B46-77") || incoming.contains("10.0.2.2") || incoming.contains("localhost")) {
                targetUrl = incoming;
            }
        }

        try {
            Uri targetUri = Uri.parse(targetUrl);
            if (targetUri.getHost() != null) {
                configuredHost = targetUri.getHost();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing target URL host", e);
        }

        if (savedInstanceState != null) {
            if (webView.restoreState(savedInstanceState) == null) {
                webView.loadUrl(targetUrl);
            }
        } else {
            webView.loadUrl(targetUrl);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        if (intent != null && intent.getData() != null && webView != null) {
            String incoming = intent.getData().toString();
            if (incoming.contains(":8080/B46-77") || incoming.contains("10.0.2.2") || incoming.contains("localhost")) {
                webView.loadUrl(incoming);
            }
        }
    }

    private void setupFileChooserLauncher() {
        fileChooserLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (fileUploadCallback == null) {
                        return;
                    }

                    Uri[] results = null;
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        Intent data = result.getData();
                        if (data.getClipData() != null) {
                            int count = data.getClipData().getItemCount();
                            results = new Uri[count];
                            for (int i = 0; i < count; i++) {
                                results[i] = data.getClipData().getItemAt(i).getUri();
                            }
                        } else if (data.getData() != null) {
                            results = new Uri[]{data.getData()};
                        }
                    }

                    // Always pass result (null if cancelled or empty) to unblock WebView
                    fileUploadCallback.onReceiveValue(results);
                    fileUploadCallback = null;
                }
        );
    }

    private void configureWebView() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setSupportZoom(true);
        webView.getSettings().setBuiltInZoomControls(true);
        webView.getSettings().setDisplayZoomControls(false);
        webView.getSettings().setLoadsImagesAutomatically(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        webView.getSettings().setSupportMultipleWindows(true);
        webView.getSettings().setAllowFileAccess(false); // Security: do not allow arbitrary local file access
        webView.getSettings().setUseWideViewPort(true);
        webView.getSettings().setLoadWithOverviewMode(true);

        webView.setVerticalScrollBarEnabled(true);
        webView.setHorizontalScrollBarEnabled(true);
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        webView.setOverScrollMode(View.OVER_SCROLL_IF_CONTENT_SCROLLS);
        webView.setNestedScrollingEnabled(true);

        // WebChromeClient with onShowFileChooser, target="_blank" support, and console logging
        webView.setWebChromeClient(new WebChromeClient() {

            @Override
            public boolean onCreateWindow(
                    WebView view,
                    boolean isDialog,
                    boolean isUserGesture,
                    android.os.Message resultMsg) {

                WebView tempWebView = new WebView(MainActivity.this);
                tempWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                        handleExternalOrInternalLink(request.getUrl());
                        v.destroy();
                        return true;
                    }

                    @Override
                    public boolean shouldOverrideUrlLoading(WebView v, String url) {
                        if (url != null) {
                            handleExternalOrInternalLink(Uri.parse(url));
                        }
                        v.destroy();
                        return true;
                    }
                });

                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                if (transport != null) {
                    transport.setWebView(tempWebView);
                    resultMsg.sendToTarget();
                    return true;
                }
                return false;
            }

            @Override
            public boolean onShowFileChooser(
                    WebView webView,
                    ValueCallback<Uri[]> filePathCallback,
                    FileChooserParams fileChooserParams) {

                // Safely cancel any previously uncompleted callback
                if (fileUploadCallback != null) {
                    fileUploadCallback.onReceiveValue(null);
                    fileUploadCallback = null;
                }
                fileUploadCallback = filePathCallback;

                try {
                    Intent intent = createFileChooserIntent(fileChooserParams);
                    fileChooserLauncher.launch(Intent.createChooser(intent, "Select File"));
                    return true;
                } catch (Exception exception) {
                    Log.e(TAG, "Failed to launch file chooser", exception);
                    if (fileUploadCallback != null) {
                        fileUploadCallback.onReceiveValue(null);
                        fileUploadCallback = null;
                    }
                    showToast("Unable to open file picker.");
                    return false;
                }
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("NextHorizonConsole", consoleMessage.message() + " ["
                        + consoleMessage.sourceId() + ":" + consoleMessage.lineNumber() + "]");
                return true;
            }
        });

        webView.setWebViewClient(new WebViewClient() {

            private boolean fallbackAttempted = false;

            @Override
            public boolean shouldOverrideUrlLoading(
                    WebView view,
                    WebResourceRequest request) {

                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                String host = uri.getHost();

                if (scheme == null) {
                    return true;
                }

                // Keep NextHorizon website pages inside the app.
                if (("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
                        && isInternalHost(host)) {
                    return false;
                }

                return handleExternalOrInternalLink(uri);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url == null) return true;
                Uri uri = Uri.parse(url);
                String scheme = uri.getScheme();
                String host = uri.getHost();

                if (scheme == null) {
                    return true;
                }

                if (("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
                        && isInternalHost(host)) {
                    return false;
                }

                return handleExternalOrInternalLink(uri);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request != null && request.isForMainFrame()) {
                    String url = request.getUrl() != null ? request.getUrl().toString() : "";
                    String desc = error != null && error.getDescription() != null ? error.getDescription().toString() : "";
                    handleConnectionFailure(view, url, desc);
                }
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                handleConnectionFailure(view, failingUrl, description);
            }

            private void handleConnectionFailure(WebView view, String failingUrl, String description) {
                Log.e(TAG, "Main frame connection error: " + failingUrl + " (" + description + ")");

                // If running on emulator and a LAN IP failed, fallback to stable 10.0.2.2 once
                if (!fallbackAttempted && isEmulator() && failingUrl != null && !failingUrl.contains("10.0.2.2")) {
                    fallbackAttempted = true;
                    Log.i(TAG, "Falling back to stable emulator address: " + DEFAULT_EMULATOR_URL);
                    view.post(() -> view.loadUrl(DEFAULT_EMULATOR_URL));
                    return;
                }

                showToast("Cannot connect to server. Ensure Tomcat is running and laptop is awake.");
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.d(TAG, "Page loaded: " + url);

                // Inject generic Blob download interceptor so any <a download href="blob:..."> works
                injectBlobDownloadInterceptor(view);
            }
        });

        // Register the Javascript bridge
        webView.addJavascriptInterface(
                new AndroidReportBridge(),
                "AndroidReport"
        );
    }

    private boolean handleExternalOrInternalLink(Uri uri) {
        if (uri == null) {
            return true;
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();

        if (scheme == null) {
            return true;
        }

        // Keep NextHorizon website pages inside the app.
        if (("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme))
                && isInternalHost(host)) {
            if (webView != null) {
                webView.loadUrl(uri.toString());
            }
            return true;
        }

        // Open external web links (e.g. YouTube, documentation, courses, articles) in browser or appropriate app.
        if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                intent.addCategory(Intent.CATEGORY_BROWSABLE);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception e) {
                Log.e(TAG, "Unable to open external link: " + uri, e);
                showToast("No app available to open this link.");
            }
            return true;
        }

        // Handle intent: scheme
        if ("intent".equalsIgnoreCase(scheme)) {
            try {
                Intent parsedIntent = Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME);
                if (parsedIntent != null) {
                    parsedIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(parsedIntent);
                    return true;
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to parse intent URI: " + uri, e);
            }
        }

        // Handle mailto:, tel:, and other schemes.
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Unable to open link: " + uri, e);
            showToast("Unable to open this link.");
        }

        return true;
    }

    private boolean isInternalHost(String host) {
        if (host == null) {
            return false;
        }
        return "10.0.2.2".equalsIgnoreCase(host)
                || "localhost".equalsIgnoreCase(host)
                || "127.0.0.1".equalsIgnoreCase(host)
                || host.equalsIgnoreCase(configuredHost);
    }

    private static boolean isEmulator() {
        return (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
                || Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.HARDWARE.contains("goldfish")
                || Build.HARDWARE.contains("ranchu")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || Build.PRODUCT.contains("sdk_google")
                || Build.PRODUCT.contains("google_sdk")
                || Build.PRODUCT.contains("sdk")
                || Build.PRODUCT.contains("sdk_x86")
                || Build.PRODUCT.contains("sdk_gphone")
                || Build.PRODUCT.contains("vbox86p")
                || Build.PRODUCT.contains("emulator")
                || Build.PRODUCT.contains("simulator");
    }

    private Intent createFileChooserIntent(WebChromeClient.FileChooserParams fileChooserParams) {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);

        String[] acceptTypes = fileChooserParams != null ? fileChooserParams.getAcceptTypes() : null;
        List<String> mimeTypes = new ArrayList<>();

        if (acceptTypes != null) {
            for (String raw : acceptTypes) {
                if (raw == null || raw.trim().isEmpty()) continue;
                String[] split = raw.split(",");
                for (String part : split) {
                    String mime = mapExtensionToMime(part.trim().toLowerCase());
                    if (mime != null && !mimeTypes.contains(mime)) {
                        mimeTypes.add(mime);
                    }
                }
            }
        }

        if (mimeTypes.isEmpty()) {
            intent.setType("*/*");
        } else if (mimeTypes.size() == 1) {
            intent.setType(mimeTypes.get(0));
        } else {
            intent.setType("*/*");
            intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes.toArray(new String[0]));
        }

        if (fileChooserParams != null && fileChooserParams.getMode() == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) {
            intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        }

        return intent;
    }

    private String mapExtensionToMime(String type) {
        if (type.equals(".pdf") || type.equals("application/pdf")) {
            return "application/pdf";
        } else if (type.equals(".png") || type.equals("image/png")) {
            return "image/png";
        } else if (type.equals(".jpg") || type.equals(".jpeg") || type.equals("image/jpeg")) {
            return "image/jpeg";
        } else if (type.equals("image/*")) {
            return "image/*";
        } else if (type.contains("/")) {
            return type;
        }
        return "*/*";
    }

    private void injectBlobDownloadInterceptor(WebView view) {
        String script = "javascript:(function() {" +
                "if (window._nhBlobInterceptorInstalled) return;" +
                "window._nhBlobInterceptorInstalled = true;" +
                "document.addEventListener('click', function(e) {" +
                "  var el = e.target;" +
                "  while (el && el.tagName !== 'A') { el = el.parentElement; }" +
                "  if (!el || !el.href) return;" +
                "  if (el.href.indexOf('blob:') === 0 && el.hasAttribute('download')) {" +
                "    e.preventDefault();" +
                "    var dlName = el.getAttribute('download') || 'download';" +
                "    fetch(el.href)" +
                "      .then(function(res) { return res.blob(); })" +
                "      .then(function(blob) {" +
                "        var reader = new FileReader();" +
                "        reader.onloadend = function() {" +
                "          if (window.AndroidReport && window.AndroidReport.saveBase64) {" +
                "            window.AndroidReport.saveBase64(dlName, reader.result);" +
                "          }" +
                "        };" +
                "        reader.readAsDataURL(blob);" +
                "      })" +
                "      .catch(function(err) {" +
                "        console.error('Blob download interception failed', err);" +
                "      });" +
                "  }" +
                "}, true);" +
                "})();";
        view.evaluateJavascript(script, null);
    }

    private void configureDownloads() {
        webView.setDownloadListener(
                (url, userAgent, contentDisposition, mimeType, contentLength) -> {
                    try {
                        Uri uri = Uri.parse(url);
                        String scheme = uri.getScheme();

                        if (scheme == null
                                || (!"http".equalsIgnoreCase(scheme)
                                && !"https".equalsIgnoreCase(scheme))) {
                            showToast("Unsupported download type.");
                            return;
                        }

                        String fileName = URLUtil.guessFileName(
                                url,
                                contentDisposition,
                                mimeType
                        );

                        DownloadManager.Request request =
                                new DownloadManager.Request(uri);

                        request.setTitle(fileName);
                        request.setDescription("Downloading file...");
                        request.setNotificationVisibility(
                                DownloadManager.Request
                                        .VISIBILITY_VISIBLE_NOTIFY_COMPLETED
                        );

                        request.setDestinationInExternalPublicDir(
                                Environment.DIRECTORY_DOWNLOADS,
                                fileName
                        );

                        String cookie =
                                CookieManager.getInstance().getCookie(url);

                        if (cookie != null && !cookie.isEmpty()) {
                            request.addRequestHeader("Cookie", cookie);
                        }

                        if (userAgent != null && !userAgent.isEmpty()) {
                            request.addRequestHeader("User-Agent", userAgent);
                        }

                        DownloadManager manager =
                                (DownloadManager) getSystemService(
                                        Context.DOWNLOAD_SERVICE
                                );

                        if (manager != null) {
                            manager.enqueue(request);
                            showToast("Download started.");
                        } else {
                            showToast("Download service unavailable.");
                        }

                    } catch (Exception exception) {
                        Log.e(TAG, "Download failed", exception);
                        showToast("Unable to download file.");
                    }
                }
        );
    }

    private void configureBackNavigation() {
        getOnBackPressedDispatcher().addCallback(
                this,
                new OnBackPressedCallback(true) {
                    @Override
                    public void handleOnBackPressed() {
                        if (webView != null && webView.canGoBack()) {
                            webView.goBack();
                        } else {
                            finish();
                        }
                    }
                }
        );
    }

    private void showToast(String message) {
        runOnUiThread(() -> {
            if (!isActivityDestroyed) {
                Toast.makeText(
                        MainActivity.this,
                        message,
                        Toast.LENGTH_LONG
                ).show();
            }
        });
    }

    /**
     * JavaScript bridge exposed to the trusted web application as window.AndroidReport
     */
    private class AndroidReportBridge {

        /**
         * Decodes base64 data (handles optional data URI headers) and saves to user Downloads.
         */
        @JavascriptInterface
        public void saveBase64(String fileName, String base64Data) {
            if (fileName == null || base64Data == null) {
                showToast("Invalid report data.");
                return;
            }

            String safeName = sanitizeFileName(fileName, "NextHorizon_Assessment_Report.pdf");
            final String encodedData = base64Data;

            new Thread(() -> {
                try {
                    String cleanData = encodedData;
                    if (cleanData.contains(",")) {
                        cleanData = cleanData.substring(cleanData.indexOf(",") + 1);
                    }
                    byte[] bytes = Base64.decode(
                            cleanData.trim(),
                            Base64.DEFAULT
                    );

                    saveReportFile(safeName, bytes);

                } catch (Exception exception) {
                    Log.e(TAG, "Unable to save report", exception);
                    showToast("Unable to save report.");
                }
            }).start();
        }

        /**
         * Saves HTML content directly as a file in Downloads.
         */
        @JavascriptInterface
        public void saveHtml(String fileName, String htmlContent) {
            if (fileName == null || htmlContent == null) {
                showToast("Invalid report data.");
                return;
            }
            String safeName = sanitizeFileName(fileName, "NextHorizon_Assessment_Report.html");
            new Thread(() -> {
                try {
                    byte[] bytes = htmlContent.getBytes(StandardCharsets.UTF_8);
                    saveReportFile(safeName, bytes);
                } catch (Exception exception) {
                    Log.e(TAG, "Failed to save HTML report", exception);
                    showToast("Unable to save report.");
                }
            }).start();
        }

        /**
         * Opens the Android system print dialog for a clean HTML report document.
         */
        @JavascriptInterface
        public void printReport(String htmlContent) {
            if (htmlContent == null || htmlContent.trim().isEmpty()) {
                printCurrentPage();
                return;
            }

            runOnUiThread(() -> {
                if (isActivityDestroyed) return;

                ViewGroup rootView = findViewById(R.id.main);
                WebView printWebView = new WebView(MainActivity.this);
                printWebView.setVisibility(View.INVISIBLE);
                if (rootView != null) {
                    rootView.addView(printWebView, new ViewGroup.LayoutParams(1, 1));
                }

                printWebView.getSettings().setJavaScriptEnabled(true);
                printWebView.getSettings().setDomStorageEnabled(true);

                printWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        super.onPageFinished(view, url);
                        view.postDelayed(() -> {
                            if (isActivityDestroyed) {
                                cleanupPrintWebView(rootView, printWebView);
                                return;
                            }

                            PrintManager printManager =
                                    (PrintManager) getSystemService(Context.PRINT_SERVICE);

                            if (printManager == null) {
                                showToast("Printing is unavailable.");
                                cleanupPrintWebView(rootView, printWebView);
                                return;
                            }

                            PrintDocumentAdapter adapter =
                                    printWebView.createPrintDocumentAdapter("NextHorizon_Assessment_Report");

                            printManager.print(
                                    "NextHorizon_Assessment_Report",
                                    adapter,
                                    new PrintAttributes.Builder()
                                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                            .build()
                            );

                            view.postDelayed(() -> cleanupPrintWebView(rootView, printWebView), 3000);
                        }, 400);
                    }
                });

                printWebView.loadDataWithBaseURL(
                        "http://10.0.2.2:8080/B46-77/assessment/",
                        htmlContent,
                        "text/html",
                        "UTF-8",
                        null
                );
            });
        }

        @JavascriptInterface
        public void printCurrentPage() {
            runOnUiThread(() -> {
                if (webView == null || isActivityDestroyed) {
                    return;
                }

                PrintManager printManager =
                        (PrintManager) getSystemService(
                                Context.PRINT_SERVICE
                        );

                if (printManager == null) {
                    showToast("Printing is unavailable.");
                    return;
                }

                PrintDocumentAdapter adapter =
                        webView.createPrintDocumentAdapter("NextHorizon_Report");

                printManager.print(
                        "NextHorizon_Report",
                        adapter,
                        new PrintAttributes.Builder().build()
                );
            });
        }
    }

    private void cleanupPrintWebView(ViewGroup rootView, WebView printWebView) {
        runOnUiThread(() -> {
            if (rootView != null && printWebView != null) {
                rootView.removeView(printWebView);
            }
            if (printWebView != null) {
                printWebView.destroy();
            }
        });
    }

    private String sanitizeFileName(String fileName, String fallback) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return fallback;
        }
        String name = new File(fileName).getName().replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        if (name.isEmpty() || name.equals(".")) {
            return fallback;
        }
        return name;
    }

    private void saveReportFile(String fileName, byte[] bytes)
            throws IOException {

        String lowerName = fileName.toLowerCase();

        String mimeType;

        if (lowerName.endsWith(".pdf")) {
            mimeType = "application/pdf";
        } else if (lowerName.endsWith(".html")) {
            mimeType = "text/html";
        } else {
            mimeType = "application/octet-stream";
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
            values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
            values.put(
                    MediaStore.MediaColumns.RELATIVE_PATH,
                    Environment.DIRECTORY_DOWNLOADS
            );
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);

            Uri fileUri = getContentResolver().insert(
                    MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                    values
            );

            if (fileUri == null) {
                throw new IOException("Could not create output file in MediaStore.");
            }

            try (OutputStream outputStream =
                         getContentResolver().openOutputStream(fileUri)) {

                if (outputStream == null) {
                    throw new IOException("Could not open MediaStore output stream.");
                }

                outputStream.write(bytes);
                outputStream.flush();

            } catch (IOException exception) {
                getContentResolver().delete(fileUri, null, null);
                throw exception;
            }

            ContentValues completed = new ContentValues();
            completed.put(MediaStore.MediaColumns.IS_PENDING, 0);

            getContentResolver().update(
                    fileUri,
                    completed,
                    null,
                    null
            );

        } else {
            File downloadsDirectory =
                    Environment.getExternalStoragePublicDirectory(
                            Environment.DIRECTORY_DOWNLOADS
                    );

            if (!downloadsDirectory.exists()
                    && !downloadsDirectory.mkdirs()) {
                throw new IOException("Could not create Downloads folder.");
            }

            File outputFile = new File(downloadsDirectory, fileName);
            int counter = 1;
            String baseName = fileName;
            String extension = "";
            int dotIndex = fileName.lastIndexOf('.');
            if (dotIndex > 0) {
                baseName = fileName.substring(0, dotIndex);
                extension = fileName.substring(dotIndex);
            }
            while (outputFile.exists()) {
                outputFile = new File(downloadsDirectory, baseName + " (" + counter + ")" + extension);
                counter++;
            }

            try (FileOutputStream outputStream =
                         new FileOutputStream(outputFile)) {
                outputStream.write(bytes);
                outputStream.flush();
            }
        }

        showToast("Saved to Downloads: " + fileName);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) {
            webView.saveState(outState);
        }

        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onDestroy() {
        isActivityDestroyed = true;

        if (fileUploadCallback != null) {
            fileUploadCallback.onReceiveValue(null);
            fileUploadCallback = null;
        }

        if (webView != null) {
            webView.removeJavascriptInterface("AndroidReport");
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
            webView = null;
        }

        super.onDestroy();
    }
}