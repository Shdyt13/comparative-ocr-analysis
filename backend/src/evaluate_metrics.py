import os
import csv
import jiwer
import warnings

warnings.filterwarnings('ignore')

class MetricsEvaluator:
    def __init__(self):
        self.metadata_file = "/app/data/metadata.csv"
        self.results_file = "/app/data/ocr_results.csv"
        self.eval_output_file = "/app/data/evaluation_metrics.csv"

    def clean_text(self, text):
        if not text: return ""
        return " ".join(text.strip().split())

    def run_evaluation(self):
        print("[INFO] Memulai Evaluasi Performa (Menghitung CER & WER)...")

        # 1. Membaca Kunci Jawaban (Metadata) ke dalam memori
        metadata = {}
        if not os.path.exists(self.metadata_file):
            print(f"[ERROR] {self.metadata_file} tidak ditemukan!")
            return
            
        with open(self.metadata_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                metadata[row['image_id']] = {
                    'type': row['type'],
                    'condition': row['condition'],
                    'ground_truth': row['ground_truth']
                }

        # 2. Membaca Lembar Jawaban (Hasil OCR) dan langsung dinilai
        if not os.path.exists(self.results_file):
            print(f"[ERROR] {self.results_file} tidak ditemukan!")
            return

        evaluations = []
        with open(self.results_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                img_id = row['image_id']
                method = row['method']
                pred_text = self.clean_text(row['extracted_text'])
                proc_time = row['processing_time']

                # Mengambil data dari kunci jawaban
                meta = metadata.get(img_id, {})
                truth_text = self.clean_text(meta.get('ground_truth', ''))
                img_type = meta.get('type', 'Unknown')
                condition = meta.get('condition', 'Unknown')

                # Menghitung CER & WER menggunakan library Jiwer
                cer, wer = 1.0, 1.0  # Default error 100% jika tebakan kosong
                if truth_text and pred_text:
                    try:
                        cer = jiwer.cer(truth_text, pred_text)
                        wer = jiwer.wer(truth_text, pred_text)
                    except ValueError:
                        pass # Tetap 1.0 jika terjadi kalkulasi invalid
                elif truth_text == pred_text == "":
                    cer, wer = 0.0, 0.0 # Benar mutlak jika keduanya memang kosong

                # Menyimpan satu baris data komprehensif
                evaluations.append([
                    img_id, img_type, condition, method, 
                    truth_text, pred_text, proc_time, 
                    round(cer, 4), round(wer, 4)
                ])

        # 3. Menulis Hasil Akhir ke CSV Baru
        headers = [
            'image_id', 'type', 'condition', 'method', 
            'ground_truth', 'extracted_text', 'processing_time', 
            'cer', 'wer'
        ]
        
        with open(self.eval_output_file, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(evaluations)

        print(f"[INFO] Evaluasi Selesai! {len(evaluations)} baris metrik berhasil dihitung.")
        print(f"[INFO] File komprehensif tersimpan di: {self.eval_output_file}")


if __name__ == "__main__":
    evaluator = MetricsEvaluator()
    evaluator.run_evaluation()