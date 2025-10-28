// app/api/data/route.js
import { db } from "@/app/firebaseConfig";
import { collection, addDoc, query, orderBy, limit, getDocs } from "firebase/firestore";

let latestData = {
  pressure: 0,
  flow: 0,
  time: new Date().toISOString(),
};

// GET: Ambil data terbaru dari Firestore
export async function GET() {
  try {
    const q = query(collection(db, "sensorData"), orderBy("time", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        latestData = doc.data();
      });
    }

    return Response.json(latestData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// POST: Simpan data dari ESP32 ke Firestore
export async function POST(req) {
  try {
    const body = await req.json();

    // Simpan data baru ke variabel dan Firestore
    latestData = {
      pressure: body.pressure || 0,
      flow: body.flow || 0,
      time: new Date().toISOString(),
    };

    await addDoc(collection(db, "sensorData"), latestData);

    console.log("✅ Data tersimpan di Firestore:", latestData);

    return Response.json({ message: "Data stored successfully" });
  } catch (error) {
    console.error("❌ Error parsing or saving data:", error);
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

