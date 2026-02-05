# 🚀 Hızlı Deploy Adımları

## ✅ Adım 1: TAMAMLANDI
GitHub reposunu oluşturdunuz!

## 📝 Adım 2: Kodu GitHub'a Yükle

### Terminal/CMD'yi Aç
1. Windows tuşuna bas
2. "cmd" yaz ve Enter
3. Şu komutu çalıştır:

```bash
cd "C:\Users\sadar\Video İndirici"
```

### Git Komutlarını Çalıştır (SIRASIYA)
Aşağıdaki komutları **TEK TEK** kopyala yapıştır:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "first commit"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/muzadanm313-ui/video-indirici.git
```

```bash
git push -u origin main
```

**NOT:** Son komutta GitHub kullanıcı adı ve şifre isteyecek. Gir ve devam et.

---

## 🌐 Adım 3: Vercel'e Deploy Et

### 3.1. Vercel Hesabı Aç
1. https://vercel.com adresine git
2. "Sign Up" tıkla
3. **"Continue with GitHub"** seç
4. GitHub hesabınla giriş yap

### 3.2. Projeyi Deploy Et
1. Vercel dashboard'a girince **"Add New..."** → **"Project"** tıkla
2. **"Import Git Repository"** bölümünde **"video-indirici"** reposunu seç
3. **"Deploy"** butonuna bas
4. Bekle... (2-3 dakika)

### 3.3. URL'i Kopyala
Deploy bitince sana bir URL verecek:
```
https://video-indirici-abc123.vercel.app
```

---

## ⚙️ Adım 4: API URL'ini Güncelle

1. Vercel'den aldığın URL'i kopyala
2. `script.js` dosyasını aç
3. **13. satırı** bul ve şöyle değiştir:

```javascript
const API_URL = 'https://SIZIN-VERCEL-URL.vercel.app/api/video-downloader';
```

Örnek:
```javascript
const API_URL = 'https://video-indirici-abc123.vercel.app/api/video-downloader';
```

4. Kaydet
5. Tekrar GitHub'a yükle:
```bash
git add .
git commit -m "API URL updated"
git push
```

---

## ✅ BITTI! 

Artık siteniz çalışıyor:
- Kendi domain'inizden indirme yapıyorsunuz
- Backend'iniz var (Vercel'de)
- CORS sorunu YOK!

Vercel URL'nizi tarayıcıda açın ve test edin! 🎉
