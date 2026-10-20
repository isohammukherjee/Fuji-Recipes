package com.soham.fujirecipes;
import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.content.Intent;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.graphics.Color;
import android.net.Uri;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.*;
import android.widget.FrameLayout;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;

/** Shared React UI hosted entirely from APK assets over a reserved HTTPS origin. */
public final class MainActivity extends Activity {
 private WebView web;
 private ValueCallback<Uri[]> fileCallback;
 private static final int PICK_IMAGE=41;
 private static final int CAPTURE_SCENE=42;
 private Uri captureUri;
 private static final String ORIGIN="appassets.androidplatform.net";
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  getWindow().setStatusBarColor(Color.rgb(17,19,17));getWindow().setNavigationBarColor(Color.rgb(17,19,17));
  FrameLayout root=new FrameLayout(this);root.setBackgroundColor(Color.rgb(17,19,17));setContentView(root);
  if(Build.VERSION.SDK_INT>=30){root.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener(){@Override public WindowInsets onApplyWindowInsets(View view,WindowInsets insets){android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout());view.setPadding(bars.left,bars.top,bars.right,bars.bottom);return WindowInsets.CONSUMED;}});}
  web=new WebView(this);root.addView(web,new FrameLayout.LayoutParams(-1,-1));web.setBackgroundColor(Color.rgb(17,19,17));
  WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setDatabaseEnabled(true);settings.setUseWideViewPort(true);settings.setLoadWithOverviewMode(false);settings.setSupportZoom(false);settings.setBuiltInZoomControls(false);settings.setDisplayZoomControls(false);settings.setTextZoom(100);settings.setAllowFileAccess(false);settings.setAllowContentAccess(true);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  WebView.setWebContentsDebuggingEnabled(false);web.addJavascriptInterface(new DeviceBridge(),"FujiNative");
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
    Uri uri=request.getUrl();String path=uri.getPath();
    if(!ORIGIN.equals(uri.getHost())||!"https".equals(uri.getScheme())){String host=uri.getHost();if("https".equals(uri.getScheme())&&isModelHost(host)&&!request.isForMainFrame())return null;return empty(403,"Blocked");}
    if(path==null||path.contains(".."))return empty(404,"Not found");
    if(path.equals("/")||path.equals("/assets/"))path="/assets/index.html";
    if(!path.startsWith("/assets/"))return empty(404,"Not found");
    String file=path.substring(8);
    try{InputStream stream=getAssets().open(file);HashMap<String,String> headers=new HashMap<>();headers.put("Cache-Control","no-cache");headers.put("X-Content-Type-Options","nosniff");return new WebResourceResponse(mime(file),"UTF-8",200,"OK",headers,stream);}catch(Exception error){return empty(404,"Not found");}
   }
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){Uri uri=request.getUrl();if(ORIGIN.equals(uri.getHost())&&"https".equals(uri.getScheme()))return false;if("https".equals(uri.getScheme())||"http".equals(uri.getScheme())){try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception ignored){}return true;}return true;}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=callback;if(params.isCaptureEnabled()){new java.io.File(getCacheDir(),"scene.jpg").delete();captureUri=Uri.parse("content://com.soham.fujirecipes.scene/scene.jpg");Intent take=new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);take.putExtra(android.provider.MediaStore.EXTRA_OUTPUT,captureUri);take.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION|Intent.FLAG_GRANT_READ_URI_PERMISSION);take.setClipData(ClipData.newRawUri("Scene photo",captureUri));try{startActivityForResult(take,CAPTURE_SCENE);}catch(Exception error){fileCallback.onReceiveValue(null);fileCallback=null;captureUri=null;}return true;}Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);intent.setType("image/*");intent.addCategory(Intent.CATEGORY_OPENABLE);intent.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"image/jpeg","image/png","image/webp"});try{startActivityForResult(intent,PICK_IMAGE);}catch(Exception error){fileCallback.onReceiveValue(null);fileCallback=null;}return true;}
  });
  if(Build.VERSION.SDK_INT>=33)getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,new android.window.OnBackInvokedCallback(){@Override public void onBackInvoked(){MainActivity.this.onBackPressed();}});
  if(state==null||web.restoreState(state)==null)web.loadUrl("https://"+ORIGIN+"/assets/index.html");
 }
 public final class DeviceBridge {
  @JavascriptInterface public void clearScenePhoto(){new java.io.File(getCacheDir(),"scene.jpg").delete();}
  @JavascriptInterface public void copyText(String text){if(text==null||text.length()>100000)return;runOnUiThread(new Runnable(){@Override public void run(){ClipboardManager clipboard=(ClipboardManager)getSystemService(CLIPBOARD_SERVICE);clipboard.setPrimaryClip(ClipData.newPlainText("Fuji recipe",text));}});}
 }
 // Exact model/CDN hosts only. Photos never leave the device; all other remote resources remain blocked.
 private static boolean isModelHost(String host){return "cdn.jsdelivr.net".equals(host)||"huggingface.co".equals(host)||"cdn-lfs.huggingface.co".equals(host)||"cdn-lfs-us-1.huggingface.co".equals(host)||"cas-bridge.xethub.hf.co".equals(host)||"us.aws.cdn.hf.co".equals(host)||"eu.aws.cdn.hf.co".equals(host);}
 private static WebResourceResponse empty(int status,String message){return new WebResourceResponse("text/plain","UTF-8",status,message,new HashMap<>(),new ByteArrayInputStream(new byte[0]));}
 private static String mime(String file){String lower=file.toLowerCase(Locale.ROOT);if(lower.endsWith(".html"))return "text/html";if(lower.endsWith(".js")||lower.endsWith(".mjs"))return "text/javascript";if(lower.endsWith(".css"))return "text/css";if(lower.endsWith(".webp"))return "image/webp";if(lower.endsWith(".png"))return "image/png";if(lower.endsWith(".svg"))return "image/svg+xml";if(lower.endsWith(".json")||lower.endsWith(".webmanifest"))return "application/json";return "application/octet-stream";}
 @Override public void onBackPressed(){if(web!=null&&web.getUrl()!=null&&web.getUrl().contains("/recipe-mind-map.html")){if(web.canGoBack())web.goBack();else web.loadUrl("https://"+ORIGIN+"/assets/index.html");return;}if(web==null){super.onBackPressed();return;}web.evaluateJavascript("(() => { const close=document.querySelector('[role=dialog] button[aria-label=\"Close photo viewer\"], [role=dialog] button[aria-label=\"Close layout chooser\"], [role=dialog] button[aria-label=\"Cancel upload\"], [role=dialog] button[aria-label=\"Close recipe suggestions\"], [role=dialog] button[aria-label=\"Close recipe preview\"]');if(close&&!close.disabled){close.click();return true}if(location.hash){location.hash='';return true}return false})()",new ValueCallback<String>(){@Override public void onReceiveValue(String result){if(!"true".equals(result))finish();}});}
 @Override public void onSaveInstanceState(Bundle state){super.onSaveInstanceState(state);if(web!=null)web.saveState(state);}
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==CAPTURE_SCENE&&fileCallback!=null){fileCallback.onReceiveValue(result==RESULT_OK&&captureUri!=null?new Uri[]{captureUri}:null);fileCallback=null;captureUri=null;if(result!=RESULT_OK)new java.io.File(getCacheDir(),"scene.jpg").delete();}if(request==PICK_IMAGE&&fileCallback!=null){Uri[] values=result==RESULT_OK&&data!=null&&data.getData()!=null?new Uri[]{data.getData()}:null;fileCallback.onReceiveValue(values);fileCallback=null;}}
 @Override public void onDestroy(){if(fileCallback!=null){fileCallback.onReceiveValue(null);fileCallback=null;}new java.io.File(getCacheDir(),"scene.jpg").delete();if(web!=null){web.removeJavascriptInterface("FujiNative");web.destroy();}super.onDestroy();}
}
