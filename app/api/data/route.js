// app/api/data/route.js

let latestData = {
  pressure: 0,
  flow: 0,
  time: new Date().toISOString(),
};

// Endpoint GET yang digunakan oleh dashboard untuk ambil data terbaru
export async function GET() {
  return Response.json(latestData);
}

// Endpoint POST yang digunakan oleh ESP32 untuk mengirim data baru
export async function POST(req) {
  try {
    const body = await req.json();

    // Simpan data baru
    latestData = {
      pressure: body.pressure,
      flow: body.flow,
      time: new Date().toISOString(),
    };

    console.log("Data diterima:", latestData);

    // Kirim respon ke ESP32
    return Response.json({ message: "Data stored successfully" });
  } catch (error) {
    console.error("Error parsing data:", error);
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
