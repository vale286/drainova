"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
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

export default function HomePage() {
  const [data, setData] = useState({ flow: 0, pressure: 0 });
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("🟢 Normal");
  const [prediction, setPrediction] = useState({ flow: 0, pressure: 0 });
  const [lastUpdate, setLastUpdate] = useState("");
  const [loading, setLoading] = useState(false);

  // Ambil data dari API
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data");
      const json = await res.json();

      setData(json);
      setHistory((prev) => {
        const updated = [
          ...prev,
          {
            ...json,
            time: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          },
        ].slice(-10);
        return updated;
      });
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Status otomatis
  useEffect(() => {
    if (data.pressure > 60 || data.flow > 30) {
      setStatus("🔴 Bahaya");
    } else if (data.pressure > 45 || data.flow > 20) {
      setStatus("🟠 Warning");
    } else {
      setStatus("🟢 Normal");
    }
  }, [data]);

  // Prediksi sederhana (Moving Average)
  useEffect(() => {
    if (history.length >= 2) {
      const avgFlow = history.reduce((sum, d) => sum + d.flow, 0) / history.length;
      const avgPressure =
        history.reduce((sum, d) => sum + d.pressure, 0) / history.length;
      setPrediction({
        flow: avgFlow.toFixed(2),
        pressure: avgPressure.toFixed(2),
      });
    }
  }, [history]);

  // Fetch data otomatis saat halaman dibuka dan setiap 30 detik
  useEffect(() => {
    fetchData(); // langsung ambil data saat pertama kali dibuka
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tombol WhatsApp
  const sendToWhatsApp = () => {
    const adminNumber = "6283896336395";
    const message = `⚠️ Peringatan Drainova\nStatus: ${status}\nFlow Rate: ${data.flow.toFixed(
      2
    )} L/min\nPressure: ${data.pressure.toFixed(
      2
    )} PSI\nPrediksi Tekanan: ${prediction.pressure} PSI`;
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

      <h1 style={{ color: "#A02334", fontSize: "2.2rem", marginBottom: "10px", fontWeight: "700" }}>
        Selamat Datang di Drainova
      </h1>
      <h2 style={{ color: "#A02334", marginBottom: "40px" }}>
        IoT POME Monitoring Dashboard
      </h2>

      {/* Status */}
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
      </div>

      {/* Flow */}
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
        <p style={{ color: "#777" }}>
          Prediksi: {prediction.flow} L/min (30 detik berikutnya)
        </p>
      </div>

      {/* Pressure */}
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
        <p style={{ color: "#777" }}>
          Prediksi: {prediction.pressure} PSI (30 detik berikutnya)
        </p>
      </div>

      {/* Chart */}
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
          <h3 style={{ color: "#A02334", marginBottom: "10px", textAlign: "center" }}>
            Visualisasi Data
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="flow"
                stroke="#410200"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Flow (L/min)"
              />
              <Line
                type="monotone"
                dataKey="pressure"
                stroke="#A02334"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Pressure (PSI)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tombol */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            backgroundColor: "#A02334",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "1rem",
          }}
        >
          {loading ? "Mengambil Data..." : "Perbarui Data"}
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
            fontSize: "1rem",
          }}
        >
          Kirim ke WhatsApp
        </button>
      </div>

      <p style={{ marginTop: "30px", color: "#A02334" }}>
        Terakhir diperbarui: {lastUpdate}
      </p>
    </main>
  );
}
