# CI/CD Setup Guide

Complete guide for setting up automated deployment pipelines for Kōbo NFT platform.

## Overview

The CI/CD system consists of:

1. **Continuous Integration** - Automated testing and validation
2. **Contract Deployment** - Automated smart contract deployment to testnets
3. **Frontend Deployment** - Automated Vercel deployments
4. **Security Scanning** - Automated security and vulnerability checks
5. **Error Tracking** - Sentry integration for monitoring

## GitHub Actions Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**
- Lint & Type Check
- Frontend Tests
- Smart Contract Tests
- Security Scan
- Status Notifications

**What it does:**
- Validates code quality
- Runs all tests
- Checks for security vulnerabilities
- Reports failures to Sentry

### 2. Deploy Contracts (`.github/workflows/deploy-contracts.yml`)

**Triggers:**
- Push to `main` with changes in `contracts/`
- Manual workflow dispatch

**Jobs:**
- Run contract tests
- Deploy to testnet (Sepolia, Goerli, Mumbai, Base Sepolia)
- Verify contracts on block explorer
- Update metadata.json
- Create PR with updated metadata

**What it does:**
- Deploys smart contracts to selected network
- Verifies contracts automatically
- Updates frontend configuration
- Creates deployment artifacts

### 3. Deploy Frontend (`.github/workflows/deploy-frontend.yml`)

**Triggers:**
- Push to `main` (production)
- Pull requests (preview)
- Manual workflow dispatch

**Jobs:**
- **Preview Deployment** (on PRs)
  - Deploy to Vercel preview URL
  - Comment PR with preview link
  
- **Production Deployment** (on main)
  - Deploy to production
  - Upload source maps to Sentry
  - Create Sentry release

**What it does:**
- Builds and deploys frontend
- Manages preview and production environments
- Integrates with Sentry for error tracking

### 4. Security Scan (`.github/workflows/security-scan.yml`)

**Triggers:**
- Daily at 2 AM UTC (scheduled)
- Push to `main` or `develop`
- Pull requests
- Manual workflow dispatch

**Jobs:**
- Dependency security scan (npm audit, Snyk)
- Smart contract security (Slither, Mythril)
- Code scanning (CodeQL)
- Secret scanning (TruffleHog)

**What it does:**
- Scans for vulnerable dependencies
- Analyzes smart contracts for security issues
- Detects hardcoded secrets
- Reports findings

### 5. Deployment Notifications (`.github/workflows/notify-deployment.yml`)

**Triggers:**
- Completion of Deploy Frontend or Deploy Contracts workflows

**What it does:**
- Sends deployment status notifications
- Reports failures to Sentry
- Creates GitHub issues for failed deployments

## Setup Instructions

### Step 1: Configure GitHub Secrets

Go to **Repository Settings → Secrets and variables → Actions**

Add the following secrets:

#### Vercel Deployment
```
VERCEL_TOKEN=<your_vercel_token>
VERCEL_ORG_ID=<your_vercel_org_id>
VERCEL_PROJECT_ID=<your_vercel_project_id>
```

#### Smart Contract Deployment
```
DEPLOYER_PRIVATE_KEY=<wallet_private_key>
ETHERSCAN_API_KEY=<etherscan_api_key>
RPC_URL=<rpc_endpoint_url>
```

#### Frontend Environment Variables
```
VITE_WALLETCONNECT_PROJECT_ID=<walletconnect_id>
VITE_HF_API_KEY=<huggingface_key>
VITE_PINATA_API_KEY=<pinata_key>
VITE_PINATA_SECRET_KEY=<pinata_secret>
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

#### Sentry (Optional)
```
VITE_SENTRY_DSN=<sentry_dsn>
SENTRY_ORG=<sentry_org>
SENTRY_PROJECT=<sentry_project>
SENTRY_AUTH_TOKEN=<sentry_auth_token>
```

#### Security Scanning (Optional)
```
SNYK_TOKEN=<snyk_token>
```

### Step 2: Enable GitHub Actions

1. Go to **Repository Settings → Actions → General**
2. Under **Workflow permissions**, select:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests
3. Click **Save**

### Step 3: Set Up Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Get credentials
cat .vercel/project.json
```

Copy `orgId` and `projectId` to GitHub secrets.

#### Option B: Using Vercel Dashboard

1. Import project to Vercel
2. Go to **Project Settings → General**
3. Copy **Project ID** and **Team ID**
4. Go to **Account Settings → Tokens**
5. Create new token and copy it

### Step 4: Set Up Sentry (Optional)

1. Create account at [sentry.io](https://sentry.io)
2. Create new project (React)
3. Copy DSN from project settings
4. Go to **Settings → Developer Settings → Auth Tokens**
5. Create new token with `project:releases` and `org:read` scopes
6. Add credentials to GitHub secrets

### Step 5: Configure Vercel Environment Variables

In Vercel dashboard:

1. Go to **Project Settings → Environment Variables**
2. Add all `VITE_*` variables:
   - `VITE_WALLETCONNECT_PROJECT_ID`
   - `VITE_HF_API_KEY`
   - `VITE_PINATA_API_KEY`
   - `VITE_PINATA_SECRET_KEY`
   - `VITE_PINATA_GATEWAY`
   - `VITE_SENTRY_DSN`
   - `VITE_CHAIN` (set to `sepolia`)
3. Set environment: **Production**, **Preview**, and **Development**

### Step 6: Test Workflows

#### Test CI Pipeline

```bash
git checkout -b test-ci
# Make a small change
git add .
git commit -m "test: CI pipeline"
git push origin test-ci
# Create PR and check Actions tab
```

#### Test Contract Deployment

1. Go to **Actions** tab
2. Select **Deploy Smart Contracts**
3. Click **Run workflow**
4. Choose network: `sepolia`
5. Click **Run workflow**
6. Monitor deployment progress

#### Test Frontend Deployment

```bash
# Preview deployment (automatic on PR)
git checkout -b test-deploy
# Make changes
git push origin test-deploy
# Create PR - preview URL will be commented

# Production deployment (automatic on merge to main)
git checkout main
git merge test-deploy
git push origin main
```

## Deployment Scripts

### Pre-deployment Checks

```bash
./scripts/pre-deploy-checks.sh
```

Verifies:
- ✅ Node.js and tool versions
- ✅ Environment variables
- ✅ Linting and type checking
- ✅ All tests pass
- ✅ Build succeeds

### Deploy Contracts

```bash
# Set environment variables
export PRIVATE_KEY="your_private_key"
export RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export ETHERSCAN_API_KEY="your_key"

# Deploy to Sepolia
./scripts/deploy-contracts.sh sepolia
```

### Verify Deployment

```bash
./scripts/verify-deployment.sh sepolia
```

## Workflow Customization

### Modify CI Pipeline

Edit `.github/workflows/ci.yml`:

```yaml
# Add custom test command
- name: Run custom tests
  run: pnpm test:custom

# Add code coverage
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### Add Deployment Environment

Edit `.github/workflows/deploy-contracts.yml`:

```yaml
# Add new network option
options:
  - sepolia
  - goerli
  - mumbai
  - base-sepolia
  - your-network  # Add here
```

### Customize Notifications

Edit `.github/workflows/notify-deployment.yml`:

```yaml
# Add Slack notification
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Deployment ${{ job.status }}"
      }
```

## Monitoring & Debugging

### View Workflow Runs

1. Go to **Actions** tab
2. Select workflow
3. Click on specific run
4. View logs for each job

### Debug Failed Workflows

```bash
# Enable debug logging
# Add to GitHub secrets:
ACTIONS_STEP_DEBUG=true
ACTIONS_RUNNER_DEBUG=true
```

### Check Deployment Status

```bash
# View recent deployments
vercel ls

# View deployment logs
vercel logs <deployment-url>

# Check Sentry for errors
# Visit sentry.io dashboard
```

### Common Issues

#### 1. Workflow Permission Denied

**Solution:**
- Settings → Actions → General
- Enable "Read and write permissions"

#### 2. Vercel Deployment Fails

**Solution:**
- Check environment variables in Vercel
- Verify build command and output directory
- Check build logs for errors

#### 3. Contract Deployment Fails

**Solution:**
- Verify deployer wallet has funds
- Check RPC_URL is correct
- Ensure PRIVATE_KEY is valid
- Review contract size limits

#### 4. Sentry Source Maps Not Uploaded

**Solution:**
- Verify SENTRY_AUTH_TOKEN
- Check token has correct permissions
- Ensure `sourcemap: true` in vite.config.ts

## Best Practices

### Security

- ✅ Never commit secrets to repository
- ✅ Use GitHub secrets for sensitive data
- ✅ Rotate API keys regularly
- ✅ Enable branch protection rules
- ✅ Require PR reviews before merging

### Testing

- ✅ Run tests locally before pushing
- ✅ Maintain high test coverage
- ✅ Test on preview deployments
- ✅ Use feature flags for risky changes

### Deployment

- ✅ Deploy to testnet first
- ✅ Verify contracts after deployment
- ✅ Test thoroughly on preview
- ✅ Monitor Sentry after production deploy
- ✅ Keep deployment artifacts

### Monitoring

- ✅ Set up Sentry alerts
- ✅ Monitor deployment frequency
- ✅ Track error rates
- ✅ Review security scan results
- ✅ Check performance metrics

## Troubleshooting

### Get Help

- **GitHub Actions Logs**: Check detailed logs in Actions tab
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Sentry Docs**: [docs.sentry.io](https://docs.sentry.io)
- **Foundry Book**: [book.getfoundry.sh](https://book.getfoundry.sh)

### Useful Commands

```bash
# Check workflow syntax
gh workflow view ci.yml

# Trigger workflow manually
gh workflow run deploy-frontend.yml

# View workflow runs
gh run list

# View specific run logs
gh run view <run-id> --log
```

## Next Steps

After setting up CI/CD:

1. ✅ Test all workflows
2. ✅ Configure branch protection
3. ✅ Set up monitoring alerts
4. ✅ Document custom workflows
5. ✅ Train team on deployment process
6. ✅ Create runbook for incidents
