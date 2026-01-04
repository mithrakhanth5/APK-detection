# Environment Variables Setup

## Current Status

**This project currently runs without any required environment variables.**

The APK detection system is self-contained and uses local Python scripts for analysis. No external APIs or databases are required for basic functionality.

## Optional Configuration

If you need to customize the behavior, you can create a `.env.local` file with the following optional variables:

### Python Configuration

```bash
# If Python is not in your PATH, specify the full path
PYTHON_PATH=/usr/bin/python3
```

### File Upload Limits

```bash
# Maximum APK file size in bytes (default: 100MB)
MAX_FILE_SIZE=104857600
```

### Analysis Timeouts

```bash
# Maximum analysis time in milliseconds (default: 60 seconds)
ANALYSIS_TIMEOUT=60000
```

## Future Integrations

### VirusTotal Integration (Optional)

To enable hash checking against VirusTotal's database:

1. Get an API key from [VirusTotal](https://www.virustotal.com/gui/join-us)
2. Add to `.env.local`:
   ```bash
   VIRUSTOTAL_API_KEY=your_api_key_here
   ```

### Database Storage (Optional)

To store analysis results in a database:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/apk_analysis
```

## Local Development Setup

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your custom values (if needed)

3. The `.env.local` file is already in `.gitignore` and won't be committed

## Render Deployment

When deploying to Render, environment variables are automatically set:

- `NODE_ENV=production`
- `PORT=10000`

You can add custom environment variables in the Render dashboard under your service's "Environment" tab.

## Security Notes

- Never commit `.env.local` or `.env` files to version control
- Use `.env.example` to document required variables for other developers
- For production, always use Render's environment variable management
- Sensitive data like API keys should only be stored in environment variables, never in code
