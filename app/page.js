"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  query,
  limitToLast
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

// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyBV_YFBsc0d0H33pMrN6_v91yfR3rib4Zg",
  authDomain: "drainova-90467.firebaseapp.com",
  databaseURL: "https://drainova-90467-default-rtdb.asia-southeast1.firebasedatabase.app/",
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
  const [loading, setLoading] = useState(false);

  // === Ambil data realtime dari RTDB ===
  useEffect(() => {
    const q = query(ref(db, "sensorData/history"), limitToLast(10));
    const unsub = onValue(q, (snapshot) => {
      const dataObj = snapshot.val();
      if (dataObj) {
        const dataList = Object.values(dataObj);
        const latest = dataList[dataList.length - 1];
        updateDashboard(latest);
        setHistory(dataList);
      }
    });
    return () => unsub();
  }, []);

  const updateDashboard = (val) => {
    setData({ flow: val.flow, pressure: val.pressure });
    setLastUpdate(
      new Date(val.time).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/data");
      const json = await res.json();
      updateDashboard(json);
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.pressure > 60 || data.flow > 30) setStatus("🔴 Bahaya");
    else if (data.pressure > 45 || data.flow > 20) setStatus("🟠 Warning");
    else setStatus("🟢 Normal");
  }, [data]);

  useEffect(() => {
    if (history.length < 2) return;
    const avgFlow = history.reduce((a, b) => a + b.flow, 0) / history.length;
    const avgPressure =
      history.reduce((a, b) => a + b.pressure, 0) / history.length;
    setPrediction({
      flow: avgFlow.toFixed(2),
      pressure: avgPressure.toFixed(2),
    });
  }, [history]);

  useEffect(() => {
    if (data.pressure <= 45 && data.flow <= 20)
      setInsight("Aliran stabil dan tekanan normal ✅");
    else if (data.pressure <= 60 && data.flow <= 30)
      setInsight("Tekanan mulai meningkat ⚠️ Periksa filter atau pompa.");
    else
      setInsight("Tekanan tinggi! 🚨 Kemungkinan sumbatan atau overpressure.");
  }, [data]);

  const sendToWhatsApp = () => {
    const adminNumber = "6283896336395";
    const message = `📡 Drainova Alert
Status: ${status}
Flow Rate: ${data.flow.toFixed(2)} L/min
Pressure: ${data.pressure.toFixed(2)} PSI
Prediksi Tekanan: ${prediction.pressure} PSI
Insight: ${insight}`;
    const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  return (
    <main style={styles.main}>
      <Image
        src="/Logo_Drainova.png"
        alt="Drainova Logo"
        width={120}
        height={120}
        style={{ marginBottom: "20px" }}
      />

      <h1 style={styles.title}>Selamat Datang di Drainova</h1>
      <h2 style={styles.subtitle}>IoT POME Monitoring Dashboard</h2>

      <div style={styles.card}>
        <h3 style={{ color: "#000000" }}>Status</h3>
        <p
          style={{
            fontSize: "1.5rem",
            color: status.includes("Bahaya")
              ? "red"
              : status.includes("Warning")
              ? "orange"
              : "green",
          }}
        >
          {status}
        </p>
        <p style={{ color: "#000000" }}>{insight}</p>
      </div>

      <div style={styles.card}>
        <h3 style={{ color: "#000000" }}>Flow Rate</h3>
        <p style={{ fontSize: "1.5rem", color: "#A02334" }}>
          {data.flow.toFixed(2)} L/min
        </p>
        <p style={{ color: "#000000" }}>
          Prediksi Tekanan: {prediction.flow} L/min
        </p>
      </div>

      <div style={styles.card}>
        <h3 style={{ color: "#000000" }}>Pressure</h3>
        <p style={{ fontSize: "1.5rem", color: "#A02334" }}>
          {data.pressure.toFixed(2)} PSI
        </p>
        <p style={{ color: "#000000" }}>
          Prediksi Tekanan Selanjutnya: {prediction.pressure} PSI
        </p>
      </div>

      {history.length > 0 && (
        <div style={styles.chartCard}>
          <h3 style={{ color: "#000000" }}>
            Visualisasi Data (Format Waktu WIB)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(timeStr) => {
                  const date = new Date(timeStr);
                  return date.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "Asia/Jakarta",
                  });
                }}
                stroke="#000000"
              />
              <YAxis stroke="#000000" />
              <Tooltip
                contentStyle={{ color: "#000000" }}
                formatter={(value, name) => [
                  `${value.toFixed ? value.toFixed(2) : value}`,
                  name === "flow" ? "Flow (L/min)" : "Pressure (PSI)",
                ]}
                labelFormatter={(timeStr) => {
                  if (!timeStr) return "-";
                  const parsed = new Date(timeStr);
                  if (isNaN(parsed.getTime())) return "-";
                  return parsed.toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="flow"
                stroke="#410200"
                name="Flow (L/min)"
              />
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

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={refreshData} style={styles.buttonRed} disabled={loading}>
          {loading ? "Memuat..." : "Perbarui Data"}
        </button>
        <button onClick={sendToWhatsApp} style={styles.buttonGreen}>
          Kirim ke WhatsApp
        </button>
      </div>

      <p style={{ marginTop: "20px", color: "#000000" }}>
        Terakhir diperbarui: {lastUpdate}
      </p>
    </main>
  );
}

// === Styles ===
const styles = {
  main: {
    background: "linear-gradient(135deg, #FFEEAD 0%, #FFD6A5 50%, #A02334 100%)",
    minHeight: "100vh",
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    textAlign: "center",
  },
  title: { color: "#A02334", fontSize: "2.2rem", fontWeight: "700" },
  subtitle: { color: "#A02334", marginBottom: "30px" },
  card: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "20px",
    width: "300px",
    marginBottom: "20px",
  },
  chartCard: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "20px",
    width: "90%",
    maxWidth: "700px",
    marginBottom: "30px",
  },
  buttonRed: {
    backgroundColor: "#A02334",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  buttonGreen: {
    backgroundColor: "#25D366",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
