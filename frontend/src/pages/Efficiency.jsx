import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lightbulb, Clock, CheckCircle, Zap } from 'lucide-react';

export default function Efficiency() {
  const [timeData, setTimeData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [showData, setShowData] = useState(false); // Tirai Panggung

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/metrics/summary").then(res => res.json()),
      fetch("http://localhost:8000/insights").then(res => res.json()),
      fetch("http://localhost:8000/pipeline-status").then(res => res.json())
    ]).then(([summaryRes, insightsRes, status]) => {
      if (summaryRes.status === "success") {
        const raw = summaryRes.data;
        setTimeData([{ name: 'Tesseract', Waktu: raw.Tesseract.avg_time }, { name: 'EasyOCR', Waktu: raw.EasyOCR.avg_time }, { name: 'PaddleOCR', Waktu: raw.PaddleOCR.avg_time }]);
      }
      if (insightsRes.status === "success") {
        setInsights(insightsRes.data);
      }
      if (status.current_step === "Selesai") {
        setShowData(true);
      }
    }).catch(err => console.error("Error fetching efficiency data:", err));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '10px', marginTop: 0 }}>Efficiency & Insights</h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>Analisis perbandingan waktu komputasi dan kesimpulan otomatis.</p>

      {!showData ? (
        // TAMPILAN TIRAI TERTUTUP
        <div style={{ backgroundColor: 'white', padding: '80px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px dashed #cbd5e1' }}>
          <Zap size={64} color="#cbd5e1" style={{ marginBottom: '20px', margin: '0 auto', display: 'block' }} />
          <h2 style={{ color: '#475569', marginBottom: '10px', fontSize: '1.5rem' }}>Insight Belum Dibuat</h2>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
            Sistem belum memiliki data untuk mengambil kesimpulan. Silakan kembali ke menu <b>Dashboard</b> dan eksekusi Pipeline terlebih dahulu.
          </p>
        </div>
      ) : (
        // TAMPILAN DATA ASLI
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
          <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#374151', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={20} color="#f59e0b" /> Rata-Rata Waktu Proses (Detik)</h2>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" unit="s" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value} detik`, 'Waktu Proses']} />
                  <Bar dataKey="Waktu" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#374151', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lightbulb size={20} color="#3b82f6" /> Kesimpulan Otomatis (Auto-Insights)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {insights.map((insight, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}