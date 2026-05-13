import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Clock, AlertTriangle, PlayCircle, Loader2, Database, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  
  // Trik Mode Presentasi: State ini bertindak sebagai "Tirai Panggung"
  const [showData, setShowData] = useState(false); 
  
  const [pipelineStatus, setPipelineStatus] = useState({ is_running: false, current_step: 'Idle', message: 'Sistem siap menerima dataset.' });

  // Fungsi memuat data metrik dari Backend
  const fetchMetrics = () => {
    fetch("http://localhost:8000/metrics/summary")
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          const chartData = [
            { name: 'Tesseract', CER: data.data.Tesseract.avg_cer * 100, WER: data.data.Tesseract.avg_wer * 100, Time: data.data.Tesseract.avg_time },
            { name: 'EasyOCR', CER: data.data.EasyOCR.avg_cer * 100, WER: data.data.EasyOCR.avg_wer * 100, Time: data.data.EasyOCR.avg_time },
            { name: 'PaddleOCR', CER: data.data.PaddleOCR.avg_cer * 100, WER: data.data.PaddleOCR.avg_wer * 100, Time: data.data.PaddleOCR.avg_time },
          ];
          setData(chartData);
          setShowData(true); // <--- BUKA TIRAI PANGGUNG!
        }
      })
      .catch(err => console.error("Error fetching data:", err));
  };

  useEffect(() => {
    // KITA TIDAK LAGI MEMANGGIL fetchMetrics() SAAT HALAMAN PERTAMA DIBUKA
    
    const interval = setInterval(() => {
      fetch("http://localhost:8000/pipeline-status")
        .then(res => res.json())
        .then(status => {
          setPipelineStatus(status);
          
          // Data HANYA akan dipanggil saat proses simulasi benar-benar selesai
          if (status.current_step === "Selesai" && pipelineStatus.is_running === true) {
             fetchMetrics();
          }
        })
        .catch(err => console.error("Gagal mengambil status:", err));
    }, 2000); // Dipercepat menjadi 2 detik agar lebih responsif

    return () => clearInterval(interval);
  }, [pipelineStatus.is_running]);

  const handleRunPipeline = () => {
    if(window.confirm("Mulai proses ekstraksi dan evaluasi ratusan gambar OCR?")) {
      // Pastikan tirai tertutup saat tombol ditekan
      setShowData(false); 
      
      fetch("http://localhost:8000/run-pipeline", { method: 'POST' })
        .then(res => res.json())
        .then(res => {
          if(res.status === "success") {
             setPipelineStatus({...pipelineStatus, is_running: true});
          }
        });
    }
  };

  // Fungsi Reset untuk mengembalikan ke tampilan awal (Idle)
  const handleReset = () => {
    fetch("http://localhost:8000/reset-pipeline", { method: 'POST' })
      .then(res => res.json())
      .then(res => {
        if(res.status === "success") {
           // Tutup kembali tirai panggung
           setShowData(false);
           setPipelineStatus({ is_running: false, current_step: 'Idle', message: 'Sistem siap menerima dataset.' });
        }
      });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '10px', marginTop: 0 }}>Dashboard Overview</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Ringkasan evaluasi performa citra (Normal + Augmentasi).</p>
        </div>
        
        {/* PANEL KENDALI PIPELINE */}
        <div style={{ backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', minWidth: '350px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold', color: '#334155' }}>Control Center</span>
            {pipelineStatus.is_running ? 
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 'bold' }}><Loader2 size={16} className="lucide-spin" /> Sedang Berjalan</span> : 
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>Status: Ready</span>
            }
          </div>
          
          {/* Dua Tombol Berdampingan */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleRunPipeline}
              disabled={pipelineStatus.is_running}
              style={{ 
                flex: 1, padding: '10px', backgroundColor: pipelineStatus.is_running ? '#cbd5e1' : '#2563eb', 
                color: 'white', border: 'none', borderRadius: '6px', cursor: pipelineStatus.is_running ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: 'background 0.2s'
              }}
            >
              <PlayCircle size={18} /> {pipelineStatus.is_running ? 'Memproses Sistem...' : 'Mulai Eksekusi Pipeline'}
            </button>
            
            {/* TOMBOL RESET */}
            <button 
              onClick={handleReset}
              disabled={pipelineStatus.is_running}
              style={{ 
                padding: '10px 15px', backgroundColor: pipelineStatus.is_running ? '#f1f5f9' : '#f8fafc', 
                color: pipelineStatus.is_running ? '#cbd5e1' : '#64748b', border: '1px solid #cbd5e1', 
                borderRadius: '6px', cursor: pipelineStatus.is_running ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s'
              }}
              title="Reset Tampilan (Kembali ke Awal)"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          
          {/* Teks Status Live */}
          <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#64748b', minHeight: '20px', fontStyle: 'italic' }}>
            {pipelineStatus.is_running ? `Memproses: ${pipelineStatus.current_step}` : pipelineStatus.message}
          </div>
        </div>
      </div>

      {/* --- BAGIAN TIRAI PANGGUNG (3 KONDISI) --- */}
      {!showData ? (
        pipelineStatus.is_running ? (
          
          // KONDISI 2: SEDANG MEMPROSES (ANIMASI LOADING RAKSASA)
          <div style={{ backgroundColor: '#eff6ff', padding: '80px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px solid #3b82f6', marginTop: '20px', transition: 'all 0.3s' }}>
            <Loader2 size={80} color="#2563eb" className="lucide-spin" style={{ marginBottom: '20px', margin: '0 auto', display: 'block' }} />
            <h2 style={{ color: '#1e40af', marginBottom: '15px', fontSize: '1.8rem' }}>Mengeksekusi Pipeline OCR...</h2>
            
            {/* Teks Proses Live yang Berubah-ubah */}
            <div style={{ backgroundColor: '#dbeafe', padding: '15px', borderRadius: '8px', display: 'inline-block', border: '1px solid #bfdbfe' }}>
              <p style={{ color: '#2563eb', margin: 0, fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                {pipelineStatus.current_step}
              </p>
            </div>
            <p style={{ color: '#60a5fa', marginTop: '20px', fontStyle: 'italic', fontSize: '0.9rem' }}>Mohon tunggu, mensimulasikan pembacaan karakter...</p>
          </div>

        ) : (

          // KONDISI 1: IDLE (LAYAR KOSONG SEBELUM DIMULAI)
          <div style={{ backgroundColor: 'white', padding: '80px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px dashed #cbd5e1', marginTop: '20px' }}>
            <Database size={64} color="#cbd5e1" style={{ marginBottom: '20px', margin: '0 auto', display: 'block' }} />
            <h2 style={{ color: '#475569', marginBottom: '10px', fontSize: '1.5rem' }}>Ruang Analitik Belum Dieksekusi</h2>
            <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
              Sistem menunggu instruksi. Silakan tekan tombol <b>"Mulai Eksekusi Pipeline"</b> di sudut kanan atas untuk menyimulasikan pembacaan mesin OCR pada seluruh dataset gambar secara otomatis.
            </p>
          </div>

        )
      ) : (

        // KONDISI 3: SELESAI (MENAMPILKAN GRAFIK ASLI)
        <div>
          {/* Kartu Ringkasan Atas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px', marginTop: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', marginBottom: '10px' }}><Activity size={20} style={{ marginRight: '8px' }}/> Akurasi Terbaik (CER)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>PaddleOCR</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', marginBottom: '10px' }}><AlertTriangle size={20} style={{ marginRight: '8px' }}/> Akurasi Kata (WER) Terbaik</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Tesseract</div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', marginBottom: '10px' }}><Clock size={20} style={{ marginRight: '8px' }}/> Waktu Tercepat</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Tesseract</div>
            </div>
          </div>

          {/* Grafik Batang */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#374151', marginBottom: '20px' }}>Perbandingan Error Rate (%) - Lebih Rendah Lebih Baik</h2>
            <div style={{ width: '100%', height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="CER" name="Character Error Rate (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="WER" name="Word Error Rate (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      )}
    </div>
  );
}