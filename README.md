# 📷 SnapCal — Free Calorie Tracker PWA

SnapCal is a **free, private, offline-first** calorie tracker that installs to your
iPhone (or Android) home screen like a native app. No accounts, no servers, no API
keys — everything runs in your browser and your data stays in `localStorage` on your
device.

Live demo (after enabling Pages, see below):
**https://zpotato465-stack.github.io/Snapcal/**

---

## ✨ Features

- **Smart onboarding** — calculates your daily calorie goal from sex, age, height,
  weight, activity level, and goal (lose / maintain / gain) using the
  **Mifflin–St Jeor** equation × activity multiplier (lose = −500 kcal, gain = +500 kcal).
  Works in **metric (kg/cm)** and **imperial (lb/ft·in)**.
- **📷 On-device photo food detection** — uses **TensorFlow.js MobileNet** loaded
  lazily from a CDN (no API keys) to recognise food in a photo, mapped to a built-in
  calorie database. **The photo never leaves your device.**
- **🏷️ Barcode scanning** — **ZXing** reads the barcode and looks up packaged foods
  via the free **[Open Food Facts](https://world.openfoodfacts.org/)** API.
- **🔎 Manual search** with a serving/quantity picker, a **daily log**, an animated
  **calorie progress ring**, **macro targets** (protein/carbs/fat), and a
  **7-day history bar chart**.
- **🌍 Full English + العربية (Arabic)** with right-to-left layout, translated food
  names, automatic device-language detection, and a switcher in onboarding & Settings.
- **📲 Installable PWA** — web app manifest + service worker, so it installs to the
  home screen and works **offline** (the AI model and Open Food Facts need a network
  the first time / for packaged-food lookups).

Everything is plain HTML/CSS/JS — **no build step**.

---

## 🚀 Go live with GitHub Pages (one-time toggle)

The site is already pushed to this repo at the root. To publish it:

1. Open the repo on GitHub → **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set **Branch** to **`main`** and folder to **`/ (root)`**, then click **Save**.
4. Wait ~1 minute. Your app is live at:

   **https://zpotato465-stack.github.io/Snapcal/**

> Note: GitHub Pages URLs are case-sensitive in the path. The repo is `Snapcal`,
> so the live URL is `…/Snapcal/`.

### Install on iPhone
Open the live URL in **Safari** → tap the **Share** button → **Add to Home Screen**.
SnapCal launches full-screen with its own icon and works offline.

---

## 🌐 Using a custom domain later

1. Buy a domain (e.g. `snapcal.app`) from any registrar.
2. In **Settings → Pages → Custom domain**, enter your domain and **Save**
   (this creates a `CNAME` file in the repo).
3. At your DNS provider add records:
   - **Apex domain** (`snapcal.app`): four `A` records →
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     (and the matching `AAAA` records if you want IPv6).
   - **Subdomain** (`www.snapcal.app`): one `CNAME` → `zpotato465-stack.github.io`.
4. Back in **Pages**, tick **Enforce HTTPS** once the certificate is issued.

Because every path in the app is **relative** (`./app.js`, `icons/…`, `start_url`
in the manifest), it works unchanged at the project URL, at a user/org Pages root,
or on a custom domain — no code changes needed.

---

## 🍏 Wrapping for the App Store with Capacitor

You can ship the same code to the Apple App Store / Google Play by wrapping it with
[Capacitor](https://capacitorjs.com/):

```bash
# from a copy of this repo
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init SnapCal app.snapcal --web-dir .   # web-dir = this folder (the web assets)
npx cap add ios            # requires macOS + Xcode
npx cap add android        # requires Android Studio
npx cap copy
npx cap open ios           # build & run / archive in Xcode
```

Tips:
- **`--web-dir .`** points Capacitor at this folder (where `index.html` lives). If you
  prefer, copy the web files into a `www/` or `dist/` folder and use that as `webDir`.
- For the camera, add usage descriptions in **`ios/App/App/Info.plist`**:
  `NSCameraUsageDescription` (photo food detection) — the file-input flow uses the
  system camera; for live barcode scanning consider the
  **`@capacitor/camera`** / a barcode plugin for the most native experience.
- The **service worker isn't needed** inside the native wrapper (assets are bundled),
  but it does no harm. Open Food Facts lookups and the MobileNet CDN still need a
  network connection.
- Bump the version & icons, then **archive in Xcode** and submit via
  **App Store Connect**. Apple requires a paid Apple Developer account.

---

## 🗂️ Project structure

```
index.html              App shell, meta tags, SW registration
styles.css              Mobile-first dark UI, RTL-aware
app.js                  All app logic (state, screens, AI, barcode, charts)
i18n.js                 English + Arabic strings and helpers
foods.js                Built-in food database + MobileNet label map
manifest.webmanifest    PWA manifest
sw.js                   Service worker (offline app-shell cache)
icons/                  PNG app icons (192, 512, maskable, apple-touch, favicon)
scripts/make_icons.py   Dependency-free icon generator (stdlib only)
```

Regenerate icons anytime with:

```bash
python3 scripts/make_icons.py
```

---

## 🔒 Privacy

- Photos are analysed **on your device** with TensorFlow.js — they are never uploaded.
- Your profile and food log live only in your browser's `localStorage`.
- The only network calls are: the **MobileNet model** (first photo use) and
  **Open Food Facts** (only when you scan a barcode).

---

## ⚠️ Disclaimer

Calorie and macro values are estimates for general guidance and are **not medical
advice**. Consult a professional for dietary decisions.
