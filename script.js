document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('video-url');
    const downloadBtn = document.getElementById('download-btn');
    const errorMsg = document.getElementById('error-msg');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('result-section');
    const resultContainer = document.getElementById('result-container');

    // ✅ Vercel URL
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
            let videoData = null;

            // 1. Kendi Vercel API'ni dene
            try {
                console.log('Deneme: Vercel API...');
                videoData = await fetchFromVercel(url);
            } catch (err) {
                console.warn('Vercel API hatası.');
            }

            // 2. Cobalt API (Çok Güçlü Fallback)
            if (!videoData) {
                try {
                    console.log('Deneme: Cobalt API...');
                    videoData = await fetchFromCobalt(url);
                } catch (err) {
                    console.warn('Cobalt API hatası.');
                }
            }

            // 3. Invidious + Proxy Fallback
            if (!videoData) {
                try {
                    console.log('Deneme: Invidious API...');
                    videoData = await fetchFromInvidiousProxy(url);
                } catch (err) {
                    console.error('Tüm sistemler başarısız.');
                    throw new Error('Şu an YouTube sistemlerinde bir yoğunluk var. Lütfen 10-15 saniye sonra tekrar deneyin.');
                }
            }

            displayResults(videoData);
            resultSection.classList.remove('hidden');
            resultSection.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            showError(err.message);
        } finally {
            loader.classList.add('hidden');
            downloadBtn.disabled = false;
        }
    }

    async function fetchFromVercel(fullUrl) {
        const response = await fetch(`${VERCEL_API}?url=${encodeURIComponent(fullUrl)}`);
        if (!response.ok) throw new Error('Vercel API Error');
        const data = await response.json();
        return data;
    }

    async function fetchFromCobalt(fullUrl) {
        // En popüler public cobalt instance'larından biri
        const cobaltApi = 'https://cobalt.hyra.workers.dev/';

        const response = await fetch(cobaltApi, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: fullUrl,
                vCodec: 'h264',
                vQuality: '720',
                isAudioOnly: false,
                isNoTTWatermark: true
            })
        });

        if (!response.ok) throw new Error('Cobalt API Error');
        const data = await response.json();

        if (data.status === 'error') throw new Error('Cobalt Error');

        const videoId = extractVideoId(fullUrl);
        const links = [];

        if (data.url) {
            links.push({
                quality: '720p / MP4',
                format: 'Video',
                url: data.url,
                type: 'video'
            });
        }

        if (data.picker) {
            data.picker.forEach(item => {
                links.push({
                    quality: item.quality || item.type,
                    format: item.type.toUpperCase(),
                    url: item.url,
                    type: item.type.includes('audio') ? 'audio' : 'video'
                });
            });
        }

        return {
            videoId: videoId,
            title: 'YouTube Video',
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: '-',
            author: 'YouTube',
            downloadLinks: links
        };
    }

    async function fetchFromInvidiousProxy(fullUrl) {
        const videoId = extractVideoId(fullUrl);
        const instances = ['inv.tux.pizza', 'invidious.asir.dev', 'invidious.io.lol'];
        const proxy = 'https://api.allorigins.win/raw?url=';

        for (const inst of instances) {
            try {
                const apiUrl = `https://${inst}/api/v1/videos/${videoId}`;
                const response = await fetch(proxy + encodeURIComponent(apiUrl));
                if (!response.ok) continue;

                const data = await response.json();
                const allLinks = [];

                if (data.formatStreams) {
                    data.formatStreams.forEach(s => {
                        allLinks.push({
                            quality: s.qualityLabel || s.resolution,
                            format: 'MP4',
                            url: s.url,
                            type: 'video'
                        });
                    });
                }

                if (data.adaptiveFormats) {
                    data.adaptiveFormats.filter(f => f.type.includes('audio')).forEach(a => {
                        allLinks.push({
                            quality: 'MP3 / Audio',
                            format: 'Audio',
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
            } catch (e) { continue; }
        }
        throw new Error('All Fail');
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
                    <img src="${data.thumbnail}" alt="Video" class="result-thumbnail">
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
            html += '<h4 style="margin-bottom:15px; color: var(--text-dark);"><i class="fa-solid fa-video"></i> Video Formatları</h4>';
            videoLinks.slice(0, 5).forEach(link => {
                html += `
                    <div class="download-item">
                        <div class="quality-info">
                            <span class="quality-badge" style="color: #1976d2;">
                                <i class="fa-solid fa-video"></i> ${link.quality}
                            </span>
                        </div>
                        <a href="${link.url}" download target="_blank" rel="noopener noreferrer" class="btn-download-item" style="background-color: #1976d2;">
                            <i class="fa-solid fa-download"></i> İndir
                        </a>
                    </div>
                `;
            });
        }

        if (audioLinks.length > 0) {
            html += '<h4 style="margin:25px 0 15px; color: var(--text-dark);"><i class="fa-solid fa-music"></i> Ses Formatları</h4>';
            audioLinks.slice(0, 3).forEach(link => {
                html += `
                    <div class="download-item">
                        <div class="quality-info">
                            <span class="quality-badge" style="color: #00c853;">
                                <i class="fa-solid fa-music"></i> ${link.quality}
                            </span>
                        </div>
                        <a href="${link.url}" download target="_blank" rel="noopener noreferrer" class="btn-download-item" style="background-color: #00c853;">
                            <i class="fa-solid fa-download"></i> İndir
                        </a>
                    </div>
                `;
            });
        }

        html += `
                    <div style="margin-top:20px; padding:15px; background: rgba(0,0,0,0.05); border-radius:8px;">
                        <p style="margin:0; color: var(--text-dark); font-size:0.85rem; text-align:center;">
                            <b>İpucu:</b> İndirme başlamazsa sağ tık yapıp "Farklı Kaydet" diyebilirsiniz.
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
