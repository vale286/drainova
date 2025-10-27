export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log("Received body:", req.body);

      const chatId = req.body.message?.chat?.id;
      const text = req.body.message?.text?.toLowerCase();

      console.log(`Chat ID: ${chatId} Text: ${text}`);

      let reply = "❌ Maaf, perintah tidak dikenali. Coba kirim /start, /status, /tips, atau /edukasi.";

      // ==== COMMAND RESPONSES ====
      if (text === '/start') {
        reply =
          "👋 Halo! Selamat datang di *Drainova IoT Bot* 🌿\n\n" +
          "Gunakan perintah berikut:\n" +
          "• /status → Tentang sistem & kandungan POME\n" +
          "• /tips → Tips pemantauan flow & pressure\n" +
          "• /edukasi → Dampak dan kerugian limbah POME";
      }

      else if (text === '/status') {
        const now = new Date();
        const jamWIB = new Date(now.getTime() + (7 * 60 * 60 * 1000))
          .toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

        reply =
          "🛰️ *Status Sistem Drainova*\n\n" +
          "Halo! Drainova adalah sistem *monitoring limbah sawit POME (Palm Oil Mill Effluent)* yang dikembangkan oleh mahasiswa *Universitas Bakrie* angkatan 2023:\n" +
          "🧑🏻‍💻Dafit | 🧑🏻‍💻Kheiko | 🧑🏻‍💻 Vahed | 👩🏻‍💻 Vallen\n\n" +
          "📘 *Tentang POME:*\n" +
          "POME merupakan limbah cair dari pabrik kelapa sawit yang mengandung:\n" +
          "• 95–96% air 💧\n" +
          "• 0,6–0,7% minyak dan lemak (4–5% total padatan)\n" +
          "• Padatan tersuspensi (*TSS*), *COD* (Chemical Oxygen Demand), dan *BOD* (Biological Oxygen Demand) yang sangat tinggi\n" +
          "• pH asam (3,3–4,6) serta suhu panas (60–80°C) saat segar 🌡️\n\n" +
          "Karakteristik ini membuat POME berpotensi mencemari tanah dan air bila tidak diolah dengan benar.\n\n" +
          "🕒 *Waktu sistem (WIB):* " + jamWIB + "\n\n" +
          "Selamat mencoba sistem monitoring kami! 🌿💧";
      }

      else if (text === '/tips') {
        reply =
          "⚙️ *Tips Pemantauan Flow & Pressure Sistem Drainova*\n\n" +
          "1️⃣ Pastikan sistem Drainova aktif dan terhubung ke jaringan setiap *10–15 menit sekali*.\n" +
          "2️⃣ Perhatikan grafik *flow rate (L/min)* dan *pressure (PSI)* agar tetap stabil dalam rentang normal.\n" +
          "3️⃣ Jika flow terlalu rendah, periksa kemungkinan penyumbatan pada saluran limbah.\n" +
          "4️⃣ Jika pressure melonjak tinggi, pastikan tidak ada penumpukan material padat pada filter.\n" +
          "5️⃣ Bersihkan sensor setiap minggu agar pembacaan tetap akurat.\n\n" +
          "📊 Pemantauan rutin menjaga efisiensi hingga *85%* dan mencegah kerusakan dini pada instalasi! 🚀";
      }

      else if (text === '/edukasi') {
        reply =
          "📚 *Edukasi: Dampak Limbah POME terhadap Lingkungan & Industri*\n\n" +
          "🌍 *Dampak Lingkungan:*\n" +
          "• Limbah POME mengandung *BOD hingga 25.000 mg/L* dan *COD hingga 50.000 mg/L*, jauh di atas baku mutu (KLHK, 2020).\n" +
          "• Jika tidak diolah, limbah ini dapat mencemari air tanah, mematikan organisme perairan, dan menghasilkan gas metana (CH₄), penyumbang efek rumah kaca.\n\n" +
          "💼 *Kerugian bagi Industri Sawit:*\n" +
          "Menurut *Kementerian Lingkungan Hidup dan Kehutanan (KLHK)* serta *Sawit Watch (2022)*:\n" +
          "• Denda pencemaran bisa mencapai *Rp500 juta–Rp1 miliar* per kasus.\n" +
          "• Potensi *pencabutan izin operasional* bagi pabrik yang tidak mematuhi baku mutu limbah.\n" +
          "• Penurunan reputasi ekspor karena sertifikasi keberlanjutan (*RSPO/ISPO*) bisa dicabut.\n\n" +
          "💡 *Drainova hadir untuk membantu mendeteksi potensi pencemaran lebih awal melalui sensor tekanan & aliran secara real-time.* 🌿";
      }

      // ==== KIRIM BALASAN KE TELEGRAM ====
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
