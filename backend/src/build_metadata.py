import os
import csv

def build_metadata():
    # Path di dalam kontainer Docker
    processed_folder = "/app/data/02_processed"
    ground_truth_folder = "/app/data/01_raw/printed" # Tempat kita menaruh folder txt tadi
    metadata_output = "/app/data/metadata.csv"

    print("[INFO] Memulai pembangunan Metadata dari direktori...")

    # 1. Siapkan file CSV Metadata
    headers = ['image_id', 'type', 'condition', 'image_path', 'ground_truth']
    
    # Ambil semua gambar di 02_processed
    files = [f for f in os.listdir(processed_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not files:
        print(f"[ERROR] Tidak ada gambar di folder {processed_folder}")
        return

    metadata_count = 0
    with open(metadata_output, mode='w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(headers)

        # 2. Parsing nama file dan membaca txt
        for filename in sorted(files):
            # Contoh filename: printed_001_normal.jpg
            base_name = os.path.splitext(filename)[0]
            parts = base_name.split('_')
            
            if len(parts) >= 3:
                img_type = parts[0]          # "printed"
                img_id = parts[1]            # "001"
                condition = "_".join(parts[2:]) # "normal"
                
                # Membaca isi file txt (misal: printed_001.txt)
                txt_filename = f"{img_type}_{img_id}.txt"
                txt_filepath = os.path.join(ground_truth_folder, txt_filename)
                
                actual_text = "TEKS ASLI TIDAK DITEMUKAN"
                if os.path.exists(txt_filepath):
                    with open(txt_filepath, 'r', encoding='utf-8') as f:
                        actual_text = f.read().strip()
                else:
                    print(f"[WARNING] File Ground Truth tidak ditemukan: {txt_filename}")
                
                # Path relatif untuk Docker
                img_path = os.path.join(processed_folder, filename)

                writer.writerow([base_name, img_type, condition, img_path, actual_text])
                metadata_count += 1
            else:
                print(f"[WARNING] Format nama file salah dan dilewati: {filename}")

    print(f"[INFO] Sukses! {metadata_count} baris data telah ditulis ke {metadata_output}")

if __name__ == "__main__":
    build_metadata()