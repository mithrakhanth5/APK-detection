#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install androguard cryptography

echo "Installing Node dependencies..."
npm install

echo "Building Next.js application..."
npm run build

echo "Build complete!"
