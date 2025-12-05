/**
 * TJ SOSMED TOOLS - MASTER SCRIPT
 * Developed by Ghaza Algifari (2025)
 * All-in-One: Downloader, Metadata, AI Tools, Carousel, Watermark.
 */

// ==========================================
// 1. KONFIGURASI GLOBAL
// ==========================================
const loadingDiv = document.getElementById('loading');
const resultDiv = document.getElementById('result');
const videoTitle = document.getElementById('videoTitle');

// API Key RapidAPI (Pastikan kuota aman)
const apiKey = '804ff958ecmshe6d23ba4fd2be6bp154905jsn9d83ded4d839'; 
const apiHost = 'social-media-video-downloader.p.rapidapi.com';

// ==========================================
// 2. FUNGSI BANTUAN (HELPER)
// ==========================================

// Fungsi Download Paksa (Bypass Browser Preview)
async function forceDownload(url, filename, btn) {
    const originalText = btn.innerText;
    btn.innerText = "Memproses...";
    btn.style.backgroundColor = "#ffa500"; // Oranye

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network error");
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        btn.innerText = "Selesai!";
        btn.style.backgroundColor = "#4CAF50"; // Hijau
        setTimeout(() => { 
            btn.innerText = originalText; 
            btn.style.backgroundColor = ""; 
        }, 3000);

    } catch (e) {
        console.warn("Auto-download blocked.");
        alert("Download otomatis diblokir browser. Video akan dibuka di tab baru, silakan Save Manual.");
        window.open(url, '_blank');
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
    }
}

// ==========================================
// 3. FITUR: LIVE TICKER (RUNNING TEXT)
// ==========================================
// Fitur ini otomatis jalan di halaman dashboard
(async function initTicker() {
    const tickerContent = document.getElementById('tickerContent');
    if (!tickerContent) return;

    // DATA CADANGAN (Bencana & Isu Viral Desember 2025)
    const backupTrends = [
        "Banjir Bandang Sumut & Aceh", 
        "Menteri: 'Rakyat Jangan Manja'",
        "BAHLIL TOLOL", 
        "Longsor Jalan Sumbar-Riau", 
        "Gempa Terkini BMKG", 
        "Menteri: 'Banjir Itu Takdir Tuhan'", 
        "Erupsi Gunung Semeru", 
        "Solusi Polusi: 'Kurangi Bernapas'", 
        "Banjir Rob Jakarta Utara", 
        "Menteri: 'Internet Lambat Itu Berkah'", 
        "Pajak Naik Rakyat Menjerit", 
        "Korban Banjir Mengungsi", 
        "Menteri: 'Makan Siang Gratis Ditunda'"
    ];

    // Fungsi Render HTML Ticker
    function renderTicker(items) {
        let html = "";
        items.forEach(topic => {
            const link = `https://www.google.com/search?q=${encodeURIComponent(topic)}`;
            html += `<span class="ticker-item"><a href="${link}" target="_blank">${topic}</a></span>`;
        });
        tickerContent.innerHTML = html;
    }

    // 1. TAMPILKAN CADANGAN DULUAN (Supaya user langsung lihat)
    renderTicker(backupTrends);

    // 2. COBA AMBIL DATA GOOGLE REAL-TIME (Update jika berhasil)
    try {
        const rssUrl = 'https://trends.google.co.id/trends/trendingsearches/daily/rss?geo=ID';
        // Gunakan Proxy AllOrigins untuk menembus CORS
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;

        const response = await fetch(proxyUrl);
        if(!response.ok) throw new Error("Proxy error");
        
        const str = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(str, "text/xml");
        const items = xmlDoc.getElementsByTagName("item");

        if (items.length > 0) {
            const googleTrends = [];
            for (let i = 0; i < 15 && i < items.length; i++) {
                googleTrends.push(items[i].getElementsByTagName("title")[0].textContent);
            }
            console.log("Google Trends Loaded!");
            renderTicker(googleTrends);
        }
    } catch (error) {
        console.warn("Gagal load Google, tetap gunakan backup.", error);
    }
})();


// ==========================================
// 4. FITUR: MEDIA DOWNLOADER (UNIVERSAL)
// ==========================================
if (document.getElementById('urlInput')) {

    window.downloadVideo = async function() {
        let urlInput = document.getElementById('urlInput').value.trim();
        let downloadLink = document.getElementById('downloadLink');

        if (!urlInput) { alert("Harap masukkan URL media!"); return; }

        // Bersihkan Link dari tracking code
        if (urlInput.includes('?')) urlInput = urlInput.split('?')[0];

        // Reset UI
        loadingDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');
        const oldImg = document.getElementById('previewImg');
        if(oldImg) oldImg.remove();

        try {
            let apiUrl = '';
            let platform = '';

            // --- DETEKSI PLATFORM ---
            if (urlInput.includes('instagram.com')) {
                platform = 'Instagram';
                // Gunakan endpoint Universal untuk IG (Cover Story & Post)
                apiUrl = `https://${apiHost}/instagram/v3/media/download?url=${encodeURIComponent(urlInput)}`;
            } 
            else if (urlInput.includes('tiktok.com')) {
                platform = 'TikTok';
                apiUrl = `https://${apiHost}/tiktok/v3/post/details?url=${encodeURIComponent(urlInput)}`;
            } 
            else if (urlInput.includes('facebook.com') || urlInput.includes('fb.watch')) {
                platform = 'Facebook';
                apiUrl = `https://${apiHost}/facebook/v3/post/details?url=${encodeURIComponent(urlInput)}`;
            } 
            else {
                throw new Error("Link tidak dikenali. Gunakan IG, TikTok, atau FB.");
            }

            console.log(`Requesting: ${apiUrl}`);

            // --- API REQUEST ---
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': apiHost }
            });

            if (!response.ok) {
                const err = await response.json().catch(()=>({}));
                throw new Error(err.message || `Gagal mengambil data (${response.status}). Cek Link.`);
            }

            const data = await response.json();
            
            // --- PARSING DATA ---
            let contentList = [];
            if (data.contents) contentList = data.contents;
            else if (data.data) contentList = [data.data];
            else if (data.media_url || data.video_url) {
                contentList = [{
                    videos: [{ url: data.video_url || data.media_url, has_audio: true }],
                    images: [{ url: data.thumbnail || data.display_url }]
                }];
            }

            if (!contentList || contentList.length === 0) {
                throw new Error("Media tidak ditemukan atau Akun Private.");
            }

            const content = contentList[0];
            let mediaData = null, fileType = 'mp4', labelType = 'VIDEO';

            // Cek Video
            if (content.videos && content.videos.length > 0) {
                if(platform === 'Instagram') mediaData = content.videos.find(v => v.has_audio) || content.videos[0];
                else mediaData = content.videos[0];
            } 
            // Cek Foto
            else if (content.images && content.images.length > 0) {
                fileType = 'jpg'; labelType = 'FOTO';
                mediaData = content.images[0];
            }

            // TAMPILKAN HASIL
            if (mediaData && mediaData.url) {
                loadingDiv.classList.add('hidden');
                resultDiv.classList.remove('hidden');

                let title = data.metadata?.title || `${platform} Media`;
                if(videoTitle) videoTitle.innerText = title.length > 60 ? title.substring(0, 60) + "..." : title;
                
                downloadLink.innerText = `DOWNLOAD ${labelType}`;
                downloadLink.href = "#";

                // Refresh Tombol
                const newBtn = downloadLink.cloneNode(true);
                downloadLink.parentNode.replaceChild(newBtn, downloadLink);

                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    forceDownload(mediaData.url, `${platform}_${Date.now()}.${fileType}`, newBtn);
                });

                // Preview
                let previewUrl = (fileType === 'jpg') ? mediaData.url : (data.metadata?.thumbnailUrl || content.cover || '');
                if (!previewUrl && fileType === 'mp4') previewUrl = "https://via.placeholder.com/300x200?text=Preview+Video"; 
                
                if (previewUrl) {
                    const img = document.createElement('img');
                    img.id = 'previewImg'; img.src = previewUrl;
                    img.style.cssText = "width:100%; border-radius:10px; margin:10px 0;";
                    const pc = document.querySelector('.video-preview');
                    if(pc) pc.insertBefore(img, videoTitle);
                }

            } else {
                throw new Error("Link download kosong dalam respon API.");
            }

        } catch (error) {
            loadingDiv.classList.add('hidden');
            alert(`Gagal: ${error.message}`);
            console.error(error);
        }
    };
}


// ==========================================
// 5. FITUR: METADATA REMOVER
// ==========================================
if (document.getElementById('dropZone') && !document.getElementById('dropZoneViewer')) {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileName');
    const previewImage = document.getElementById('previewImage');
    const cleanBtn = document.getElementById('downloadCleanBtn');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if (fileInput.files.length) processFile(fileInput.files[0]); });

    function processFile(file) {
        if (!file.type.match('image.*')) { alert("Harap upload file gambar!"); return; }
        loadingDiv.classList.remove('hidden'); resultDiv.classList.add('hidden');
        document.querySelector('.upload-area').classList.add('hidden');

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                canvas.width = img.width; canvas.height = img.height; 
                ctx.drawImage(img, 0, 0); 
                canvas.toBlob((blob) => {
                    const cleanUrl = URL.createObjectURL(blob);
                    loadingDiv.classList.add('hidden'); resultDiv.classList.remove('hidden');
                    previewImage.src = cleanUrl; fileNameDisplay.innerText = "Clean_" + file.name;
                    cleanBtn.href = cleanUrl; cleanBtn.download = "Clean_" + file.name;
                }, 'image/jpeg', 0.92); 
            }; img.src = e.target.result;
        }; reader.readAsDataURL(file);
    }
}


// ==========================================
// 6. FITUR: METADATA VIEWER (EXIF-JS)
// ==========================================
if (document.getElementById('viewerPage')) {
    const dropZone = document.getElementById('dropZoneViewer');
    const fileInput = document.getElementById('fileInputViewer');
    const tableBody = document.getElementById('exifTableBody');
    const imgPreview = document.getElementById('imgPreview');
    const basicInfo = document.getElementById('basicInfo');
    const gpsContainer = document.getElementById('gpsContainer');
    const mapsLink = document.getElementById('mapsLink');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); if(e.dataTransfer.files.length) processExif(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if(fileInput.files.length) processExif(fileInput.files[0]); });

    window.filterTable = function() {
        const filter = document.getElementById("searchInput").value.toUpperCase();
        document.querySelectorAll(".exif-table tbody tr").forEach(row => {
            row.style.display = row.innerText.toUpperCase().indexOf(filter) > -1 ? "" : "none";
        });
    };

    function processExif(file) {
        if (!file.type.match('image/jpeg') && !file.type.match('image/tiff')) { alert("Harap upload JPG asli!"); return; }
        loadingDiv.classList.remove('hidden'); resultDiv.classList.add('hidden'); document.querySelector('.upload-area').classList.add('hidden');
        
        const reader = new FileReader();
        reader.onload = function(e) { imgPreview.src = e.target.result; };
        reader.readAsDataURL(file);

        EXIF.getData(file, function() {
            loadingDiv.classList.add('hidden'); resultDiv.classList.remove('hidden');
            const allTags = EXIF.getAllTags(this);
            let tableHTML = "";
            let hasData = false;

            const keyMap = [
                { key: 'Make', label: 'Merk Kamera' }, { key: 'Model', label: 'Model' }, { key: 'LensModel', label: 'Lensa' },
                { key: 'ExposureTime', label: 'Shutter', fmt: 's' }, { key: 'FNumber', label: 'Aperture', fmt: 'f' },
                { key: 'ISOSpeedRatings', label: 'ISO' }, { key: 'DateTimeOriginal', label: 'Waktu' }
            ];

            keyMap.forEach(k => {
                if(allTags[k.key]) {
                    hasData = true;
                    let v = allTags[k.key];
                    if(k.fmt=='s' && v.numerator) v = `1/${Math.round(v.denominator/v.numerator)}s`;
                    if(k.fmt=='f') v = `f/${Number(v).toFixed(1)}`;
                    tableHTML += `<tr><td style="color:#00ff88;font-weight:bold">${k.label}</td><td>${v}</td></tr>`;
                }
            });

            for(let t in allTags) {
                if(keyMap.some(k=>k.key==t) || t=='MakerNote' || t=='thumbnail' || t=='UserComment') continue;
                tableHTML += `<tr><td style="color:#aaa">${t}</td><td>${allTags[t]}</td></tr>`;
            }

            if(!hasData) tableHTML = `<tr><td colspan="2" align="center">Data Kosong (Mungkin hasil WA/SS)</td></tr>`;
            
            tableBody.innerHTML = tableHTML;
            basicInfo.innerHTML = `<strong>${file.name}</strong> (${(file.size/1024/1024).toFixed(2)} MB)`;

            const lat = EXIF.getTag(this, "GPSLatitude");
            const lon = EXIF.getTag(this, "GPSLongitude");
            if(lat && lon) {
                const decLat = (lat[0]+lat[1]/60+lat[2]/3600) * (EXIF.getTag(this, "GPSLatitudeRef")=="N"?1:-1);
                const decLon = (lon[0]+lon[1]/60+lon[2]/3600) * (EXIF.getTag(this, "GPSLongitudeRef")=="E"?1:-1);
                gpsContainer.classList.remove('hidden');
                mapsLink.href = `https://www.google.com/maps?q=${decLat},${decLon}`;
                mapsLink.innerHTML = `📍 Lihat Lokasi (${decLat.toFixed(4)}, ${decLon.toFixed(4)})`;
            } else { gpsContainer.classList.add('hidden'); }
        });
    }
}


// ==========================================
// 7. FITUR: CAPTION GENERATOR
// ==========================================
if (document.getElementById('captionPage')) {
    const resultBox = document.getElementById('result');
    const captionText = document.getElementById('captionText');
    const templates = {
        santai: ["Nikmati prosesnya. ✨", "Slow down. {topic}. ☕", "Definisi bahagia: {topic}. 🍃", "Recharge energy with {topic}. 🔋"],
        lucu: ["Niatnya diet, eh ketemu {topic}. 🤪", "Dibalik foto ini ada perjuangan {topic} yg sulit dijelaskan. 🤣"],
        motivasi: ["Jangan menyerah pada {topic}. 🔥", "Mulailah {topic} sekarang. 💪", "Fokus pada tujuan {topic}. 🚀"],
        promosi: ["Promo spesial {topic}! 🔥", "Solusi terbaik: {topic}. 🛍️", "Jangan sampai kehabisan {topic}. 📢"],
        aesthetic: ["Lost in {topic}. 🌙", "Collecting moments with {topic}. 🎞️", "Estetika {topic}. ✨"]
    };
    const hashtags = { santai: "#chill #goodvibes", lucu: "#ngakak #humor", motivasi: "#sukses #semangat", promosi: "#promo #diskon", aesthetic: "#aesthetic #art" };

    window.generateCaption = function() {
        const topic = document.getElementById('topicInput').value.trim() || "hal ini";
        const tone = document.getElementById('toneInput').value;
        const list = templates[tone];
        const random = list[Math.floor(Math.random() * list.length)];
        let final = random.replace(/{topic}/g, topic) + `\n.\n.\n${hashtags[tone]} #${topic.replace(/\s/g, '')}`;
        resultBox.classList.remove('hidden');
        captionText.innerText = final; 
    };
    window.copyCaption = function() {
        navigator.clipboard.writeText(captionText.innerText).then(() => alert("Tersalin!"));
    };
}


// ==========================================
// 8. FITUR: HASHTAG RISET
// ==========================================
if (document.getElementById('hashtagPage')) {
    const keywordInput = document.getElementById('keywordInput');
    const resultBox = document.getElementById('result');
    const searchLabel = document.getElementById('searchLabel');
    const tagsHard = document.getElementById('tagsHard');
    const tagsMedium = document.getElementById('tagsMedium');
    const tagsNiche = document.getElementById('tagsNiche');

    const hashtagDB = {
        "kopi": { hard: "#coffee #coffeelover", medium: "#ngopi #kopihitam", niche: "#manualbrew #kopipagi" },
        "bola": { hard: "#football #soccer", medium: "#sepakbola #timnas", niche: "#infobola #ligaindonesia" },
        "bisnis": { hard: "#business #success", medium: "#bisnisonline #cuan", niche: "#belajarbisnis #umkm" },
        "travel": { hard: "#travel #vacation", medium: "#jalanjalan #liburan", niche: "#wisatalokal #healing" },
        "fotografi": { hard: "#photography #art", medium: "#fotografiindonesia #instanusantara", niche: "#belajarfotografi #motret" },
        "gaming": { hard: "#gaming #esports", medium: "#gamersindonesia #mabar", niche: "#mobilelegendsindonesia #pubgmobile" },
        "skincare": { hard: "#skincare #beauty", medium: "#skincareindonesia #glowing", niche: "#racunskincare #reviewjujur" },
        "makanan": { hard: "#food #yummy", medium: "#kulinerindonesia #jajanan", niche: "#kulinerviral #resepmasakan" }
    };

    window.generateHashtags = function() {
        const input = keywordInput.value.toLowerCase().trim();
        if (!input) { alert("Masukkan kata kunci!"); return; }
        resultBox.classList.remove('hidden'); searchLabel.innerText = input;
        
        let foundKey = Object.keys(hashtagDB).find(key => input.includes(key));
        if (foundKey) {
            tagsHard.value = hashtagDB[foundKey].hard;
            tagsMedium.value = hashtagDB[foundKey].medium;
            tagsNiche.value = hashtagDB[foundKey].niche;
        } else {
            tagsHard.value = "#viral #fyp #trending";
            tagsMedium.value = "#indonesia #daily #instadaily";
            tagsNiche.value = `#${input.replace(/\s/g,'')} #${input.replace(/\s/g,'_')}`;
        }
    };
    window.copyTags = function(id) { navigator.clipboard.writeText(document.getElementById(id).value).then(()=>alert("Disalin!")); };
    window.copyAllTags = function() { navigator.clipboard.writeText(`${tagsHard.value} ${tagsMedium.value} ${tagsNiche.value}`).then(()=>alert("Semua disalin!")); };
    
    keywordInput.addEventListener("keypress", function(event) { if (event.key === "Enter") window.generateHashtags(); });
}


// ==========================================
// 9. FITUR: AUTO WATERMARK (BATCH + CROP RATIO)
// ==========================================
if (document.getElementById('watermarkPage')) {
    const mainInput = document.getElementById('mainPhotoInput');
    const logoInput = document.getElementById('logoInput');
    const canvas = document.getElementById('wmCanvas');
    const ctx = canvas.getContext('2d');
    const processBtn = document.getElementById('processWmBtn');
    const placeholder = document.getElementById('placeholderText');
    const sizeVal = document.getElementById('sizeVal');
    const alphaVal = document.getElementById('alphaVal');
    const fileCountText = document.getElementById('wmFileCount');
    const resultArea = document.getElementById('wmResultArea');
    const resultGrid = document.getElementById('wmResultsGrid');

    // State Variables
    let wmSelectedFiles = [];
    let previewImg = new Image();
    let logoImg = new Image();
    let isPreviewLoaded = false;
    let isLogoLoaded = false;
    
    // Settings
    let currentPos = 'mc'; 
    let currentSize = 20; 
    let currentAlpha = 1; 
    let currentRatio = 'original'; // Default

    // --- EVENT LISTENERS ---
    
    // Ratio Selector (NEW)
    document.querySelectorAll('input[name="wmRatio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            currentRatio = this.value;
            updatePreview(); // Redraw saat ganti ukuran
        });
    });

    document.querySelectorAll('.pos-box').forEach(box => {
        box.addEventListener('click', function() {
            document.querySelectorAll('.pos-box').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPos = this.dataset.pos;
            updatePreview();
        });
    });

    document.getElementById('sizeSlider').addEventListener('input', function() { currentSize = this.value; sizeVal.innerText = this.value + "%"; updatePreview(); });
    document.getElementById('opacitySlider').addEventListener('input', function() { currentAlpha = this.value / 100; alphaVal.innerText = this.value + "%"; updatePreview(); });

    mainInput.addEventListener('change', function(e) {
        let files = Array.from(e.target.files);
        if (files.length > 10) { alert("Maks 10 foto!"); files = files.slice(0, 10); }
        wmSelectedFiles = files;
        fileCountText.innerText = `${wmSelectedFiles.length} foto terpilih.`;
        if (wmSelectedFiles.length > 0) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                previewImg.src = evt.target.result;
                previewImg.onload = () => { isPreviewLoaded = true; updatePreview(); };
            };
            reader.readAsDataURL(wmSelectedFiles[0]);
        }
    });

    logoInput.addEventListener('change', function(e) {
        if(!e.target.files[0]) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            logoImg.src = evt.target.result;
            logoImg.onload = () => { isLogoLoaded = true; updatePreview(); };
        };
        reader.readAsDataURL(e.target.files[0]);
    });

    // --- HELPER: DRAW IMAGE COVER (CROP TO FILL) ---
    function drawImageProp(ctx, img, w, h) {
        // Jika mode original, gambar biasa saja
        if (currentRatio === 'original') {
            ctx.drawImage(img, 0, 0);
            return;
        }

        // Jika mode crop, hitung aspect ratio
        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let drawW, drawH, drawX, drawY;

        if (imgRatio > targetRatio) { 
            // Gambar lebih lebar dari target -> Crop kiri kanan
            drawH = h; drawW = h * imgRatio; drawY = 0; drawX = (w - drawW) / 2; 
        } else { 
            // Gambar lebih tinggi dari target -> Crop atas bawah
            drawW = w; drawH = w / imgRatio; drawX = 0; drawY = (h - drawH) / 2; 
        }
        
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    // --- LOGIKA UTAMA (PREVIEW & BATCH) ---
    // Kita satukan logika menggambar agar konsisten
    function applyWatermarkToCanvas(context, image, w, h) {
        // 1. Gambar Foto Utama (Auto Crop / Original)
        drawImageProp(context, image, w, h);

        // 2. Gambar Logo (Jika ada)
        if (isLogoLoaded) {
            const logoWidth = (w * currentSize) / 100;
            const logoHeight = logoWidth * (logoImg.height / logoImg.width);
            let x = 0, y = 0, padding = w * 0.03;

            if (currentPos.includes('l')) x = padding;
            else if (currentPos.includes('c')) x = (w - logoWidth) / 2;
            else if (currentPos.includes('r')) x = w - logoWidth - padding;

            if (currentPos.includes('t')) y = padding;
            else if (currentPos.includes('m')) y = (h - logoHeight) / 2;
            else if (currentPos.includes('b')) y = h - logoHeight - padding;

            context.globalAlpha = currentAlpha;
            context.drawImage(logoImg, x, y, logoWidth, logoHeight);
            context.globalAlpha = 1.0; // Reset
        }
    }

    function updatePreview() {
        if (!isPreviewLoaded) return;
        canvas.style.display = 'block'; placeholder.style.display = 'none';
        if (isLogoLoaded) processBtn.disabled = false;

        // Tentukan Ukuran Canvas
        let w = previewImg.width;
        let h = previewImg.height;

        if (currentRatio !== 'original') {
            w = 1080; // Standar Lebar Sosmed
            if (currentRatio === 'square') h = 1080;
            else if (currentRatio === 'portrait') h = 1350; // 4:5
            else if (currentRatio === 'story') h = 1920; // 9:16
        }

        canvas.width = w;
        canvas.height = h;

        applyWatermarkToCanvas(ctx, previewImg, w, h);
    }

    // --- BATCH PROCESS ---
    processBtn.addEventListener('click', async function() {
        if (wmSelectedFiles.length === 0 || !isLogoLoaded) return;
        loadingDiv.classList.remove('hidden'); resultArea.classList.add('hidden'); resultGrid.innerHTML = '';

        try {
            const promises = wmSelectedFiles.map((file, index) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = new Image();
                        img.onload = function() {
                            const tCanvas = document.createElement('canvas');
                            
                            // Hitung ukuran per foto
                            let w = img.width;
                            let h = img.height;
                            if (currentRatio !== 'original') {
                                w = 1080;
                                if (currentRatio === 'square') h = 1080;
                                else if (currentRatio === 'portrait') h = 1350;
                                else if (currentRatio === 'story') h = 1920;
                            }

                            tCanvas.width = w;
                            tCanvas.height = h;
                            const tCtx = tCanvas.getContext('2d');

                            // Pakai logika yang SAMA PERSIS dengan preview
                            applyWatermarkToCanvas(tCtx, img, w, h);

                            resolve({ src: tCanvas.toDataURL('image/jpeg', 0.9), num: index + 1 });
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                });
            });

            const results = await Promise.all(promises);

            results.forEach(item => {
                const div = document.createElement('div'); div.className = 'slide-item';
                const img = new Image(); img.src = item.src;
                const btn = document.createElement('a');
                btn.href = item.src; btn.download = `WM_${currentRatio}_${item.num}.jpg`;
                btn.className = 'btn-dl-slide'; btn.innerHTML = `<i class="fas fa-download"></i> Save #${item.num}`;
                div.appendChild(img); div.appendChild(btn);
                resultGrid.appendChild(div);
            });

            loadingDiv.classList.add('hidden'); resultArea.classList.remove('hidden');
            resultArea.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            loadingDiv.classList.add('hidden'); alert("Error processing images."); console.error(error);
        }
    });
}


// ==========================================
// 10. FITUR: AUTO CAROUSEL (DYNAMIC SIZE & TEMPLATES)
// ==========================================
if (document.getElementById('carouselPage')) {
    const fileInput = document.getElementById('carouselInput');
    const fileCountDisplay = document.getElementById('fileCount');
    const step2 = document.getElementById('step2');
    const generateBtn = document.getElementById('generateBtn');
    const resultsGrid = document.getElementById('carouselResultsGrid');
    let selectedFiles = [];

    fileInput.addEventListener('change', function(e) {
        let files = Array.from(e.target.files);
        if (files.length > 10) { alert("Maks 10 foto!"); files = files.slice(0, 10); }
        selectedFiles = files;
        fileCountDisplay.innerText = `${selectedFiles.length} foto terpilih.`;
        if (selectedFiles.length > 0) step2.classList.remove('hidden'); else step2.classList.add('hidden');
    });

    generateBtn.addEventListener('click', async function() {
        if (selectedFiles.length === 0) return;
        loadingDiv.classList.remove('hidden'); resultDiv.classList.add('hidden'); resultsGrid.innerHTML = '';

        const templateType = document.querySelector('input[name="template"]:checked').value;
        const ratioType = document.querySelector('input[name="ratio"]:checked').value;
        const mainTitle = document.getElementById('carouselTitle').value.trim();
        
        // Tentukan Ukuran Canvas
        let cWidth = 1080;
        let cHeight = 1080; // Default Square

        if (ratioType === 'portrait') {
            cHeight = 1350; // 4:5
        } else if (ratioType === 'story') {
            cHeight = 1920; // 9:16
        }

        try {
            const imagePromises = selectedFiles.map(file => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });
            });

            const loadedImages = await Promise.all(imagePromises);

            loadedImages.forEach((img, index) => {
                const canvas = document.createElement('canvas');
                canvas.width = cWidth; canvas.height = cHeight;
                const ctx = canvas.getContext('2d');
                const slideNum = index + 1;
                const total = loadedImages.length;

                // Panggil Template dengan Parameter Width & Height
                if (templateType === 'minimal') drawMinimalTemplate(ctx, img, cWidth, cHeight, slideNum, total);
                else if (templateType === 'split') drawSplitTemplate(ctx, img, cWidth, cHeight, slideNum, total, mainTitle);
                else if (templateType === 'cinematic') drawCinematicTemplate(ctx, img, cWidth, cHeight, slideNum, total, mainTitle);
                else if (templateType === 'journal') drawJournalTemplate(ctx, img, cWidth, cHeight, slideNum, total, mainTitle);

                const resultItem = document.createElement('div');
                resultItem.className = 'slide-item';
                const imgResult = new Image(); imgResult.src = canvas.toDataURL('image/jpeg', 0.9);
                const dlBtn = document.createElement('a');
                dlBtn.href = imgResult.src; dlBtn.download = `Slide_${slideNum}_${ratioType}.jpg`;
                dlBtn.className = 'btn-dl-slide'; dlBtn.innerHTML = `Save Slide ${slideNum}`;
                resultItem.appendChild(imgResult); resultItem.appendChild(dlBtn);
                resultsGrid.appendChild(resultItem);
            });

            loadingDiv.classList.add('hidden'); resultDiv.classList.remove('hidden');
            resultDiv.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            loadingDiv.classList.add('hidden'); alert("Gagal memproses gambar."); console.error(error);
        }
    });

    // --- TEMPLATE DRAWER FUNCTIONS (UPDATED FOR DYNAMIC SIZE) ---
    
    // Helper: Draw Cover (Aspect Fill)
    function drawImageCover(ctx, img, x, y, w, h) {
        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let drawW, drawH, drawX, drawY;
        if (imgRatio > targetRatio) { 
            drawH = h; drawW = h * imgRatio; drawY = y; drawX = x - (drawW - w) / 2; 
        } else { 
            drawW = w; drawH = w / imgRatio; drawX = x; drawY = y - (drawH - h) / 2; 
        }
        ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.closePath(); ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawW, drawH); ctx.restore();
    }

    function drawMinimalTemplate(ctx, img, w, h, num, total) {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
        const pad = w * 0.08; // Padding 8% dari lebar
        const imgH = h - (pad * 2.5); // Sisakan ruang bawah untuk teks
        drawImageCover(ctx, img, pad, pad, w - (pad*2), imgH);
        
        ctx.fillStyle = '#000'; ctx.font = `bold ${w*0.04}px Arial`; ctx.textAlign = 'center';
        ctx.fillText(`${num} / ${total}`, w/2, h - (pad * 0.5));
    }

    function drawSplitTemplate(ctx, img, w, h, num, total, title) {
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h);
        const imgHeight = h * 0.8; // Foto 80% tinggi
        const barHeight = h * 0.2;
        drawImageCover(ctx, img, 0, 0, w, imgHeight);
        
        ctx.fillStyle = '#00ff88'; ctx.fillRect(0, imgHeight, w, barHeight);
        ctx.fillStyle = '#000'; ctx.textAlign = 'left';
        
        if(num === 1 && title) {
            ctx.font = `bold ${w*0.05}px Arial`; ctx.fillText(title, w*0.05, imgHeight + (barHeight*0.4));
            ctx.font = `${w*0.03}px Arial`; ctx.fillText(`Slide ${num} of ${total}`, w*0.05, imgHeight + (barHeight*0.7));
        } else {
             ctx.font = `bold ${w*0.04}px Arial`; ctx.fillText(`Slide ${num} / ${total}`, w*0.05, imgHeight + (barHeight*0.55));
        }
    }

    function drawCinematicTemplate(ctx, img, w, h, num, total, title) {
        drawImageCover(ctx, img, 0, 0, w, h);
        const grad = ctx.createLinearGradient(0, h*0.5, 0, h);
        grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.9)');
        ctx.fillStyle = grad; ctx.fillRect(0, h*0.5, w, h*0.5);
        
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        if(title) { ctx.font = `bold ${w*0.06}px serif`; ctx.fillText(title, w/2, h - (h*0.15)); }
        ctx.font = `${w*0.03}px Arial`; ctx.fillText(`${num} — ${total}`, w/2, h - (h*0.08));
    }

    function drawJournalTemplate(ctx, img, w, h, num, total, title) {
        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(0, 0, w, h);
        
        // Header
        ctx.fillStyle = '#222'; ctx.font = `bold ${w*0.03}px Arial`; ctx.textAlign = 'center';
        ctx.letterSpacing = '4px'; 
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
        ctx.fillText(dateStr, w/2, h*0.08); ctx.letterSpacing = '0px';

        // Foto Utama (Disesuaikan rasio)
        const padX = w * 0.12; 
        const padY = h * 0.15;
        const photoW = w - (padX*2);
        const photoH = h * 0.6; // Tinggi foto 60% dari canvas
        
        // Shadow
        ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 20; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 8;
        ctx.fillStyle = '#fff'; ctx.fillRect(padX, padY, photoW, photoH); ctx.restore();

        // Foto
        drawImageCover(ctx, img, padX, padY, photoW, photoH);
        ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.strokeRect(padX, padY, photoW, photoH);

        // Caption & Number
        ctx.fillStyle = '#222'; ctx.textAlign = 'center';
        const cap = title ? title.toLowerCase() : "moments in frame.";
        ctx.font = `italic ${w*0.05}px serif`; ctx.fillText(cap, w/2, padY+photoH + (h*0.1));
        
        ctx.font = `bold ${w*0.025}px Arial`; ctx.textAlign = 'right'; 
        ctx.fillText(`${num}/${total}`, w - (w*0.05), h - (h*0.05));
    }
}