// app/api/telegram/route.js

export async function POST(req) {
  try {
    const body = await req.json();
    const chatId = body.message?.chat?.id;
    const text = body.message?.text?.toLowerCase() || "";

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

    // Kirim balasan ke Telegram
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: reply }),
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error in Telegram route:", error);
    return new Response("Error", { status: 500 });
  }
}

// Tambahkan handler GET agar tidak error 405
export async function GET() {
  return new Response("This endpoint is for Telegram Bot webhook", { status: 200 });
}
