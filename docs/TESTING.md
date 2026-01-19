# 🧪 Testing Guide

Panduan lengkap untuk testing bot Telegram dengan berbagai skenario.

---

## 🚀 Setup Testing

### 1. Start Bot

```bash
npm run dev
```

### 2. Get Your Chat ID

Kirim `/start` ke bot Anda di Telegram, kemudian cek logs:

```bash
curl http://localhost:3000/api/logs/level/INFO
```

Cari entry dengan message "User started the bot" dan ambil `chatId`.

---

## 📝 Test Cases

### Test 1: /start Command

**Scenario:** User baru mengirim `/start`

**Expected:**
- Bot merespons dengan pesan sambutan
- Log entry: `User started the bot`

**Actual:**
```
User: /start
Bot: 👋 Hello [Name]!
     Please verify your credentials.
     Use /verify <token> <key>
```

---

### Test 2: /verify Tanpa Parameter

**Scenario:** User mengirim `/verify` tanpa token dan key

**Expected:**
- Bot mengirim validation error message
- Log entry: `User sent /verify without credentials` (WARN level)

**Actual:**
```
User: /verify
Bot: ❌ **VALIDATION ERROR**
     The /verify command requires 2 parameters:
     
     📝 **Format:**
     `/verify <API_TOKEN> <API_KEY>`
     
     📌 **Example:**
     `/verify my_token_here my_key_here`
     
     ⚠️ **Note:**
     - Replace `my_token_here` with your actual API token
     - Replace `my_key_here` with your actual API key
     - Both parameters are required and cannot be empty
     
     If you don't have credentials, please contact the administrator.
```

**Verify Log:**
```bash
curl http://localhost:3000/api/logs/level/WARN | grep "without credentials"
```

---

### Test 3: /verify Dengan 1 Parameter

**Scenario:** User mengirim `/verify` dengan hanya 1 parameter

**Expected:**
- Bot mengirim validation error message
- Log entry: `User sent /verify without credentials` (WARN level)

**Actual:**
```
User: /verify my_token_only
Bot: ❌ **VALIDATION ERROR**
     The /verify command requires 2 parameters:
     ...
```

---

### Test 4: /verify Dengan 2 Parameter (Valid)

**Scenario:** User mengirim `/verify` dengan credentials yang valid

**Expected:**
- Bot mengirim success message
- User ditambahkan ke verified list
- Log entry: `User verified successfully` (SUCCESS level)

**Setup:**
1. Cek credentials di `credentialsService.js`
2. Gunakan credentials yang valid

**Actual:**
```
User: /verify valid_token valid_key
Bot: ✅ **VERIFICATION SUCCESS**
     You are now able to use this bot.
     Type /help to see available commands.
```

**Verify Log:**
```bash
curl http://localhost:3000/api/logs/level/SUCCESS | grep "verified"
```

---

### Test 5: /verify Dengan 2 Parameter (Invalid)

**Scenario:** User mengirim `/verify` dengan credentials yang invalid

**Expected:**
- Bot mengirim verification failed message
- User TIDAK ditambahkan ke verified list
- Log entry: `Verification failed - invalid credentials` (WARN level)

**Actual:**
```
User: /verify invalid_token invalid_key
Bot: ❌ **VERIFICATION FAILED**
     The credentials you provided are not valid.
     Please try again with valid credentials.
```

**Verify Log:**
```bash
curl http://localhost:3000/api/logs/level/WARN | grep "invalid credentials"
```

---

### Test 6: /help Tanpa Verifikasi

**Scenario:** User yang belum verified mengirim `/help`

**Expected:**
- Bot mengirim pesan bahwa user belum verified
- Minta user untuk verify terlebih dahulu

**Actual:**
```
User: /help
Bot: ❌ You are not verified.
     Please verify your credentials first.
     Use /verify <token> <key>
```

---

### Test 7: /help Setelah Verifikasi

**Scenario:** User yang sudah verified mengirim `/help`

**Expected:**
- Bot mengirim daftar command yang tersedia

**Actual:**
```
User: /help
Bot: 📋 **PERINTAH YANG TERSEDIA**
     /start - Start bot
     /help - Help (this message)
     /ping - Test bot connection
     /status - Check bot status
     /logout - Logout from bot
     
     Or send any message to test echo.
```

---

### Test 8: /ping Setelah Verifikasi

**Scenario:** User yang sudah verified mengirim `/ping`

**Expected:**
- Bot merespons dengan pong message
- Log entry: `User pinged bot` (INFO level)

**Actual:**
```
User: /ping
Bot: 🏓 Pong! Bot is active.
     ⏱️ Mode: WEBHOOK
```

---

### Test 9: /status Setelah Verifikasi

**Scenario:** User yang sudah verified mengirim `/status`

**Expected:**
- Bot mengirim status information

**Actual:**
```
User: /status
Bot: 📊 **STATUS BOT**
     🌍 Environment: DEV
     📡 Mode: POLLING
     🔌 Webhook: N/A
     ⏲️ Polling: ✅ Active
     ⏰ Timestamp: 2024-01-19T10:30:45.123Z
```

---

### Test 10: /logout Setelah Verifikasi

**Scenario:** User yang sudah verified mengirim `/logout`

**Expected:**
- User dihapus dari verified list
- Bot mengirim logout message
- Log entry: User logout

**Actual:**
```
User: /logout
Bot: 👋 You have logged out.
     Type /start to login again.
```

---

### Test 11: Echo Message

**Scenario:** User yang sudah verified mengirim pesan biasa

**Expected:**
- Bot echo kembali pesan yang dikirim

**Actual:**
```
User: Hello bot!
Bot: 💬 You said: "Hello bot!"
```

---

### Test 12: Echo Message Tanpa Verifikasi

**Scenario:** User yang belum verified mengirim pesan biasa

**Expected:**
- Bot mengirim pesan bahwa user belum verified

**Actual:**
```
User: Hello bot!
Bot: ❌ You are not verified.
     Use /start to start.
```

---

## 🔍 Logging API Testing

### Get All Logs

```bash
curl http://localhost:3000/api/logs
```

### Get Logs by Level

```bash
# Get ERROR logs
curl http://localhost:3000/api/logs/level/ERROR

# Get WARN logs
curl http://localhost:3000/api/logs/level/WARN

# Get INFO logs
curl http://localhost:3000/api/logs/level/INFO

# Get SUCCESS logs
curl http://localhost:3000/api/logs/level/SUCCESS
```

### Get Statistics

```bash
curl http://localhost:3000/api/logs/stats
```

### Get Logs with Pagination

```bash
# Get 50 logs
curl "http://localhost:3000/api/logs?limit=50"

# Get 50 logs, skip 100
curl "http://localhost:3000/api/logs?limit=50&offset=100"
```

### Get Logs from File

```bash
# Get logs dari hari ini
curl http://localhost:3000/api/logs/file/2024-01-19

# Get logs dari tanggal tertentu
curl http://localhost:3000/api/logs/file/2024-01-18
```

---

## 📊 Test Results Template

```markdown
## Test Results - [DATE]

### Environment
- Node Version: [VERSION]
- Bot Mode: [POLLING/WEBHOOK]
- Environment: [DEV/PROD]

### Test Cases

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 1 | /start | ✅ PASS | - |
| 2 | /verify (no params) | ✅ PASS | - |
| 3 | /verify (1 param) | ✅ PASS | - |
| 4 | /verify (valid) | ✅ PASS | - |
| 5 | /verify (invalid) | ✅ PASS | - |
| 6 | /help (unverified) | ✅ PASS | - |
| 7 | /help (verified) | ✅ PASS | - |
| 8 | /ping | ✅ PASS | - |
| 9 | /status | ✅ PASS | - |
| 10 | /logout | ✅ PASS | - |
| 11 | Echo (verified) | ✅ PASS | - |
| 12 | Echo (unverified) | ✅ PASS | - |

### Logging API

| # | Endpoint | Status | Notes |
|---|----------|--------|-------|
| 1 | GET /api/logs | ✅ PASS | - |
| 2 | GET /api/logs/level/ERROR | ✅ PASS | - |
| 3 | GET /api/logs/stats | ✅ PASS | - |
| 4 | GET /api/logs/file/:date | ✅ PASS | - |

### Summary
- Total Tests: 16
- Passed: 16
- Failed: 0
- Success Rate: 100%
```

---

## 🐛 Debugging Tips

### Check Logs in Real-time

```bash
# Terminal 1: Start bot
npm run dev

# Terminal 2: Watch logs
watch -n 1 'curl -s http://localhost:3000/api/logs?limit=10 | jq'
```

### Filter Logs by Level

```bash
# Get only ERROR logs
curl http://localhost:3000/api/logs/level/ERROR | jq '.data[] | {timestamp, message}'

# Get only WARN logs
curl http://localhost:3000/api/logs/level/WARN | jq '.data[] | {timestamp, message}'
```

### Check Verified Users

```bash
# Check credentialsService.js untuk melihat verified users
cat credentialsService.js | grep -A 20 "verifiedUsers"
```

### Clear Memory Logs

```bash
curl -X DELETE http://localhost:3000/api/logs/memory
```

---

## ✅ Checklist

- [ ] All test cases passed
- [ ] Logging API working correctly
- [ ] Validation messages clear and helpful
- [ ] Error handling working as expected
- [ ] No console errors
- [ ] Logs stored correctly in files
- [ ] Memory logs accessible via API

---

Happy Testing! 🚀
