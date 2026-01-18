# CDNGate Notifier Bot

Telegram bot untuk monitoring dan notifikasi aplikasi yang di-deploy di Coolify.

**Ditulis dengan Python** - Lebih ringan dan efisien!

## Fitur

- 📦 Melihat daftar aplikasi aktif
- 📊 Mengecek status aplikasi
- ❓ Bantuan dan informasi
- 🎯 Interface yang user-friendly dengan tombol interaktif

## Requirement

- Python 3.8+
- Telegram Bot Token (dari BotFather)
- Coolify API Token dan URL

## Setup

### 1. Clone atau download project ini

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup environment variables

Buat file `.env` di root directory dengan isi:
```
BOT_TOKEN=your_telegram_bot_token
COOLIFY_API_URL=https://your-coolify-instance.com/api
COOLIFY_API_TOKEN=your_coolify_api_token
WEBHOOK_URL=https://your-domain.com
```

### 4. Jalankan bot

**Development:**
```bash
python bot.py
```

**Production:**
```bash
python bot.py
```

## Deploy di Coolify

### Menggunakan Nixpacks (Recommended)

1. Di Coolify dashboard, pilih **Create Application**
2. Pilih **Git Repository** dan connect ke repository Anda
3. Di bagian **Build**, pilih **Nixpacks**
4. Coolify akan otomatis mendeteksi `requirements.txt` dan menginstall dependencies
5. Set environment variables di Coolify:
   - `BOT_TOKEN`
   - `COOLIFY_API_URL`
   - `COOLIFY_API_TOKEN`
   - `WEBHOOK_URL`
6. Deploy!

### Konfigurasi Coolify

- **Build Command**: Tidak perlu (Nixpacks akan handle otomatis)
- **Start Command**: `python bot.py`
- **Port**: 3000

## Struktur Project

```
telegram-bot/
├── bot.py              # Main bot file (Python)
├── requirements.txt    # Python dependencies
├── package.json        # Metadata
├── nixpacks.toml       # Nixpacks configuration
├── Procfile            # Process file
├── .gitignore          # Git ignore rules
└── README.md          # Dokumentasi
```

## Troubleshooting

### Bot tidak merespons
- Pastikan `BOT_TOKEN` benar
- Cek koneksi internet
- Lihat logs di Coolify dashboard

### Tidak bisa fetch aplikasi dari Coolify
- Pastikan `COOLIFY_API_URL` dan `COOLIFY_API_TOKEN` benar
- Cek apakah API endpoint `/applications` tersedia
- Pastikan token memiliki permission yang cukup

## Keuntungan Python vs Node.js

- ✅ Ukuran lebih kecil (~100-200MB vs 700MB)
- ✅ Memory usage lebih rendah
- ✅ Startup time lebih cepat
- ✅ Dependencies lebih minimal
- ✅ Lebih mudah di-maintain

## License

ISC
