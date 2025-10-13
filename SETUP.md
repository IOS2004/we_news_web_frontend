# WeNews Web Frontend - Setup Guide

## Quick Start

Follow these steps to get the web frontend running on your local machine.

### Step 1: Prerequisites

Make sure you have installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning)

Verify installations:

```powershell
node --version
npm --version
```

### Step 2: Navigate to Project

```powershell
cd f:\WeNews\web-frontend
```

### Step 3: Install Dependencies

```powershell
npm install
```

This will install all required packages (~200MB, takes 2-5 minutes).

### Step 4: Configure Environment

Create a `.env` file in the `web-frontend` folder:

```powershell
Copy-Item .env.example .env
```

Then edit `.env` with your settings:

```env
# API Configuration (use local backend or production)
VITE_API_BASE_URL=http://localhost:5000/api

# Or use production backend
# VITE_API_BASE_URL=https://wenews.onrender.com/api

# App Info
VITE_APP_NAME=WeNews
VITE_APP_VERSION=1.0.0

# Payment Gateway (for production)
VITE_CASHFREE_APP_ID=your_app_id_here
VITE_CASHFREE_MODE=sandbox
```

### Step 5: Start Backend (if running locally)

In a separate terminal, start the backend server:

```powershell
cd f:\WeNews\backend\backend
npm start
```

Backend should be running on `http://localhost:5000`

### Step 6: Start Development Server

```powershell
npm run dev
```

You should see:

```
VITE v5.1.0  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

### Step 7: Open in Browser

Navigate to: **http://localhost:3000**

You should see the WeNews sign-in page!

## First Time Usage

### Create an Account

1. Click "Sign Up" on the sign-in page
2. Fill in the registration form:
   - First Name & Last Name
   - Username (unique)
   - Email
   - Password (min 6 characters)
   - Referral Code (optional)
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the dashboard

### Explore the App

- **Dashboard**: View your stats and quick actions
- **News**: Read articles and earn rewards
- **Trading**: Play Color & Number games
- **Wallet**: Check balance and transactions
- **Network**: View your referral tree
- **Plans**: Browse investment plans

## Troubleshooting

### Issue: Dependencies won't install

**Solution**: Clear npm cache and try again

```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: Port 3000 already in use

**Solution**: Kill the process or use a different port

```powershell
# Use different port
npm run dev -- --port 3001
```

### Issue: Cannot connect to API

**Solution**: Check backend is running

1. Verify backend is running on `http://localhost:5000`
2. Check `.env` file has correct `VITE_API_BASE_URL`
3. Try accessing `http://localhost:5000/api/health` in browser

### Issue: TypeScript errors

**Solution**: Rebuild

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: Tailwind styles not working

**Solution**: Restart dev server

```powershell
# Press Ctrl+C to stop
npm run dev
```

## Building for Production

```powershell
# Create optimized build
npm run build

# Preview production build
npm run preview
```

Build output will be in `dist/` folder.

## Next Steps

1. **Customize branding**: Update colors in `tailwind.config.js`
2. **Add features**: Implement remaining pages (see README.md roadmap)
3. **Configure payments**: Set up Cashfree credentials
4. **Deploy**: Use Vercel, Netlify, or your hosting provider

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review [API Documentation](../backend/backend/API_DOCUMENTATION.md)
- Contact the development team

---

Happy coding! 🚀
