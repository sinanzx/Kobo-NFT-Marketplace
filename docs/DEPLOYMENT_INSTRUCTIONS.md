# Production Deployment Instructions

This guide walks you through deploying the Kobo NFT platform to production.

## Prerequisites

- [x] All API keys configured in `.env.example`
- [ ] Vercel account created
- [ ] Production Supabase project created
- [ ] Domain name registered (optional)

## Step 1: Supabase Production Setup

### 1.1 Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and region (choose closest to your users)
4. Set a strong database password (save it securely)
5. Wait for project to be provisioned (~2 minutes)

### 1.2 Apply Database Migrations

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your production project
supabase link --project-ref YOUR_PROJECT_REF

# Apply all migrations
supabase db push
```

Alternatively, you can apply migrations manually:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of each migration file from `supabase/migrations/` in order
3. Execute each migration

### 1.3 Create Storage Bucket

1. Go to Storage in Supabase Dashboard
2. Create bucket named `nft-media` (public)
3. Create bucket named `user-exports` (private)
4. Set up RLS policies (already in migrations)

### 1.4 Deploy Edge Functions

```bash
# Deploy GDPR functions
supabase functions deploy gdpr-delete-user
supabase functions deploy gdpr-export-data

# Set environment secrets
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 1.5 Get Production Credentials

From your Supabase project settings:
- Project URL: `https://YOUR_PROJECT.supabase.co`
- Anon Key: `eyJ...` (public, safe for frontend)
- Service Role Key: `eyJ...` (secret, never expose to frontend)

## Step 2: Vercel Deployment

### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Login to Vercel

```bash
vercel login
```

### 2.3 Link Project

```bash
vercel link
```

### 2.4 Set Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

**Frontend Variables (VITE_*):**
```
VITE_CHAIN=mainnet
VITE_HF_API_KEY=your_production_key
VITE_ELEVENLABS_API_KEY=your_production_key
VITE_RUNWAY_API_KEY=your_production_key
VITE_WALLETCONNECT_PROJECT_ID=your_production_id
VITE_PINATA_API_KEY=your_production_key
VITE_PINATA_SECRET_KEY=your_production_secret
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
VITE_TINEYE_API_KEY=your_production_key
VITE_TINEYE_API_URL=https://api.tineye.com/rest/
VITE_TINEYE_MATCH_THRESHOLD=75
VITE_SENTRY_DSN=your_production_dsn
VITE_APP_VERSION=1.0.0
VITE_SENTRY_ENVIRONMENT=production
```

**Backend Variables (for CI/CD only):**
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

### 2.5 Deploy to Production

```bash
# Deploy to production
vercel --prod
```

Or push to main branch if you have GitHub integration enabled.

## Step 3: Smart Contract Deployment

### 3.1 Prepare for Deployment

1. Review `contracts/SMART_CONTRACT_SECURITY.md`
2. Complete security audit (recommended)
3. Set up multi-sig wallet (3-of-5 recommended)
4. Get sufficient ETH for deployment

### 3.2 Deploy Contracts

```bash
cd contracts

# Set environment variables
export DEPLOYER_PRIVATE_KEY=your_private_key
export RPC_URL=your_mainnet_rpc_url
export ETHERSCAN_API_KEY=your_etherscan_key

# Run deployment script
forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast --verify

# Save deployment addresses
```

### 3.3 Update Frontend Config

Update `contracts/interfaces/metadata.json` with deployed contract addresses.

### 3.4 Verify on Etherscan

Contracts should auto-verify, but if not:

```bash
forge verify-contract CONTRACT_ADDRESS ContractName --chain-id 1
```

## Step 4: Post-Deployment Verification

### 4.1 Smoke Tests

- [ ] Homepage loads correctly
- [ ] User can connect wallet
- [ ] User can sign up/login
- [ ] NFT minting works
- [ ] All pages accessible
- [ ] No console errors

### 4.2 Security Checks

- [ ] HTTPS enabled
- [ ] Security headers configured (check vercel.json)
- [ ] RLS policies active
- [ ] No sensitive data in frontend
- [ ] API keys have domain restrictions

### 4.3 Performance Checks

- [ ] Lighthouse score >90
- [ ] Core Web Vitals passing
- [ ] Images optimized
- [ ] Bundle size <500KB

## Step 5: Monitoring Setup

### 5.1 Sentry Error Tracking

Already configured via `VITE_SENTRY_DSN`. Verify:
1. Go to Sentry Dashboard
2. Check errors are being reported
3. Set up alerts for critical errors

### 5.2 Uptime Monitoring

Set up with UptimeRobot or similar:
1. Monitor main domain
2. Monitor API endpoints
3. Set up email/SMS alerts

### 5.3 Analytics

If using Google Analytics:
1. Create GA4 property
2. Add tracking code (respecting cookie consent)
3. Verify data collection

## Step 6: DNS & Domain Setup (Optional)

### 6.1 Configure Custom Domain

In Vercel Dashboard:
1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 6.2 Update DNS Records

Add these records at your DNS provider:
```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

### 6.3 Wait for SSL

Vercel automatically provisions SSL certificates. Wait ~24 hours for DNS propagation.

## Step 7: Launch Checklist

Before announcing launch:

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Edge Functions deployed
- [ ] Smart contracts deployed and verified
- [ ] Frontend deployed to production
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring and alerts configured
- [ ] Error tracking active
- [ ] Legal pages accessible (/privacy, /terms, /cookies)
- [ ] Cookie consent working
- [ ] All critical user flows tested
- [ ] Team notified and ready for support
- [ ] Announcement prepared

## Rollback Procedure

If issues arise:

### Rollback Frontend
```bash
# Revert to previous deployment in Vercel Dashboard
# Or redeploy previous version
vercel --prod
```

### Rollback Database
```bash
# Restore from Supabase backup
# Go to Database → Backups → Restore
```

### Rollback Contracts
Smart contracts cannot be rolled back. Use emergency pause if implemented.

## Support Contacts

- **Technical Issues**: tech@kobo-nft.com
- **Security Issues**: security@kobo-nft.com
- **General Support**: support@kobo-nft.com

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [Production Security Guide](./PRODUCTION_SECURITY.md)
- [Mainnet Launch Checklist](./MAINNET_LAUNCH_CHECKLIST.md)

---

**Last Updated**: November 27, 2024
