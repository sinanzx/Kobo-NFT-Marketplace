# Deployment Guide

Complete guide for deploying KoboNFT platform to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment Platforms](#deployment-platforms)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Database Migrations](#database-migrations)
- [Monitoring & Alerts](#monitoring--alerts)
- [Rollback Procedures](#rollback-procedures)
- [Security Checklist](#security-checklist)

---

## Prerequisites

### Required Accounts
- [ ] GitHub account with repository access
- [ ] Vercel account for frontend hosting
- [ ] Supabase project for backend
- [ ] Ethereum wallet with deployment funds
- [ ] Domain name (optional)

### Required Tools
```bash
# Node.js 20+
node --version

# pnpm package manager
pnpm --version

# Git
git --version

# Foundry (for smart contracts)
forge --version
```

---

## Environment Setup

### 1. Frontend Environment Variables

Create `.env.production` file:

```bash
# Blockchain Configuration
VITE_CHAIN=mainnet  # or sepolia for testnet

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your-project-id

# AI Services
VITE_OPENAI_API_KEY=your-openai-key
VITE_ELEVENLABS_API_KEY=your-elevenlabs-key

# IPFS/Pinata
VITE_PINATA_API_KEY=your-pinata-key
VITE_PINATA_SECRET_KEY=your-pinata-secret

# Analytics (optional)
VITE_GA_TRACKING_ID=your-ga-id
VITE_SENTRY_DSN=your-sentry-dsn

# Feature Flags
VITE_ENABLE_BATTLES=true
VITE_ENABLE_COLLABORATIONS=true
VITE_ENABLE_GOVERNANCE=true
```

### 2. Supabase Environment Variables

In Supabase Dashboard → Settings → API:

```bash
# Edge Functions
OPENAI_API_KEY=your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_KEY=your-pinata-secret
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

### 3. GitHub Secrets

Add to GitHub repository secrets:

```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Notifications
SLACK_WEBHOOK=your-slack-webhook

# Code Coverage
CODECOV_TOKEN=your-codecov-token
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline automatically runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Pipeline Stages

#### 1. **Lint** (Parallel)
```yaml
- ESLint code quality checks
- PostCSS validation
```

#### 2. **Type Check** (Parallel)
```yaml
- TypeScript compilation check
- Type safety validation
```

#### 3. **Test** (Parallel)
```yaml
- Unit tests with Vitest
- E2E tests with Playwright
- Coverage report upload
```

#### 4. **Security Scan** (Parallel)
```yaml
- Trivy vulnerability scanning
- Dependency audit
- SARIF report upload
```

#### 5. **Build**
```yaml
- Install dependencies
- Create production build
- Upload build artifacts
```

#### 6. **Deploy Preview** (PR only)
```yaml
- Deploy to Vercel preview environment
- Comment preview URL on PR
```

#### 7. **Deploy Production** (main branch only)
```yaml
- Deploy to Vercel production
- Notify team via Slack
```

### Manual Deployment

If you need to deploy manually:

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Deployment Platforms

### Vercel (Frontend)

#### Initial Setup

1. **Import Project**
   ```bash
   # Via Vercel CLI
   vercel

   # Or via Vercel Dashboard
   # Import from GitHub repository
   ```

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

3. **Environment Variables**
   - Add all variables from `.env.production`
   - Set for Production, Preview, and Development

4. **Domain Configuration**
   - Add custom domain in Vercel dashboard
   - Configure DNS records:
     ```
     A     @     76.76.21.21
     CNAME www   cname.vercel-dns.com
     ```

#### Deployment Commands

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

### Supabase (Backend)

#### Database Migrations

1. **Create Migration**
   ```bash
   # Generate migration file
   supabase migration new migration_name
   ```

2. **Apply Migrations**
   ```bash
   # Apply to local
   supabase db push

   # Apply to production
   supabase db push --db-url $PRODUCTION_DB_URL
   ```

3. **Rollback Migration**
   ```bash
   supabase migration repair --status reverted
   ```

#### Edge Functions Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy function-name

# View logs
supabase functions logs function-name
```

---

## Smart Contract Deployment

### Prerequisites

1. **Prepare Deployment Wallet**
   ```bash
   # Create new wallet or use existing
   # Fund with ETH for gas fees
   # Mainnet: ~0.5 ETH recommended
   # Sepolia: Get from faucet
   ```

2. **Configure Network**
   ```bash
   # Edit foundry.toml
   [rpc_endpoints]
   mainnet = "${MAINNET_RPC_URL}"
   sepolia = "${SEPOLIA_RPC_URL}"
   ```

### Deployment Steps

1. **Compile Contracts**
   ```bash
   cd contracts
   forge build
   ```

2. **Run Tests**
   ```bash
   forge test
   forge test --gas-report
   ```

3. **Deploy to Testnet**
   ```bash
   # Deploy to Sepolia
   forge script script/Deploy.s.sol:DeployScript \
     --rpc-url sepolia \
     --broadcast \
     --verify
   ```

4. **Verify Deployment**
   ```bash
   # Check contract on Etherscan
   # Test basic functions
   # Verify ownership and permissions
   ```

5. **Deploy to Mainnet**
   ```bash
   # CRITICAL: Double-check everything!
   forge script script/Deploy.s.sol:DeployScript \
     --rpc-url mainnet \
     --broadcast \
     --verify \
     --slow
   ```

6. **Post-Deployment**
   ```bash
   # Transfer ownership to multisig
   # Set up timelock
   # Update frontend config
   # Announce deployment
   ```

### Contract Verification

```bash
# Verify on Etherscan
forge verify-contract \
  --chain-id 1 \
  --num-of-optimizations 200 \
  --compiler-version v0.8.20 \
  CONTRACT_ADDRESS \
  src/ContractName.sol:ContractName \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

---

## Database Migrations

### Migration Workflow

1. **Create Migration**
   ```sql
   -- supabase/migrations/20240101000000_add_feature.sql
   
   -- Add new table
   CREATE TABLE new_feature (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Add RLS policies
   ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can read own data"
     ON new_feature FOR SELECT
     USING (auth.uid() = user_id);
   ```

2. **Test Locally**
   ```bash
   # Reset local database
   supabase db reset
   
   # Verify migration
   supabase db diff
   ```

3. **Deploy to Production**
   ```bash
   # Backup database first!
   supabase db dump -f backup.sql
   
   # Apply migration
   supabase db push
   ```

4. **Verify Migration**
   ```bash
   # Check tables
   supabase db list
   
   # Test queries
   psql $DATABASE_URL -c "SELECT * FROM new_feature LIMIT 1;"
   ```

### Rollback Procedure

```bash
# Restore from backup
psql $DATABASE_URL < backup.sql

# Or create rollback migration
supabase migration new rollback_feature
```

---

## Monitoring & Alerts

### Vercel Analytics

- **Performance Monitoring**: Automatic via Vercel
- **Error Tracking**: Integrated with Sentry
- **Usage Metrics**: View in Vercel dashboard

### Supabase Monitoring

```bash
# Database metrics
- Active connections
- Query performance
- Storage usage

# Edge Function metrics
- Invocations
- Errors
- Execution time
```

### Sentry Error Tracking

```typescript
// Already configured in src/main.tsx
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Uptime Monitoring

Recommended services:
- **UptimeRobot**: Free tier available
- **Pingdom**: Comprehensive monitoring
- **StatusPage**: Public status page

### Alert Configuration

```yaml
# Example: Slack alerts for critical errors
- Error rate > 5%
- Response time > 3s
- Deployment failures
- Database connection issues
```

---

## Rollback Procedures

### Frontend Rollback

#### Via Vercel Dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

#### Via CLI
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### Backend Rollback

#### Edge Functions
```bash
# Redeploy previous version
git checkout [previous-commit]
supabase functions deploy
git checkout main
```

#### Database
```bash
# Restore from backup
psql $DATABASE_URL < backup.sql

# Or apply rollback migration
supabase migration new rollback_migration
```

### Smart Contracts

**IMPORTANT**: Smart contracts cannot be rolled back!

Mitigation strategies:
- Use upgradeable proxy patterns
- Implement pause functionality
- Have emergency procedures ready
- Use timelock for critical changes

---

## Security Checklist

### Pre-Deployment

- [ ] All environment variables set correctly
- [ ] No secrets in code or git history
- [ ] Dependencies updated and audited
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Rate limiting enabled
- [ ] Input sanitization implemented
- [ ] RLS policies tested
- [ ] Smart contracts audited
- [ ] Backup procedures tested

### Post-Deployment

- [ ] SSL/TLS certificate active
- [ ] CORS configured correctly
- [ ] Monitoring and alerts active
- [ ] Error tracking configured
- [ ] Backup schedule verified
- [ ] Incident response plan ready
- [ ] Team notified of deployment
- [ ] Documentation updated

### Ongoing

- [ ] Regular security audits
- [ ] Dependency updates
- [ ] Log review
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Backup verification
- [ ] Disaster recovery drills

---

## Deployment Checklist

### Week Before Launch

- [ ] Complete security audit
- [ ] Load testing
- [ ] Backup procedures tested
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Team training complete
- [ ] Support channels ready

### Day Before Launch

- [ ] Final code review
- [ ] Database backup
- [ ] Environment variables verified
- [ ] DNS records configured
- [ ] SSL certificates verified
- [ ] Rollback plan ready
- [ ] Team on standby

### Launch Day

- [ ] Deploy to production
- [ ] Verify all features working
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify smart contracts
- [ ] Test critical user flows
- [ ] Announce launch

### Post-Launch

- [ ] Monitor for 24 hours
- [ ] Address any issues
- [ ] Collect user feedback
- [ ] Review metrics
- [ ] Document lessons learned
- [ ] Plan next iteration

---

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
pnpm store prune
rm -rf node_modules
pnpm install
pnpm build
```

#### Environment Variable Issues
```bash
# Verify variables are set
vercel env ls

# Pull latest variables
vercel env pull
```

#### Database Connection Issues
```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1;"

# Verify RLS policies
supabase db inspect
```

#### Smart Contract Issues
```bash
# Verify contract on Etherscan
# Check transaction status
# Review contract events
```

---

## Support

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Foundry Book](https://book.getfoundry.sh/)

### Community
- Discord: [Join our server]
- GitHub Discussions: [Repository discussions]
- Email: support@kobo-nft.com

---

**Last Updated**: November 25, 2024
**Version**: 1.0.0
