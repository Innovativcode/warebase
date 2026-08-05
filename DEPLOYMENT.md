# WareBase Deployment Summary

## Deployment Status

### Production Environment
- **URL**: https://warebase.getcognix.shop
- **Vercel Deployment**: https://inventory-721u9ate1-adespscientists-projects.vercel.app
- **Status**: ✅ Ready
- **Database**: inventory_ms_prod (clean, no seed data)
- **Environment Variables**: All configured

### Staging Environment
- **URL**: https://staging-warebase.getcognix.shop (pending DNS)
- **Vercel Deployment**: https://inventory-i32turgla-adespscientists-projects.vercel.app
- **Status**: ✅ Ready (awaiting DNS configuration)
- **Database**: inventory_ms_staging (with seed data)
- **Environment Variables**: All configured

## DNS Configuration Required

To complete the staging deployment, you need to add a CNAME record for the staging subdomain:

### DNS Record to Add
```
Type: CNAME
Name: staging-warebase
Value: 98e172e7264165e2.vercel-dns-017.com
```

### Where to Add
- Go to your domain registrar (where getcognix.shop is managed)
- Add the CNAME record above
- Wait for DNS propagation (usually 5-30 minutes)

## Environment Separation

### Production (warebase.getcognix.shop)
- Clean database with no seed data
- Real user data
- NODE_ENV=production

### Staging (staging-warebase.getcognix.shop)
- Database with seed data for testing
- Test users and sample data
- NODE_ENV=production (but uses staging database)

### Development (localhost)
- Local development environment
- Uses .env file
- Can run seed script with `npm run prisma:seed`

## Environment Variables

All environments have the following variables configured:
- APP_NAME
- NODE_ENV
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_APP_URL
- API_PORT
- API_HOST
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- COOKIE_NAME
- CORS_ORIGIN

## Database Setup

### Production Database
The production database is clean and ready for real data. No seed data has been applied.

### Staging Database
The staging database should be seeded with test data. To seed the staging database:

```bash
# Connect to staging database and run seed
DATABASE_URL="postgresql://inventory_admin:Inventory%232026%21@localhost:55432/inventory_ms_staging?schema=public" npm run prisma:seed
```

### Local Development
To seed your local development database:

```bash
npm run prisma:seed
```

## Seed Data Credentials

After seeding, you can log in with these credentials:
- **Admin**: admin@inventory.local / Admin#2026!
- **Manager**: manager@inventory.local / Manager#2026!
- **Staff**: staff@inventory.local / Staff#2026!

## Next Steps

1. **Add DNS Record**: Add the CNAME record for staging-warebase.getcognix.shop
2. **Wait for Propagation**: DNS changes typically take 5-30 minutes
3. **Verify SSL**: Once DNS propagates, Vercel will automatically issue an SSL certificate
4. **Test Staging**: Access https://staging-warebase.getcognix.shop and verify it works
5. **Seed Staging Database**: Run the seed script against the staging database

## Security Notes

- All environment variables are encrypted in Vercel
- JWT secrets are different for production and staging
- Database URLs point to separate databases
- CORS is configured to only allow requests from the respective domains

## Support

If you encounter any issues:
1. Check Vercel deployment logs: `vercel logs <deployment-url>`
2. Verify environment variables: `vercel env ls`
3. Check domain status: `vercel domains inspect <domain>`
