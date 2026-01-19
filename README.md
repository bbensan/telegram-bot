# 🤖 Telegram Bot dengan Logging System

Bot Telegram yang dilengkapi dengan sistem logging lengkap dan REST API untuk monitoring.

## ✨ Fitur

- 📱 **Telegram Bot** - Command-based bot dengan verification system
- 🔐 **Credentials Verification** - Secure access dengan API token & key
- 📋 **Logging System** - Comprehensive logging ke file dan memory
- 🌐 **REST API** - Access logs via HTTP endpoints
- 📊 **Statistics** - Real-time log statistics
- 🔄 **Webhook Support** - Production-ready webhook mode
- 📱 **Polling Mode** - Development mode dengan polling

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Buat file `.env`:

```env
# Telegram
BOT_TOKEN=your_bot_token_here

# Webhook (Production)
WEBHOOK_URL=https://your-domain.com
WEBHOOK_HOST=0.0.0.0
WEBHOOK_PORT=3000

# Credentials
API_TOKEN=your_api_token
API_KEY=your_api_key

# Environment
NODE_ENV=dev
```

### 3. Run Bot

**Development (Polling):**
```bash
npm run dev
```

**Production (Webhook):**
```bash
NODE_ENV=prod npm start
```

---

## 📋 Bot Commands

| Command | Description | Requires Verification | Format |
|---------|-------------|----------------------|--------|
| `/start` | Start bot | ❌ No | `/start` |
| `/verify` | Verify credentials | ❌ No | `/verify <TOKEN> <KEY>` |
| `/help` | Show help | ✅ Yes | `/help` |
| `/ping` | Test connection | ✅ Yes | `/ping` |
| `/status` | Check bot status | ✅ Yes | `/status` |
| `/logout` | Logout | ✅ Yes | `/logout` |

### /verify Command Details

**Format:**
```
/verify <API_TOKEN> <API_KEY>
```

**Example:**
```
/verify my_token_12345 my_key_67890
```

**Validation:**
- ✅ Requires exactly 2 parameters
- ✅ Both token and key must be non-empty
- ✅ Returns validation error if format is incorrect
- ✅ Returns verification error if credentials are invalid

**Responses:**
- ✅ **Success**: User added to verified list
- ❌ **Invalid Format**: Validation error message
- ❌ **Invalid Credentials**: Verification failed message

📖 **Full Documentation:** See [VERIFY_COMMAND.md](./VERIFY_COMMAND.md)

---

## 📡 API Endpoints

### Logging API

```
GET  /health                    - Health check
GET  /api/status               - Bot status
GET  /api/logs                 - Get all logs
GET  /api/logs/stats           - Get statistics
GET  /api/logs/level/:level    - Get logs by level
GET  /api/logs/file/:date      - Get logs from file
GET  /api/logs/files           - List available files
DELETE /api/logs/memory        - Clear memory logs
```

**Dokumentasi lengkap:** Lihat [API_LOGGING.md](./API_LOGGING.md)

---

## 📁 Project Structure

```
telegram-bot/
├── bot.js                 # Main bot file
├── app.js                 # Express app dengan API routes
├── logger.js              # Logging service
├── config.js              # Configuration
├── credentialsService.js  # Credentials management
├── package.json           # Dependencies
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── API_LOGGING.md         # API documentation
└── logs/                  # Log files (auto-created)
    ├── 2024-01-19.log
    ├── 2024-01-18.log
    └── ...
```

---

## 🔧 Configuration

### config.js

```javascript
{
  nodeEnv: 'dev' | 'prod',
  botToken: 'your_bot_token',
  webhook: {
    url: 'https://your-domain.com',
    host: '0.0.0.0',
    port: 3000
  }
}
```

### credentialsService.js

Manage verified users dan credentials verification.

### logger.js

Logging service dengan file dan memory storage.

---

## 📊 Logging

### Log Levels

- **ERROR** - Error/exception
- **WARN** - Warning
- **INFO** - Information
- **DEBUG** - Debug info
- **SUCCESS** - Success message

### Log Storage

**File Storage:**
- Lokasi: `logs/YYYY-MM-DD.log`
- Format: `[timestamp] [level] message | data`
- Persistent

**Memory Storage:**
- Max 1000 logs
- Real-time access
- Hilang saat restart

### Contoh Log

```
[2024-01-19T10:30:45.123Z] [INFO] User started the bot | {"chatId":123456,"firstName":"John"}
[2024-01-19T10:31:20.456Z] [SUCCESS] User verified successfully | {"chatId":123456}
[2024-01-19T10:32:15.789Z] [ERROR] Failed to register webhook | {"error":"Connection timeout"}
```

---

## 🌐 Deployment

### Railway

1. Connect repository ke Railway
2. Set environment variables
3. Deploy!

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=prod
EXPOSE 3000

CMD ["npm", "start"]
```

Build & run:
```bash
docker build -t telegram-bot .
docker run -p 3000:3000 --env-file .env telegram-bot
```

---

## 🔐 Security

⚠️ **Production Checklist:**

- [ ] Add API authentication (API Key / JWT)
- [ ] Enable HTTPS/TLS
- [ ] Setup rate limiting
- [ ] Configure CORS
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Setup log rotation
- [ ] Monitor disk space

---

## 📈 Monitoring

### Check Bot Status

```bash
curl http://localhost:3000/health
```

### Get Logs

```bash
curl http://localhost:3000/api/logs?limit=50
```

### Get Statistics

```bash
curl http://localhost:3000/api/logs/stats
```

---

## 🐛 Troubleshooting

### Bot tidak merespons

1. Cek `BOT_TOKEN` di `.env`
2. Cek logs: `curl http://localhost:3000/api/logs/level/ERROR`
3. Cek bot status: `curl http://localhost:3000/api/status`

### Webhook tidak terdaftar

1. Cek `WEBHOOK_URL` di `.env`
2. Pastikan domain accessible dari internet
3. Cek logs untuk error message

### Logs tidak tersimpan

1. Pastikan direktori `logs/` writable
2. Cek disk space
3. Cek file permissions

---

## 📚 Resources

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [Express.js](https://expressjs.com/)

---

## 📝 License

ISC

---

## 👨‍💻 Author

Created with ❤️ for Telegram Bot Development

---

## 🤝 Contributing

Contributions welcome! Feel free to submit issues and pull requests.

---

**Happy Botting! 🚀**
