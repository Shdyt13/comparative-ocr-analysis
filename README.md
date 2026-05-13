# 🔍 OCR Eval-Pro: Analisis Komparatif Mesin OCR

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)

Repositori ini memuat sistem lengkap (*Backend*, *Frontend*, dan *Pipeline Evaluasi*) yang dikembangkan sebagai bagian dari penelitian skripsi untuk membandingkan performa berbagai mesin *Optical Character Recognition* (OCR) dalam mengekstrak teks dari citra.

---

# 🎯 Tujuan Penelitian

Sistem ini dirancang untuk mengukur dan membandingkan ketahanan tiga arsitektur AI OCR secara otomatis:

1. **Tesseract OCR**  
   Engine OCR klasik berbasis LSTM.

2. **EasyOCR**  
   Framework OCR modern berbasis PyTorch.

3. **PaddleOCR**  
   Sistem OCR berkinerja tinggi dari Baidu.

Metrik evaluasi yang digunakan meliputi:

- **Character Error Rate (CER)**
- **Word Error Rate (WER)**
- **Processing Time**
- **Robustness terhadap augmentasi citra**

Pipeline evaluasi menguji gambar dalam berbagai kondisi:

- Normal
- Blur
- Dark / Low Light
- Rotated

---

# 🏗️ Arsitektur Sistem

## 🔹 Frontend
- React.js
- Vite
- Recharts
- Dashboard Analitik Interaktif

## 🔹 Backend
- FastAPI (Python)
- REST API untuk evaluasi OCR dan visualisasi data

## 🔹 OCR Engines
- Tesseract OCR
- EasyOCR
- PaddleOCR

## 🔹 Infrastruktur
- Docker
- Docker Compose

---

# 📂 Struktur Proyek

```bash
ocr-skripsi-datok/
│
├── backend/
│   ├── api/
│   ├── data/
│   ├── src/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

# ⚙️ Fitur Utama

✅ Evaluasi otomatis multi-engine OCR  
✅ Perhitungan CER dan WER  
✅ Visualisasi performa OCR secara interaktif  
✅ Augmentasi dataset otomatis  
✅ Analisis robustness OCR terhadap noise  
✅ Dashboard analitik real-time  
✅ Arsitektur containerized menggunakan Docker  

---

# 🚀 Cara Menjalankan Sistem

## 📌 Persyaratan Sistem

Pastikan perangkat telah menginstal:

- Docker Desktop
- Docker Compose
- Git

Cek instalasi dengan perintah:

```bash
docker --version
docker compose version
git --version
```

---

# 🔽 1. Clone Repository

```bash
git clone https://github.com/username-anda/ocr-skripsi-datok.git
cd ocr-skripsi-datok
```

---

# 🐳 2. Build dan Jalankan Container

Jalankan seluruh sistem menggunakan Docker Compose:

```bash
docker-compose up --build
```

Atau untuk Docker Compose versi baru:

```bash
docker compose up --build
```

Perintah ini akan:

✅ Build backend FastAPI  
✅ Build frontend React  
✅ Menginstal dependency OCR  
✅ Menjalankan seluruh service otomatis  

---

# 🌐 3. Akses Sistem

Setelah container berhasil berjalan:

| Service | URL |
|---|---|
| Frontend Dashboard | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger API Docs | http://localhost:8000/docs |

---

# ▶️ 4. Menjalankan Pipeline Evaluasi OCR

Pipeline OCR dapat dijalankan melalui backend API atau langsung melalui container backend.

## Masuk ke Container Backend

```bash
docker exec -it ocr-backend bash
```

---

## Jalankan Pipeline OCR

```bash
python src/ocr_pipeline.py
```

Pipeline akan:

1. Membaca dataset gambar
2. Melakukan augmentasi citra
3. Menjalankan OCR:
   - Tesseract
   - EasyOCR
   - PaddleOCR
4. Menyimpan hasil OCR ke CSV

---

# 📊 5. Menjalankan Evaluasi Metrik

Untuk menghitung CER dan WER:

```bash
python src/evaluate_metrics.py
```

Hasil evaluasi akan disimpan ke:

```bash
backend/data/evaluation_metrics.csv
```

---

# 📈 6. Melihat Dashboard Analitik

Buka browser:

```bash
http://localhost:5173
```

Dashboard akan menampilkan:

- Perbandingan CER
- Perbandingan WER
- Analisis kecepatan OCR
- Grafik robustness
- Ranking performa OCR

---

# 🛑 Menghentikan Sistem

Tekan:

```bash
CTRL + C
```

Lalu hentikan container:

```bash
docker-compose down
```

---

# 🔄 Menjalankan Ulang Setelah Perubahan Kode

Jika ada perubahan dependency atau Dockerfile:

```bash
docker-compose up --build
```

Jika hanya perubahan kode biasa:

```bash
docker-compose restart
```

---

# 🧪 Metodologi Evaluasi

Pipeline sistem bekerja dengan tahapan berikut:

1. Memuat dataset gambar dan ground truth
2. Melakukan augmentasi citra
3. Menjalankan OCR menggunakan:
   - Tesseract
   - EasyOCR
   - PaddleOCR
4. Menghitung:
   - CER
   - WER
   - Waktu komputasi
5. Menyimpan hasil evaluasi ke CSV
6. Memvisualisasikan hasil pada dashboard

---

# 📈 Dashboard Analitik

Dashboard frontend menyediakan visualisasi:

- Perbandingan CER antar OCR
- Perbandingan WER antar OCR
- Analisis kecepatan komputasi
- Grafik robustness terhadap blur/dark/rotation
- Ranking performa OCR

---

# 🧪 Dataset & Augmentasi

Dataset dibagi menjadi dua kategori:

## ✍️ Handwritten
Teks tulisan tangan.

## 🖨️ Printed
Teks hasil cetakan.

Setiap gambar diuji dengan beberapa augmentasi:

| Augmentasi | Deskripsi |
|---|---|
| Normal | Tanpa perubahan |
| Blur | Simulasi gambar buram |
| Dark | Simulasi pencahayaan rendah |
| Rotated | Simulasi rotasi dokumen |

---

# 🐳 Teknologi yang Digunakan

| Teknologi | Fungsi |
|---|---|
| FastAPI | Backend API |
| React.js | Frontend Dashboard |
| Recharts | Visualisasi Grafik |
| Docker | Containerization |
| Tesseract | OCR Engine |
| EasyOCR | OCR Engine |
| PaddleOCR | OCR Engine |

---

# 🧠 Insight Penelitian

Sistem ini membantu menghasilkan insight otomatis mengenai:

- OCR paling akurat
- OCR paling cepat
- OCR paling tahan terhadap noise
- Pengaruh augmentasi terhadap performa OCR

---

# 📝 Format Commit Profesional

Gunakan gaya commit berbasis **Semantic Commit Message**.

## ✨ Feature Baru
```bash
feat: menambahkan endpoint kalkulasi CER dan WER
```

## 🐛 Perbaikan Bug
```bash
fix: memperbaiki error parsing hasil OCR PaddleOCR
```

## 📚 Dokumentasi
```bash
docs: memperbarui struktur README dan arsitektur sistem
```

## ⚙️ Konfigurasi / Maintenance
```bash
chore: menambahkan docker-compose dan konfigurasi environment
```

---

# 👨‍💻 Developer

**Sapar Hidayat**  
*(Datok Tanjak Kuneng Laot)*

📍 Tanjungpinang, Kepulauan Riau  
🎓 Proyek Skripsi  

---

# 📜 Lisensi

Proyek ini dikembangkan untuk kebutuhan penelitian akademik dan skripsi.

---