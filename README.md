# RoomMitra – Android App

कमरा ढूँढना हुआ आसान। मकान मालिक और किराएदार को सीधे जोड़ने वाला ऐप।

## इसमें क्या-क्या है
- स्प्लैश स्क्रीन, होम, खोज + फ़िल्टर, कमरे का पूरा विवरण (फोटो गैलरी, सुविधाएँ, मालिक, मैप)
- कॉल करें / WhatsApp करें (फोन का डायलर और WhatsApp सीधे खुलता है)
- प्रॉपर्टी लिस्ट करें (फोटो अपलोड के साथ), मालिक डैशबोर्ड (बदलें / रोकें / हटाएं)
- पसंदीदा, मैसेज + चैट, प्रोफाइल, मोबाइल नंबर से लॉगिन
- ऐप का कोड: `app/src/main/assets/www/` (HTML/CSS/JS) + `MainActivity.java` (Android wrapper)

> ⚠️ **ज़रूरी:** अभी यह ऐप हर फोन में अपना डेटा अलग रखता है। यानी आपकी लिस्टिंग दूसरों के फोन पर नहीं दिखेगी,
> OTP असली SMS से नहीं आता (डेमो OTP: `123456`) और चैट दूसरे व्यक्ति तक नहीं पहुँचती।
> असली मार्केटप्लेस के लिए एक सर्वर/डेटाबेस (जैसे Supabase या Firebase) जोड़ना होगा।

---

## APK और Play Store फाइल कैसे बनाएँ (कंप्यूटर की ज़रूरत नहीं)

### 1. GitHub पर डालें
1. https://github.com पर अकाउंट बनाएं → **New repository** → नाम `RoomMitra` → **Private** → Create.
2. **uploading an existing file** पर क्लिक करें → इस ZIP को खोलकर अंदर की सारी फाइलें/फोल्डर अपलोड करें
   (ध्यान दें: `.github` फोल्डर भी अपलोड होना चाहिए) → **Commit changes**.

### 2. Signing key के 4 Secrets डालें (एक बार)
Repository → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|---|---|
| `KEYSTORE_BASE64` | `keystore-base64.txt` फाइल का पूरा text |
| `RM_STORE_PASS` | `signing-passwords.txt` में दिया पासवर्ड |
| `RM_KEY_PASS` | वही पासवर्ड |
| `RM_KEY_ALIAS` | `roommitra` |

> 🔐 `roommitra-upload.jks`, `keystore-base64.txt` और पासवर्ड को सुरक्षित जगह (Google Drive आदि) रखें। इन्हें
> repository में कभी अपलोड न करें। हर अपडेट इसी key से साइन होगा।

### 3. Build चलाएँ
**Actions** टैब → **Build RoomMitra app** → **Run workflow**। ~5 मिनट बाद नीचे **Artifacts** में ZIP मिलेगा:
- `RoomMitra-test.apk` → फोन में डालकर टेस्ट करें
- `RoomMitra-playstore.aab` → Play Store पर अपलोड करें

हर बार कोड बदलकर commit करने पर नया build अपने-आप बनेगा (versionCode भी अपने-आप बढ़ता है)।

---

## Play Store पर अपलोड
1. https://play.google.com/console पर Developer अकाउंट बनाएं ($25 एक बार, पहचान सत्यापन ज़रूरी)।
2. **Create app** → नाम RoomMitra, भाषा हिंदी, App, Free।
3. **Store listing**: `play-store/` फोल्डर से आइकन (512×512), feature graphic (1024×500) और स्क्रीनशॉट डालें।
4. **App content**: Privacy policy URL (नीचे देखें), Data safety (नाम, फोन नंबर, फोटो — ऐप चलाने के लिए), Content rating, Target audience (18+)।
5. **Testing → Closed testing** में `.aab` अपलोड करें। नए personal अकाउंट में Production से पहले
   **12 टेस्टर्स को 14 दिन** टेस्ट करना ज़रूरी है — उसके बाद Production के लिए apply करें।

### Privacy Policy URL
`privacy-policy.html` पहले से बना है। Repository → Settings → **Pages** → Branch `main` → Save करें।
फिर URL होगा: `https://<आपका-username>.github.io/RoomMitra/privacy-policy.html`
(GitHub Pages के लिए repository Public होना चाहिए, या पॉलिसी को किसी फ्री वेबसाइट पर डालें।)

## Package name
`com.karan.roommitra` — बदलना हो तो `app/build.gradle` में `applicationId` बदलें (Play Store पर पहली बार अपलोड से **पहले**)।
