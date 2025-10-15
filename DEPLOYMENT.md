# WeNews Web Frontend - Deployment Guide

## ✅ Production Build Complete!

Your app has been successfully built and is ready for deployment.

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   cd F:\WeNews\web-frontend
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new one
   - Set root directory: `./`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables will be loaded from `.env.production`

4. **Production deployment**:
   ```bash
   vercel --prod
   ```

**Vercel Dashboard**: https://vercel.com/dashboard

---

### Option 2: Netlify

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy to Netlify**:
   ```bash
   cd F:\WeNews\web-frontend
   netlify deploy
   ```

3. **Follow the prompts**:
   - Authorize Netlify
   - Create new site or link existing
   - Build directory: `dist`

4. **Production deployment**:
   ```bash
   netlify deploy --prod
   ```

**Netlify Dashboard**: https://app.netlify.com/

---

### Option 3: Manual Deployment

1. **Build files are in**: `F:\WeNews\web-frontend\dist`

2. **Upload to any static hosting**:
   - GitHub Pages
   - AWS S3 + CloudFront
   - Firebase Hosting
   - Render
   - Railway

3. **Important**: Make sure to configure redirects for SPA routing (all routes → `/index.html`)

---

## 🔧 Environment Variables

Make sure to set these in your deployment platform:

```
VITE_API_URL=https://wenews.onrender.com/api
VITE_APP_NAME=WeNews
VITE_APP_VERSION=1.0.0
VITE_ENABLE_TRADING=true
VITE_ENABLE_INVESTMENTS=true
VITE_ENABLE_REFERRALS=true
```

---

## 📋 Pre-Deployment Checklist

- [x] Production build successful
- [x] All TypeScript errors fixed
- [x] API services created and configured
- [x] Environment variables set
- [x] Deployment configs created (vercel.json, netlify.toml)
- [x] SPA redirects configured
- [ ] Test the deployed app
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate (auto on Vercel/Netlify)
- [ ] Configure CORS on backend for your domain

---

## 🧪 Testing Production Build Locally

```bash
cd F:\WeNews\web-frontend
npm run preview
```

This will serve the production build at `http://localhost:4173`

---

## 📱 Mobile Testing

After deployment, test on:
- iOS Safari
- Android Chrome
- Different screen sizes (320px, 768px, 1024px, 1440px)

---

## 🔒 Security Considerations

1. **CORS Configuration**: Update backend to allow your deployed domain
2. **API Keys**: Keep sensitive keys in environment variables only
3. **HTTPS**: Both Vercel and Netlify provide SSL automatically
4. **Rate Limiting**: Implement on backend if not already done

---

## 🎯 Post-Deployment Tasks

1. **Update Backend CORS**:
   - Add your deployed domain to allowed origins
   - Example: `https://wenews.vercel.app` or `https://wenews.netlify.app`

2. **Test All Features**:
   - User authentication
   - News reading and rewards
   - Trading (color & number games)
   - Wallet transactions
   - Withdrawals
   - Referral system
   - Profile updates

3. **Monitor**:
   - Check deployment logs
   - Monitor API response times
   - Track user errors (consider adding Sentry)

4. **Custom Domain** (Optional):
   - Purchase domain (e.g., wenews.com)
   - Add to Vercel/Netlify
   - Update DNS records
   - Configure SSL

---

## 🛠️ Troubleshooting

### Build fails:
```bash
rm -rf node_modules
npm install
npm run build
```

### Routes not working after deployment:
- Check `_redirects` file exists in `dist` folder
- Verify SPA redirect configuration

### API calls failing:
- Check CORS configuration on backend
- Verify `VITE_API_URL` environment variable
- Check network tab in browser dev tools

### Assets not loading:
- Verify `base` in `vite.config.ts` is set correctly
- Check asset paths in production build

---

## 📞 Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints directly
4. Check browser console for errors

---

## 🎉 Deployment Complete!

Once deployed, your WeNews web app will be live at:
- **Vercel**: `https://your-project.vercel.app`
- **Netlify**: `https://your-project.netlify.app`

Share the link with your users and start growing! 🚀
