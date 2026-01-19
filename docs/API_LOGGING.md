# 📋 API Logging Documentation

Bot Telegram Anda sekarang dilengkapi dengan sistem logging lengkap yang bisa diakses via REST API.

## 🚀 Fitur Logging

- ✅ Logging ke file (per hari)
- ✅ Logging ke memory (in-memory storage)
- ✅ REST API untuk akses logs
- ✅ Filter by level (ERROR, WARN, INFO, DEBUG, SUCCESS)
- ✅ Pagination support
- ✅ Statistics

---

## 📡 API Endpoints

### 1. **Health Check**

```
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Bot API is running",
  "timestamp": "2024-01-19T10:30:45.123Z"
}
```

---

### 2. **Get All Logs**

```
GET /api/logs?limit=100&level=INFO&offset=0
```

**Query Parameters:**
- `limit` (optional): Jumlah logs (default: 100, max: 1000)
- `level` (optional): Filter by level (ERROR, WARN, INFO, DEBUG, SUCCESS)
- `offset` (optional): Skip logs (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-01-19T10:30:45.123Z",
      "level": "INFO",
      "message": "User started the bot",
      "data": {
        "chatId": 123456,
        "firstName": "John"
      }
    }
  ],
  "pagination": {
    "total": 250,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 3. **Get Logs by Level**

```
GET /api/logs/level/ERROR?limit=50
```

**Parameters:**
- `level`: ERROR, WARN, INFO, DEBUG, SUCCESS
- `limit` (optional): Jumlah logs (default: 100)

**Response:**
```json
{
  "success": true,
  "level": "ERROR",
  "data": [
    {
      "timestamp": "2024-01-19T10:30:45.123Z",
      "level": "ERROR",
      "message": "Failed to register webhook",
      "data": {
        "error": "Connection timeout"
      }
    }
  ],
  "count": 5
}
```

---

### 4. **Get Log Statistics**

```
GET /api/logs/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLogs": 1000,
    "byLevel": {
      "ERROR": 15,
      "WARN": 45,
      "INFO": 800,
      "DEBUG": 100,
      "SUCCESS": 40
    },
    "availableFiles": [
      "2024-01-19.log",
      "2024-01-18.log",
      "2024-01-17.log"
    ]
  }
}
```

---

### 5. **Get Logs from File**

```
GET /api/logs/file/2024-01-19
```

**Parameters:**
- `date` (optional): Format YYYY-MM-DD (default: today)

**Response:**
```json
{
  "success": true,
  "date": "2024-01-19",
  "data": [
    {
      "timestamp": "2024-01-19T10:30:45.123Z",
      "level": "INFO",
      "message": "User started the bot",
      "data": null
    }
  ],
  "count": 150
}
```

---

### 6. **Get Available Log Files**

```
GET /api/logs/files
```

**Response:**
```json
{
  "success": true,
  "data": [
    "2024-01-19.log",
    "2024-01-18.log",
    "2024-01-17.log"
  ],
  "count": 3
}
```

---

### 7. **Clear Memory Logs**

```
DELETE /api/logs/memory
```

**Response:**
```json
{
  "success": true,
  "message": "Memory logs cleared"
}
```

---

## 🔍 Contoh Penggunaan

### Menggunakan cURL

**Get semua logs:**
```bash
curl http://localhost:3000/api/logs
```

**Get error logs saja:**
```bash
curl http://localhost:3000/api/logs/level/ERROR
```

**Get logs dengan limit 50:**
```bash
curl "http://localhost:3000/api/logs?limit=50"
```

**Get logs dari tanggal tertentu:**
```bash
curl http://localhost:3000/api/logs/file/2024-01-19
```

**Get statistics:**
```bash
curl http://localhost:3000/api/logs/stats
```

---

### Menggunakan JavaScript/Fetch

```javascript
// Get all logs
fetch('http://localhost:3000/api/logs')
  .then(res => res.json())
  .then(data => console.log(data));

// Get error logs
fetch('http://localhost:3000/api/logs/level/ERROR')
  .then(res => res.json())
  .then(data => console.log(data));

// Get logs dengan pagination
fetch('http://localhost:3000/api/logs?limit=50&offset=100')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

### Menggunakan Python

```python
import requests

# Get all logs
response = requests.get('http://localhost:3000/api/logs')
print(response.json())

# Get error logs
response = requests.get('http://localhost:3000/api/logs/level/ERROR')
print(response.json())

# Get statistics
response = requests.get('http://localhost:3000/api/logs/stats')
print(response.json())
```

---

## 📁 Log File Structure

Logs disimpan di direktori `logs/` dengan format:
```
logs/
├── 2024-01-19.log
├── 2024-01-18.log
└── 2024-01-17.log
```

Setiap file berisi logs dalam format:
```
[2024-01-19T10:30:45.123Z] [INFO] User started the bot | {"chatId":123456,"firstName":"John"}
[2024-01-19T10:31:20.456Z] [SUCCESS] User verified successfully | {"chatId":123456}
[2024-01-19T10:32:15.789Z] [ERROR] Failed to register webhook | {"error":"Connection timeout"}
```

---

## 🎯 Log Levels

| Level | Warna | Penggunaan |
|-------|-------|-----------|
| ERROR | Red | Error/exception |
| WARN | Yellow | Warning/potential issue |
| INFO | Cyan | General information |
| DEBUG | Magenta | Debug information |
| SUCCESS | Green | Success message |

---

## 💾 Memory vs File Storage

### Memory Storage
- **Pros**: Cepat, real-time access
- **Cons**: Hilang saat restart
- **Limit**: Max 1000 logs

### File Storage
- **Pros**: Persistent, unlimited
- **Cons**: Lebih lambat untuk akses
- **Format**: Per hari (YYYY-MM-DD.log)

---

## 🔐 Security Notes

⚠️ **PENTING**: API logging ini tidak memiliki authentication. Untuk production, tambahkan:

1. **API Key Authentication**
2. **JWT Token**
3. **Rate Limiting**
4. **CORS Configuration**

Contoh middleware authentication:
```javascript
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.use('/api/', apiKeyMiddleware);
```

---

## 📊 Monitoring Dashboard

Anda bisa membuat dashboard untuk monitoring logs. Contoh:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Bot Logs Dashboard</title>
</head>
<body>
  <h1>Bot Logs</h1>
  <div id="logs"></div>

  <script>
    async function loadLogs() {
      const response = await fetch('/api/logs?limit=50');
      const data = await response.json();
      
      const html = data.data.map(log => `
        <div style="border: 1px solid #ccc; padding: 10px; margin: 5px;">
          <strong>${log.level}</strong> - ${log.timestamp}
          <p>${log.message}</p>
          ${log.data ? `<pre>${JSON.stringify(log.data, null, 2)}</pre>` : ''}
        </div>
      `).join('');
      
      document.getElementById('logs').innerHTML = html;
    }

    loadLogs();
    setInterval(loadLogs, 5000); // Refresh setiap 5 detik
  </script>
</body>
</html>
```

---

## 🚀 Deployment

Pastikan di production:

1. ✅ Set `NODE_ENV=prod`
2. ✅ Logs directory writable
3. ✅ Implement authentication
4. ✅ Setup log rotation (optional)
5. ✅ Monitor disk space

---

Selamat! Sistem logging Anda sudah siap digunakan! 🎉
