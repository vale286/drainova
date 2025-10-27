// app/api/telegram/route.js

export async function POST(req) {
  try {
    // ⬇️ Tambahkan log di sini, di awal fungsi POST
    const body = await req.json();
    console.log("Received body:", body);

    const chatId = body.message?.chat?.id;
    const text = body.message?.text?.toLowerCase() || "";
    console.log("Chat ID:", chatId, "Text:", text);

    let reply = "Halo! Saya DrainovaBot 🤖 siap bantu pantau dan edukasi limbah sawit.";

    if (text.includes("/start")) {
      reply = "Selamat datang di DrainovaBot 🌿\nKetik /status untuk lihat kondisi terbaru,\natau /edukasi untuk tips ramah lingkungan!";
    } 
    else if (text.includes("/status")) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/data`);
      const data = await res.json();
      reply = `📊 Data Terkini:\n🌊 Flow: ${data.flow} L/min\n⛽ Pressure: ${data.pressure} PSI\n🕒 Waktu: ${new Date(data.time).toLocaleTimeString()}`;
    } 
    else if (text.includes("/edukasi")) {
      reply = "💡 Fakta: Limbah sawit bisa mencemari air dan tanah.\nSelalu pastikan sistem Drainova berfungsi dan bersihkan filter setiap minggu agar efisien!";
    } 
    else if (text.includes("/tips")) {
      reply = "🌱 Tips: Gunakan limbah padat sawit sebagai pupuk kompos alami untuk tanaman sekitar.";
    }

    // kirim balasan ke Telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: reply }),
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Telegram error:", err); // ⬅️ log error juga
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// biar kalau diakses lewat browser GET nggak error
export async function GET() {
  return new Response("This endpoint is for Telegram Bot webhook", { status: 200 });
}
