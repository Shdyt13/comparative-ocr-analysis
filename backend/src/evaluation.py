import os
import time
import csv
import jiwer
from ocr_engines import OCREngine
import warnings

warnings.filterwarnings('ignore')

class OCREvaluator:
    def __init__(self):
        # Memanggil class OCREngine yang sudah kita buat sebelumnya
        self.engine = OCREngine()

    def clean_text(self, text):
        """
        Membersihkan teks dari spasi berlebih atau karakter aneh yang 
        bisa membuat perhitungan CER/WER menjadi bias.
        """
        if not text:
            return ""
        return " ".join(text.strip().split())

    def calculate_metrics(self, true_text, pred_text):
        """Menghitung CER dan WER menggunakan library jiwer"""
        true_text = self.clean_text(true_text)
        pred_text = self.clean_text(pred_text)

        # Jika prediksi kosong, error rate dianggap 100% (1.0)
        if not pred_text or not true_text:
            return 1.0, 1.0

        try:
            cer_score = jiwer.cer(true_text, pred_text)
            wer_score = jiwer.wer(true_text, pred_text)
        except ValueError:
            # Mengantisipasi error jika teks kosong setelah dibersihkan
            cer_score, wer_score = 1.0, 1.0

        return cer_score, wer_score

    def evaluate_single_image(self, image_path, true_text):
        """Menjalankan ketiga engine pada 1 gambar dan mencatat metriknya"""
        metrics = {}

        # 1. Tesseract
        start_time = time.time()
        pred_tess = self.engine.run_tesseract(image_path)
        time_tess = time.time() - start_time
        cer_tess, wer_tess = self.calculate_metrics(true_text, pred_tess)
        
        metrics['Tesseract'] = {
            'Text': pred_tess, 'CER': round(cer_tess, 4), 'WER': round(wer_tess, 4), 'Time': round(time_tess, 4)
        }

        # 2. EasyOCR
        start_time = time.time()
        pred_easy = self.engine.run_easyocr(image_path)
        time_easy = time.time() - start_time
        cer_easy, wer_easy = self.calculate_metrics(true_text, pred_easy)
        
        metrics['EasyOCR'] = {
            'Text': pred_easy, 'CER': round(cer_easy, 4), 'WER': round(wer_easy, 4), 'Time': round(time_easy, 4)
        }

        # 3. PaddleOCR
        start_time = time.time()
        pred_paddle = self.engine.run_paddleocr(image_path)
        time_paddle = time.time() - start_time
        cer_paddle, wer_paddle = self.calculate_metrics(true_text, pred_paddle)
        
        metrics['PaddleOCR'] = {
            'Text': pred_paddle, 'CER': round(cer_paddle, 4), 'WER': round(wer_paddle, 4), 'Time': round(time_paddle, 4)
        }

        return metrics

    def run_full_evaluation(self, image_folder, output_csv, ground_truth_dict):
        """
        Mengevaluasi seluruh gambar dalam folder berdasarkan kamus ground_truth.
        ground_truth_dict: Dictionary dengan key=nama_file (tanpa ekstensi), value=teks asli
        """
        print(f"\n[INFO] Memulai evaluasi massal pada folder: {image_folder}")
        
        # Siapkan file CSV untuk menyimpan hasil
        csv_headers = [
            'Filename', 'Condition', 'Ground_Truth', 
            'Tess_Text', 'Tess_CER', 'Tess_WER', 'Tess_Time',
            'Easy_Text', 'Easy_CER', 'Easy_WER', 'Easy_Time',
            'Paddle_Text', 'Paddle_CER', 'Paddle_WER', 'Paddle_Time'
        ]

        # Ambil semua gambar yang valid
        valid_ext = ('.png', '.jpg', '.jpeg')
        files = [f for f in os.listdir(image_folder) if f.lower().endswith(valid_ext)]
        
        if not files:
            print("[ERROR] Tidak ada gambar ditemukan!")
            return

        with open(output_csv, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(csv_headers)

            for filename in files:
                filepath = os.path.join(image_folder, filename)
                base_name = os.path.splitext(filename)[0]
                
                # Mendeteksi kondisi dari nama file (normal, blur, dark, rotated)
                condition = "Unknown"
                if "_normal" in base_name: condition = "Normal"
                elif "_blur" in base_name: condition = "Blur"
                elif "_dark" in base_name: condition = "Dark"
                elif "_rotated" in base_name: condition = "Rotated"

                # Mencari teks asli (Ground Truth) berdasarkan base_name asli sebelum augmentasi
                # Contoh: "Gambar1_blur" -> kita cari "Gambar1" di dictionary
                original_base_name = base_name.replace("_normal", "").replace("_blur", "").replace("_dark", "").replace("_rotated", "")
                
                # Default teks jika tidak ditemukan di dictionary
                true_text = ground_truth_dict.get(original_base_name, "TEKS ASLI BELUM DIDATA")

                print(f"Mengevaluasi: {filename} ...", end="", flush=True)
                
                # Jalankan evaluasi
                res = self.evaluate_single_image(filepath, true_text)
                
                # Tulis ke CSV
                writer.writerow([
                    filename, condition, true_text,
                    res['Tesseract']['Text'], res['Tesseract']['CER'], res['Tesseract']['WER'], res['Tesseract']['Time'],
                    res['EasyOCR']['Text'], res['EasyOCR']['CER'], res['EasyOCR']['WER'], res['EasyOCR']['Time'],
                    res['PaddleOCR']['Text'], res['PaddleOCR']['CER'], res['PaddleOCR']['WER'], res['PaddleOCR']['Time']
                ])
                print(" Selesai!")
                
        print(f"\n[INFO] Evaluasi Selesai! Hasil disimpan di: {output_csv}")


if __name__ == "__main__":
    # ---------------- KONFIGURASI EVALUASI ----------------
    PROCESSED_FOLDER = "/app/data/02_processed"
    OUTPUT_CSV = "/app/data/hasil_evaluasi_ocr.csv"
    
    # Kunci Jawaban yang sesuai dengan nama file Anda yang baru
    GROUND_TRUTH = {
        "dummy_cetak": "Sistem monitoring konsumsi daya listrik",
        "dummy_tulis": "Sistem monitoring konsumsi daya listrik"
    }
    
    evaluator = OCREvaluator()
    evaluator.run_full_evaluation(PROCESSED_FOLDER, OUTPUT_CSV, GROUND_TRUTH)