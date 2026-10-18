# Fuji Recipes for Android — 1.0.0

An installable offline Android edition using the exact shared React UI, photo gallery, settings, themes, search, filters, favorites and square photo import flow. It bundles 19 recipes and 45 reference images. Android 8.0 / API 26 or newer is required.

Favorites and imported photos are saved on the device in IndexedDB, with native file selection, clipboard copying and Android Back handling. All imported photos are square and no larger than 1080 × 1080. It does not request broad storage or camera permissions. The normal Internet permission supports WebView HTTPS loading; the native asset handler blocks remote subresource requests, and the bundled edition works offline. The reserved HTTPS asset origin allows secure-context browser APIs without a local HTTP server. External web collection links open the user's browser.

The offline Android data and signed-in website data are independent; cloud synchronization is not part of this first native package. This is clearly stated in the app's Layout chooser. Built-in recipes ship with the app; a later APK is needed to refresh the bundled collection.

## Build

Install Java 17 or newer, Android SDK platform 36 and build-tools 36.0.0. If only a Java runtime is available, the helper uses the pinned Eclipse ECJ 3.42.0 compiler. Install the repository's Node dependencies first. Then run from the repository root:

```sh
python android/build-apk.py --sdk /path/to/android-sdk --keystore /private/path/Fuji-Recipes-Development.keystore --output /output/Fuji-Recipes-1.0.0.apk
```

The helper builds Vite assets from `app/page.tsx`, compiles native resources and Java bytecode, runs D8, aligns the APK, signs it and verifies its certificate and alignment. If a development signing keystore does not yet exist, it creates one with alias `fuji-recipes`. The default development password is `android`; set `FUJI_SIGNING_PASSWORD` for a different password. Preserve the same keystore for future installable updates. Do not commit signing keys.

Generated assets, build output, APKs and signing keys are ignored by Git. The Android source and build scripts remain tracked. No Play Store publishing or account setup is needed for sideloading.

## Verification

APK packaging, manifest SDK/package values, included image hashes, signature and zip alignment are checked. Device launch, native file-picker interaction and persistence have not been exercised on a physical Android device or emulator in this environment.
