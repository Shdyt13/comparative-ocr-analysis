import cv2
import os
import numpy as np

def process_augmentations():
    processed_folder = "/app/data/02_processed"
    print(f"[INFO] Memulai Pabrik Augmentasi pada direktori: {processed_folder}")

    # Mencari semua gambar 'normal' (baik printed maupun handwritten)
    files = [f for f in os.listdir(processed_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg')) and '_normal' in f.lower()]

    if not files:
        print("[ERROR] Tidak ada gambar dengan akhiran '_normal' ditemukan.")
        return

    count = 0
    total_files = len(files)

    for idx, filename in enumerate(files, 1):
        img_path = os.path.join(processed_folder, filename)
        img = cv2.imread(img_path)

        if img is None:
            print(f"[WARNING] Gagal membaca gambar: {filename}")
            continue
        
        print(f"[{idx}/{total_files}] Memproses augmentasi untuk: {filename}")

        # Mengambil nama dasar (contoh: 'printed_001') dan ekstensinya
        base_name = os.path.splitext(filename)[0].replace('_normal', '')
        ext = os.path.splitext(filename)[1]

        # --- 1. EFEK BLUR (Gaussian Blur) ---
        # Mensimulasikan kamera tidak fokus atau goyang
        blur_img = cv2.GaussianBlur(img, (9, 9), 0)
        blur_path = os.path.join(processed_folder, f"{base_name}_blur{ext}")
        cv2.imwrite(blur_path, blur_img)

        # --- 2. EFEK DARK (Penurunan Kecerahan & Kontras) ---
        # Mensimulasikan pemindaian di ruangan gelap
        dark_img = cv2.convertScaleAbs(img, alpha=0.7, beta=-30)
        dark_path = os.path.join(processed_folder, f"{base_name}_dark{ext}")
        cv2.imwrite(dark_path, dark_img)

        # --- 3. EFEK ROTATED (Miring 5 Derajat) ---
        # Mensimulasikan posisi kertas yang miring saat difoto
        h, w = img.shape[:2]
        center = (w // 2, h // 2)
        rotation_matrix = cv2.getRotationMatrix2D(center, angle=5, scale=1.0)
        # WarpAffine dengan latar belakang putih murni (255, 255, 255)
        rotated_img = cv2.warpAffine(img, rotation_matrix, (w, h), borderValue=(255, 255, 255))
        rotated_path = os.path.join(processed_folder, f"{base_name}_rotated{ext}")
        cv2.imwrite(rotated_path, rotated_img)

        count += 3 # 3 variasi gambar baru tercetak

    print(f"\n[INFO] Augmentasi Selesai! Berhasil mencetak {count} gambar simulasi noise baru.")

if __name__ == "__main__":
    process_augmentations()