# 🚀 5 Dakikada Deploy Rehberi

## Adım 1: Vercel Hesabı Aç (Ücretsiz)
1. https://vercel.com adresine git
2. GitHub hesabınla giriş yap
3. Hesap oluştur (ÜCRETSİZ)

## Adım 2: GitHub'a Yükle
1. GitHub'da yeni repo oluştur: `video-indirici`
2. Bu klasörü repoya yükle:
```bash
cd "C:\Users\sadar\Video İndirici"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/KULLANICI_ADIN/video-indirici.git
git push -u origin main
```

## Adım 3: Vercel'e Deploy Et
1. Vercel dashboarduna git
2. "New Project" tıkla
3. GitHub reposunu seç
4. "Deploy" butonuna bas
5. **BITTI!** 🎉

## Adım 4: API URL'ini Güncelle
Deploy sonrası Vercel sana bir link verecek:
`https://video-indirici-ABC123.vercel.app`

`script.js` dosyasında şu satırı güncelle:
```javascript
const API_URL = 'https://video-indirici-ABC123.vercel.app/api/video-downloader';
```

## Artık Siteniz Çalışıyor! ✅
- Kendi domain'iniz: `https://yourproject.vercel.app`
- Direkt indirme linkleri çalışacak
- Backend'i Vercel ücretsiz host ediyor
- CORS sorunu yok!

---

## Alternatif: Netlify ile Deploy
1. https://netlify.com → hesap aç
2. Drag & drop ile klasörü yükle
3. Netlify Functions kullan (aynı mantık)

## NOT
- Vercel ÜCRETSİZ'dir
- Aylık 100GB bandwidth veriyor
- Kendi API'niz olacak
- Gerçek indirme yapacak!
