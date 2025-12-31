# Production Security Guide

## Environment Variables Security

### Critical Security Rules

1. **NEVER commit sensitive keys to version control**
2. **Use different keys for development, staging, and production**
3. **Rotate keys regularly (quarterly minimum)**
4. **Use environment-specific key restrictions**
5. **Monitor key usage and set up alerts**

### Environment Variable Checklist

#### Required for Production

- [ ] `VITE_CHAIN=mainnet` (or appropriate production network)
- [ ] `VITE_SUPABASE_URL` - Production Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Production anon key (RLS-protected)
- [ ] `VITE_WALLETCONNECT_PROJECT_ID` - Production WalletConnect project
- [ ] `VITE_PINATA_API_KEY` - Production Pinata key with rate limits
- [ ] `VITE_PINATA_SECRET_KEY` - Production Pinata secret
- [ ] `VITE_SENTRY_DSN` - Production Sentry DSN for error tracking

#### Optional but Recommended

- [ ] `VITE_HF_API_KEY` - Hugging Face API key (higher rate limits)
- [ ] `VITE_ELEVENLABS_API_KEY` - ElevenLabs API key
- [ ] `VITE_RUNWAY_API_KEY` - Runway ML API key
- [ ] `VITE_TINEYE_API_KEY` - TinEye reverse image search

#### Backend/CI/CD Only (Never in Frontend)

- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Backend only, never expose to frontend
- [ ] `DEPLOYER_PRIVATE_KEY` - Smart contract deployment (hardware wallet recommended)
- [ ] `ETHERSCAN_API_KEY` - Contract verification
- [ ] `SENTRY_AUTH_TOKEN` - CI/CD for source map uploads
- [ ] `VERCEL_TOKEN` - Deployment automation

### API Key Security Best Practices

#### Supabase

```bash
# Production Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... # Public anon key (safe to expose)

# NEVER expose service role key in frontend
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Backend/Edge Functions only
```

**Security Measures:**
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Anon key has limited permissions via RLS
- ✅ Service role key only used in Edge Functions
- ✅ API rate limiting configured
- ✅ Database backups enabled

#### Pinata/IPFS

```bash
# Production Pinata Configuration
VITE_PINATA_API_KEY=your_api_key
VITE_PINATA_SECRET_KEY=your_secret_key
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
```

**Security Measures:**
- ✅ API key restricted to specific domains
- ✅ Rate limits configured (e.g., 100 requests/min)
- ✅ Separate keys for dev/staging/production
- ✅ Monitor usage via Pinata dashboard
- ✅ Set up billing alerts

**Key Restrictions:**
1. Go to Pinata Dashboard → API Keys
2. Edit key → Add domain restrictions
3. Add: `yourdomain.com`, `*.yourdomain.com`
4. Enable rate limiting

#### WalletConnect

```bash
# Production WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

**Security Measures:**
- ✅ Separate project for production
- ✅ Domain allowlist configured
- ✅ Monitor usage in WalletConnect Cloud
- ✅ Set up usage alerts

**Configuration:**
1. Create production project at https://cloud.walletconnect.com
2. Configure allowed domains
3. Enable analytics and monitoring

#### AI Service APIs

```bash
# Hugging Face
VITE_HF_API_KEY=hf_... # Optional, for higher rate limits

# ElevenLabs
VITE_ELEVENLABS_API_KEY=... # For audio generation

# Runway ML
VITE_RUNWAY_API_KEY=... # For video generation
```

**Security Measures:**
- ✅ Client-side rate limiting implemented
- ✅ Usage monitoring and alerts
- ✅ Billing limits configured
- ✅ Fallback to free tier if key missing

#### Sentry Error Tracking

```bash
# Production Sentry
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_APP_VERSION=1.0.0

# CI/CD only
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=... # For source map uploads
```

**Security Measures:**
- ✅ Scrub sensitive data before sending
- ✅ Configure data retention policies
- ✅ Set up alert rules
- ✅ Enable release tracking

#### Smart Contract Deployment

```bash
# NEVER commit these to version control
DEPLOYER_PRIVATE_KEY=0x... # Use hardware wallet in production
ETHERSCAN_API_KEY=... # For contract verification
RPC_URL=https://... # Production RPC endpoint
```

**Security Measures:**
- ✅ Use hardware wallet (Ledger/Trezor) for mainnet
- ✅ Private key encrypted at rest
- ✅ Multi-sig for contract ownership
- ✅ Separate deployer account from operations

### Environment-Specific Configuration

#### Development (.env.local)

```bash
VITE_CHAIN=devnet
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev_anon_key
# Use test API keys with low limits
```

#### Staging (.env.staging)

```bash
VITE_CHAIN=testnet
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging_anon_key
# Use separate staging API keys
```

#### Production (.env.production)

```bash
VITE_CHAIN=mainnet
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod_anon_key
# Use production API keys with proper limits
```

### Vercel Environment Variables Setup

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add Production Variables:**
   - Set environment: `Production`
   - Add all `VITE_*` variables
   - Mark sensitive variables as "Sensitive"

3. **Add Preview Variables:**
   - Set environment: `Preview`
   - Use staging/test API keys

4. **Add Development Variables:**
   - Set environment: `Development`
   - Use development API keys

### Key Rotation Schedule

| Service | Rotation Frequency | Process |
|---------|-------------------|---------|
| Supabase Keys | Quarterly | Generate new anon key, update env vars, deploy |
| Pinata API Keys | Quarterly | Create new key, update env vars, revoke old key |
| WalletConnect | Annually | Create new project, migrate, deprecate old |
| AI Service Keys | As needed | Rotate if compromised or quarterly |
| Deployer Private Key | Never (use multi-sig) | Transfer to hardware wallet |

### Monitoring & Alerts

#### Set Up Alerts For:

1. **API Usage Spikes**
   - Pinata: >80% of rate limit
   - Supabase: >80% of database connections
   - AI Services: >80% of quota

2. **Unusual Activity**
   - Failed authentication attempts
   - Unauthorized API calls
   - Unexpected error rates

3. **Cost Alerts**
   - Pinata storage costs
   - Supabase database size
   - AI API usage costs

### Security Incident Response

#### If API Key Compromised:

1. **Immediate Actions:**
   ```bash
   # 1. Revoke compromised key immediately
   # 2. Generate new key
   # 3. Update environment variables
   # 4. Redeploy application
   # 5. Monitor for unauthorized usage
   ```

2. **Investigation:**
   - Check access logs
   - Identify scope of compromise
   - Assess potential damage

3. **Communication:**
   - Notify team immediately
   - Document incident
   - Update security procedures

### Compliance & Audit

#### Regular Security Audits:

- [ ] Monthly: Review API key usage and costs
- [ ] Quarterly: Rotate API keys
- [ ] Quarterly: Review access logs
- [ ] Annually: Comprehensive security audit
- [ ] Annually: Penetration testing

#### Documentation:

- [ ] Maintain key inventory
- [ ] Document rotation procedures
- [ ] Log all key changes
- [ ] Track key access permissions

### Production Deployment Checklist

Before deploying to production:

- [ ] All API keys are production-grade
- [ ] Environment variables set in Vercel
- [ ] No sensitive data in code or version control
- [ ] Rate limiting configured
- [ ] Monitoring and alerts set up
- [ ] Backup and recovery procedures tested
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] RLS policies reviewed and tested
- [ ] Error tracking (Sentry) configured
- [ ] API usage limits and billing alerts set

### Additional Security Measures

#### Content Security Policy (CSP)

Already configured in `vercel.json`:
- Restricts script sources
- Prevents XSS attacks
- Enforces HTTPS

#### Rate Limiting

Implemented at multiple levels:
- Client-side: `src/lib/rateLimiter.ts`
- Edge Functions: `supabase/functions/_shared/rateLimiter.ts`
- API providers: Native rate limits

#### Input Sanitization

All user inputs sanitized via:
- `src/lib/inputSanitization.ts`
- DOMPurify for HTML content
- Validation for all data types

#### Database Security

- Row Level Security (RLS) on all tables
- Prepared statements (SQL injection prevention)
- Encrypted connections (SSL/TLS)
- Regular backups

### Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Pinata Security](https://docs.pinata.cloud/security)

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular monitoring, updates, and audits are essential.
