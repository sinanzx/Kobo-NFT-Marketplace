# Kōbo Compliance & Copyright Integration Guide

## Overview

This guide provides comprehensive instructions for integrating Kōbo's automated copyright-proofing and legal compliance system into your application workflows.

## Architecture

### Backend Components

1. **Database Schema** (`supabase/migrations/20251123120800_create_compliance_tables.sql`)
   - `prompt_output_history`: Immutable log of all prompts and outputs
   - `tos_acceptance`: User TOS acceptance tracking
   - `restricted_content_blocklist`: Configurable content filters
   - `compliance_violations`: Violation logging and tracking
   - `ai_engine_config`: AI engine configuration and TOS versions
   - `user_notifications`: User notification queue

2. **Edge Functions**
   - `copyright-precheck`: Pre-mint copyright and compliance scanning
   - `tos-management`: TOS acceptance tracking and enforcement
   - `user-notifications`: Notification delivery and management

### Frontend Components

1. **UI Components**
   - `TOSAcceptanceModal`: Modal for TOS acceptance flow
   - `ComplianceNotifications`: Real-time notification center

2. **React Hooks**
   - `useCopyrightPrecheck`: Copyright pre-check integration
   - `useTOSManagement`: TOS status and acceptance management

---

## Integration Workflows

### 1. TOS Acceptance Flow

#### When to Trigger
- First-time user onboarding
- Before first AI content generation
- When new AI engines are selected
- When TOS versions are updated

#### Implementation

```typescript
import { useTOSManagement } from '@/hooks/useTOSManagement'
import { TOSAcceptanceModal } from '@/components/compliance/TOSAcceptanceModal'

function MyComponent() {
  const { requiredTOS, hasOutstanding, checkRequiredTOS } = useTOSManagement()
  const [showTOSModal, setShowTOSModal] = useState(false)

  useEffect(() => {
    checkRequiredTOS()
  }, [])

  useEffect(() => {
    if (hasOutstanding) {
      setShowTOSModal(true)
    }
  }, [hasOutstanding])

  return (
    <>
      <TOSAcceptanceModal
        open={showTOSModal}
        onClose={() => setShowTOSModal(false)}
        onAccepted={() => {
          setShowTOSModal(false)
          // Proceed with user action
        }}
        requiredTOS={requiredTOS}
      />
    </>
  )
}
```

#### API Endpoints

**Check Required TOS**
```typescript
GET /tos-management/required

Response:
{
  success: true,
  requiredTOS: [
    {
      type: "platform",
      version: "v1.0",
      url: "/terms-of-service",
      description: "Kōbo Platform Terms of Service"
    },
    {
      type: "playground",
      version: "v1.0",
      url: "https://playgroundai.com/terms",
      description: "playground AI Engine Terms of Service"
    }
  ],
  hasOutstanding: true
}
```

**Accept TOS**
```typescript
POST /tos-management/accept
Body:
{
  tosType: "platform",
  tosVersion: "v1.0",
  ipAddress: "1.2.3.4", // optional
  userAgent: "Mozilla/5.0..."
}

Response:
{
  success: true,
  message: "TOS accepted for platform",
  acceptance: { ... }
}
```

**Check TOS Status**
```typescript
GET /tos-management/status
GET /tos-management/status?tosType=playground

Response:
{
  success: true,
  tosStatus: {
    platform: {
      accepted: true,
      acceptedAt: "2024-01-15T10:30:00Z",
      version: "v1.0"
    },
    engines: {
      playground: {
        accepted: false,
        needsUpdate: true,
        currentVersion: "v1.0",
        tosUrl: "https://playgroundai.com/terms"
      }
    }
  }
}
```

---

### 2. Copyright Pre-Check Flow

#### When to Trigger
- Before AI content generation
- Before minting NFT
- After content upload/remix

#### Implementation

```typescript
import { useCopyrightPrecheck } from '@/hooks/useCopyrightPrecheck'

function AIGenerationComponent() {
  const { performPrecheck, loading, error } = useCopyrightPrecheck()
  const [showTOSModal, setShowTOSModal] = useState(false)
  const [tosRequired, setTosRequired] = useState([])

  const handleGenerate = async () => {
    const result = await performPrecheck({
      promptText: userPrompt,
      aiEngine: selectedEngine, // 'playground', 'runway', 'suno'
      outputType: 'image', // 'image', 'video', 'audio'
      outputUrl: generatedContentUrl, // optional, for post-generation check
      isRemix: false,
      parentOutputId: null,
    })

    if (!result.success) {
      if (result.errorType === 'TOS_NOT_ACCEPTED') {
        setTosRequired(result.tosRequired)
        setShowTOSModal(true)
        return
      }

      if (result.errorType === 'RESTRICTED_CONTENT') {
        alert(`Content blocked: ${result.flaggedTerms?.join(', ')}`)
        return
      }

      if (result.errorType === 'COPYRIGHT_VIOLATION') {
        alert('Copyright violation detected. Please modify your content.')
        return
      }
    }

    // Pre-check passed, proceed with generation/minting
    const outputId = result.outputId
    proceedWithMinting(outputId)
  }

  return (
    <>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Checking...' : 'Generate'}
      </button>

      <TOSAcceptanceModal
        open={showTOSModal}
        onClose={() => setShowTOSModal(false)}
        onAccepted={() => {
          setShowTOSModal(false)
          handleGenerate() // Retry after TOS acceptance
        }}
        requiredTOS={tosRequired}
      />
    </>
  )
}
```

#### API Endpoint

**Copyright Pre-Check**
```typescript
POST /copyright-precheck
Body:
{
  promptText: "A futuristic cityscape at sunset",
  aiEngine: "playground",
  outputType: "image",
  outputUrl: "https://ipfs.io/ipfs/Qm...", // optional
  isRemix: false,
  parentOutputId: null
}

Success Response:
{
  success: true,
  message: "Pre-check passed. Content approved for minting.",
  outputId: "uuid-1234",
  complianceStatus: "approved",
  copyrightScanResult: {
    passed: true,
    confidence: 0.95,
    flags: [],
    scanProvider: "google_vision"
  },
  restrictedContentResult: {
    blocked: false,
    flaggedTerms: [],
    categories: []
  }
}

Error Response (TOS):
{
  success: false,
  error: "TOS_NOT_ACCEPTED",
  message: "You must accept the Terms of Service for playground before proceeding.",
  tosRequired: [...]
}

Error Response (Restricted Content):
{
  success: false,
  error: "RESTRICTED_CONTENT",
  message: "Your prompt contains restricted content and cannot be processed.",
  flaggedTerms: ["nsfw", "violence"],
  categories: ["nsfw", "violence"]
}

Error Response (Copyright):
{
  success: false,
  error: "COPYRIGHT_VIOLATION",
  message: "Generated content failed copyright check.",
  scanResult: {
    passed: false,
    flags: ["similar_to_copyrighted_work"],
    confidence: 0.85
  }
}
```

---

### 3. User Notifications Flow

#### Implementation

```typescript
import { ComplianceNotifications } from '@/components/compliance/ComplianceNotifications'

function AppLayout() {
  return (
    <header>
      <nav>
        {/* Other nav items */}
        <ComplianceNotifications />
      </nav>
    </header>
  )
}
```

#### API Endpoints

**Get Notifications**
```typescript
GET /user-notifications?limit=50&unreadOnly=true

Response:
{
  success: true,
  notifications: [
    {
      id: "uuid",
      notification_type: "compliance_violation",
      title: "Content Blocked",
      message: "Your prompt contains restricted content...",
      severity: "error",
      is_read: false,
      created_at: "2024-01-15T10:30:00Z",
      action_url: "/help/restricted-content",
      action_label: "Learn More"
    }
  ],
  count: 1
}
```

**Mark as Read**
```typescript
POST /user-notifications/mark-read
Body: { notificationId: "uuid" }

Response:
{
  success: true,
  notification: { ... }
}
```

**Mark All as Read**
```typescript
POST /user-notifications/mark-all-read

Response:
{
  success: true,
  updatedCount: 5
}
```

**Delete Notification**
```typescript
DELETE /user-notifications/:id

Response:
{
  success: true,
  message: "Notification deleted"
}
```

**Get Unread Count**
```typescript
GET /user-notifications/unread-count

Response:
{
  success: true,
  unreadCount: 3
}
```

---

## Database Queries

### Sample Queries for Analytics

**Get User Compliance History**
```sql
SELECT 
  p.prompt_text,
  p.ai_engine,
  p.output_type,
  p.compliance_status,
  p.created_at,
  v.violation_type,
  v.severity
FROM prompt_output_history p
LEFT JOIN compliance_violations v ON v.output_id = p.id
WHERE p.user_id = 'user-uuid'
ORDER BY p.created_at DESC
LIMIT 50;
```

**Get Flagged Content Statistics**
```sql
SELECT 
  violation_type,
  severity,
  COUNT(*) as count,
  DATE_TRUNC('day', created_at) as date
FROM compliance_violations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY violation_type, severity, DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

**Get Most Common Restricted Terms**
```sql
SELECT 
  jsonb_array_elements_text(restricted_content_flags->'flaggedTerms') as term,
  COUNT(*) as count
FROM prompt_output_history
WHERE compliance_status = 'flagged'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY term
ORDER BY count DESC
LIMIT 20;
```

**Get TOS Acceptance Rate**
```sql
SELECT 
  tos_type,
  COUNT(DISTINCT user_id) as accepted_users,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  ROUND(100.0 * COUNT(DISTINCT user_id) / (SELECT COUNT(*) FROM auth.users), 2) as acceptance_rate
FROM tos_acceptance
GROUP BY tos_type;
```

---

## Third-Party Copyright API Integration

### Recommended Providers

1. **Google Cloud Vision API** (Image)
   - Web detection for copyright matching
   - Safe search for content moderation
   - [Documentation](https://cloud.google.com/vision/docs)

2. **AWS Rekognition** (Image/Video)
   - Content moderation
   - Celebrity recognition
   - [Documentation](https://aws.amazon.com/rekognition/)

3. **Pixsy** (Image)
   - Reverse image search
   - Copyright infringement detection
   - [Documentation](https://www.pixsy.com/api)

4. **Audible Magic** (Audio/Video)
   - Content identification
   - Copyright matching
   - [Documentation](https://www.audiblemagic.com/)

### Integration Template

Update `supabase/functions/copyright-precheck/index.ts`:

```typescript
async function performCopyrightScan(outputUrl: string, outputType: string): Promise<CopyrightScanResult> {
  if (outputType === 'image') {
    return await scanImageCopyright(outputUrl)
  } else if (outputType === 'video') {
    return await scanVideoCopyright(outputUrl)
  } else if (outputType === 'audio') {
    return await scanAudioCopyright(outputUrl)
  }
}

async function scanImageCopyright(imageUrl: string): Promise<CopyrightScanResult> {
  const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
  
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: 'WEB_DETECTION' },
            { type: 'SAFE_SEARCH_DETECTION' }
          ]
        }]
      })
    }
  )

  const result = await response.json()
  const webDetection = result.responses[0].webDetection
  const safeSearch = result.responses[0].safeSearchAnnotation

  const flags = []
  if (webDetection?.pagesWithMatchingImages?.length > 0) {
    flags.push('similar_content_found')
  }
  if (safeSearch?.adult === 'VERY_LIKELY' || safeSearch?.violence === 'VERY_LIKELY') {
    flags.push('unsafe_content')
  }

  return {
    passed: flags.length === 0,
    confidence: 0.9,
    flags,
    details: { webDetection, safeSearch },
    scanProvider: 'google_vision',
  }
}
```

---

## Extending the System

### Adding New AI Engines

1. **Add Engine Configuration**
```sql
INSERT INTO ai_engine_config (
  engine_name,
  engine_type,
  tos_url,
  tos_version,
  requires_tos_acceptance,
  is_active
) VALUES (
  'midjourney',
  'image',
  'https://midjourney.com/terms',
  'v1.0',
  TRUE,
  TRUE
);
```

2. **Update Frontend Engine Selection**
```typescript
const AI_ENGINES = [
  { id: 'playground', name: 'Playground AI', type: 'image' },
  { id: 'runway', name: 'Runway ML', type: 'video' },
  { id: 'suno', name: 'Suno AI', type: 'audio' },
  { id: 'midjourney', name: 'Midjourney', type: 'image' }, // New
]
```

### Adding New Restricted Terms

```sql
INSERT INTO restricted_content_blocklist (term, category, severity, is_active)
VALUES ('new-term', 'category', 'high', TRUE);
```

### Updating TOS Versions

```sql
UPDATE ai_engine_config
SET tos_version = 'v2.0', updated_at = NOW()
WHERE engine_name = 'playground';
```

Users with old TOS versions will be prompted to accept the new version.

---

## Security Best Practices

1. **API Keys**: Store all third-party API keys in Supabase secrets
2. **Rate Limiting**: Implement rate limits on copyright scan endpoints
3. **Audit Logging**: All compliance actions are logged immutably
4. **User Privacy**: Prompt history is user-scoped with RLS policies
5. **Content Hashing**: Prompts are hashed (SHA-256) for deduplication

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Compliance Rate**: % of content passing pre-checks
2. **Violation Types**: Distribution of violation categories
3. **TOS Acceptance Rate**: % of users accepting each TOS
4. **Blocked Content**: Trends in restricted content flags
5. **Copyright Scan Performance**: API response times and accuracy

### Dashboard Queries

See "Database Queries" section above for analytics SQL examples.

---

## Troubleshooting

### Common Issues

**Issue**: TOS modal appears repeatedly
- **Solution**: Check that TOS acceptance is being recorded correctly in `tos_acceptance` table

**Issue**: Copyright scan always fails
- **Solution**: Verify third-party API keys are set correctly in Supabase secrets

**Issue**: Notifications not appearing
- **Solution**: Check real-time subscription is active and user is authenticated

**Issue**: Restricted content not being blocked
- **Solution**: Verify `restricted_content_blocklist` table has active entries

---

## Support

For additional help:
- Review database schema: `supabase/migrations/20251123120800_create_compliance_tables.sql`
- Check Edge Function logs in Supabase dashboard
- Review frontend component implementations in `src/components/compliance/`
