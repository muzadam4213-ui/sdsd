# 🔧 CORS Sonu Çözümü

## ❌ Sorun
RapidAPI ve tüm YouTube downloader API'ler tarayıcıdan direkt çağrıya izin vermiyor (CORS politikası).

## ✅ Çözüm 1: CORS Unblock Extension (2 DK)

### Adım 1: Extension Yükle
1. Chrome/Edge'de bu linki aç: https://chrome.google.com/webstore/detail/allow-cors/lhobafahddgcelffkeicbaginigeejlf
2. "Add to Chrome" tıkla
3. Extension yüklendi!

### Adım 2: Extension'ı Aç
1. Sağ üstte extension ikonuna tıkla
2. **"C"** harfine tıklayarak AKTIF et (yeşil olmalı)

### Adım 3: Sitenizi Test Edin
1. `index.html` dosyasını aç
2. YouTube linki yapıştır
3. İNDİR'e bas
4. ✅ ÇALIŞACAK!

---

## ✅ Çözüm 2: Kendi Backend'inizi Host Edin (5 DK)

Vercel veya Netlify'da ücretsiz backend deploy edin.

### Detaylar için:
`DEPLOY_GUIDE.md` dosyasına bakın.

---

## 💡 Öneri
**Extension yöntemi** en hızlı ve kolay çözüm. 
Sadece kendi bilgisayarınızda çalışır ama test için yeterli.

Canlı siteye koymak için **backend gerekir**.
