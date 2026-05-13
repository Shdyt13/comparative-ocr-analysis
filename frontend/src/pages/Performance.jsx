import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export default function Performance() {
  const [data, setData] = useState([]);
  const [showData, setShowData] = useState(false); // Tirai Panggung

  useEffect(() => {
    // Mengecek status pipeline dan mengambil data
    Promise.all([
      fetch("http://localhost:8000/metrics/by-condition").then(res => res.json()),
      fetch("http://localhost:8000/pipeline-status").then(res => res.json())
    ]).then(([resData, status]) => {
      if (resData.status === "success") {
        const raw = resData.data;
        const chartData = Object.keys(raw).map(condition => ({
          condition: condition.charAt(0).toUpperCase() + condition.slice(1), 
          Tesseract: Number((raw[condition].Tesseract * 100).toFixed(2)),
          EasyOCR: Number((raw[condition].EasyOCR * 100).toFixed(2)),
          PaddleOCR: Number((raw[condition].PaddleOCR * 100).toFixed(2)),
        }));
        setData(chartData);
      }
      // Buka tirai hanya jika pipeline sudah selesai dieksekusi
      if (status.current_step === "Selesai") {
        setShowData(true);
      }
    }).catch(err => console.error("Error fetching data:", err));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '10px', marginTop: 0 }}>Performance Analysis</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>Analisis ketahanan (robustness) metode OCR terhadap berbagai kondisi citra.</p>

      {!showData ? (
        // TAMPILAN TIRAI TERTUTUP
        <div style={{ backgroundColor: 'white', padding: '80px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px dashed #cbd5e1' }}>
          <Activity size={64} color="#cbd5e1" style={{ marginBottom: '20px', margin: '0 auto', display: 'block' }} />
          <h2 style={{ color: '#475569', marginBottom: '10px', fontSize: '1.5rem' }}>Grafik Performa Belum Tersedia</h2>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
            Data analisis performa belum dihitung. Silakan kembali ke menu <b>Dashboard</b> dan eksekusi Pipeline terlebih dahulu.
          </p>
        </div>
      ) : (
        // TAMPILAN DATA ASLI
        <div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#374151', marginBottom: '20px' }}>Tren Ketahanan Model (Lebih Rendah Lebih Baik)</h2>
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="condition" tick={{ fill: '#6b7280' }} tickMargin={10} />
                  <YAxis tick={{ fill: '#6b7280' }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} formatter={(value) => [`${value}%`, 'CER']} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="Tesseract" name="Tesseract OCR" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="EasyOCR" name="EasyOCR" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="PaddleOCR" name="PaddleOCR" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e3a8a' }}>💡 Catatan Peneliti</h3>
            <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.6' }}>Grafik ini membuktikan metode mana yang paling tangguh saat menghadapi <i>noise</i> (Blur, Gelap, Rotasi) dibandingkan citra normal.</p>
          </div>
        </div>
      )}
    </div>
  );
}