import cv2
import pytesseract
import easyocr
from paddleocr import PaddleOCR
import numpy as np
import os
import warnings

# Mengabaikan warning dari library agar terminal tetap bersih
warnings.filterwarnings('ignore')

class OCREngine:
    def __init__(self):
        print("[INFO] Sedang memuat model OCR ke dalam memori CPU. Mohon tunggu...")
        
        # Inisialisasi EasyOCR (Bahasa Indonesia & Inggris, tanpa GPU)
        self.reader_easyocr = easyocr.Reader(['id', 'en'], gpu=False, verbose=False)
        
        # Inisialisasi PaddleOCR (Bahasa Indonesia, dengan deteksi sudut, tanpa GPU)
        self.reader_paddle = PaddleOCR(use_angle_cls=True, lang='id', use_gpu=False, show_log=False)
        
        print("[INFO] Semua model OCR berhasil dimuat!\n")

    def run_tesseract(self, image_path):
        """Mengekstrak teks menggunakan Tesseract OCR"""
        if not os.path.exists(image_path):
            return ""
            
        image = cv2.imread(image_path)
        # Tesseract bekerja lebih optimal dengan format RGB (OpenCV defaultnya BGR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Menggunakan bahasa Indonesia (ind) dan Inggris (eng)
        text = pytesseract.image_to_string(rgb_image, lang='ind+eng')
        return text.strip()

    def run_easyocr(self, image_path):
        """Mengekstrak teks menggunakan EasyOCR"""
        if not os.path.exists(image_path):
            return ""
            
        # Parameter detail=0 akan langsung mengembalikan list berisi string teks saja
        results = self.reader_easyocr.readtext(image_path, detail=0)
        return " ".join(results)

    def run_paddleocr(self, image_path):
        """Mengekstrak teks menggunakan PaddleOCR"""
        if not os.path.exists(image_path):
            return ""
            
        results = self.reader_paddle.ocr(image_path, cls=True)
        text_result = []
        
        # Ekstraksi teks dari struktur data output PaddleOCR yang cukup kompleks
        if results and results[0]:
            for line in results[0]:
                text = line[1][0]  # Mengambil nilai string teksnya saja
                text_result.append(text)
                
        return " ".join(text_result)


# --- BLOK PENGUJIAN ---
if __name__ == "__main__":
    import sys
    
    # Memastikan pengguna memasukkan path gambar saat menjalankan skrip
    if len(sys.argv) < 2:
        print("Penggunaan: python ocr_engines.py <path_ke_gambar>")
        sys.exit(1)
        
    img_path = sys.argv[1]
    
    # Inisialisasi Class
    engine = OCREngine()
    
    print(f"--- Memproses Gambar: {os.path.basename(img_path)} ---")
    
    print("\n[1] Ekstraksi Tesseract:")
    print("------------------------")
    print(engine.run_tesseract(img_path))
    
    print("\n[2] Ekstraksi EasyOCR:")
    print("----------------------")
    print(engine.run_easyocr(img_path))
    
    print("\n[3] Ekstraksi PaddleOCR:")
    print("------------------------")
    print(engine.run_paddleocr(img_path))
    print("\n[INFO] Selesai.")