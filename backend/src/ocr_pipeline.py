import os
import csv
import time
from ocr_engines import OCREngine
import warnings

# Mengabaikan warning bawaan dari library agar terminal tetap bersih
warnings.filterwarnings('ignore')

class OCRPipeline:
    def __init__(self):
        print("[INFO] Memanaskan Mesin AI OCR (Tesseract, EasyOCR, PaddleOCR)...")
        self.engine = OCREngine()
        self.metadata_file = "/app/data/metadata.csv"
        self.results_file = "/app/data/ocr_results.csv"

    def run(self):
        print("\n[INFO] Memulai Pipeline Ekstraksi OCR...")
        
        # 1. Membaca Metadata
        if not os.path.exists(self.metadata_file):
            print(f"[ERROR] Metadata tidak ditemukan di {self.metadata_file}")
            return

        metadata = []
        with open(self.metadata_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            metadata = list(reader)

        if not metadata:
            print("[ERROR] Metadata kosong.")
            return

        # 2. Menyiapkan File Output
        # Sesuai Master Plan: image_id, method, extracted_text, processing_time
        headers = ['image_id', 'method', 'extracted_text', 'processing_time']
        
        with open(self.results_file, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)

            total_images = len(metadata)
            
            # 3. Proses Ekstraksi Iteratif
            for idx, row in enumerate(metadata, 1):
                img_id = row['image_id']
                img_path = row['image_path']
                
                print(f"[{idx}/{total_images}] Mengekstrak citra: {img_id} ...", end="", flush=True)

                if not os.path.exists(img_path):
                    print(" [GAGAL] File gambar tidak ditemukan!")
                    continue

                # --- Eksekusi Tesseract ---
                start_tess = time.time()
                tess_text = self.engine.run_tesseract(img_path)
                tess_time = round(time.time() - start_tess, 4)
                # Pembersihan teks dari enter berlebih untuk CSV
                tess_text_clean = " ".join(tess_text.strip().split())
                writer.writerow([img_id, 'Tesseract', tess_text_clean, tess_time])

                # --- Eksekusi EasyOCR ---
                start_easy = time.time()
                easy_text = self.engine.run_easyocr(img_path)
                easy_time = round(time.time() - start_easy, 4)
                easy_text_clean = " ".join(easy_text.strip().split())
                writer.writerow([img_id, 'EasyOCR', easy_text_clean, easy_time])

                # --- Eksekusi PaddleOCR ---
                start_paddle = time.time()
                paddle_text = self.engine.run_paddleocr(img_path)
                paddle_time = round(time.time() - start_paddle, 4)
                paddle_text_clean = " ".join(paddle_text.strip().split())
                writer.writerow([img_id, 'PaddleOCR', paddle_text_clean, paddle_time])

                print(" Selesai")

        print(f"\n[INFO] Pipeline OCR Selesai!")
        print(f"[INFO] Hasil dari {total_images * 3} operasi OCR telah disimpan ke {self.results_file}")


if __name__ == "__main__":
    pipeline = OCRPipeline()
    pipeline.run()