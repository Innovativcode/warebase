# WareBase Complete Deployment Guide

## Overview

WareBase consists of two parts:
1. **Frontend**: Next.js application deployed on Vercel
2. **Backend**: Express.js API that needs separate hosting

## Current Status

### Frontend (✅ Deployed)
- Production: https://warebase.getcognix.shop
- Staging: https://staging-warebase.getcognix.shop

### Backend (❌ Not Deployed)
The Express backend is currently NOT deployed. The API endpoints are returning 404 because Vercel only hosts the Next.js frontend.

## Backend Deployment Options

### Option 1: Railway (Recommended)

Railway is the easiest way to deploy the backend with built-in PostgreSQL support.

#### Steps:

1. **Create a Railway account** at https://railway.app

2. **Create a new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your `Innovativcode/warebase` repository

3. **Add PostgreSQL database**:
   - Click "New Service" → "Database" → "PostgreSQL"
   - Copy the `DATABASE_URL` from the Variables tab

4. **Configure the backend service**:
   - Click on your deployed service
   - Go to "Variables" tab
   - Add these environment variables:
     ```
     NODE_ENV=production
     API_PORT=3000
     API_HOST=0.0.0.0
     DATABASE_URL=<your-postgresql-url>
     JWT_SECRET=<generate-a-secure-random-string-min-32-chars>
     JWT_EXPIRES_IN=7d
     COOKIE_NAME=inventory_session
     CORS_ORIGIN=https://warebase.getcognix.shop,https://staging-warebase.getcognix.shop
     ```

5. **Set build and start commands**:
   - Go to "Settings" tab
   - Build Command: `npm install && npm run build:api`
   - Start Command: `node server/dist/index.js`

6. **Generate a domain**:
   - Go to "Settings" tab
   - Click "Generate Domain"
   - You'll get a URL like: `https://your-app.up.railway.app`

7. **Update frontend environment variables on Vercel**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: https://your-app.up.railway.app/api/v1
   ```

### Option 2: Render

Render is another good option with free tier available.

#### Steps:

1. **Create a Render account** at https://render.com

2. **Create a new Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure the service**:
   - Name: `warebase-api`
   - Environment: `Node`
   - Build Command: `npm install && npm run build:api`
   - Start Command: `node server/dist/index.js`

4. **Add PostgreSQL database**:
   - Click "New" → "PostgreSQL"
   - Copy the Internal Database URL

5. **Add environment variables** (same as Railway)

6. **Deploy and get the URL**

7. **Update Vercel environment variable**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: https://your-render-url.onrender.com/api/v1
   ```

### Option 3: Fly.io

Fly.io offers good performance with global distribution.

#### Steps:

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly**:
   ```bash
   fly auth login
   ```

3. **Create a new app**:
   ```bash
   fly launch --name warebase-api
   ```

4. **Create a PostgreSQL database**:
   ```bash
   fly postgres create --name warebase-db
   fly postgres attach warebase-db
   ```

5. **Set secrets**:
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set DATABASE_URL=<your-db-url>
   fly secrets set JWT_SECRET=<your-secret>
   # ... add other variables
   ```

6. **Deploy**:
   ```bash
   fly deploy
   ```

## Creating Superadmin on Production

After deploying the backend, create the superadmin account:

### On Railway/Render:

1. **Open the service shell**:
   - Railway: Click "Deploy" → "Shell"
   - Render: Click "Shell" in the dashboard

2. **Run the superadmin seed script**:
   ```bash
   npm run prisma:seed:superadmin
   ```

3. **Default credentials**:
   - Email: `superadmin@warebase.io`
   - Password: `SuperAdmin#2026!Secure`

### Custom Superadmin Credentials:

You can customize the superadmin credentials using environment variables:

```bash
SUPERADMIN_EMAIL=admin@yourcompany.com
SUPERADMIN_PASSWORD=YourSecurePassword123!
SUPERADMIN_NAME="Company Admin"
npm run prisma:seed:superadmin
```

## Updating Frontend to Use External Backend

After deploying the backend, update the frontend:

### On Vercel:

```bash
# Update production API URL
vercel env rm NEXT_PUBLIC_API_URL production -y
vercel env add NEXT_PUBLIC_API_URL production --value "https://your-backend-url.com/api/v1"

# Update staging API URL
vercel env rm NEXT_PUBLIC_API_URL preview -y
vercel env add NEXT_PUBLIC_API_URL preview --value "https://your-backend-url.com/api/v1"

# Redeploy
vercel --prod
```

## Complete Environment Variables

### Frontend (Vercel):

**Production:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
NEXT_PUBLIC_APP_URL=https://warebase.getcognix.shop
```

**Staging:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
NEXT_PUBLIC_APP_URL=https://staging-warebase.getcognix.shop
```

### Backend (Railway/Render):

```
NODE_ENV=production
API_PORT=3000
API_HOST=0.0.0.0
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
COOKIE_NAME=inventory_session
CORS_ORIGIN=https://warebase.getcognix.shop,https://staging-warebase.getcognix.shop
```

## Database Setup

### Production Database (Clean):
```bash
# On your backend hosting platform
npm run prisma:push
npm run prisma:seed:superadmin
```

### Staging Database (With seed data):
```bash
# On your backend hosting platform
npm run prisma:push
npm run prisma:seed
npm run prisma:seed:superadmin
```

## Testing the Deployment

1. **Test backend health**:
   ```bash
   curl https://your-backend-url.com/health
   # Should return: {"success":true,"data":{"status":"ok","service":"inventory-api"}}
   ```

2. **Test frontend**:
   - Visit https://warebase.getcognix.shop
   - Try to register a new account
   - Verify the API calls are going to your backend

3. **Test superadmin login**:
   - Go to https://warebase.getcognix.shop/login
   - Login with superadmin credentials
   - Verify you can create other admin users

## Troubleshooting

### API returning 404:
- Check that `NEXT_PUBLIC_API_URL` is set correctly on Vercel
- Verify the backend is running and accessible
- Check CORS settings on the backend

### Database connection errors:
- Verify `DATABASE_URL` is correct
- Check database is accessible from your backend hosting
- Ensure database migrations have run

### Superadmin can't login:
- Run `npm run prisma:seed:superadmin` again
- Check the email and password are correct
- Verify the user is active in the database

## Security Checklist

- [ ] Change superadmin password after first login
- [ ] Use strong JWT_SECRET (min 32 characters, random)
- [ ] Enable HTTPS on backend (automatic on Railway/Render)
- [ ] Set up proper CORS origins
- [ ] Regular database backups
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated

## Support

If you encounter issues:
1. Check backend logs on Railway/Render dashboard
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Test backend endpoints directly with curl

## Next Steps

1. Deploy backend to Railway or Render
2. Update `NEXT_PUBLIC_API_URL` on Vercel
3. Create superadmin account
4. Test the full flow
5. Set up monitoring and backups
