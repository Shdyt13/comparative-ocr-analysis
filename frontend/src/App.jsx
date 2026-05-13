import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Eye, Zap } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Performance from './pages/Performance';
import Visualization from './pages/Visualization';
import Efficiency from './pages/Efficiency';

// Komponen navigasi Sidebar (Internal)
function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/performance', icon: <BarChart2 size={20} />, label: 'Performance Analysis' },
    { path: '/visualization', icon: <Eye size={20} />, label: 'Result Visualization' },
    { path: '/efficiency', icon: <Zap size={20} />, label: 'Efficiency & Insights' },
  ];

  return (
    <div style={{ width: '260px', backgroundColor: '#1e293b', color: 'white', minHeight: '100vh', padding: '20px 0', position: 'fixed' }}>
      <div style={{ padding: '0 20px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>OCR Eval-Pro</h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '5px 0 0 0' }}>Sistem Skripsi Datok</p>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 10px' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', 
                borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s',
                backgroundColor: isActive ? '#334155' : 'transparent',
                color: isActive ? '#38bdf8' : '#cbd5e1',
                fontWeight: isActive ? 'bold' : 'normal'
              }}
            >
              {item.icon} {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Cangkang Utama
function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
        <Sidebar />
        {/* AREA KONTEN UTAMA YANG SUDAH DIKUNCI LEBARNYA */}
        <div style={{ 
          marginLeft: '260px', 
          flex: 1, 
          padding: '40px',
          maxWidth: 'calc(100vw - 260px)', /* Mencegah konten mendesak layar */
          boxSizing: 'border-box',
          overflowX: 'hidden' /* Melarang halaman meluber ke samping */
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/performance" element={<Performance />} /> 

            <Route path="/visualization" element={<Visualization />} />
            <Route path="/efficiency" element={<Efficiency />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;