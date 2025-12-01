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
    // --- 1. PEMFORMATAN TANGGAL: YYYY-MM-DD -> DD/MM/YYYY ---
    // ----------------------------------------------------
    let fecha = rawFecha;
    if (rawFecha && rawFecha.includes('-')) {
        const parts = rawFecha.split('-'); 
        // Format ulang menjadi DD/MM/YYYY
        fecha = `${parts[2]}/${parts[1]}/${parts[0]}`; 
    }

    // ----------------------------------------------------
    // --- 2. PERHITUNGAN WAKTU: Menghitung Waktu Selesai ---
    // ----------------------------------------------------
    let rentangWaktu = waktuMulaiStr; // Default: hanya waktu mulai
    
    // Ekstrak angka jam dari durasi (misalnya "2 JAM" menjadi 2)
    // Gunakan regex untuk mengambil angka pertama dari string
    const match = durasiString.match(/\d+/);
    const durasiJam = match ? parseInt(match[0]) : 0;
    
    // Pastikan waktu mulai valid dan durasi adalah angka
    if (waktuMulaiStr && durasiJam > 0) {
        // Pisahkan jam dan menit waktu mulai
        const [jam_mulai, menit_mulai] = waktuMulaiStr.split(':').map(Number);
        
        // Gunakan objek Date temporer untuk mempermudah perhitungan
        const date_mulai = new Date();
        date_mulai.setHours(jam_mulai, menit_mulai, 0, 0);

        // Tambahkan durasi (durasiJam dikali milidetik dalam satu jam)
        const date_selesai = new Date(date_mulai.getTime() + (durasiJam * 60 * 60 * 1000));

        // Format waktu selesai kembali ke HH:MM (dengan padding nol)
        const jam_selesai = date_selesai.getHours().toString().padStart(2, '0');
        const menit_selesai = date_selesai.getMinutes().toString().padStart(2, '0');
        const waktuSelesaiStr = `${jam_selesai}:${menit_selesai}`;

        // Gabungkan Waktu Mulai dan Waktu Selesai
        rentangWaktu = `${waktuMulaiStr} - ${waktuSelesaiStr} (${durasiString})`;
    } else {
         // Jika durasi tidak jelas, set rentang waktu sebagai waktu mulai dan durasi terpisah
         rentangWaktu = `${waktuMulaiStr} (${durasiString})`;
    }
    // ----------------------------------------------------
    
    // VALIDASI data harus di atas sebelum URL
    if (cliente === "" || rawFecha === "" || waktuMulaiStr === "") {
        resp.classList.add("fail");
        resp.innerHTML = `Isi data dengan lengkap, ${cliente || 'Tim'}.`;
        return false;
    }

    // Membuat URL WhatsApp dengan data yang sudah diformat
    const url = `https://api.whatsapp.com/send?phone=${telefono}&text=` +
    // Header
    `*_TIANGJAUH PHOTORGAPHY_*%0A` +
    `*Booking/Order*%0A%0A` +
    // Detail Pemesanan
    `*Nama Tim:* ${cliente}%0A` +
    `*Tanggal:* ${fecha}%0A` +
    `*Waktu:* ${rentangWaktu}%0A` +
    `*Venue:* ${servicio}%0A%0A` +
    // Pertanyaan Penutup
    `*Apakah Jadwal tersedia?*`;

    resp.classList.remove("fail");
    resp.classList.add("send");
    resp.innerHTML = `Pesan telah terkirim, ${cliente}`;

    window.open(url, '_blank');
});