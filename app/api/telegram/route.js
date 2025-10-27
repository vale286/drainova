export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const chatId = body.message?.chat?.id;
    const text = body.message?.text?.toLowerCase();

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
        "• Padatan tersuspensi (*TSS*), *COD*, dan *BOD* yang sangat tinggi\n" +
        "• pH asam (3,3–4,6) serta suhu panas (60–80°C) saat segar 🌡️\n\n" +
        "Karakteristik ini membuat POME berpotensi mencemari tanah dan air bila tidak diolah dengan benar.\n\n" +
        "🕒 *Waktu sistem (WIB):* " + jamWIB + "\n\n" +
        "Selamat mencoba sistem monitoring kami! 🌿💧";
    }

    else if (text === '/tips') {
      reply =
        "⚙️ *Tips Pemantauan Flow & Pressure Sistem Drainova*\n\n" +
        "1️⃣ Pastikan sistem Drainova aktif dan terhubung ke jaringan setiap *10–15 menit sekali*.\n" +
        "2️⃣ Perhatikan grafik *flow rate (L/min)* dan *pressure (PSI)* agar tetap stabil.\n" +
        "3️⃣ Jika flow rendah → kemungkinan penyumbatan saluran.\n" +
        "4️⃣ Jika pressure tinggi → periksa filter atau pipa.\n" +
        "5️⃣ Bersihkan sensor setiap minggu agar akurat.\n\n" +
        "📊 Pemantauan rutin menjaga efisiensi hingga *85%* dan mencegah kerusakan dini! 🚀";
    }

    else if (text === '/edukasi') {
      reply =
        "📚 *Edukasi: Dampak Limbah POME terhadap Lingkungan & Industri*\n\n" +
        "🌍 *Dampak Lingkungan:*\n" +
        "• Limbah POME mengandung *BOD hingga 25.000 mg/L* dan *COD hingga 50.000 mg/L*, jauh di atas baku mutu (KLHK, 2020).\n" +
        "• Jika tidak diolah, limbah ini mencemari air tanah, membunuh organisme perairan, dan menghasilkan gas metana (CH₄) penyumbang efek rumah kaca.\n\n" +
        "💼 *Kerugian bagi Industri Sawit:*\n" +
        "Menurut *KLHK* & *Sawit Watch (2022)*:\n" +
        "• Denda pencemaran bisa mencapai *Rp500 juta–Rp1 miliar* per kasus.\n" +
        "• Potensi *pencabutan izin operasional* jika tidak memenuhi baku mutu.\n" +
        "• Penurunan reputasi ekspor akibat hilangnya sertifikasi *RSPO/ISPO*.\n\n" +
        "💡 *Drainova membantu mendeteksi potensi pencemaran lebih awal melalui sensor tekanan & aliran real-time.* 🌿";
    }

    // ==== KIRIM BALASAN ====
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

    return new Response("OK");
  } catch (error) {
    console.error("Error in webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  return new Response("This endpoint is for Telegram Bot webhook");
}
