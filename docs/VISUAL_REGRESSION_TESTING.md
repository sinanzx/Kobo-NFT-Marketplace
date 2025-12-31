# Visual Regression Testing Guide

## Overview

This project uses **Playwright** for visual regression testing to ensure UI consistency across browsers, viewports, and code changes.

## What is Visual Regression Testing?

Visual regression testing captures screenshots of your UI components and compares them against baseline images. When changes are detected, tests fail, alerting you to unintended visual changes.

## Setup

### Installation

```bash
# Install Playwright and browsers
pnpm add -D @playwright/test
pnpm exec playwright install
```

### Configuration

The configuration is in `playwright.config.ts`:

- **Test Directory**: `./tests/visual`
- **Browsers**: Chromium, Firefox, WebKit
- **Viewports**: Desktop (1920x1080), Mobile (Pixel 5, iPhone 12), Tablet (iPad Pro)
- **Base URL**: `http://localhost:5173` (configurable via `PLAYWRIGHT_BASE_URL`)

## Running Tests

### Run All Visual Tests

```bash
pnpm exec playwright test
```

### Run Tests in UI Mode (Interactive)

```bash
pnpm exec playwright test --ui
```

### Run Specific Test File

```bash
pnpm exec playwright test tests/visual/components.spec.ts
```

### Run Tests for Specific Browser

```bash
pnpm exec playwright test --project=chromium
pnpm exec playwright test --project=firefox
pnpm exec playwright test --project=webkit
```

### Update Baseline Screenshots

When you intentionally change UI, update baselines:

```bash
pnpm exec playwright test --update-snapshots
```

### View Test Report

```bash
pnpm exec playwright show-report
```

## Test Structure

### Example Test

```typescript
import { test, expect } from '@playwright/test';

test('Component Visual Test', async ({ page }) => {
  // Navigate to page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot of element
  const element = page.locator('[data-testid="my-component"]');
  await expect(element).toHaveScreenshot('my-component.png', {
    maxDiffPixels: 100, // Allow up to 100 pixels difference
  });
});
```

## What We Test

### Components Covered

1. **Navigation Header** - Consistency across pages
2. **Hero Section** - Landing page hero
3. **NFT Gallery Grid** - Card layouts and spacing
4. **Dashboard Cards** - Stats and gamification UI
5. **Button Variants** - All button styles
6. **Modal Dialogs** - Popup and overlay UI
7. **Loading Skeletons** - Progressive loading states
8. **Form Elements** - Input fields, dropdowns, etc.

### Responsive Testing

- **Desktop**: 1920x1080
- **Tablet**: 1024x1366 (iPad Pro)
- **Mobile**: 375x667 (iPhone), 393x851 (Pixel 5)

### Browser Coverage

- **Chromium** (Chrome, Edge)
- **Firefox**
- **WebKit** (Safari)

### State Testing

- **Default State** - Normal component appearance
- **Hover State** - Mouse hover interactions
- **Focus State** - Keyboard navigation
- **Loading State** - Skeleton loaders
- **Error State** - Error messages and alerts
- **Empty State** - No data scenarios
- **Dark Mode** - Color scheme consistency

## Best Practices

### 1. Use Data Attributes for Selectors

```tsx
<div data-testid="nft-card">...</div>
```

```typescript
const card = page.locator('[data-testid="nft-card"]');
```

### 2. Wait for Content to Load

```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="content"]', { state: 'visible' });
```

### 3. Set Appropriate Diff Thresholds

```typescript
await expect(element).toHaveScreenshot('name.png', {
  maxDiffPixels: 100, // Adjust based on component complexity
});
```

### 4. Test Animations After Completion

```typescript
// Wait for animation to finish
await page.waitForTimeout(1000);
await expect(element).toHaveScreenshot('animated.png');
```

### 5. Isolate Dynamic Content

```typescript
// Hide timestamps or dynamic data
await page.addStyleTag({
  content: '[data-dynamic] { visibility: hidden; }'
});
```

## CI/CD Integration

### GitHub Actions Workflow

Add to `.github/workflows/visual-tests.yml`:

```yaml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps
        
      - name: Run Visual Tests
        run: pnpm exec playwright test
        
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Debugging Failed Tests

### 1. View HTML Report

```bash
pnpm exec playwright show-report
```

The report shows:
- Side-by-side comparison of expected vs actual
- Diff highlighting changed pixels
- Test logs and traces

### 2. Run in Debug Mode

```bash
pnpm exec playwright test --debug
```

### 3. View Screenshots

Screenshots are saved in:
- `tests/visual/components.spec.ts-snapshots/` - Baseline images
- `test-results/` - Failed test artifacts

### 4. Analyze Diff

Playwright generates diff images showing:
- **Red pixels**: Removed content
- **Green pixels**: Added content
- **Yellow pixels**: Changed content

## Common Issues

### Issue: Tests Fail on CI but Pass Locally

**Cause**: Font rendering differences between OS

**Solution**: Use Docker for consistent environment

```bash
docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.40.0 pnpm exec playwright test
```

### Issue: Flaky Tests Due to Animations

**Cause**: Screenshots taken mid-animation

**Solution**: Disable animations or wait for completion

```typescript
// Disable animations
await page.addStyleTag({
  content: '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }'
});
```

### Issue: Dynamic Content Causes Failures

**Cause**: Timestamps, random data, etc.

**Solution**: Mock or hide dynamic content

```typescript
// Mock API response
await page.route('**/api/data', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ timestamp: '2024-01-01T00:00:00Z' })
  });
});
```

## Maintenance

### When to Update Baselines

Update baselines when:
- ✅ Intentional UI changes (new design, layout updates)
- ✅ Dependency updates affecting rendering
- ✅ Font or icon library updates

Do NOT update baselines for:
- ❌ Unintended visual regressions
- ❌ Broken layouts
- ❌ Missing styles

### Baseline Review Process

1. Run tests: `pnpm exec playwright test`
2. Review failures in HTML report
3. Verify changes are intentional
4. Update baselines: `pnpm exec playwright test --update-snapshots`
5. Commit updated screenshots to git

## Advanced Usage

### Custom Viewport Testing

```typescript
test('Custom Viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('custom-viewport.png');
});
```

### Testing Specific Regions

```typescript
test('Specific Region', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('header');
  await expect(header).toHaveScreenshot('header-only.png', {
    clip: { x: 0, y: 0, width: 1920, height: 100 }
  });
});
```

### Mask Dynamic Elements

```typescript
test('Masked Elements', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('masked.png', {
    mask: [page.locator('[data-dynamic]')],
  });
});
```

### Full Page Screenshots

```typescript
test('Full Page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('full-page.png', {
    fullPage: true,
  });
});
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Visual Comparisons Guide](https://playwright.dev/docs/test-snapshots)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## Support

For issues or questions:
1. Check the [Playwright GitHub Issues](https://github.com/microsoft/playwright/issues)
2. Review test logs in `test-results/`
3. Consult the HTML report: `pnpm exec playwright show-report`
