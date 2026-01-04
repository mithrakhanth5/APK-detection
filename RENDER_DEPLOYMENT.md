# Deploy to Render

This guide explains how to deploy the APK Detection System on Render.

## Prerequisites

- A [Render account](https://render.com) (free tier available)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**
   - Connect your repository
   - Render will automatically detect `render.yaml` and configure everything

3. **Deploy**
   - Click **"Apply"** to start the deployment
   - Render will install Python dependencies, build Next.js, and start the server
   - Your app will be live at `https://your-app-name.onrender.com`

### Option 2: Manual Setup

1. **Create a new Web Service**
   - Go to Render Dashboard
   - Click **"New +"** → **"Web Service"**
   - Connect your repository

2. **Configure the service**
   - **Name**: `apk-detection-system`
   - **Runtime**: `Node`
   - **Build Command**: `pip install androguard cryptography && npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or your preferred plan)

3. **Add Environment Variables**
   - `NODE_VERSION`: `20.11.0`
   - `PYTHON_VERSION`: `3.11.0`
   - `NODE_ENV`: `production`

4. **Deploy**
   - Click **"Create Web Service"**
   - Wait for the build and deployment to complete

## Important Configuration

### Build Script Permissions

Make the build script executable before pushing to Git:
```bash
chmod +x build.sh
```

### Python on Render

Render's Node environment includes Python 3, so the `build.sh` script will install the required Python packages (`androguard` and `cryptography`) during the build process.

### Health Checks

The service is configured with a health check at `/` to ensure the app is running properly.

### Auto Deploy

The configuration enables automatic deployments whenever you push to your main branch.

## Troubleshooting

### Build Fails
- Check that `build.sh` has execute permissions: `chmod +x build.sh`
- Verify Python packages are installing correctly in the build logs
- Ensure all Node dependencies are in `package.json`

### Python Script Not Running
- Verify the Python path in `app/api/analyze/route.ts` is correct
- On Render, you may need to use `python3` instead of `python`
- Check Render logs for Python-related errors

### Memory Issues (Free Tier)
- Free tier has 512MB RAM limit
- Large APK files may cause memory issues
- Consider upgrading to a paid plan for production use

## Monitoring

After deployment:
- Monitor logs in Render Dashboard
- Set up alerts for failures
- Check performance metrics
- Review APK analysis results

## Security Considerations

For production deployment:
- Add rate limiting to the `/api/analyze` endpoint
- Implement file size limits (configured in the upload component)
- Add authentication if needed
- Consider adding virus scanning integration
- Set up HTTPS (Render provides this automatically)

## Costs

- **Free Tier**: Suitable for testing and low-traffic use
- **Paid Plans**: Required for production with consistent uptime
- Free tier services spin down after 15 minutes of inactivity

## Next Steps

1. Test the deployed application with sample APK files
2. Monitor the logs for any errors
3. Configure custom domain (optional)
4. Set up monitoring and alerts
5. Review security settings

Your APK Detection System should now be live and accessible!
