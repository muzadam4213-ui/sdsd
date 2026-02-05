document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('video-url');
    const downloadBtn = document.getElementById('download-btn');
    const errorMsg = document.getElementById('error-msg');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('result-section');
    const resultContainer = document.getElementById('result-container');

    // ✅ Vercel URL eklendi
    const API_URL = 'https://sdsd-rust.vercel.app/api/video-downloader';

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

        if (API_URL === 'VERCEL_URL_BURAYA') {
            showError('Lütfen önce Vercel URL\'nizi script.js dosyasına ekleyin! (BASIT_DEPLOY.md dosyasına bakın)');
            return;
        }

        loader.classList.remove('hidden');
        downloadBtn.disabled = true;

        try {
            const videoData = await fetchVideoFromAPI(url);
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

    async function fetchVideoFromAPI(fullUrl) {
        const apiUrl = `${API_URL}?url=${encodeURIComponent(fullUrl)}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Backend API hatası. Vercel deploy edildi mi?');
        }

        const data = await response.json();

        console.log('Backend Response:', data);

        if (data.status === 'error') {
            throw new Error(data.error || 'Video işlenemedi');
        }

        // Backend formatını parse et
        const allLinks = [];

        // Video seçenekleri
        if (data.videoOptions && data.videoOptions.length > 0) {
            data.videoOptions.forEach(v => {
                allLinks.push({
                    quality: v.quality,
                    format: v.format,
                    size: v.size,
                    url: v.url,
                    type: 'video'
                });
            });
        }

        // Audio seçenekleri
        if (data.audioOptions && data.audioOptions.length > 0) {
            data.audioOptions.forEach(a => {
                allLinks.push({
                    quality: a.quality,
                    format: a.format,
                    size: a.size,
                    url: a.url,
                    type: 'audio'
                });
            });
        }

        const videoId = extractVideoId(fullUrl);
        return {
            videoId: videoId,
            title: data.title || 'YouTube Video',
            thumbnail: data.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: formatDuration(data.duration),
            author: data.author || 'YouTube',
            downloadLinks: allLinks
        };
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
                    <h4 style="margin-bottom:15px; color: var(--text-dark);">
                        <i class="fa-solid fa-download"></i> İndirme Linkleri
                    </h4>
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
                            <span class="file-info">Boyut: ${link.size}</span>
                        </div>
                        <a href="${link.url}" download class="btn-download-item" style="background-color: #1976d2;">
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
                            <span class="file-info">Boyut: ${link.size}</span>
                        </div>
                        <a href="${link.url}" download class="btn-download-item" style="background-color: #00c853;">
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
                            <strong>${videoLinks.length} video + ${audioLinks.length} ses seçeneği hazır!</strong>
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
