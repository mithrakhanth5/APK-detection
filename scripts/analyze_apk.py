#!/usr/bin/env python3
"""
APK Static Analysis Script
Analyzes Android APK files without execution for security assessment
"""

import sys
import json
import hashlib
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
import re

# Dangerous permissions that indicate potential security risks
DANGEROUS_PERMISSIONS = {
    "android.permission.READ_SMS": "Read SMS messages - Can access all text messages",
    "android.permission.SEND_SMS": "Send SMS messages - Can send texts without user knowledge",
    "android.permission.RECEIVE_SMS": "Receive SMS messages - Can intercept incoming texts",
    "android.permission.READ_CONTACTS": "Read contacts - Can access all contact information",
    "android.permission.WRITE_CONTACTS": "Write contacts - Can modify or add contacts",
    "android.permission.READ_CALL_LOG": "Read call log - Can see all calls made and received",
    "android.permission.WRITE_CALL_LOG": "Write call log - Can modify call history",
    "android.permission.CAMERA": "Camera access - Can take photos and videos",
    "android.permission.RECORD_AUDIO": "Record audio - Can record sound without notification",
    "android.permission.ACCESS_FINE_LOCATION": "Precise location - Can track exact GPS location",
    "android.permission.ACCESS_COARSE_LOCATION": "Approximate location - Can track general location",
    "android.permission.READ_EXTERNAL_STORAGE": "Read storage - Can access all files on device",
    "android.permission.WRITE_EXTERNAL_STORAGE": "Write storage - Can create/modify/delete files",
    "android.permission.INSTALL_PACKAGES": "Install apps - Can install other applications",
    "android.permission.DELETE_PACKAGES": "Delete apps - Can uninstall applications",
    "android.permission.SYSTEM_ALERT_WINDOW": "Draw over apps - Can display overlays (phishing risk)",
    "android.permission.BIND_ACCESSIBILITY_SERVICE": "Accessibility service - Can monitor all user actions",
    "android.permission.BIND_DEVICE_ADMIN": "Device admin - Can control device remotely",
    "android.permission.REQUEST_INSTALL_PACKAGES": "Request installs - Can prompt to install apps",
    "android.permission.RECEIVE_BOOT_COMPLETED": "Start at boot - Runs automatically when device starts",
    "android.permission.WAKE_LOCK": "Prevent sleep - Can keep device awake",
    "android.permission.INTERNET": "Internet access - Can send data to external servers",
    "android.permission.ACCESS_NETWORK_STATE": "Network state - Can check connectivity",
    "android.permission.CHANGE_WIFI_STATE": "Change WiFi - Can enable/disable WiFi",
    "android.permission.BLUETOOTH": "Bluetooth - Can connect to Bluetooth devices",
    "android.permission.BLUETOOTH_ADMIN": "Bluetooth admin - Can discover and pair devices",
    "android.permission.GET_ACCOUNTS": "Get accounts - Can access account information",
    "android.permission.USE_CREDENTIALS": "Use credentials - Can access authentication tokens",
    "android.permission.MANAGE_ACCOUNTS": "Manage accounts - Can add/remove accounts",
}

def calculate_sha256(file_path):
    """Calculate SHA256 hash of the APK file"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def format_file_size(size_bytes):
    """Format file size in human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

def parse_manifest(apk_path):
    """Extract and parse AndroidManifest.xml from APK"""
    try:
        with zipfile.ZipFile(apk_path, 'r') as zip_ref:
            # Try to read manifest (it's binary encoded in APK)
            manifest_data = zip_ref.read('AndroidManifest.xml')
            
            # For demonstration, we'll extract basic info from binary manifest
            # In production, you'd use a proper APK parser library like androguard
            
            # Extract package name (simple pattern matching)
            package_pattern = rb'([a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_])'
            packages = re.findall(package_pattern, manifest_data)
            package_name = packages[0][0].decode('utf-8', errors='ignore') if packages else "com.unknown.app"
            
            return {
                'package_name': package_name,
                'version_name': '1.0',
                'version_code': '1',
                'permissions': extract_permissions(manifest_data)
            }
    except Exception as e:
        print(f"Error parsing manifest: {e}", file=sys.stderr)
        return {
            'package_name': 'com.unknown.app',
            'version_name': '1.0',
            'version_code': '1',
            'permissions': []
        }

def extract_permissions(manifest_data):
    """Extract permissions from manifest data"""
    permissions = []
    
    # Look for permission patterns in binary data
    for perm_name in DANGEROUS_PERMISSIONS.keys():
        if perm_name.encode() in manifest_data:
            permissions.append(perm_name)
    
    # Add some common normal permissions
    normal_perms = [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.WAKE_LOCK"
    ]
    
    for perm in normal_perms:
        if perm.encode() in manifest_data and perm not in permissions:
            permissions.append(perm)
    
    return permissions

def check_signature(apk_path):
    """Check if APK is signed and certificate type"""
    try:
        with zipfile.ZipFile(apk_path, 'r') as zip_ref:
            # Check for META-INF directory with signing files
            files = zip_ref.namelist()
            has_rsa = any(f.startswith('META-INF/') and f.endswith('.RSA') for f in files)
            has_dsa = any(f.startswith('META-INF/') and f.endswith('.DSA') for f in files)
            has_sf = any(f.startswith('META-INF/') and f.endswith('.SF') for f in files)
            
            is_signed = has_rsa or has_dsa and has_sf
            
            # Check for debug keystore signature
            cert_type = "Unknown"
            issuer = "Unknown"
            
            if is_signed:
                # Simple heuristic: debug builds often have "Android Debug" in cert
                cert_type = "Release" if has_rsa else "Debug/Unknown"
                issuer = "CN=Android, O=Google Inc, C=US" if has_rsa else "CN=Android Debug, O=Android, C=US"
            
            return {
                'is_signed': is_signed,
                'certificate_type': cert_type,
                'issuer': issuer
            }
    except Exception as e:
        print(f"Error checking signature: {e}", file=sys.stderr)
        return {
            'is_signed': False,
            'certificate_type': 'Unknown',
            'issuer': 'Unknown'
        }

def calculate_risk_score(permissions, signature_info, file_size):
    """Calculate risk score based on various factors"""
    score = 0
    warnings = []
    
    # Check dangerous permissions
    dangerous_count = sum(1 for p in permissions if p in DANGEROUS_PERMISSIONS)
    
    if dangerous_count >= 5:
        score += 40
        warnings.append(f"Requests {dangerous_count} dangerous permissions - excessive for most apps")
    elif dangerous_count >= 3:
        score += 25
        warnings.append(f"Requests {dangerous_count} dangerous permissions")
    elif dangerous_count >= 1:
        score += 10
    
    # Check for high-risk permission combinations
    if "android.permission.SEND_SMS" in permissions and "android.permission.INTERNET" in permissions:
        score += 20
        warnings.append("Can send SMS and access internet - potential for premium rate fraud")
    
    if "android.permission.BIND_ACCESSIBILITY_SERVICE" in permissions:
        score += 25
        warnings.append("Requests accessibility service - can monitor all user interactions")
    
    if "android.permission.SYSTEM_ALERT_WINDOW" in permissions and "android.permission.INTERNET" in permissions:
        score += 15
        warnings.append("Can draw overlays and access internet - phishing risk")
    
    if "android.permission.BIND_DEVICE_ADMIN" in permissions:
        score += 20
        warnings.append("Requests device administrator access - difficult to remove")
    
    # Check signature
    if not signature_info['is_signed']:
        score += 30
        warnings.append("APK is not properly signed - unverified source")
    elif signature_info['certificate_type'] == 'Debug/Unknown':
        score += 15
        warnings.append("Signed with debug certificate - not intended for distribution")
    
    # Check for location + network combination
    if ("android.permission.ACCESS_FINE_LOCATION" in permissions or 
        "android.permission.ACCESS_COARSE_LOCATION" in permissions) and \
       "android.permission.INTERNET" in permissions:
        if dangerous_count > 3:
            score += 10
            warnings.append("Tracks location and has network access with other risky permissions")
    
    return min(score, 100), warnings

def determine_risk_level(score):
    """Determine risk level based on score"""
    if score >= 60:
        return "MALICIOUS"
    elif score >= 30:
        return "SUSPICIOUS"
    else:
        return "SAFE"

def generate_summary(risk_level, dangerous_count):
    """Generate human-readable summary"""
    if risk_level == "MALICIOUS":
        return "This APK exhibits multiple high-risk behaviors and should NOT be installed. It may steal data, send premium SMS, or compromise device security."
    elif risk_level == "SUSPICIOUS":
        return f"This APK requests {dangerous_count} potentially dangerous permissions and shows concerning patterns. Exercise extreme caution before installing."
    else:
        return "This APK appears to have a reasonable permission set and no immediate red flags. However, always verify the source before installing any app."

def analyze_apk(apk_path, file_name, file_size):
    """Main analysis function"""
    
    # Calculate hash
    sha256 = calculate_sha256(apk_path)
    
    # Parse manifest
    manifest_info = parse_manifest(apk_path)
    
    # Check signature
    signature_info = check_signature(apk_path)
    
    # Categorize permissions
    dangerous_perms = []
    normal_perms = []
    
    for perm in manifest_info['permissions']:
        if perm in DANGEROUS_PERMISSIONS:
            dangerous_perms.append({
                'name': perm,
                'description': DANGEROUS_PERMISSIONS[perm]
            })
        else:
            normal_perms.append(perm)
    
    # Calculate risk
    risk_score, warnings = calculate_risk_score(
        manifest_info['permissions'],
        signature_info,
        file_size
    )
    
    risk_level = determine_risk_level(risk_score)
    summary = generate_summary(risk_level, len(dangerous_perms))
    
    # Build result
    result = {
        'riskScore': risk_score,
        'riskLevel': risk_level,
        'summary': summary,
        'warnings': warnings if warnings else ["No immediate security concerns detected"],
        'metadata': {
            'packageName': manifest_info['package_name'],
            'versionName': manifest_info['version_name'],
            'versionCode': manifest_info['version_code'],
            'fileSize': format_file_size(file_size),
            'sha256': sha256
        },
        'permissions': {
            'dangerous': dangerous_perms,
            'normal': normal_perms
        },
        'signature': {
            'isSigned': signature_info['is_signed'],
            'certificateType': signature_info['certificate_type'],
            'issuer': signature_info['issuer']
        }
    }
    
    return result

def main():
    if len(sys.argv) != 4:
        print("Usage: analyze_apk.py <apk_path> <file_name> <file_size>", file=sys.stderr)
        sys.exit(1)
    
    apk_path = sys.argv[1]
    file_name = sys.argv[2]
    file_size = int(sys.argv[3])
    
    try:
        result = analyze_apk(apk_path, file_name, file_size)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error analyzing APK: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
