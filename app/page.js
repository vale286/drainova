"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  push,
  serverTimestamp,
} from "firebase/database";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBV_YFBsc0d0H33pMrN6_v91yfR3rib4Zg",
  authDomain: "drainova-90467.firebaseapp.com",
  projectId: "drainova-90467",
  storageBucket: "drainova-90467.firebasestorage.app",
  messagingSenderId: "769734268201",
  appId: "1:769734268201:web:180b292ff1bd605bd79338",
  measurementId: "G-J3V3WMCGQ0",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function HomePage() {
  const [data, setData] = useState({ flow: 0, pressure: 0 });
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("🟢 Normal");
  const [prediction, setPrediction] = useState({ flow: 0, pressure: 0 });
  const [insight, setInsight] = useState("");
  const [lastUpdate, setLastUpdate] = useState("-");

  // Ambil data real-time dari Firebase
  useEffect(() => {
    const dataRef = ref(db, "sensorData");
    onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) return;

      const allData = Object.values(val);
      const latest = allData.slice(-1)[0];
      const ts = latest.timestamp ? latest.timestamp : Date.now();

      setData({ flow: latest.flow, pressure: latest.pressure });
      setLastUpdate(new Date(ts).toLocaleTimeString("id-ID"));

      const updated = allData
        .slice(-10)
        .map((d) => ({
          flow: d.flow,
          pressure: d.pressure,
          time: new Date(d.timestamp || Date.now()).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        }));
      setHistory(updated);
    });
  }, []);

  // Status otomatis
  useEffect(() => {
    if (data.pressure > 60 || data.flow > 30) setStatus("🔴 Bahaya");
    else if (data.pressure > 45 || data.flow > 20) setStatus("🟠 Warning");
    else setStatus("🟢 Normal");
  }, [data]);

  // Prediksi sederhana (moving average)
  useEffect(() => {
    if (history.length < 2) return;
    const avgFlow = history.reduce((a, b) => a + b.flow, 0) / history.length;
    const avgPressure = history.reduce((a, b) => a + b.pressure, 0) / history.length;
    setPrediction({
      flow: avgFlow.toFixed(2),
      pressure: avgPressure.toFixed(2),
    });
  }, [history]);

  // 🔹 Insight
  useEffect(() => {
    if (data.pressure <= 45 && data.flow <= 20)
      setInsight("Aliran stabil dan tekanan normal ✅");
    else if (data.pressure <= 60 && data.flow <= 30)
      setInsight("Tekanan mulai meningkat ⚠️ Periksa filter atau pompa.");
    else setInsight("Tekanan tinggi! 🚨 Kemungkinan sumbatan atau overpressure.");
  }, [data]);

  // 🔹 Tambah data simulasi
  const pushData = async () => {
    const newData = {
      flow: parseFloat((Math.random() * 35).toFixed(2)),
      pressure: parseFloat((Math.random() * 70).toFixed(2)),
      timestamp: Date.now(),
    };
    await push(ref(db, "sensorData"), { ...newData, timestamp: serverTimestamp() });

    // update tampilan langsung
    setData({ flow: newData.flow, pressure: newData.pressure });
    setLastUpdate(new Date().toLocaleTimeString("id-ID"));
    setHistory((prev) =>
      [...prev, { ...newData, time: new Date().toLocaleTimeString("id-ID") }].slice(-10)
    );
  };

  const sendToWhatsApp = () => {
    const adminNumber = "6283896336395";
    const message = `Peringatan Drainova
Status: ${status}
Flow Rate: ${data.flow.toFixed(2)} L/min
Pressure: ${data.pressure.toFixed(2)} PSI
Prediksi Tekanan: ${prediction.pressure} PSI
Insight: ${insight}`;
    const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <main
      style={{
        background: "linear-gradient(135deg, #FFEEAD 0%, #FFD6A5 50%, #A02334 100%)",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <Image
        src="/Logo_Drainova.png"
        alt="Drainova Logo"
        width={120}
        height={120}
        style={{ marginBottom: "20px" }}
      />

      <h1 style={{ color: "#A02334", fontSize: "2.2rem", fontWeight: "700" }}>
        Selamat Datang di Drainova
      </h1>
      <h2 style={{ color: "#A02334", marginBottom: "30px" }}>
        IoT POME Monitoring Dashboard
      </h2>

      {/* STATUS */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          padding: "20px",
          width: "300px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "#A02334" }}>Status</h3>
        <p
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            color:
              status === "🔴 Bahaya"
                ? "red"
                : status === "🟠 Warning"
                ? "orange"
                : "green",
          }}
        >
          {status}
        </p>
        <p style={{ color: "#555" }}>{insight}</p>
      </div>

      {/* FLOW */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          padding: "30px",
          width: "300px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "#A02334" }}>Flow Rate</h3>
        <p style={{ fontSize: "1.5rem", fontWeight: "600", color: "#A02334" }}>
          {data.flow.toFixed(2)} L/min
        </p>
        <p style={{ color: "#777" }}>Prediksi: {prediction.flow} L/min</p>
      </div>

      {/* PRESSURE */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          padding: "30px",
          width: "300px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ color: "#A02334" }}>Pressure</h3>
        <p style={{ fontSize: "1.5rem", fontWeight: "600", color: "#A02334" }}>
          {data.pressure.toFixed(2)} PSI
        </p>
        <p style={{ color: "#777" }}>Prediksi: {prediction.pressure} PSI</p>
      </div>

      {/* CHART */}
      {history.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            padding: "20px",
            marginBottom: "30px",
            width: "90%",
            maxWidth: "700px",
          }}
        >
          <h3 style={{ color: "#A02334", marginBottom: "10px" }}>Visualisasi Data</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="flow" stroke="#410200" name="Flow (L/min)" />
              <Line
                type="monotone"
                dataKey="pressure"
                stroke="#A02334"
                name="Pressure (PSI)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={pushData}
          style={{
            backgroundColor: "#A02334",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
         Perbarui Data
        </button>

        <button
          onClick={sendToWhatsApp}
          style={{
            backgroundColor: "#25D366",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Kirim ke WhatsApp
        </button>
      </div>

      <p style={{ marginTop: "30px", color: "#410200" }}>
        Terakhir diperbarui: {lastUpdate}
      </p>
    </main>
  );
}
