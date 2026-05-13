from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import time
import sys

# Memastikan Python bisa membaca folder src dan routes kita
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.ocr_engines import OCREngine
from api.routes import evaluate

app = FastAPI(title="OCR Research API Endpoint")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. MENYAMBUNGKAN OTAK ANALITIK (TAHAP 5) ---
# Ini akan mengaktifkan semua endpoint /metrics/... dan /insights
app.include_router(evaluate.router)

print("\n[API INFO] Mempersiapkan Mesin OCR untuk Live Test...")
engine = OCREngine()
print("[API INFO] Mesin OCR Siap Menerima Request!\n")

@app.get("/")
def read_root():
    return {"message": "API OCR Skripsi Datok - Terstruktur & Berjalan!"}


# --- 2. ENDPOINT UJI COBA LIVE (UNTUK DEMO FRONTEND) ---
@app.post("/ocr/predict")
async def predict_ocr(file: UploadFile = File(...)):
    temp_dir = "/app/data/temp"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, file.filename)

    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    response_data = {"filename": file.filename, "results": {}}
    try:
        # Eksekusi Tesseract
        start_time = time.time()
        text_tess = engine.run_tesseract(temp_file_path)
        response_data["results"]["Tesseract"] = {"text": text_tess, "time_seconds": round(time.time() - start_time, 4)}

        # Eksekusi EasyOCR
        start_time = time.time()
        text_easy = engine.run_easyocr(temp_file_path)
        response_data["results"]["EasyOCR"] = {"text": text_easy, "time_seconds": round(time.time() - start_time, 4)}

        # Eksekusi PaddleOCR
        start_time = time.time()
        text_paddle = engine.run_paddleocr(temp_file_path)
        response_data["results"]["PaddleOCR"] = {"text": text_paddle, "time_seconds": round(time.time() - start_time, 4)}
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    return response_data