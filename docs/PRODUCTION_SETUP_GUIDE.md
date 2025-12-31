# Production Setup Guide

This guide walks through the remaining manual setup tasks for production launch.

## 1. Supabase Production Setup

### Create Production Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization and region (closest to your users)
4. Set strong database password (save in password manager)
5. Wait for project provisioning (~2 minutes)

### Apply Database Migrations
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your production project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to production
supabase db push

# Verify migrations applied
supabase db diff
```

### Configure Environment Variables
Update your production environment with:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Deploy Edge Functions
```bash
# Deploy GDPR functions
supabase functions deploy gdpr-delete-user
supabase functions deploy gdpr-export-data

# Set environment secrets for functions
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Enable Row Level Security (RLS)
All tables should have RLS enabled. Verify in Supabase Dashboard:
- Go to Database → Tables
- Check each table has RLS enabled
- Review policies for security

### Configure Auth Providers
1. Go to Authentication → Providers
2. Enable desired providers (Google, GitHub, etc.)
3. Configure OAuth credentials
4. Set redirect URLs for production domain

---

## 2. Sentry Error Tracking Setup

### Create Sentry Project
1. Go to https://sentry.io
2. Create new project (React)
3. Note your DSN

### Configure Environment Variables
```env
VITE_SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
SENTRY_ORG=your_org_slug
SENTRY_PROJECT=your_project_slug
SENTRY_AUTH_TOKEN=your_auth_token
```

### Verify Integration
The app already has Sentry configured in:
- `src/main.tsx` - Sentry initialization
- `vite.config.ts` - Source map upload
- `src/contexts/AuthContext.tsx` - User context tracking

### Test Error Tracking
```javascript
// Trigger test error in browser console
throw new Error("Sentry test error");
```

Check Sentry dashboard for the error.

---

## 3. Monitoring & Uptime

### Recommended Services

**Option A: UptimeRobot (Free)**
1. Go to https://uptimerobot.com
2. Add new monitor (HTTP(s))
3. Enter production URL
4. Set check interval (5 minutes)
5. Configure alert contacts (email, SMS, Slack)

**Option B: Better Uptime (Paid)**
1. Go to https://betteruptime.com
2. Create monitor for production URL
3. Set up status page
4. Configure incident management

**Option C: Pingdom (Paid)**
1. Go to https://www.pingdom.com
2. Add uptime check
3. Configure performance monitoring
4. Set up alerts

### Performance Monitoring
Use Sentry Performance Monitoring:
1. Enable in Sentry project settings
2. Already configured in `src/main.tsx`:
   ```typescript
   tracesSampleRate: 0.1 // 10% of transactions
   ```
3. Monitor in Sentry → Performance

---

## 4. Analytics Setup

### Google Analytics 4 (Recommended)

**Setup:**
1. Go to https://analytics.google.com
2. Create GA4 property
3. Get Measurement ID (G-XXXXXXXXXX)

**Install:**
```bash
pnpm add react-ga4
```

**Configure:**
```typescript
// src/lib/analytics.ts
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);
};

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({ category, action, label });
};
```

**Cookie Consent Integration:**
The app already has cookie consent in `src/components/CookieConsent.tsx`.
Update to initialize GA only after consent:

```typescript
const handleAcceptAll = async () => {
  // ... existing code ...
  
  // Initialize analytics after consent
  if (typeof window !== 'undefined' && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    initGA();
  }
};
```

**Environment Variable:**
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 5. Cross-Browser Testing

### Manual Testing Checklist

**Browsers to Test:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

**Test Scenarios:**
1. **Authentication Flow**
   - Sign up
   - Sign in
   - Password reset
   - Social login (if enabled)

2. **Core Features**
   - NFT gallery browsing
   - NFT creation
   - Trait marketplace
   - DAO governance
   - Wallet connection

3. **Responsive Design**
   - Desktop (1920x1080, 1366x768)
   - Tablet (768x1024)
   - Mobile (375x667, 414x896)

4. **GDPR Features**
   - Cookie consent banner
   - Data export
   - Account deletion

### Automated Testing Tools

**BrowserStack (Recommended)**
1. Go to https://www.browserstack.com
2. Start free trial
3. Test on real devices
4. Automated screenshot testing

**LambdaTest**
1. Go to https://www.lambdatest.com
2. Free tier available
3. Live testing and screenshots

---

## 6. Accessibility Audit

### Automated Testing

**Already Integrated:**
The app includes `@axe-core/react` for runtime accessibility checks.

**Run Lighthouse Audit:**
```bash
# In Chrome DevTools
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Accessibility"
4. Click "Generate report"
```

**Target Score:** 95+ on Lighthouse Accessibility

### Manual Testing Checklist

**Keyboard Navigation:**
- ✅ Tab through all interactive elements
- ✅ Enter/Space activate buttons
- ✅ Escape closes modals
- ✅ Arrow keys navigate menus

**Screen Reader Testing:**
- ✅ Test with NVDA (Windows) or VoiceOver (Mac)
- ✅ All images have alt text
- ✅ Form labels are associated
- ✅ ARIA labels for icon buttons

**Color Contrast:**
- ✅ Text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- ✅ Interactive elements have sufficient contrast
- ✅ Focus indicators are visible

**Common Issues to Fix:**
1. Missing alt text on images
2. Low contrast text
3. Missing form labels
4. Keyboard traps in modals
5. Missing focus indicators

### Tools
- **axe DevTools** (Chrome extension)
- **WAVE** (Web Accessibility Evaluation Tool)
- **Color Contrast Analyzer**

---

## 7. Final Pre-Launch Checklist

### Security
- [ ] All API keys in environment variables (not hardcoded)
- [ ] CORS configured correctly
- [ ] Rate limiting on API endpoints
- [ ] SQL injection protection (Supabase RLS)
- [ ] XSS protection (DOMPurify already integrated)
- [ ] HTTPS enforced
- [ ] Security headers configured

### Performance
- [ ] Bundle size optimized (see BUNDLE_OPTIMIZATION_REPORT.md)
- [ ] Images optimized and lazy loaded
- [ ] Fonts optimized
- [ ] Lighthouse Performance score > 90
- [ ] Core Web Vitals pass

### SEO
- [ ] Meta tags configured
- [ ] Open Graph tags for social sharing
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Canonical URLs set

### Legal
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Cookie Policy published
- [ ] GDPR compliance verified
- [ ] Cookie consent working

### Monitoring
- [ ] Sentry error tracking active
- [ ] Uptime monitoring configured
- [ ] Performance monitoring enabled
- [ ] Analytics tracking working

### Smart Contracts (if applicable)
- [ ] Security audit completed
- [ ] Multi-sig wallet deployed
- [ ] Ownership transferred
- [ ] Timelock configured
- [ ] Emergency pause mechanism tested

---

## 8. Deployment

### Build Production Bundle
```bash
pnpm run build
```

### Test Production Build Locally
```bash
pnpm run preview
```

### Deploy to Hosting
The app is configured for static hosting. Deploy `dist/` folder to:
- **Vercel** (Recommended)
- **Netlify**
- **Cloudflare Pages**
- **AWS S3 + CloudFront**

### Post-Deployment Verification
1. ✅ Site loads correctly
2. ✅ All routes work
3. ✅ API calls succeed
4. ✅ Authentication works
5. ✅ Wallet connection works
6. ✅ Error tracking receives events
7. ✅ Analytics tracking works
8. ✅ Uptime monitor is green

---

## Support & Troubleshooting

### Common Issues

**Build Fails:**
- Check Node.js version (18+)
- Clear node_modules and reinstall
- Check for TypeScript errors

**API Calls Fail:**
- Verify environment variables
- Check CORS configuration
- Verify Supabase project is active

**Wallet Connection Issues:**
- Check WalletConnect project ID
- Verify chain configuration
- Test with different wallets

### Getting Help
- Supabase: https://supabase.com/docs
- Sentry: https://docs.sentry.io
- Vite: https://vitejs.dev/guide
- React: https://react.dev

---

## Maintenance

### Regular Tasks
- **Weekly:** Review error logs in Sentry
- **Monthly:** Check uptime reports
- **Quarterly:** Security audit
- **Annually:** Dependency updates

### Monitoring Dashboards
1. **Sentry:** Error rates, performance
2. **Uptime Monitor:** Availability
3. **Analytics:** User behavior
4. **Supabase:** Database performance

---

**Last Updated:** 2024-01-27
**Version:** 1.0.0
