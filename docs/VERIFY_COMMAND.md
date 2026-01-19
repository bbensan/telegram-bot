# 🔐 /verify Command Documentation

Dokumentasi lengkap untuk command `/verify` dengan validation error handling.

---

## 📋 Overview

Command `/verify` digunakan untuk memverifikasi user dengan credentials (API Token dan API Key). Setelah verifikasi berhasil, user dapat mengakses semua command yang tersedia.

---

## 🎯 Format Command

### ✅ Format yang Benar

```
/verify <API_TOKEN> <API_KEY>
```

**Contoh:**
```
/verify my_token_12345 my_key_67890
```

### ❌ Format yang Salah

```
/verify
/verify my_token_only
/verify   
```

---

## 📝 Behavior

### 1. **User Mengirim `/verify` Tanpa Parameter**

**Input:**
```
/verify
```

**Response:**
```
❌ **VALIDATION ERROR**

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

**Log:**
```
[WARN] User sent /verify without credentials | {"chatId": 123456}
```

---

### 2. **User Mengirim `/verify` dengan Hanya 1 Parameter**

**Input:**
```
/verify my_token_only
```

**Response:**
```
❌ **VALIDATION ERROR**

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

**Log:**
```
[WARN] User sent /verify without credentials | {"chatId": 123456}
```

---

### 3. **User Mengirim `/verify` dengan 2 Parameter (Valid)**

#### 3a. Credentials Valid ✅

**Input:**
```
/verify valid_token valid_key
```

**Response:**
```
✅ **VERIFICATION SUCCESS**

You are now able to use this bot.

Type /help to see available commands.
```

**Log:**
```
[INFO] User attempting to verify credentials | {"chatId": 123456}
[SUCCESS] User verified successfully | {"chatId": 123456}
```

---

#### 3b. Credentials Invalid ❌

**Input:**
```
/verify invalid_token invalid_key
```

**Response:**
```
❌ **VERIFICATION FAILED**

The credentials you provided are not valid.

Please try again with valid credentials.
```

**Log:**
```
[INFO] User attempting to verify credentials | {"chatId": 123456}
[WARN] Verification failed - invalid credentials | {"chatId": 123456}
```

---

## 🔍 Implementation Details

### Regex Patterns

**Pattern 1: Dengan 2 Parameter**
```javascript
/\/verify\s+(\S+)\s+(\S+)/
```
- Matches: `/verify token key`
- Captures: token, key

**Pattern 2: Tanpa Parameter atau 1 Parameter**
```javascript
/\/verify(?:\s|$)/
```
- Matches: `/verify`, `/verify token`, `/verify  `
- Tidak capture apa-apa

### Handler Logic

```javascript
// Handler 1: /verify dengan 2 parameter
bot.onText(/\/verify\s+(\S+)\s+(\S+)/, (msg, match) => {
  // Verifikasi credentials
  // Jika valid -> add user ke verified list
  // Jika invalid -> send error message
});

// Handler 2: /verify tanpa 2 parameter
bot.onText(/\/verify(?:\s|$)/, (msg) => {
  // Check apakah sudah ditangani oleh handler 1
  if (text.match(/\/verify\s+\S+\s+\S+/)) {
    return; // Skip, sudah ditangani
  }
  
  // Send validation error message
});
```

---

## 📊 Validation Flow

```
User sends /verify
    ↓
Check if matches /\/verify\s+(\S+)\s+(\S+)/
    ├─ YES → Verify credentials
    │         ├─ Valid → Success message + Add to verified list
    │         └─ Invalid → Error message
    │
    └─ NO → Check if matches /\/verify(?:\s|$)/
             ├─ YES → Send validation error message
             └─ NO → Ignore (not a /verify command)
```

---

## 🔐 Security Considerations

### ✅ Best Practices

1. **Never log credentials** - Token dan key tidak boleh di-log
2. **Use HTTPS** - Pastikan komunikasi encrypted
3. **Rate limiting** - Limit verification attempts
4. **Timeout** - Verification session timeout
5. **Audit trail** - Log semua verification attempts

### ⚠️ Current Implementation

Saat ini, bot sudah:
- ✅ Validate format command
- ✅ Log verification attempts
- ✅ Provide clear error messages
- ❌ Tidak ada rate limiting (TODO)
- ❌ Tidak ada timeout (TODO)

---

## 🚀 Future Enhancements

### Planned Features

1. **Rate Limiting**
   ```javascript
   // Max 5 attempts per 5 minutes
   const MAX_ATTEMPTS = 5;
   const TIMEOUT = 5 * 60 * 1000; // 5 minutes
   ```

2. **Verification Timeout**
   ```javascript
   // Verification expires after 24 hours
   const VERIFICATION_TIMEOUT = 24 * 60 * 60 * 1000;
   ```

3. **Two-Factor Authentication**
   ```javascript
   // Require additional verification step
   ```

4. **Credential Rotation**
   ```javascript
   // Periodically rotate credentials
   ```

---

## 📱 User Experience

### Scenario 1: New User

```
User: /start
Bot: Hello! Please verify your credentials.
     Use /verify <token> <key>

User: /verify
Bot: ❌ VALIDATION ERROR
     Format: /verify <API_TOKEN> <API_KEY>

User: /verify my_token my_key
Bot: ✅ VERIFICATION SUCCESS
     You can now use all commands!
```

### Scenario 2: Verified User

```
User: /help
Bot: 📋 AVAILABLE COMMANDS
     /start - Start bot
     /help - Help
     /ping - Test connection
     /status - Check status
     /logout - Logout
```

---

## 🔧 Testing

### Test Cases

```bash
# Test 1: /verify tanpa parameter
curl -X POST https://api.telegram.org/bot{TOKEN}/sendMessage \
  -d "chat_id={CHAT_ID}&text=/verify"

# Test 2: /verify dengan 1 parameter
curl -X POST https://api.telegram.org/bot{TOKEN}/sendMessage \
  -d "chat_id={CHAT_ID}&text=/verify token_only"

# Test 3: /verify dengan 2 parameter (valid)
curl -X POST https://api.telegram.org/bot{TOKEN}/sendMessage \
  -d "chat_id={CHAT_ID}&text=/verify valid_token valid_key"

# Test 4: /verify dengan 2 parameter (invalid)
curl -X POST https://api.telegram.org/bot{TOKEN}/sendMessage \
  -d "chat_id={CHAT_ID}&text=/verify invalid_token invalid_key"
```

---

## 📊 Logging

### Log Entries

**Successful Verification:**
```
[2024-01-19T10:30:45.123Z] [INFO] User attempting to verify credentials | {"chatId":123456}
[2024-01-19T10:30:46.456Z] [SUCCESS] User verified successfully | {"chatId":123456}
```

**Failed Verification:**
```
[2024-01-19T10:30:45.123Z] [INFO] User attempting to verify credentials | {"chatId":123456}
[2024-01-19T10:30:46.456Z] [WARN] Verification failed - invalid credentials | {"chatId":123456}
```

**Validation Error:**
```
[2024-01-19T10:30:45.123Z] [WARN] User sent /verify without credentials | {"chatId":123456}
```

---

## 🎯 Summary

| Scenario | Input | Response | Log Level |
|----------|-------|----------|-----------|
| No params | `/verify` | Validation error | WARN |
| 1 param | `/verify token` | Validation error | WARN |
| 2 params (valid) | `/verify token key` | Success | SUCCESS |
| 2 params (invalid) | `/verify bad bad` | Failed | WARN |

---

Selamat! Anda sekarang memahami cara kerja command `/verify` dengan validation! 🎉
