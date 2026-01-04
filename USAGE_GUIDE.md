# APK Detection System - Usage Guide

This guide demonstrates how to use the Malicious APK Detection and Pre-Installation Warning System for academic security research and education.

## System Overview

The system performs **static analysis** on Android APK files before installation, providing:

1. **Security Risk Assessment** - 0-100 score with color-coded classifications
2. **Permission Analysis** - Identifies dangerous permissions and explains risks
3. **Signature Verification** - Validates digital certificates and signing status
4. **Informed Consent** - Warns users about risks while allowing installation

## Quick Start

### 1. Launch the Application

```bash
npm run dev
```

Navigate to `http://localhost:3000`

### 2. Upload an APK File

**Method A: Drag and Drop**
- Drag an APK file from your file manager
- Drop it onto the upload area

**Method B: File Browser**
- Click the upload area
- Select an APK file from the file picker

**Constraints:**
- File must have `.apk` extension
- Maximum size: 100MB
- Only one file at a time

### 3. Analyze the APK

Click the "Analyze APK" button. The system will:

1. Upload file securely to the server
2. Calculate SHA256 hash for integrity
3. Extract AndroidManifest.xml
4. Parse permissions and components
5. Verify digital signature
6. Calculate risk score
7. Generate security warnings

Analysis typically takes 2-5 seconds depending on APK size.

### 4. Review Results

The analysis page displays:

#### Risk Summary Card
- **Risk Level**: SAFE (Green) / SUSPICIOUS (Yellow) / MALICIOUS (Red)
- **Risk Score**: 0-100 numerical score with visual progress bar
- **Summary**: Plain-language explanation of findings
- **Warnings**: Specific security concerns detected

#### APK Metadata
- Package name and version
- File size and SHA256 hash
- Basic app information

#### Permissions Analysis
- **Dangerous Permissions**: Permissions that can harm users
  - Each includes name and risk description
  - Highlighted in red
- **Normal Permissions**: Standard app permissions
  - Basic network, storage, etc.

#### Signature Verification
- Signing status (Signed/Unsigned)
- Certificate type (Release/Debug)
- Issuer information

### 5. Informed Consent Process

**For SAFE APKs (0-29 points):**
- Green "Ready to Install" message
- Direct installation button available

**For SUSPICIOUS APKs (30-59 points):**
- Yellow warning alert displayed
- Explanation of specific risks
- "I Understand the Risks" button required
- Installation only after explicit consent

**For MALICIOUS APKs (60-100 points):**
- Red critical warning displayed
- Strong recommendation NOT to install
- Detailed explanation of threats
- "I Understand the Risks" button required
- Installation only after explicit consent

## Understanding Risk Scores

### Score Breakdown

| Score Range | Classification | Meaning |
|-------------|---------------|---------|
| 0-29 | SAFE | Reasonable permissions, properly signed |
| 30-59 | SUSPICIOUS | Multiple dangerous permissions or signature issues |
| 60-100 | MALICIOUS | Excessive permissions, unsigned, or dangerous combinations |

### What Increases Risk Score

**Permission Count:**
- 1-2 dangerous permissions: +10 points
- 3-4 dangerous permissions: +25 points
- 5+ dangerous permissions: +40 points

**Dangerous Combinations:**
- SMS + Internet: +20 (fraud risk)
- Accessibility Service: +25 (monitoring risk)
- System Alert + Internet: +15 (phishing risk)
- Device Admin: +20 (ransomware risk)
- Location + Internet + others: +10 (privacy risk)

**Signature Issues:**
- Unsigned APK: +30 points
- Debug certificate: +15 points

## Example Scenarios

### Scenario 1: Legitimate Messaging App

**Permissions Requested:**
- INTERNET (send/receive messages)
- READ_CONTACTS (find friends)
- CAMERA (photo messages)
- RECORD_AUDIO (voice messages)

**Analysis Result:**
- Risk Score: 25/100
- Classification: SAFE
- Reason: Standard permissions for messaging, properly signed

### Scenario 2: Suspicious Game

**Permissions Requested:**
- INTERNET
- SEND_SMS
- READ_SMS
- ACCESS_FINE_LOCATION
- READ_CONTACTS
- READ_PHONE_STATE

**Analysis Result:**
- Risk Score: 55/100
- Classification: SUSPICIOUS
- Warnings:
  - "Requests 5 dangerous permissions - excessive for most apps"
  - "Can send SMS and access internet - potential for premium rate fraud"
  - "Signed with debug certificate - not intended for distribution"

**User Decision:** Requires explicit consent acknowledgment

### Scenario 3: Malicious Adware

**Permissions Requested:**
- INTERNET
- SYSTEM_ALERT_WINDOW
- BIND_ACCESSIBILITY_SERVICE
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE
- ACCESS_FINE_LOCATION
- READ_PHONE_STATE
- CAMERA

**Analysis Result:**
- Risk Score: 90/100
- Classification: MALICIOUS
- Warnings:
  - "Requests 7 dangerous permissions - excessive for most apps"
  - "Requests accessibility service - can monitor all user interactions"
  - "Can draw overlays and access internet - phishing risk"
  - "APK is not properly signed - unverified source"

**Recommendation:** DO NOT INSTALL

## Security Best Practices

### For Researchers

1. **Always use a test device or emulator**
   - Never analyze unknown APKs on personal devices
   - Use isolated virtual machines or Android emulators

2. **Verify APK sources**
   - Compare hashes with official sources
   - Check developer signatures

3. **Document your findings**
   - Save analysis reports
   - Note unusual permission patterns

4. **Report malware**
   - Submit findings to security researchers
   - Report to Google Play Protect
   - Share IOCs with security community

### For Educators

1. **Demonstrate false positives**
   - Show how legitimate apps can score high
   - Explain context matters

2. **Discuss limitations**
   - Static analysis can't detect everything
   - Runtime behavior matters
   - Obfuscation techniques

3. **Teach informed consent**
   - Users must understand risks
   - Warnings aren't absolute blocks
   - Security is probabilistic

## Troubleshooting

### "Analysis failed" error

**Possible causes:**
1. Python3 not installed or not in PATH
2. APK file corrupted
3. Insufficient permissions to create temp files

**Solutions:**
- Verify Python3 installation: `python3 --version`
- Re-download the APK file
- Check system temp directory permissions

### Analysis takes too long

**Possible causes:**
1. Very large APK file (close to 100MB)
2. Server overload

**Solutions:**
- Wait up to 30 seconds for large files
- Reduce file size if possible
- Restart the development server

### Incorrect risk assessment

**Remember:**
- This is a **rule-based** system
- False positives/negatives are possible
- Use as one tool among many
- Verify with VirusTotal, Play Protect, etc.

## Academic Use Cases

### 1. Mobile Security Course Lab
**Exercise:** Analyze 5 APKs (2 safe, 2 suspicious, 1 malicious)
- Compare risk scores
- Explain permission justifications
- Identify false positives

### 2. Malware Research Project
**Exercise:** Create dataset of APK risk profiles
- Collect metadata from 100+ APKs
- Correlate scores with VirusTotal results
- Validate scoring algorithm

### 3. Security Awareness Training
**Exercise:** Demonstrate informed consent
- Show how warnings appear
- Discuss why users ignore warnings
- Improve warning message effectiveness

### 4. Reverse Engineering Demo
**Exercise:** Compare static vs dynamic analysis
- Use this tool for static analysis
- Use Android Debug Bridge for dynamic
- Identify what each method reveals

## Ethical Guidelines

### Acceptable Use
✅ Academic research and education
✅ Security awareness training
✅ Personal device security assessment
✅ Malware analysis in controlled environments
✅ Developing improved detection techniques

### Prohibited Use
❌ Distributing malware
❌ Bypassing app store security
❌ Unauthorized reverse engineering
❌ Copyright infringement
❌ Creating attack tools
❌ Commercial malware scanning (without proper licensing)

## API Integration (Advanced)

You can integrate the analysis API into other tools:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "apk=@/path/to/app.apk"
```

Response format: See README.md API Reference section

## Further Reading

- **Android Security Documentation**: developer.android.com/security
- **OWASP Mobile Security Project**: owasp.org/www-project-mobile-security
- **Android Malware Research**: academic papers on Android threat landscape
- **Static Analysis Techniques**: Research on APK analysis methodologies

## Support

For academic support or to report issues:
1. Review the README.md documentation
2. Check error logs in browser console
3. Verify Python script output
4. Create detailed bug reports with examples

---

**Remember:** This tool is for **educational purposes only**. Always follow ethical guidelines and applicable laws when analyzing APK files.
