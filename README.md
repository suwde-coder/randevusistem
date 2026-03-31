# RandeVu - Akıllı Randevu Yönetim Sistemi

RandeVu, modern tıp merkezleri ve hastaneler için tasarlanmış, doktor ve hasta etkileşimini optimize eden tam kapsamlı bir randevu yönetim platformudur.

## 🚀 Öne Çıkan Özellikler

- **Akıllı Doktor Önerileri:** Kullanıcı geçmişine göre kişiselleştirilmiş öneriler.
- **Dinamik Takvim:** Doktorların mesai saatlerine göre anlık müsaitlik kontrolü.
- **Yorum ve Yanıt:** Hasta deneyimi takibi ve doktor etkileşimi.
- **PDF Reçete:** Elektronik reçete yazdırma ve indirme desteği.
- **Sağlık Analitiği:** Kullanıcı profili üzerinden VKI ve sağlık risk değerlendirmesi.

## 🛠️ Teknolojiler

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Leaflet (Harita)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **CI/CD:** Jenkins, GitHub Actions

## 📖 Kurulum ve Çalıştırma

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/Suwde/randevusistem.git
cd randevusistem
```

### 2. Bağımlılıkları Yükleyin
```bash
# Sunucu için
cd server && npm install
# İstemci için
cd ../client && npm install
```

### 3. Çevre Değişkenlerini Ayarlayın
`server` klasörü içinde bir `.env` dosyası oluşturun:
```env
PORT=5000
MONGODB_URI=mongodb_baglanti_adresiniz
JWT_SECRET=gizli_anahtariniz
```

### 4. Uygulamayı Başlatın
```bash
# Sunucu (Server) - Termal 1
cd server && npm run dev
# İstemci (Client) - Terminal 2
cd client && npm run dev
```

## ⚙️ CI/CD Boru Hattı (Jenkins)

Projenin her `push` ve `pull request` işlemi Jenkins üzerinden otomatik olarak doğrulanır. Boru hattı aşamaları:

1. **Bağımlılık Yükleme:** `npm ci` ile temiz ve hızlı kurulum.
2. **Statik Analiz:** ESLint ile kod kalitesi kontrolü.
3. **Backend Doğrulama:** Syntax kontrolü ve birim testler.
4. **Build:** Üretim aşaması için frontend paketleme.

## 📄 Lisans

Bu proje Suwde tarafından geliştirilmiştir. [ISC Lisansı](LICENSE) altında lisanslanmıştır.
