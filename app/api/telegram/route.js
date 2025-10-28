export async function POST(req) {
  try {
    const body = await req.json();
    const chatId = body.message?.chat?.id;
    const text = body.message?.text?.toLowerCase().trim();

    if (!chatId) {
      return new Response(JSON.stringify({ error: "Chat ID tidak ditemukan" }), { status: 400 });
    }

    console.log(`Chat ID: ${chatId} | Text: ${text}`);

    let reply = "Maaf, perintah tidak dikenali. Coba kirim /start, /tentang, /status, /edukasi, atau /tips.";

    // === /start ===
    if (text === "/start") {
      reply =
        "🤩 *Selamat datang di Drainova!*\n\n" +
        "Halo! Aku adalah *Drainova IoT Bot*, asisten kecilmu untuk memantau limbah sawit berbasis Internet of Things (IoT) 🌿💧\n\n" +
        "Kamu bisa kirim perintah ini:\n" +
        "• /tentang — 🤔 Drainova itu apa, sih?\n" +
        "• /status — 📊 Lihat data sensor terkini\n" +
        "• /tips — 🌱 Tips pengolahan limbah ramah lingkungan\n" +
        "• /edukasi — 🌰 Fakta limbah sawit dan dampaknya\n\n" +
        "Yuk, mulai eksplorasi sistem monitoring limbah sawit kami! 🚀";
    }

    // === /tentang ===
    else if (text === "/tentang") {
      reply =
        "🤔 *Drainova itu apa, sih?*\n\n" +
        "Drainova adalah sistem IoT yang diciptakan oleh kami, mahasiswa Universitas Bakrie angkatan 2023 🎓:\n\n" +
        "🧑🏻‍💻 Dafit (Teknik Sipil)\n" +
        "🧑🏻‍💻 Kheiko (Teknik Lingkungan)\n" +
        "🧑🏻‍💻 Vahed (Manajemen)\n" +
        "👩🏻‍💻 Vallen (Sistem Informasi)\n\n" +
        "Sistem ini membantu pabrik kelapa sawit memantau *flow* dan *pressure* limbah cair (*POME*) secara real-time 🌿💧\n" +
        "Tujuannya: mendeteksi potensi pencemaran lebih awal dan mendukung industri sawit *yang lebih berkelanjutan*.\n\n" +
        "🔗 Dashboard: https://drainovaiot.vercel.app";
    }

    // === /status ===
    else if (text === "/status") {
      try {
        const res = await fetch("https://drainovaiot.vercel.app/api/data", { cache: "no-store" });
        const sensorData = await res.json();

        const flow = parseFloat(sensorData.flow ?? 0).toFixed(2);
        const pressure = parseFloat(sensorData.pressure ?? 0).toFixed(2);

        let kondisi = "🟢 Normal";
        if (pressure > 60 || flow > 30) kondisi = "🔴 Bahaya";
        else if (pressure > 45 || flow > 20) kondisi = "🟠 Warning";

        const jamWIB = new Date().toLocaleTimeString("id-ID", {
          timeZone: "Asia/Jakarta",
          hour12: false,
        });

        reply =
          "📊 *Status Sensor Drainova Saat Ini*\n\n" +
          `🌊 Flow: ${flow} L/min\n` +
          `⛽ Pressure: ${pressure} PSI\n` +
          `📟 Status: ${kondisi}\n` +
          `🕒 Waktu: ${jamWIB} WIB\n\n` +
          "Drainova memantau *tekanan* dan *aliran* limbah cair sawit secara otomatis untuk memastikan sistem tetap stabil 🌿";
      } catch (err) {
        console.error("Gagal mengambil data sensor:", err);
        reply = "⚠️ Gagal mengambil data sensor dari sistem. Pastikan API aktif.";
      }
    }

    // === /tips ===
    else if (text === "/tips") {
      reply =
        "🌿 *Tips Pengolahan Limbah Cair Sawit (POME) Efisien & Ramah Lingkungan*\n\n" +
        "Yuk, ikuti langkah-langkah ini agar sistem *Drainova* dan pengolahan limbah kamu bekerja optimal:\n\n" +
        "1️⃣ Pastikan sistem Drainova aktif & terkoneksi setiap *10-15 menit* untuk pantau aliran dan tekanan.\n" +
        "2️⃣ Jika flow menurun, periksa saluran menuju kolam pendingin-kemungkinan ada sumbatan atau kerak minyak.\n" +
        "3️⃣ Jika pressure meningkat, buka valve pembuangan atau bersihkan filter untuk mencegah overpressure.\n" +
        "4️⃣ Limbah cair hasil proses awal (POME) sebaiknya dialirkan ke kolam anaerobik untuk penguraian alami oleh bakteri tanpa oksigen.\n" +
        "5️⃣ Setelah itu, lanjutkan ke kolam fakultatif dan kolam aerobik untuk menurunkan COD & BOD hingga aman dibuang atau dipakai kembali.\n" +
        "6️⃣ Padatan hasil penyaringan bisa dikeringkan dan dijadikan pupuk organik atau biogas feedstock.\n\n" +
        "💧 Dengan sistem ini, efisiensi pengolahan limbah bisa meningkat hingga *85%*, dan emisi gas metana berkurang signifikan! ⚡";
}

    // === /edukasi ===
    else if (text === "/edukasi") {
      reply =
        "🌰 *Fakta Limbah Sawit (POME) dan Dampaknya*\n\n" +
        "📘 *Hmm, POME itu apa, ya?*\n" +
        "POME (Palm Oil Mill Effluent) adalah limbah cair dari pabrik kelapa sawit yang mengandung:\n" +
        "• 95-96% air 💧\n" +
        "• 0,6-0,7% minyak & lemak\n" +
        "• Padatan tersuspensi (TSS), COD, dan BOD tinggi\n" +
        "• pH asam (3,3-4,6), suhu 60-80°C 🌡️\n\n" +
        "🌍 *Dampak Lingkungan:*\n" +
        "• BOD bisa mencapai 25.000 mg/L (baku mutu: <100 mg/L)\n" +
        "• COD bisa mencapai 50.000 mg/L (baku mutu: <350 mg/L)\n" +
        "• Jika tidak diolah, sehingga mencemari air tanah & menghasilkan gas metana (CH₄)\n\n" +
        "💼 *Risiko bagi industri:*\n" +
        "• Denda Rp500 juta-Rp1 miliar (Kementeriam Lingkungan Hidup dan Kehutanan, 2022)\n" +
        "• Potensi pencabutan izin operasional\n" +
        "• Kehilangan sertifikasi RSPO/ISPO\n\n" +
        "📚 Sumber: [Kementerian Lingkungan Hidup dan Kehutanan 2020](https://www.menlhk.go.id/), [Sawit Watch 2022](https://sawitwatch.or.id/), [RSPO Guidelines 2023](https://rspo.org/)\n\n" +
        "💡 Drainova hadir membantu industri sawit agar tetap produktif *tanpa merusak lingkungan.* 🌿";
    }

    // === Kirim ke Telegram ===
    const token = process.env.TELEGRAM_TOKEN;
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply,
        parse_mode: "Markdown",
      }),
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Error di webhook Telegram:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
