import { adminDb } from "@/app/firebaseAdmin";

export const maxDuration = 10;

// Data sementara (fallback)
let latestData = {
  pressure: 0,
  flow: 0,
  time: new Date().toISOString(),
};

// Ambil data terbaru dari Realtime Database
export async function GET() {
  try {
    const snapshot = await adminDb.ref("sensorData/history").limitToLast(1).get();

    if (snapshot.exists()) {
      const val = Object.values(snapshot.val())[0];
      latestData = val;
    }

    return new Response(JSON.stringify(latestData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GET] Error fetching data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch data", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Simpan data baru ke Realtime Database 
export async function POST(req) {
  try {
    const body = await req.json();
    const { pressure, flow } = body;

    if (typeof pressure !== "number" || typeof flow !== "number") {
      return new Response(
        JSON.stringify({ error: "Invalid data types. Expected numbers." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Simpan ke Realtime Database
    latestData = {
      pressure,
      flow,
      time: new Date().toISOString(),
    };

    await adminDb.ref("sensorData/history").push(latestData);

    console.log("Data baru disimpan di RTDB, nih:", latestData);

    return new Response(
      JSON.stringify({ message: "Data logged successfully", data: latestData }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[POST] Server error:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
