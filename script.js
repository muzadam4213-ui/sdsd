document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('video-url');
    const downloadBtn = document.getElementById('download-btn');
    const errorMsg = document.getElementById('error-msg');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('result-section');
    const resultContainer = document.getElementById('result-container');

    // ✅ Vercel URL (Burayı güncelledik)
    const VERCEL_API = 'https://sdsd-rust.vercel.app/api/video-downloader';

    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (_) {
            return false;
        }
    }

    function extractVideoId(url) {
        let videoId = null;
        if (url.includes('youtube.com')) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get('v');
        } else if (url.includes('youtu.be')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        }
        return videoId;
    }

    downloadBtn.addEventListener('click', handleDownload);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleDownload();
    });

    async function handleDownload() {
        const url = urlInput.value.trim();

        errorMsg.classList.add('hidden');
        resultSection.classList.add('hidden');
        resultContainer.innerHTML = '';

        if (!url) {
            showError('Lütfen bir video bağlantısı girin.');
            return;
        }

        if (!isValidUrl(url)) {
            showError('Geçerli bir bağlantı değil.');
            return;
        }

        loader.classList.remove('hidden');
        downloadBtn.disabled = true;

        try {
            // STRATEJİ: Sırayla dene. Biri bozulursa diğerine geç.
            let videoData = null;
            let lastError = null;

            // 1. Kendi Vercel API'ni dene
            try {
                console.log('Deneme 1: Vercel API...');
                videoData = await fetchFromVercel(url);
            } catch (err) {
                console.warn('Vercel API hatası, yedek sisteme geçiliyor:', err);
                lastError = err;
            }

            // 2. Eğer Vercel çalışmazsa, Public Invidious + Proxy dene (GARANTİ YÖNTEM)
            if (!videoData) {
                try {
                    console.log('Deneme 2: Yedek API (Invidious)...');
                    videoData = await fetchFromInvidiousProxy(url);
                } catch (err) {
                    console.error('Yedek API de başarısız:', err);
                    throw new Error('Tüm sistemler meşgul. Lütfen daha sonra tekrar deneyin veya GitHub klasör yapısını kontrol edin.');
                }
            }

            displayResults(videoData);
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            showError(err.message || 'Video bilgisi alınamadı.');
        } finally {
            loader.classList.add('hidden');
            downloadBtn.disabled = false;
        }
    }

    async function fetchFromVercel(fullUrl) {
        const response = await fetch(`${VERCEL_API}?url=${encodeURIComponent(fullUrl)}`);
        if (!response.ok) throw new Error('Vercel API yanıt vermedi');
        const data = await response.json();
        if (data.status === 'error') throw new Error(data.error);
        return data;
    }

    async function fetchFromInvidiousProxy(fullUrl) {
        const videoId = extractVideoId(fullUrl);
        if (!videoId) throw new Error('YouTube ID bulunamadı');

        // Çalışan Invidious instance'ları
        const instances = ['invidious.flokinet.to', 'inv.tux.pizza', 'yewtu.be'];
        const proxy = 'https://api.allorigins.win/raw?url=';

        for (const inst of instances) {
            try {
                const apiUrl = `https://${inst}/api/v1/videos/${videoId}`;
                const response = await fetch(proxy + encodeURIComponent(apiUrl));
                if (!response.ok) continue;

                const data = await response.json();

                // Formatları hazırla
                const allLinks = [];

                // Video Formatları
                if (data.formatStreams) {
                    data.formatStreams.forEach(s => {
                        allLinks.push({
                            quality: s.qualityLabel || s.resolution,
                            format: 'MP4',
                            size: 'Hesaplanıyor',
                            url: s.url,
                            type: 'video'
                        });
                    });
                }

                // Audio Formatları
                if (data.adaptiveFormats) {
                    data.adaptiveFormats.filter(f => f.type.includes('audio')).forEach(a => {
                        allLinks.push({
                            quality: Math.round(a.bitrate / 1000) + 'kbps',
                            format: 'Audio',
                            size: 'Hesaplanıyor',
                            url: a.url,
                            type: 'audio'
                        });
                    });
                }

                return {
                    videoId: videoId,
                    title: data.title,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                    duration: formatDuration(data.lengthSeconds),
                    author: data.author,
                    downloadLinks: allLinks
                };
            } catch (e) {
                continue;
            }
        }
        throw new Error('Yedek sistemler de yanıt vermedi.');
    }

    function formatDuration(seconds) {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function displayResults(data) {
        let html = `
            <div class="result-card">
                <div class="result-header">
                    <img src="${data.thumbnail}" alt="Video" class="result-thumbnail" onerror="this.src='https://placehold.co/200x112?text=Video'">
                    <div class="result-info">
                        <h3>${data.title}</h3>
                        <p><i class="fa-solid fa-user"></i> ${data.author}</p>
                        <p><i class="fa-solid fa-clock"></i> ${data.duration}</p>
                    </div>
                </div>
                <div class="download-options">
        `;

        const videoLinks = data.downloadLinks.filter(l => l.type === 'video');
        const audioLinks = data.downloadLinks.filter(l => l.type === 'audio');

        if (videoLinks.length > 0) {
            html += '<h4 style="margin-bottom:15px; color: var(--text-dark);"><i class="fa-solid fa-video"></i> Video Formatları (MP4)</h4>';
            videoLinks.forEach(link => {
                html += `
                    <div class="download-item">
                        <div class="quality-info">
                            <span class="quality-badge" style="color: #1976d2;">
                                <i class="fa-solid fa-video"></i> ${link.format} - ${link.quality}
                            </span>
                        </div>
                        <a href="${link.url}" download target="_blank" class="btn-download-item" style="background-color: #1976d2;">
                            <i class="fa-solid fa-download"></i>
                            İndir
                        </a>
                    </div>
                `;
            });
        }

        if (audioLinks.length > 0) {
            html += '<h4 style="margin:25px 0 15px; color: var(--text-dark);"><i class="fa-solid fa-music"></i> Ses Formatları</h4>';
            audioLinks.forEach(link => {
                html += `
                    <div class="download-item">
                        <div class="quality-info">
                            <span class="quality-badge" style="color: #00c853;">
                                <i class="fa-solid fa-music"></i> ${link.format} - ${link.quality}
                            </span>
                        </div>
                        <a href="${link.url}" download target="_blank" class="btn-download-item" style="background-color: #00c853;">
                            <i class="fa-solid fa-download"></i>
                            İndir
                        </a>
                    </div>
                `;
            });
        }

        html += `
                    <div style="margin-top:20px; padding:15px; background: linear-gradient(135deg, rgba(25,118,210,0.1), rgba(0,200,83,0.1)); border-radius:8px;">
                        <p style="margin:0; color: var(--text-dark); font-size:0.9rem; text-align:center;">
                            <i class="fa-solid fa-check-circle"></i> 
                            İndirme hazır! Butona bastığınızda indirme başlamazsa sağ tık yapıp "Farklı Kaydet" diyebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        `;

        resultContainer.innerHTML = html;
    }

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove('hidden');
    }
});

