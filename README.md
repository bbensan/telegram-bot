# CDNGate Notifier Bot

Telegram bot untuk monitoring dan notifikasi aplikasi yang di-deploy di Coolify.

## Fitur

- 📦 Melihat daftar aplikasi aktif
- 📊 Mengecek status aplikasi
- ❓ Bantuan dan informasi
- 🎯 Interface yang user-friendly dengan tombol interaktif

## Requirement

- Node.js >= 18.0.0
- Telegram Bot Token (dari BotFather)
- Coolify API Token dan URL

## Setup

### 1. Clone atau download project ini

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables

Buat file `.env` di root directory dengan isi:
```
BOT_TOKEN=your_telegram_bot_token
COOLIFY_API_URL=https://your-coolify-instance.com/api
COOLIFY_API_TOKEN=your_coolify_api_token
```

### 4. Jalankan bot

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Deploy di Coolify

### Menggunakan Nixpacks (Recommended)

1. Di Coolify dashboard, pilih **Create Application**
2. Pilih **Git Repository** dan connect ke repository Anda
3. Di bagian **Build**, pilih **Nixpacks**
4. Coolify akan otomatis mendeteksi `package.json` dan menginstall dependencies
5. Set environment variables di Coolify:
   - `BOT_TOKEN`
   - `COOLIFY_API_URL`
   - `COOLIFY_API_TOKEN`
6. Deploy!

### Konfigurasi Coolify

- **Build Command**: Tidak perlu (Nixpacks akan handle otomatis)
- **Start Command**: `npm start`
- **Port**: Tidak perlu (bot tidak menggunakan HTTP server)

## Struktur Project

```
telegram-bot/
├── bot.js              # Main bot file
├── package.json        # Dependencies
├── .env.example        # Environment variables template
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

## License

ISC
