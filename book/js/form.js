/* TIANGJAUH/book/js/form.js */

document.querySelector("#submit").addEventListener("click", e => {
    e.preventDefault();

    // INGRESSE UN NUMERO DE WHATSAPP VALIDO AQUI:
    const telefono = "628176498254";

    const cliente = document.querySelector("#cliente").value.trim();
    // Ambil nilai tanggal dari input
    const rawFecha = document.querySelector("#fecha").value;
    const waktuMulaiStr = document.querySelector("#hora").value; // Contoh: "20:00"
    const durasiString = document.querySelector("#empleado").value; // Contoh: "2 JAM"
    const servicio = document.querySelector("#servicio").value;
    const resp = document.querySelector("#respuesta");

    resp.classList.remove("fail", "send");

    // ----------------------------------------------------
    // --- 1. PEMFORMATAN TANGGAL & HARI ---
    // ----------------------------------------------------
    let fecha = rawFecha;
    let hariStr = "";

    if (rawFecha && rawFecha.includes('-')) {
        const parts = rawFecha.split('-'); // YYYY-MM-DD
        
        // Buat objek Date (Perhatikan: Bulan di JS mulai dari 0)
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        
        // Array nama hari dalam Bahasa Indonesia
        const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        hariStr = namaHari[dateObj.getDay()]; // Ambil nama hari

        // Format ulang menjadi DD/MM/YYYY
        fecha = `${parts[2]}/${parts[1]}/${parts[0]}`; 
    }

    // ----------------------------------------------------
    // --- 2. PERHITUNGAN WAKTU ---
    // ----------------------------------------------------
    let rentangWaktu = waktuMulaiStr;
    const match = durasiString.match(/\d+/);
    const durasiJam = match ? parseInt(match[0]) : 0;
    
    if (waktuMulaiStr && durasiJam > 0) {
        const [jam_mulai, menit_mulai] = waktuMulaiStr.split(':').map(Number);
        const date_mulai = new Date();
        date_mulai.setHours(jam_mulai, menit_mulai, 0, 0);
        const date_selesai = new Date(date_mulai.getTime() + (durasiJam * 60 * 60 * 1000));
        const jam_selesai = date_selesai.getHours().toString().padStart(2, '0');
        const menit_selesai = date_selesai.getMinutes().toString().padStart(2, '0');
        const waktuSelesaiStr = `${jam_selesai}:${menit_selesai}`;
        rentangWaktu = `${waktuMulaiStr} - ${waktuSelesaiStr} WIB (${durasiString})`;
    } else {
         rentangWaktu = `${waktuMulaiStr} WIB (${durasiString})`;
    }
    
    // ----------------------------------------------------
    
    // VALIDASI
    if (cliente === "" || rawFecha === "" || waktuMulaiStr === "") {
        resp.classList.add("fail");
        resp.innerHTML = `Isi data dengan lengkap, ${cliente || 'Tim'}.`;
        return false;
    }

    // URL WHATSAPP (DENGAN HARI)
    const url = `https://api.whatsapp.com/send?phone=${telefono}&text=` +
    `*_TIANGJAUH PHOTOGRAPHY_*%0A` +
    `*Booking Order*%0A%0A` +
    `*Nama Tim:* ${cliente}%0A` +
    `*Hari/Tgl:* ${hariStr}, ${fecha}%0A` + // Menambahkan Hari disini
    `*Waktu:* ${rentangWaktu}%0A` +
    `*Venue:* ${servicio}%0A%0A` +
    `*Apakah Jadwal tersedia?*`;

    resp.classList.remove("fail");
    resp.classList.add("send");
    resp.innerHTML = `Pesan telah terkirim, ${cliente}`;

    window.open(url, '_blank');
});