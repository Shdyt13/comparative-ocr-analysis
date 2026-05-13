from fastapi import APIRouter, BackgroundTasks
import csv
import os
import subprocess
import time
from collections import defaultdict

router = APIRouter()

CSV_PATH = "/app/data/evaluation_metrics.csv"

# =====================================================
# VARIABEL GLOBAL STATUS PIPELINE
# =====================================================
pipeline_status = {
    "is_running": False,
    "current_step": "Idle",
    "message": "Sistem siap."
}

# =====================================================
# UTIL
# =====================================================
def get_eval_data():
    if not os.path.exists(CSV_PATH):
        return []
    with open(CSV_PATH, mode="r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


# =====================================================
# PIPELINE BACKGROUND TASK (SIMULASI + LIVE)
# =====================================================
def run_full_pipeline():
    global pipeline_status
    pipeline_status["is_running"] = True

    try:
        # -------------------------------------------------
        # TAHAP 1 – 3 (SIMULASI / CACHE)
        # -------------------------------------------------
        pipeline_status["current_step"] = (
            "Tahap 1: Augmentasi Citra (Blur, Dark, Rotated) "
            "(Memuat dari Cache)"
        )
        time.sleep(2)

        pipeline_status["current_step"] = (
            "Tahap 2: Membangun Ulang Metadata "
            "(Memuat dari Cache)"
        )
        time.sleep(1.5)

        pipeline_status["current_step"] = (
            "Tahap 3: Ekstraksi Teks OCR "
            "(Mengambil hasil tersimpan)"
        )
        time.sleep(3)

        # -------------------------------------------------
        # TAHAP 4 (EKSEKUSI NYATA)
        # -------------------------------------------------
        pipeline_status["current_step"] = (
            "Tahap 4: Menghitung Metrik CER & WER secara langsung..."
        )
        subprocess.run(
            ["python", "/app/src/evaluate_metrics.py"],
            check=True
        )

        pipeline_status["current_step"] = "Selesai"
        pipeline_status["message"] = (
            "Simulasi Pipeline Berhasil! "
            "Grafik dan metrik telah diperbarui."
        )

    except Exception as e:
        pipeline_status["current_step"] = "Error"
        pipeline_status["message"] = f"Terjadi kesalahan: {str(e)}"

    finally:
        pipeline_status["is_running"] = False


# =====================================================
# ENDPOINT PIPELINE (UNTUK UI)
# =====================================================
@router.post("/run-pipeline")
def trigger_pipeline(background_tasks: BackgroundTasks):
    """Memicu pipeline OCR berjalan di latar belakang."""
    global pipeline_status

    if pipeline_status["is_running"]:
        return {
            "status": "error",
            "message": "Pipeline sedang berjalan. Silakan tunggu hingga selesai."
        }

    background_tasks.add_task(run_full_pipeline)
    return {
        "status": "success",
        "message": "Pipeline OCR telah dimulai di latar belakang."
    }


@router.get("/pipeline-status")
def get_pipeline_status():
    """Mengirim status pipeline terkini ke Frontend."""
    return pipeline_status

@router.post("/reset-pipeline")
def reset_pipeline():
    """Mereset status pipeline untuk keperluan demonstrasi berulang."""
    global pipeline_status
    pipeline_status["is_running"] = False
    pipeline_status["current_step"] = "Idle"
    pipeline_status["message"] = "Sistem siap menerima dataset."
    return {"status": "success", "message": "Tampilan aplikasi berhasil di-reset."}

# =====================================================
# ENDPOINT ANALISIS & VISUALISASI
# =====================================================
@router.get("/metrics/summary")
def get_global_summary():
    """Menghitung ringkasan performa global tiap metode."""
    data = get_eval_data()
    if not data:
        return {"status": "error", "message": "Data evaluasi belum tersedia."}

    stats = defaultdict(lambda: {
        "cer": 0.0,
        "wer": 0.0,
        "time": 0.0,
        "count": 0
    })

    for row in data:
        m = row["method"]
        stats[m]["cer"] += float(row["cer"])
        stats[m]["wer"] += float(row["wer"])
        stats[m]["time"] += float(row["processing_time"])
        stats[m]["count"] += 1

    summary = {}
    for m, v in stats.items():
        cnt = v["count"]
        summary[m] = {
            "avg_cer": round(v["cer"] / cnt, 4),
            "avg_wer": round(v["wer"] / cnt, 4),
            "avg_time": round(v["time"] / cnt, 4),
            "total_images": cnt
        }

    return {"status": "success", "data": summary}


@router.get("/metrics/by-type")
def get_metrics_by_type():
    """Analisis performa berdasarkan jenis teks (Cetak vs Tulisan Tangan)."""
    data = get_eval_data()
    stats = defaultdict(lambda: defaultdict(lambda: {"cer": 0.0, "count": 0}))

    for row in data:
        t = row["type"]
        m = row["method"]
        stats[t][m]["cer"] += float(row["cer"])
        stats[t][m]["count"] += 1

    result = {}
    for text_type, methods in stats.items():
        result[text_type] = {}
        for m, v in methods.items():
            result[text_type][m] = round(v["cer"] / v["count"], 4)

    return {"status": "success", "data": result}


@router.get("/metrics/by-condition")
def get_metrics_by_condition():
    """Analisis ketahanan metode terhadap kondisi citra."""
    data = get_eval_data()
    stats = defaultdict(lambda: defaultdict(lambda: {"cer": 0.0, "count": 0}))

    for row in data:
        c = row["condition"]
        m = row["method"]
        stats[c][m]["cer"] += float(row["cer"])
        stats[c][m]["count"] += 1

    result = {}
    for condition, methods in stats.items():
        result[condition] = {}
        for m, v in methods.items():
            result[condition][m] = round(v["cer"] / v["count"], 4)

    return {"status": "success", "data": result}


@router.get("/insights")
def get_automatic_insights():
    """Merumuskan kesimpulan otomatis dari hasil evaluasi."""
    data = get_eval_data()
    if not data:
        return {"status": "error"}

    stats = defaultdict(lambda: {"cer": 0.0, "time": 0.0, "count": 0})

    for row in data:
        m = row["method"]
        stats[m]["cer"] += float(row["cer"])
        stats[m]["time"] += float(row["processing_time"])
        stats[m]["count"] += 1

    best_accuracy = min(
        stats.keys(),
        key=lambda k: stats[k]["cer"] / stats[k]["count"]
    )
    best_speed = min(
        stats.keys(),
        key=lambda k: stats[k]["time"] / stats[k]["count"]
    )

    insights = [
        f"Metode dengan akurasi tertinggi (CER terendah) adalah {best_accuracy}.",
        f"Metode dengan waktu pemrosesan tercepat adalah {best_speed}.",
        (
            "Terdapat trade-off antara akurasi dan kecepatan komputasi."
            if best_accuracy != best_speed
            else "Metode ini unggul baik dari sisi akurasi maupun kecepatan."
        )
    ]

    return {"status": "success", "data": insights}


@router.get("/results")
def get_all_results():
    """Menyajikan seluruh data evaluasi mentah."""
    return {"status": "success", "data": get_eval_data()}