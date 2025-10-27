export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const chatId = req.body.message?.chat?.id;
      const text = req.body.message?.text?.toLowerCase();

      console.log(`Chat ID: ${chatId} Text: ${text}`);

      let reply = "❌ Maaf, perintah tidak dikenali. Coba kirim /start, /tentang, /status, /edukasi, atau /tips.";

      // === /start ===
      if (text === '/start') {
        reply =
          "🤩 *Selamat datang di Drainova!*\n\n" +
          "Halo! Aku adalah *Drainova IoT Bot*, asisten kecilmu untuk memantau limbah sawit berbasis Internet of Things (IoT) 🌿💧\n\n" +
          "Kamu bisa kirim perintah ini:\n" +
          "• /tentang — 🤔 Drainova itu apa, sih?\n" +
          "• /status — 📊 Lihat data sensor terkini\n" +
          "• /tips — 🌱 Tips pengolahan limbah ramah lingkungan\n" +
          "• /edukasi — 🌰 Fakta limbah sawit dan dampaknya\n\n" +
          "Yuk, mulai eksplorasi sistem monitoring limbah sawit kita! 🚀";
      }

      // === /tentang ===
      else if (text === '/tentang') {
        reply =
          "🤔 *Drainova itu apa, sih?*\n\n" +
          "Drainova adalah sistem IOT yang diciptakan oleh mahasiswa *Universitas Bakrie* angkatan 2023🎓:\n" +
          "🧑🏻‍💻 Dafit | 🧑🏻‍💻 Kheiko | 🧑🏻‍💻 Vahed | 👩🏻‍💻 Vallen\n\n" +
          "Sistem ini membantu pabrik kelapa sawit memantau *flow* dan *pressure* limbah cair (*POME*) secara real-time.\n\n" +
          "Tujuannya mendeteksi potensi pencemaran lebih awal dan mendukung industri sawit yang *lebih berkelanjutan*.\n\n" +
          "🔗 Kunjungi dashboard: https://drainovaiot.vercel.app";
      }

      // === /status ===
      else if (text === '/status') {
        try {
          const sensorResponse = await fetch('https://drainovaiot.vercel.app/api/data');
          const sensorData = await sensorResponse.json();

          const flow = sensorData.flow ?? '0';
          const pressure = sensorData.pressure ?? '0';

          const now = new Date();
          const waktuWIB = new Date(now.getTime() + (7 * 60 * 60 * 1000));
          const jamWIB = waktuWIB.toLocaleTimeString('id-ID', {
            timeZone: 'Asia/Jakarta',
            hour12: true,
          });

          reply =
            "📊 *Data Sensor Drainova Saat Ini*\n\n" +
            `🌊 Flow: ${flow} L/min\n` +
            `⛽ Pressure: ${pressure} PSI\n` +
            `🕒 Waktu: ${jamWIB}\n\n` +
            "Drainova memantau *tekanan (pressure)* dan *aliran (flow)* limbah cair sawit secara otomatis untuk memastikan sistem berjalan normal. 🌿";
        } catch (err) {
          console.error("Error fetching sensor data:", err);
          reply = "⚠️ Gagal mengambil data sensor dari sistem. Pastikan API Drainova aktif.";
        }
      }

      // === /tips ===
      else if (text === '/tips') {
        reply =
          "🌱 *Tips Pengolahan Limbah Ramah Lingkungan*\n\n" +
          "Berikut beberapa cara agar sistem Drainova bekerja optimal dan pengolahan limbah tetap aman:\n\n" +
          "1️⃣ Pastikan sistem aktif dan terhubung setiap *10–15 menit sekali*.\n" +
          "2️⃣ Cek grafik *flow rate (L/min)* dan *pressure (PSI)* di dashboard secara rutin.\n" +
          "3️⃣ Jika flow menurun → mungkin saluran tersumbat.\n" +
          "4️⃣ Jika pressure meningkat → bisa jadi ada material padat di filter.\n" +
          "5️⃣ Bersihkan sensor minimal seminggu sekali agar pembacaan akurat.\n\n" +
          "🔍 Catatan: Sistem Drainova hanya memantau *flow* & *pressure*, bukan pH.\n\n" +
          "Pemantauan teratur bisa meningkatkan efisiensi hingga *85%*! 🚀";
      }

      // === /edukasi ===
      else if (text === '/edukasi') {
        reply =
          "🌰 *Fakta Limbah Sawit (POME) dan Dampaknya*\n\n" +
          "📘 *Apa itu POME?*\n" +
          "POME (Palm Oil Mill Effluent) adalah limbah cair dari pabrik kelapa sawit yang mengandung:\n" +
          "• 95-96% air 💧\n" +
          "• 0,6-0,7% minyak & lemak\n" +
          "• Padatan tersuspensi (TSS), COD, dan BOD tinggi\n" +
          "• pH asam (3,3-4,6) dan suhu 60-80°C 🌡️\n\n" +
          "🌍 *Dampak Lingkungan:*\n" +
          "• POME memiliki *BOD hingga 25.000 mg/L* dan *COD hingga 50.000 mg/L* jauh di atas baku mutu (KLHK, 2020).\n" +
          "• Jika tidak diolah, dapat mencemari air tanah dan menghasilkan gas metana (CH₄), penyebab efek rumah kaca.\n\n" +
          "💼 *Kerugian bagi Industri Sawit:*\n" +
          "Menurut *Kementerian Lingkungan Hidup dan Kehutanan* dan *Sawit Watch (2022)*:\n" +
          "• Denda pencemaran bisa mencapai *Rp500 juta–Rp1 miliar*.\n" +
          "• Potensi *pencabutan izin operasional* pabrik.\n" +
          "• Hilangnya sertifikasi *RSPO/ISPO* yang menurunkan nilai ekspor.\n\n" +
          "📚 Sumber: Kementerian Lingkungan Hidup dan Kehutanan (2020), Sawit Watch (2022), RSPO Guidelines (2023), Saka.co.id (2022)\n\n" +
          "💡 Drainova hadir membantu industri sawit agar tetap produktif *tanpa merusak lingkungan.* 🌿";
      }

      // === Kirim balasan ke Telegram ===
      if (chatId) {
        const token = process.env.TELEGRAM_TOKEN;
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply,
            parse_mode: 'Markdown',
          }),
        });

        const result = await response.json();
        console.log("Telegram API response:", result);
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Error in webhook:", error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(200).send("This endpoint is for Telegram Bot webhook");
  }
}
