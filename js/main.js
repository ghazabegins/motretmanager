/* TIANGJAUH/js/main.js */

const scriptURL = 'https://script.google.com/macros/s/AKfycbwJGLSActDA3XA3SGZscC04W85P1TTeXEvBDXoGTd_uxCOM_ENNCIk_jD9MJIMl9B979g/exec';

// TOGGLE MENU MOBILE
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active');
}

// FETCH DATA & SETUP MODAL
document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. SETUP LOGIKA MODAL LIGHTBOX ---
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("imgView");
    const closeBtn = document.querySelector(".close-modal");

    // Fungsi buka modal
    function openModal(src) {
        modal.style.display = "block";
        modalImg.src = src;
    }

    // Event listener untuk setiap gambar di galeri
    // Kita gunakan event delegation agar jika gambar berubah src-nya, tetap bisa diklik
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Ambil src dari tag <img> di dalam div ini
            const img = this.querySelector('img');
            if(img && img.src) {
                openModal(img.src);
            }
        });
    });

    // Tutup modal saat klik tombol X
    closeBtn.onclick = function() { modal.style.display = "none"; }

    // Tutup modal saat klik area hitam di luar gambar
    window.onclick = function(event) {
        if (event.target == modal) { modal.style.display = "none"; }
    }

    // --- 2. FETCH DATA DARI GOOGLE SHEET ---
    fetch(scriptURL + '?action=getSettings')
    .then(response => response.json())
    .then(data => {
        if(data.logo_url) {
            const logo = document.getElementById('dynamic-logo');
            if(logo) logo.src = data.logo_url;
        }

        if(document.getElementById('hero-title')) {
            if(data.judul_berita) document.getElementById('hero-title').innerHTML = data.judul_berita;
            if(data.isi_berita) document.getElementById('hero-desc').innerText = data.isi_berita;
        }

        if(document.getElementById('about-title')) {
            if(data.about_img) document.getElementById('about-img').style.backgroundImage = `url('${data.about_img}')`;
            if(data.about_title) document.getElementById('about-title').innerText = data.about_title;
            if(data.about_desc1) document.getElementById('about-desc1').innerText = data.about_desc1;
            if(data.about_desc2) document.getElementById('about-desc2').innerText = data.about_desc2;
            
            if(data.stat_1_num) document.getElementById('stat-1-num').innerText = data.stat_1_num;
            if(data.stat_1_label) document.getElementById('stat-1-lbl').innerText = data.stat_1_label;
            if(data.stat_2_num) document.getElementById('stat-2-num').innerText = data.stat_2_num;
            if(data.stat_2_label) document.getElementById('stat-2-lbl').innerText = data.stat_2_label;
        }

        // UPDATE GAMBAR GALERI
        for(let i=1; i<=6; i++) {
            const imgEl = document.getElementById('gal-img-'+i);
            if(imgEl && data['foto_'+i]) {
                imgEl.src = data['foto_'+i];
            }
        }
    })
    .catch(error => console.error('Gagal mengambil konten:', error));
});