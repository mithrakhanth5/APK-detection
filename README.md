# Malicious APK Detection and Pre-Installation Warning System

A web-based security tool that analyzes Android APK files **before installation** to detect potential malware and security risks, providing users with informed consent options.

## Features

### 🔍 Comprehensive APK Analysis
- **Static Analysis**: Inspects APK structure without execution
- **Permission Analysis**: Identifies dangerous permissions and risky combinations
- **Signature Verification**: Checks digital signatures and certificates
- **Metadata Extraction**: Package name, version, file hash, and more
- **Risk Scoring**: 0-100 score with SAFE/SUSPICIOUS/MALICIOUS classification

### ⚠️ Security-Focused UI
- Color-coded risk levels (Green/Yellow/Red)
- Clear, non-technical warnings for users
- Informed consent system for risky APKs
- Expandable sections for detailed analysis

### 🛡️ Key Security Checks
- **Dangerous Permissions**: SMS, Contacts, Location, Camera, etc.
- **Risky Combinations**: SMS + Internet, Overlay + Internet, etc.
- **Signature Status**: Signed/Unsigned, Debug/Release certificates
- **Privilege Escalation**: Device Admin, Accessibility Service
- **Data Exfiltration**: Location tracking, storage access

## System Architecture

```
┌─────────────┐
│   Next.js   │  Frontend - File upload & results display
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   API Route │  Backend - /api/analyze
│  (Node.js)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Python    │  Analysis Engine - Static APK inspection
│   Script    │
└─────────────┘
```

## Installation

### Prerequisites
- Node.js 18+
- Python 3.8+

### Setup

1. **Clone or download the project**
   ```bash
   npx shadcn@latest init
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## How It Works

### 1. APK Upload
Users drag-and-drop or select an APK file (max 100MB). The file is validated client-side before upload.

### 2. Static Analysis
The Python script performs:
- **Hash Calculation**: SHA256 for file integrity
- **ZIP Inspection**: Extracts AndroidManifest.xml
- **Permission Parsing**: Identifies all requested permissions
- **Signature Check**: Verifies META-INF signing files
- **Pattern Detection**: Looks for known malicious patterns

### 3. Risk Scoring Algorithm
```python
Base Score = 0

# Permission-based scoring
If dangerous_permissions >= 5: +40 points
If dangerous_permissions >= 3: +25 points
If dangerous_permissions >= 1: +10 points

# Combination penalties
SMS + Internet: +20 points
Accessibility Service: +25 points
System Alert Window + Internet: +15 points
Device Admin: +20 points

# Signature penalties
Unsigned APK: +30 points
Debug Certificate: +15 points

Final Score = min(total, 100)
```

### 4. Risk Classification
- **0-29**: SAFE (Green)
- **30-59**: SUSPICIOUS (Yellow)
- **60-100**: MALICIOUS (Red)

### 5. User Warning & Consent
- **SAFE**: Direct installation option
- **SUSPICIOUS/MALICIOUS**: Warning message with "I Understand the Risks" consent button

## Security Considerations

### What This System Does ✅
- Static analysis (no code execution)
- Permission and signature verification
- Rule-based malware pattern detection
- User education about risks

### What This System Does NOT Do ❌
- Dynamic analysis (no APK execution)
- Machine learning classification
- Persistent file storage
- Behavioral analysis

### Ethical Use
This tool is designed for:
- **Academic research** in mobile security
- **Educational demonstrations** of APK analysis
- **Security awareness** training
- **Ethical malware analysis**

**Not intended for:**
- Bypassing app store security
- Distributing malicious apps
- Unauthorized reverse engineering

## File Structure

```
├── app/
│   ├── page.tsx                  # Main page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Security-themed styles
│   └── api/
│       └── analyze/
│           └── route.ts          # API endpoint
├── components/
│   ├── apk-upload.tsx            # Upload interface
│   └── apk-results.tsx           # Results display
├── scripts/
│   └── analyze_apk.py            # Python analysis engine
├── types/
│   └── analysis.ts               # TypeScript interfaces
└── README.md
```

## API Reference

### POST /api/analyze

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `apk` (File)

**Response:**
```json
{
  "riskScore": 45,
  "riskLevel": "SUSPICIOUS",
  "summary": "This APK requests 4 potentially dangerous permissions...",
  "warnings": [
    "Requests 4 dangerous permissions",
    "Can send SMS and access internet - potential for fraud"
  ],
  "metadata": {
    "packageName": "com.example.app",
    "versionName": "1.0",
    "versionCode": "1",
    "fileSize": "5.23 MB",
    "sha256": "abc123..."
  },
  "permissions": {
    "dangerous": [
      {
        "name": "android.permission.SEND_SMS",
        "description": "Send SMS messages - Can send texts without user knowledge"
      }
    ],
    "normal": ["android.permission.INTERNET"]
  },
  "signature": {
    "isSigned": true,
    "certificateType": "Release",
    "issuer": "CN=Android, O=Google Inc, C=US"
  }
}
```

## Dangerous Permissions Detected

The system monitors 25+ dangerous permissions including:

| Category | Permissions |
|----------|-------------|
| **SMS** | READ_SMS, SEND_SMS, RECEIVE_SMS |
| **Contacts** | READ_CONTACTS, WRITE_CONTACTS |
| **Location** | ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION |
| **Storage** | READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE |
| **Device Control** | BIND_DEVICE_ADMIN, SYSTEM_ALERT_WINDOW |
| **Monitoring** | BIND_ACCESSIBILITY_SERVICE, RECORD_AUDIO |

## Limitations

1. **Basic Pattern Matching**: Uses simple binary pattern detection instead of full DEX decompilation
2. **No Behavioral Analysis**: Cannot detect runtime malicious behavior
3. **Rule-Based Only**: No machine learning or heuristic analysis
4. **Limited Obfuscation Detection**: Advanced obfuscation may evade detection

## Future Enhancements

- Integration with VirusTotal API for multi-engine scanning
- DEX bytecode decompilation with Androguard library
- Network traffic pattern analysis
- Certificate chain validation
- APK comparison with official versions

## Academic Context

This project demonstrates:
- **Secure file handling** (temporary storage, cleanup)
- **Static analysis techniques** (ZIP inspection, manifest parsing)
- **Risk assessment algorithms** (permission-based scoring)
- **Security-focused UX** (informed consent, clear warnings)
- **Ethical disclosure** (educational purpose, limitations)

## License

For academic and educational use only. Not licensed for commercial distribution.

## Disclaimer

This tool is provided for **educational and research purposes only**. Users are responsible for complying with all applicable laws and regulations. The authors assume no liability for misuse of this software.

---

**Built with:** Next.js 16, React 19, TypeScript, Python 3, Tailwind CSS
