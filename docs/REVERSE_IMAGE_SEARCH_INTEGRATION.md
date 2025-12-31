# Reverse Image Search Integration

## Overview

The KoboNFT platform integrates **TinEye Reverse Image Search API** to enhance copyright compliance by detecting similar images across the web before minting. This helps creators ensure their content is original and avoid potential copyright violations.

## Features

- **Automated Reverse Image Search**: Every image upload is automatically scanned against TinEye's database of billions of images
- **Threshold-Based Warnings**: Configurable similarity threshold (default 75%) triggers warnings or blocks minting
- **Detailed Match Reports**: View similar images found online with match scores, domains, and backlink counts
- **Smart Compliance Integration**: Seamlessly integrated with existing compliance scanning workflow
- **User-Friendly UI**: Clear visual feedback with expandable match details in the compliance modal

## Architecture

### Service Layer

**File**: `src/lib/complianceService.ts`

Key functions:
- `performReverseImageSearch(imageUrl: string)`: Executes TinEye API search
- `performEnhancedComplianceScan(params)`: Combines standard compliance checks with reverse image search

### Mint Flow Integration

**File**: `src/lib/mintService.ts`

The mint service automatically:
1. Uploads image to IPFS to get a public URL
2. Performs enhanced compliance scan (includes reverse image search)
3. Blocks minting if `status === 'blocked'`
4. Returns warning if similarity threshold exceeded
5. Allows user to review matches and decide whether to proceed

### UI Components

**File**: `src/components/compliance/ComplianceResultsModal.tsx`

Displays:
- Total matches found
- Highest match score vs threshold
- Top 5 similar images with:
  - Match percentage
  - Source domain
  - Crawl date
  - Number of backlinks
  - Link to view original image

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# TinEye Reverse Image Search API
VITE_TINEYE_API_KEY=your_api_key_here
VITE_TINEYE_API_URL=https://api.tineye.com/rest/
VITE_TINEYE_MATCH_THRESHOLD=75
```

### Getting a TinEye API Key

1. Visit [TinEye API](https://services.tineye.com/TinEyeAPI)
2. Sign up for an account
3. Purchase a search bundle:
   - 5,000 searches: $200 (~$0.04/search)
   - 10,000 searches: $300 (~$0.03/search)
   - 50,000 searches: $1,000 (~$0.02/search)
   - 1,000,000 searches: $10,000 (~$0.01/search)
4. Enable auto top-up (optional) for automatic bundle renewal
5. Copy your API key to `.env`

### Threshold Configuration

The `VITE_TINEYE_MATCH_THRESHOLD` determines when to warn users:

- **50-60%**: Very lenient - only blocks obvious duplicates
- **70-75%**: Balanced - recommended default
- **80-90%**: Strict - flags even minor similarities
- **95-100%**: Very strict - only allows completely unique images

## API Integration Details

### TinEye API Request Flow

1. **Generate Signature**: TinEye requires HMAC-SHA256 signature for authentication
   ```typescript
   const signatureString = `${apiKey}${nonce}${method}${params.toString()}`;
   const signature = crypto.createHash('sha256').update(signatureString).digest('hex');
   ```

2. **Make Request**: GET request to `/search_url/` endpoint
   ```typescript
   const requestUrl = `${apiUrl}${method}/?${params}&api_key=${apiKey}&nonce=${nonce}&api_sig=${signature}`;
   ```

3. **Parse Response**: Extract matches with scores, domains, and metadata

### Response Structure

```typescript
interface TinEyeMatch {
  score: number;           // Similarity score (0-100)
  width: number;           // Image width
  height: number;          // Image height
  imageUrl: string;        // URL of matched image
  domain: string;          // Domain where image was found
  crawlDate: string;       // When TinEye indexed the image
  backlinks: Array<{       // Sites linking to this image
    url: string;
    crawlDate: string;
  }>;
}
```

### Error Handling

The integration gracefully handles failures:
- **Missing API Key**: Skips reverse search, logs warning, continues mint
- **API Errors**: Returns empty result, logs error, continues mint
- **Network Issues**: Timeout after 30s, continues mint

This ensures users are never blocked from minting due to API issues.

## Usage in Mint Flow

### Standard Mint

```typescript
import { mintNFT } from '@/lib/mintService';

const result = await mintNFT({
  to: userAddress,
  uri: '', // Will be generated
  nftType: NFTType.IMAGE,
  generationMethod: GenerationMethod.MANUAL_UPLOAD,
  file: imageFile,
  metadata: {
    name: 'My NFT',
    description: 'Created with KoboNFT',
  },
  // skipComplianceScan: false (default - scan is performed)
});

if (!result.success && result.complianceScanResult) {
  // Show compliance modal with reverse search results
  showComplianceModal(result.complianceScanResult);
}
```

### Skip Compliance Scan (Admin Override)

```typescript
const result = await mintNFT({
  // ... other options
  skipComplianceScan: true, // Skip reverse image search
});
```

## Compliance Modal UI

The `ComplianceResultsModal` component displays reverse search results:

### Status Indicators

- **Green (Passed)**: No matches or all matches below threshold
- **Yellow (Warning)**: Matches found above threshold - review required
- **Red (Blocked)**: Critical compliance violations (not just reverse search)

### Reverse Search Section

Expandable section showing:
- Total matches found
- Highest match score with threshold comparison
- Top 5 matches with detailed information
- Links to view original images

### User Actions

- **Proceed Anyway**: User acknowledges matches and continues minting
- **Cancel**: User decides not to mint
- **View Details**: Expand to see all match information

## Best Practices

### For Platform Administrators

1. **Set Appropriate Threshold**: Balance between protecting copyright and allowing creative remixes
2. **Monitor API Usage**: Track search bundle consumption and set up auto top-up
3. **Review Blocked Content**: Periodically audit blocked mints to ensure threshold is appropriate
4. **Update Blocklist**: Combine reverse search with keyword blocklist for comprehensive protection

### For Developers

1. **Handle Async Gracefully**: Reverse search adds ~2-5s to mint flow - show loading states
2. **Cache Results**: Consider caching reverse search results for same image (future enhancement)
3. **Optimize IPFS Uploads**: Image is uploaded to IPFS before reverse search - ensure fast gateway
4. **Test Edge Cases**: Test with various image types, sizes, and network conditions

### For Users

1. **Upload Original Content**: Reverse search helps verify your content is unique
2. **Review Matches Carefully**: High match score doesn't always mean copyright violation
3. **Understand Fair Use**: Some similarities may be acceptable under fair use or licensing
4. **Contact Support**: If you believe a match is incorrect, contact platform support

## Limitations

### TinEye API Limitations

- **Image Database**: Only searches TinEye's indexed images (not entire internet)
- **Crawl Lag**: Recently published images may not be indexed yet
- **Modified Images**: Heavily edited or cropped images may not match originals
- **Rate Limits**: API calls limited by purchased bundle size

### Technical Limitations

- **Image Types Only**: Currently only works for images (not video/audio)
- **IPFS Dependency**: Requires image to be uploaded to IPFS first
- **Network Latency**: Adds 2-5 seconds to mint flow
- **No Offline Mode**: Requires internet connection and TinEye API availability

## Future Enhancements

### Planned Features

1. **Video Reverse Search**: Integrate video fingerprinting services
2. **Audio Matching**: Add audio similarity detection
3. **Result Caching**: Cache reverse search results to avoid duplicate API calls
4. **Batch Processing**: Optimize multiple image uploads
5. **Advanced Filtering**: Filter matches by domain, date range, or license type
6. **Machine Learning**: Train custom model to detect derivative works

### Alternative Services

Consider integrating additional reverse search providers:
- **Google Vision API**: Broader image database, ML-powered matching
- **Lenso.ai**: Developer-friendly API with 5,000 free calls/month
- **MatchEngine**: TinEye's private image collection search (for platform-specific matching)

## Troubleshooting

### Common Issues

**Issue**: "TinEye API key not configured"
- **Solution**: Add `VITE_TINEYE_API_KEY` to `.env` file

**Issue**: "Reverse image search failed"
- **Solution**: Check API key validity, bundle balance, and network connectivity

**Issue**: "All images flagged as similar"
- **Solution**: Lower `VITE_TINEYE_MATCH_THRESHOLD` value

**Issue**: "No matches found for duplicate image"
- **Solution**: Image may not be indexed by TinEye yet, or heavily modified

### Debug Mode

Enable detailed logging:

```typescript
// In complianceService.ts
console.log('TinEye API Response:', data);
console.log('Match Threshold:', threshold);
console.log('Highest Score:', highestScore);
```

## Support

For issues or questions:
- **TinEye API Support**: https://help.tineye.com
- **Platform Support**: Contact your KoboNFT administrator
- **Documentation**: https://api.tineye.com/documentation/

## License

This integration uses the TinEye API under commercial license. Ensure compliance with TinEye's Terms of Service.
