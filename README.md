# OCR Eval-Pro: Analisis Komparatif Mesin OCR

Sistem *full-stack* untuk mengukur dan membandingkan performa tiga mesin *Optical Character Recognition* (OCR) — **Tesseract**, **EasyOCR**, dan **PaddleOCR** — dalam mengekstrak teks dari citra dokumen, lengkap dengan pipeline augmentasi citra, evaluasi metrik CER/WER, dan dashboard analitik interaktif.

Repositori ini merupakan implementasi teknis dari proyek riset/skripsi perbandingan mesin OCR.

---

## Tujuan Sistem

Mengukur ketahanan (*robustness*) tiga mesin OCR terhadap berbagai kondisi citra yang umum terjadi saat pemindaian atau pemotretan dokumen:

| Kondisi | Deskripsi | Cara disimulasikan |
|---|---|---|
| Normal | Citra asli tanpa gangguan | — |
| Blur | Kamera tidak fokus/goyang | Gaussian Blur (kernel 9x9) |
| Dark | Pencahayaan rendah | Penurunan kecerahan & kontras |
| Rotated | Dokumen miring saat difoto | Rotasi 5 derajat dengan latar putih |

Metrik yang dihitung untuk tiap kombinasi (mesin OCR x kondisi citra):

- **CER** (*Character Error Rate*)
- **WER** (*Word Error Rate*)
- **Processing Time** (waktu ekstraksi per gambar)

---

## Arsitektur Sistem

```text
┌───────────────────────────────────────────────────────────┐
│                    FRONTEND — React                        │
│   React 18 • React Router • Recharts • Vite                │
│                      Port: 5173                              │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API (fetch, JSON)
                            ▼
┌───────────────────────────────────────────────────────────┐
│                    BACKEND — FastAPI                        │
│      Python 3.10 • FastAPI • Uvicorn                        │
│                      Port: 8000                              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────┐
│                  OCR & EVALUATION PIPELINE                  │
│  1. Augmentasi Citra (Blur, Dark, Rotated)                   │
│  2. Pembangunan Metadata & Ground Truth                      │
│  3. Ekstraksi Teks: Tesseract, EasyOCR, PaddleOCR             │
│  4. Perhitungan Metrik CER & WER (via jiwer)                  │
│  5. Agregasi & Insight Otomatis                               │
└───────────────────────────────────────────────────────────┘
```

---

## Alur Pipeline Evaluasi

Pipeline offline (dijalankan sekali di awal untuk membangun dataset evaluasi):

1. **`src/augmentation.py`** — membaca gambar `*_normal.jpg` di `backend/data/02_processed/`, menghasilkan varian `_blur`, `_dark`, dan `_rotated` untuk masing-masing.
2. **`src/build_metadata.py`** — memindai seluruh gambar hasil augmentasi, mencocokkannya dengan teks acuan (*ground truth*) di `backend/data/01_raw/printed/*.txt`, lalu menulis `backend/data/metadata.csv`.
3. **`src/ocr_pipeline.py`** — menjalankan ketiga mesin OCR pada setiap gambar di `metadata.csv`, menyimpan hasil ekstraksi teks & waktu proses ke `backend/data/ocr_results.csv`.
4. **`src/evaluate_metrics.py`** — membandingkan `ocr_results.csv` dengan *ground truth*, menghitung CER/WER per baris menggunakan `jiwer`, dan menulis `backend/data/evaluation_metrics.csv`.

Dashboard memicu ulang **tahap 4** (perhitungan metrik) secara langsung melalui endpoint `/run-pipeline`; tahap 1-3 saat ini disajikan sebagai simulasi progres dari data yang sudah tersedia (lihat bagian API di bawah).

> **Cakupan dataset saat ini:** folder `backend/data/02_processed/` berisi 400 gambar (100 dokumen printed x 4 kondisi). Teks acuan untuk data *handwritten* juga tersedia di `backend/data/01_raw/handwritten/`, tetapi belum ada gambar hasil augmentasi untuk kategori ini — sehingga evaluasi yang berjalan saat ini mencakup kategori **printed** saja.

---

## API Backend (FastAPI)

Dokumentasi interaktif (Swagger UI) tersedia otomatis di `http://localhost:8000/docs`.

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/` | Health check sederhana |
| POST | `/ocr/predict` | Uji coba OCR langsung (upload 1 gambar, dijalankan pada ketiga mesin secara *live*) |
| POST | `/run-pipeline` | Memicu ulang tahap evaluasi metrik di latar belakang (*background task*) |
| GET | `/pipeline-status` | Status pipeline saat ini (`is_running`, `current_step`, `message`) |
| POST | `/reset-pipeline` | Mereset status pipeline ke kondisi awal |
| GET | `/metrics/summary` | Rata-rata CER, WER, dan waktu proses per mesin OCR |
| GET | `/metrics/by-type` | Rata-rata CER per mesin OCR, dikelompokkan berdasarkan jenis teks |
| GET | `/metrics/by-condition` | Rata-rata CER per mesin OCR, dikelompokkan berdasarkan kondisi citra (normal/blur/dark/rotated) |
| GET | `/insights` | Kesimpulan otomatis (mesin paling akurat, paling cepat, dan trade-off di antaranya) |
| GET | `/results` | Seluruh baris data evaluasi mentah dari `evaluation_metrics.csv` |

---

## Dashboard Frontend

Navigasi berbasis React Router dengan empat halaman:

| Halaman | Rute | Isi |
|---|---|---|
| Dashboard | `/` | Ringkasan performa global, tombol jalankan/reset pipeline, grafik perbandingan CER/WER |
| Performance Analysis | `/performance` | Tren ketahanan tiap mesin OCR terhadap kondisi citra (normal/blur/dark/rotated) |
| Result Visualization | `/visualization` | Tabel hasil evaluasi mentah dengan pencarian |
| Efficiency & Insights | `/efficiency` | Perbandingan rata-rata waktu proses dan kesimpulan otomatis |

Setiap halaman mengambil data langsung dari API backend (`http://localhost:8000`) menggunakan `fetch`.

---

## Struktur Proyek

```text
comparative-ocr-analysis/
├── backend/
│   ├── api/
│   │   ├── main.py                # Entry point FastAPI, endpoint /ocr/predict
│   │   └── routes/
│   │       └── evaluate.py        # Endpoint pipeline & metrik (/run-pipeline, /metrics/*, /insights, /results)
│   ├── data/
│   │   ├── 01_raw/                # Gambar & ground truth asli (printed, handwritten)
│   │   ├── 02_processed/          # Gambar hasil augmentasi (normal, blur, dark, rotated)
│   │   ├── metadata.csv           # Metadata gabungan gambar + ground truth
│   │   ├── ocr_results.csv        # Hasil ekstraksi teks mentah dari ketiga mesin OCR
│   │   ├── evaluation_metrics.csv # Metrik CER/WER/waktu per gambar per mesin (dipakai dashboard)
│   │   └── hasil_evaluasi_ocr.csv # Output dari script evaluasi lama (evaluation.py, legacy)
│   ├── src/
│   │   ├── ocr_engines.py         # Wrapper Tesseract, EasyOCR, PaddleOCR
│   │   ├── augmentation.py        # Pembuatan varian blur/dark/rotated
│   │   ├── build_metadata.py      # Penyusunan metadata.csv
│   │   ├── ocr_pipeline.py        # Ekstraksi teks massal -> ocr_results.csv
│   │   ├── evaluate_metrics.py    # Perhitungan CER/WER -> evaluation_metrics.csv (dipakai API)
│   │   └── evaluation.py          # Script evaluasi mandiri versi awal (legacy, ground truth hardcoded)
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Layout, sidebar, dan routing
│   │   ├── main.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Performance.jsx
│   │       ├── Visualization.jsx
│   │       └── Efficiency.jsx
│   ├── Dockerfile
│   └── package.json
│
├── Kalimat handwritten.txt        # Catatan/daftar kalimat acuan untuk data handwritten
├── docker-compose.yml             # Orkestrasi service backend & frontend
└── README.md
```

> **Catatan:** `src/evaluation.py` adalah versi awal script evaluasi (ground truth di-*hardcode* untuk dua file dummy) dan tidak terhubung ke API — pipeline yang aktif dipakai dashboard adalah `build_metadata.py` -> `ocr_pipeline.py` -> `evaluate_metrics.py`.

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Frontend | React 18, React Router, Vite, Recharts, Lucide Icons |
| Backend | Python 3.10, FastAPI, Uvicorn |
| OCR Engine | Tesseract OCR (`pytesseract`), EasyOCR (PyTorch), PaddleOCR |
| Pengolahan Citra | OpenCV (`opencv-python-headless`) |
| Evaluasi Teks | jiwer (CER/WER) |
| DevOps | Docker, Docker Compose |

---

## Cara Menjalankan

### Prasyarat

- Docker Desktop & Docker Compose
- Git

```bash
docker --version
docker compose version
```

### 1. Clone Repository

```bash
git clone <url-repositori-anda>
cd comparative-ocr-analysis
```

### 2. Build & Jalankan via Docker Compose

```bash
docker-compose up --build
```

Perintah ini akan membangun dan menjalankan kedua service sekaligus:

- Backend FastAPI (image berbasis `python:3.10-slim`, menginstal Tesseract + paket bahasa Indonesia via `apt-get`)
- Frontend React/Vite (image berbasis `node:20-alpine`)

### 3. Akses Sistem

| Service | URL |
|---|---|
| Frontend Dashboard | `http://localhost:5173` |
| Backend API | `http://localhost:8000` |
| Swagger API Docs | `http://localhost:8000/docs` |

### 4. Menjalankan Ulang Pipeline Evaluasi

Klik tombol jalankan pipeline pada halaman **Dashboard** — ini memanggil `POST /run-pipeline` yang mengeksekusi `src/evaluate_metrics.py` di dalam container backend dan memperbarui `evaluation_metrics.csv`. Progres dapat dipantau melalui `GET /pipeline-status`.

Untuk membangun ulang dataset dari awal (augmentasi, metadata, dan ekstraksi OCR massal), jalankan skrip berikut secara manual di dalam container backend:

```bash
docker exec -it ocr_backend bash

python src/augmentation.py
python src/build_metadata.py
python src/ocr_pipeline.py
python src/evaluate_metrics.py
```

### Menghentikan Sistem

```bash
docker-compose down
```

### Menjalankan Ulang Setelah Perubahan Kode

```bash
# Jika ada perubahan dependency/Dockerfile
docker-compose up --build

# Jika hanya perubahan kode
docker-compose restart
```

---

## Format Dataset

Gambar hasil augmentasi mengikuti pola penamaan:

```text
<tipe>_<id>_<kondisi>.<ekstensi>
# contoh: printed_001_normal.jpg, printed_001_blur.jpg
```

Ground truth disimpan sebagai file `.txt` terpisah di `backend/data/01_raw/<tipe>/`, dengan nama `<tipe>_<id>.txt` (contoh: `printed_001.txt`), berisi teks asli dari gambar yang bersangkutan.

---

## Keterbatasan yang Diketahui

1. Kategori **handwritten** memiliki ground truth teks, tetapi belum ada gambar hasil augmentasi di `02_processed/` sehingga belum ikut dievaluasi oleh pipeline saat ini.
2. URL API di setiap halaman frontend (`http://localhost:8000`) di-*hardcode*, belum menggunakan variabel lingkungan.
3. `POST /run-pipeline` hanya benar-benar mengeksekusi ulang tahap perhitungan metrik (`evaluate_metrics.py`); tahap augmentasi, pembangunan metadata, dan ekstraksi OCR ditampilkan sebagai simulasi progres dari data yang sudah ada, bukan dijalankan ulang secara live.
4. `src/evaluation.py` adalah script evaluasi versi awal dengan ground truth *hardcode* dan tidak digunakan oleh API/dashboard — dipertahankan di repositori sebagai riwayat pengembangan.
5. Semua mesin OCR berjalan pada CPU (tanpa GPU), sehingga waktu proses PaddleOCR dan EasyOCR relatif lebih lambat dibanding penggunaan dengan akselerasi GPU.

---

## Penulis

**Sapar Hidayat**
Tanjungpinang, Kepulauan Riau
Proyek Skripsi — Perbandingan Kinerja Mesin OCR

---

## Lisensi

Proyek ini dikembangkan untuk kebutuhan penelitian akademik dan skripsi.
