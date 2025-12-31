# DevOps Production Launch Checklist

This comprehensive checklist ensures all critical systems are configured and tested before production deployment.

## Table of Contents
- [Environment Configuration](#environment-configuration)
- [Database & Backend](#database--backend)
- [Smart Contracts](#smart-contracts)
- [Frontend Application](#frontend-application)
- [Monitoring & Error Tracking](#monitoring--error-tracking)
- [Security](#security)
- [Performance](#performance)
- [Testing](#testing)
- [Deployment](#deployment)
- [Post-Launch](#post-launch)

---

## Environment Configuration

### Required Environment Variables

#### Blockchain
- [ ] `VITE_CHAIN` - Set to production chain (mainnet/polygon/arbitrum/base)
- [ ] `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID configured
- [ ] Verify contract addresses in `src/metadata.json` match deployed contracts

#### API Keys
- [ ] `VITE_HF_API_KEY` - Hugging Face API key (optional but recommended)
- [ ] `VITE_ELEVENLABS_API_KEY` - ElevenLabs for audio generation
- [ ] `VITE_RUNWAY_API_KEY` - Runway ML for video generation
- [ ] `VITE_PINATA_API_KEY` - Pinata IPFS API key
- [ ] `VITE_PINATA_SECRET_KEY` - Pinata secret key
- [ ] `VITE_TINEYE_API_KEY` - TinEye reverse image search

#### Error Tracking
- [ ] `VITE_SENTRY_DSN` - Sentry DSN configured
- [ ] `VITE_APP_VERSION` - Set to current release version
- [ ] `SENTRY_ORG` - Sentry organization name
- [ ] `SENTRY_PROJECT` - Sentry project name
- [ ] `SENTRY_AUTH_TOKEN` - Sentry auth token for releases

#### Deployment (CI/CD)
- [ ] `VERCEL_TOKEN` - Vercel deployment token
- [ ] `VERCEL_ORG_ID` - Vercel organization ID
- [ ] `VERCEL_PROJECT_ID` - Vercel project ID
- [ ] `DEPLOYER_PRIVATE_KEY` - Contract deployer private key (secure!)
- [ ] `ETHERSCAN_API_KEY` - For contract verification
- [ ] `RPC_URL` - Production RPC endpoint

---

## Database & Backend

### Supabase Configuration

#### Database Tables
- [ ] All migrations deployed successfully
- [ ] Tables created:
  - [ ] `users` - User profiles
  - [ ] `profiles` - Auth profiles
  - [ ] `nfts` - NFT metadata
  - [ ] `nft_provenance` - NFT history tracking
  - [ ] `nft_derivatives` - Derivative/remix tracking
  - [ ] `nft_likes` - Social interactions
  - [ ] `nft_comments` - Comments system
  - [ ] `nft_views` - View tracking
  - [ ] `user_follows` - Follow system
  - [ ] `prompts` - Prompt marketplace
  - [ ] `prompt_purchases` - Prompt transactions
  - [ ] `collaborations` - Collaborative minting
  - [ ] `collaboration_contributors` - Collaboration participants
  - [ ] `battles` - Battle arena
  - [ ] `battle_entries` - Battle submissions
  - [ ] `battle_votes` - Battle voting
  - [ ] `gifts` - Gift wrapping system
  - [ ] `dao_proposals` - DAO governance proposals
  - [ ] `dao_votes` - DAO voting records
  - [ ] `leaderboard_entries` - Gamification leaderboards
  - [ ] `achievements` - Achievement definitions
  - [ ] `user_achievements` - User achievement unlocks
  - [ ] `notifications` - Notification system
  - [ ] `copyright_audits` - Copyright compliance

#### Row Level Security (RLS)
- [ ] RLS enabled on all tables
- [ ] Policies tested for:
  - [ ] Public read access where appropriate
  - [ ] User-owned data protection
  - [ ] Admin-only operations secured
  - [ ] No data leaks between users
- [ ] Test with different user roles

#### Edge Functions
- [ ] All Edge Functions deployed:
  - [ ] `ai-generate-image` - Image generation
  - [ ] `generate-audio` - Audio generation
  - [ ] `generate-video` - Video generation
  - [ ] `mint-nft` - NFT minting
  - [ ] `upload-to-ipfs` - IPFS uploads
  - [ ] `ipfs-upload` - Alternative IPFS handler
  - [ ] `reverse-image-search` - Copyright checking
  - [ ] `copyright-precheck` - Pre-mint copyright check
  - [ ] `tos-management` - Terms of service
  - [ ] `user-notifications` - Notification system
  - [ ] `dao-stats` - DAO statistics
  - [ ] `nft-stats` - NFT analytics
  - [ ] `send-notification` - Notification sender
  - [ ] `compliance-check` - Content compliance
- [ ] Edge Function secrets configured
- [ ] Test all Edge Functions with production data
- [ ] Monitor Edge Function logs for errors

#### Storage Buckets
- [ ] `nft-media` bucket created
- [ ] Bucket policies configured (public read)
- [ ] File size limits set appropriately
- [ ] MIME type restrictions configured

#### Authentication
- [ ] Email authentication enabled
- [ ] Email verification configured (or disabled if needed)
- [ ] Password requirements set
- [ ] Rate limiting configured
- [ ] OAuth providers configured (if applicable)

---

## Smart Contracts

### Deployment Verification
- [ ] All contracts deployed to production chain
- [ ] Contract addresses recorded in `contracts/interfaces/metadata.json`
- [ ] Contracts verified on block explorer (Etherscan/etc)
- [ ] Ownership transferred to multisig/DAO (if applicable)

### Contract Checklist
- [ ] `KoboNFT.sol` - Core NFT contract
- [ ] `KoboNFTExtended.sol` - Extended NFT features
- [ ] `KoboGiftWrapper.sol` - Gift wrapping
- [ ] `KoboGovernanceToken.sol` - Governance token
- [ ] `KoboGovernor.sol` - DAO governance
- [ ] `KoboTimelock.sol` - Timelock controller
- [ ] `KoboTraitMarketplace.sol` - Trait marketplace

### Security
- [ ] All contracts audited (see `contracts/audit_report.md`)
- [ ] Security checklist completed (`contracts/SECURITY_CHECKLIST.md`)
- [ ] No critical vulnerabilities
- [ ] Reentrancy guards in place
- [ ] Access controls properly configured
- [ ] Emergency pause mechanisms tested

### Testing
- [ ] All Foundry tests passing
- [ ] Test coverage > 80%
- [ ] Integration tests completed
- [ ] Mainnet fork tests successful

---

## Frontend Application

### Build & Deploy
- [ ] Production build successful (`pnpm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Bundle size optimized
- [ ] Code splitting implemented
- [ ] Lazy loading configured

### Configuration
- [ ] `src/utils/evmConfig.ts` configured for production chain
- [ ] Contract ABIs up to date
- [ ] Network configuration correct
- [ ] Fallback RPC endpoints configured

### Assets
- [ ] All images optimized
- [ ] Fonts loaded efficiently
- [ ] Service worker configured
- [ ] PWA manifest configured
- [ ] Favicon and app icons set

---

## Monitoring & Error Tracking

### Sentry Setup
- [ ] Sentry project created
- [ ] DSN configured in environment
- [ ] Source maps uploaded
- [ ] Release tracking configured
- [ ] User context tracking enabled
- [ ] Performance monitoring enabled
- [ ] Error dashboard accessible (`/dashboard` with ErrorDashboard component)

### Alerts
- [ ] Error rate alerts configured
- [ ] Performance degradation alerts
- [ ] Uptime monitoring configured
- [ ] Slack/Discord notifications set up

### Analytics
- [ ] User analytics configured (optional)
- [ ] Conversion tracking set up
- [ ] Custom events tracked
- [ ] Privacy policy compliant

---

## Security

### Application Security
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] XSS protection enabled
- [ ] CORS properly configured
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all forms
- [ ] SQL injection prevention (parameterized queries)

### Secrets Management
- [ ] No secrets in source code
- [ ] Environment variables properly secured
- [ ] API keys rotated regularly
- [ ] Private keys stored securely (never in repo)
- [ ] Supabase service role key secured

### Smart Contract Security
- [ ] Contracts audited by professionals
- [ ] No known vulnerabilities
- [ ] Emergency procedures documented
- [ ] Multisig for critical operations
- [ ] Timelock for governance changes

---

## Performance

### Frontend Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Images lazy loaded
- [ ] Code splitting implemented
- [ ] Service worker caching configured

### Backend Performance
- [ ] Database queries optimized
- [ ] Indexes created on frequently queried columns
- [ ] Edge Functions response time < 500ms
- [ ] IPFS uploads optimized
- [ ] CDN configured for static assets

### Blockchain Performance
- [ ] Gas optimization completed
- [ ] Batch operations where possible
- [ ] Efficient data structures used
- [ ] Events properly indexed

---

## Testing

### Unit Tests
- [ ] Frontend test coverage > 90%
- [ ] All custom hooks tested
- [ ] Key components tested
- [ ] Service functions tested

### Integration Tests
- [ ] API integration tests passing
- [ ] Database integration tests passing
- [ ] Smart contract integration tests passing

### E2E Tests
- [ ] Critical user flows tested (Cypress)
- [ ] Wallet connection flow
- [ ] NFT minting flow
- [ ] Battle participation flow
- [ ] DAO voting flow
- [ ] Gift sending flow

### Manual Testing
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test with different wallet providers
- [ ] Test with slow network conditions
- [ ] Test error scenarios

---

## Deployment

### Pre-Deployment
- [ ] Backup current production database
- [ ] Document rollback procedure
- [ ] Notify team of deployment window
- [ ] Schedule during low-traffic period

### Deployment Steps
- [ ] Deploy smart contracts (if new/updated)
- [ ] Deploy database migrations
- [ ] Deploy Edge Functions
- [ ] Deploy frontend application
- [ ] Verify deployment successful
- [ ] Run smoke tests

### Post-Deployment Verification
- [ ] Homepage loads correctly
- [ ] Wallet connection works
- [ ] NFT minting works
- [ ] Database queries successful
- [ ] Edge Functions responding
- [ ] No console errors
- [ ] Sentry receiving events

---

## Post-Launch

### Monitoring (First 24 Hours)
- [ ] Monitor error rates in Sentry
- [ ] Check Edge Function logs
- [ ] Monitor database performance
- [ ] Watch for unusual activity
- [ ] Monitor gas prices and transaction success rates
- [ ] Check user feedback channels

### Documentation
- [ ] Update README with production URLs
- [ ] Document any deployment issues
- [ ] Update API documentation
- [ ] Create user guides if needed
- [ ] Document known issues

### Communication
- [ ] Announce launch to community
- [ ] Update social media
- [ ] Send email to beta users
- [ ] Update status page

### Ongoing Maintenance
- [ ] Schedule regular security audits
- [ ] Plan for dependency updates
- [ ] Monitor for new vulnerabilities
- [ ] Regular database backups
- [ ] Performance optimization reviews

---

## Emergency Procedures

### Rollback Plan
1. Revert frontend deployment to previous version
2. Rollback database migrations if needed
3. Pause smart contracts if critical issue
4. Notify users of temporary downtime
5. Investigate and fix issue
6. Redeploy with fix

### Contact Information
- **DevOps Lead**: [Contact Info]
- **Smart Contract Team**: [Contact Info]
- **Backend Team**: [Contact Info]
- **Frontend Team**: [Contact Info]
- **Security Team**: [Contact Info]

### Incident Response
1. Identify and assess severity
2. Notify relevant team members
3. Implement immediate mitigation
4. Communicate with users
5. Investigate root cause
6. Implement permanent fix
7. Post-mortem analysis

---

## Sign-Off

Before launching to production, ensure all critical items are checked and signed off by relevant team members:

- [ ] **DevOps Engineer**: All infrastructure configured
- [ ] **Backend Developer**: Database and Edge Functions tested
- [ ] **Smart Contract Developer**: Contracts deployed and verified
- [ ] **Frontend Developer**: Application tested and optimized
- [ ] **QA Engineer**: All tests passing
- [ ] **Security Auditor**: Security review completed
- [ ] **Product Manager**: Feature completeness verified

**Launch Date**: _______________

**Approved By**: _______________

---

## Additional Resources

- [Deployment Guide](./deployment-guide.md)
- [Security Checklist](../contracts/SECURITY_CHECKLIST.md)
- [Testing Documentation](./TESTING.md)
- [Performance Report](./PERFORMANCE_REPORT.md)
- [Sentry Integration](./SENTRY_INTEGRATION.md)
