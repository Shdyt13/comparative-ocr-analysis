import { useState, useEffect } from 'react';
import { Search, FileSearch } from 'lucide-react';

export default function Visualization() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showData, setShowData] = useState(false); // Tirai Panggung

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/results").then(res => res.json()),
      fetch("http://localhost:8000/pipeline-status").then(res => res.json())
    ]).then(([resData, status]) => {
      if (resData.status === "success") {
        const rawData = resData.data;
        const grouped = {};
        rawData.forEach(item => {
          if (!grouped[item.image_id]) {
            grouped[item.image_id] = {
              id: item.image_id, condition: item.condition, truth: item.ground_truth,
              Tesseract: { text: '-', cer: 0 }, EasyOCR: { text: '-', cer: 0 }, PaddleOCR: { text: '-', cer: 0 }
            };
          }
          if (grouped[item.image_id][item.method]) {
            grouped[item.image_id][item.method] = { text: item.extracted_text, cer: parseFloat(item.cer) };
          }
        });
        setData(Object.values(grouped));
      }
      if (status.current_step === "Selesai") {
        setShowData(true);
      }
    }).catch(err => console.error("Error fetching data:", err));
  }, []);

  const filteredData = data.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) || item.truth.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <div style={{ flexShrink: 0 }}>
        <h1 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '10px', marginTop: 0 }}>Result Visualization</h1>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>Rincian perbandingan ekstraksi teks per citra.</p>
        
        {showData && (
          <div style={{ marginBottom: '20px', position: 'relative', maxWidth: '400px' }}>
            <div style={{ position: 'absolute', top: '10px', left: '12px', color: '#9ca3af' }}><Search size={20} /></div>
            <input type="text" placeholder="Cari ID gambar atau teks asli..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}/>
          </div>
        )}
      </div>

      {!showData ? (
        // TAMPILAN TIRAI TERTUTUP
        <div style={{ backgroundColor: 'white', padding: '80px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '2px dashed #cbd5e1', flex: 1 }}>
          <FileSearch size={64} color="#cbd5e1" style={{ marginBottom: '20px', margin: '0 auto', display: 'block' }} />
          <h2 style={{ color: '#475569', marginBottom: '10px', fontSize: '1.5rem' }}>Tabel Visualisasi Belum Tersedia</h2>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
            Belum ada gambar yang diekstraksi. Silakan kembali ke menu <b>Dashboard</b> dan eksekusi Pipeline terlebih dahulu.
          </p>
        </div>
      ) : (
        // TAMPILAN DATA ASLI
        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'auto' }}>
          <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', color: '#475569', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', width: '15%' }}>ID Gambar</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', width: '25%' }}>Ground Truth (Asli)</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', width: '20%' }}>Tesseract OCR</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', width: '20%' }}>EasyOCR</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #e2e8f0', width: '20%' }}>PaddleOCR</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '15px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{item.id}</div>
                    <div style={{ fontSize: '0.8rem', backgroundColor: '#e2e8f0', display: 'inline-block', padding: '2px 8px', borderRadius: '12px', marginTop: '5px', color: '#475569' }}>{item.condition}</div>
                  </td>
                  <td style={{ padding: '15px', verticalAlign: 'top', color: '#334155', fontStyle: 'italic' }}>{item.truth}</td>
                  {['Tesseract', 'EasyOCR', 'PaddleOCR'].map(engine => {
                    const engineData = item[engine];
                    const hasError = engineData.cer > 0;
                    return (
                      <td key={engine} style={{ padding: '15px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: hasError ? '#fee2e2' : '#dcfce3', color: hasError ? '#dc2626' : '#16a34a' }}>
                            CER: {(engineData.cer * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ color: hasError ? '#b91c1c' : '#15803d', wordBreak: 'break-word' }}>{engineData.text || <span style={{ color: '#cbd5e1' }}>(Kosong)</span>}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}