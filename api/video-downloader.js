// Vercel Serverless Function - MP3 ve MP4 desteği
const ytdl = require('ytdl-core');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parametresi gerekli' });
    }

    try {
        const info = await ytdl.getInfo(url);

        // Video formatları (MP4 ile ses birlikte)
        const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio');
        const videoOptions = videoFormats
            .filter(f => f.qualityLabel) // Sadece kalite etiketi olanlar
            .sort((a, b) => {
                const qualityA = parseInt(a.qualityLabel) || 0;
                const qualityB = parseInt(b.qualityLabel) || 0;
                return qualityB - qualityA; // Yüksekten düşüğe
            })
            .slice(0, 5) // En iyi 5 kalite
            .map(format => ({
                quality: format.qualityLabel,
                size: format.contentLength ? (format.contentLength / (1024 * 1024)).toFixed(1) + ' MB' : 'Hesaplanıyor',
                format: 'MP4',
                url: format.url,
                type: 'video'
            }));

        // Ses formatları (MP3/M4A)
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        const audioOptions = audioFormats
            .filter(f => f.audioBitrate)
            .sort((a, b) => b.audioBitrate - a.audioBitrate)
            .slice(0, 3)
            .map(format => ({
                quality: format.audioBitrate + 'kbps',
                size: format.contentLength ? (format.contentLength / (1024 * 1024)).toFixed(1) + ' MB' : 'Hesaplanıyor',
                format: format.hasAudio && format.mimeType?.includes('mp4') ? 'M4A' : 'WebM',
                url: format.url,
                type: 'audio'
            }));

        res.status(200).json({
            status: 'ok',
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            duration: info.videoDetails.lengthSeconds,
            videoOptions,
            audioOptions
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Video bilgisi alınamadı'
        });
    }
};
