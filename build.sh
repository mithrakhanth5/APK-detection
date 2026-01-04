#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install androguard cryptography

echo "Cleaning npm cache and node_modules..."
rm -rf node_modules package-lock.json
npm cache clean --force

echo "Installing Node dependencies..."
npm install --legacy-peer-deps

echo "Building Next.js application..."
npm run build

echo "Build complete!"
