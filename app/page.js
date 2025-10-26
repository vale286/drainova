"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function HomePage() {
  const [data, setData] = useState({ flow: 0, pressure: 0 });
  const [history, setHistory] = useState([]); // Simpan riwayat data
  const [lastUpdate, setLastUpdate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/data");
    const json = await res.json();

    const now = new Date().toLocaleTimeString();

    setData(json);
    setLastUpdate(now);

    // tambahkan data baru ke history (Dalam 30 data terakhir)
    setHistory((prev) => {
      const updated = [...prev, { time: now, flow: json.flow, pressure: json.pressure }];
      return updated.length > 10 ? updated.slice(-10) : updated;
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // update tiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const sendToWhatsApp = () => {
    const adminNumber = "6283896336395"; // ganti nomor admin kamu
    const message = `⚠️ Peringatan Drainova\nFlow Rate: ${data.flow} L/min\nPressure: ${data.pressure} PSI\nCek kondisi sekarang!`;
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
        padding: "20px",
        textAlign: "center",
      }}
    >
      {/* Logo Drainova */}
      <Image
        src="/Logo_Drainova.png"
        alt="Drainova Logo"
        width={120}
        height={120}
        style={{ marginBottom: "20px" }}
      />

      {/* Judul */}
      <h1
        style={{
          color: "#A02334",
          fontSize: "2.2rem",
          marginBottom: "10px",
          fontWeight: "700",
        }}
      >
        Selamat Datang di Drainova
      </h1>
      <h2 style={{ color: "#A02334", marginBottom: "30px" }}>
        IoT POME Monitoring Dashboard
      </h2>

      {/* Data Card */}
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
        <h3 style={{ color: "#A02334" }}>Flow Rate</h3>
        <p style={{ fontSize: "1.5rem", fontWeight: "600", color: "#A02334" }}>
          {data.flow.toFixed(2)} L/min
        </p>
      </div>

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
        <h3 style={{ color: "#A02334" }}>Pressure</h3>
        <p style={{ fontSize: "1.5rem", fontWeight: "600", color: "#A02334" }}>
          {data.pressure.toFixed(2)} PSI
        </p>
      </div>

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
          }}
        >
          Kirim ke WhatsApp
        </button>
      </div>

      <p style={{ marginTop: "20px", color: "#A02334" }}>
        Terakhir diperbarui: {lastUpdate}
      </p>

      {/* Chart Section */}
      <div style={{ width: "90%", maxWidth: "700px", height: "300px", marginTop: "40px" }}>
        <ResponsiveContainer>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="flow" stroke="#A02334" name="Flow (L/min)" />
            <Line type="monotone" dataKey="pressure" stroke="#A02334" name="Pressure (PSI)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
