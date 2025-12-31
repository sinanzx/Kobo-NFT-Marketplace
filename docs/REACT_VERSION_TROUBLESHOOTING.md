# React Version Troubleshooting Guide

## Official React Version Requirement

**This project requires React 18.x.x**

Current stable version: **React 18.3.1**

## Why React 18 is Required

Several critical dependencies in this project have peer dependency requirements that are incompatible with React 19:

- **RainbowKit** (v2.x): Requires React 18
- **Wagmi** (v2.x): Requires React 18
- **@testing-library/react**: Optimized for React 18
- **Cypress Component Testing**: Configured for React 18

React 19 introduced breaking changes to internal hooks APIs that cause runtime errors with these packages.

## Known React 19 Incompatibility Symptoms

If you accidentally install React 19, you may encounter:

### Runtime Errors
```
TypeError: Cannot read properties of null (reading 'useState')
TypeError: Cannot read properties of null (reading 'useEffect')
```

### Build Errors
```
Module not found: Can't resolve 'react/jsx-runtime'
Type errors related to JSX.Element and ReactNode
```

### Console Warnings
```
Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

## Downgrading from React 19 to React 18

If you've accidentally installed React 19, follow these steps:

### 1. Remove React 19

```bash
pnpm remove react react-dom @types/react @types/react-dom
```

### 2. Install React 18.3.1

```bash
pnpm add react@18.3.1 react-dom@18.3.1
pnpm add -D @types/react@18.3.18 @types/react-dom@18.3.1
```

### 3. Downgrade Dependent Packages

**Wagmi**: Must use v2.x (not v3.x)
```bash
pnpm remove wagmi viem @tanstack/react-query
pnpm add wagmi@2.12.17 viem@2.21.45 @tanstack/react-query@5.59.16
```

**RainbowKit**: Must use v2.x compatible with Wagmi v2
```bash
pnpm remove @rainbow-me/rainbowkit
pnpm add @rainbow-me/rainbowkit@2.1.7
```

### 4. Clean Dependency Tree

```bash
# Remove lockfile and node_modules
rm -rf node_modules pnpm-lock.yaml

# Fresh install
pnpm install
```

### 5. Verify Installation

Check for peer dependency warnings:
```bash
pnpm install --loglevel warn
```

You should see no warnings about React version mismatches.

### 6. Restart Dev Server

```bash
pnpm run dev
```

## TypeScript Errors After Downgrade

If you see TypeScript errors after downgrading, they're likely due to cached or mixed React typings:

### Common Type Errors

**Error**: `Type 'bigint' is not assignable to type 'ReactNode'`

**Fix**: Convert bigint values to strings before rendering:
```tsx
// ❌ Wrong
<div>{myBigIntValue}</div>

// ✅ Correct
<div>{myBigIntValue.toString()}</div>
```

**Error**: `Type 'Icon' is not assignable to type 'ReactNode'`

**Fix**: Ensure lucide-react icons are used as JSX components:
```tsx
// ❌ Wrong
const icon = AlertCircle;

// ✅ Correct
const icon = <AlertCircle className="..." />;
```

### Clearing Type Cache

If type errors persist:

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite
rm -rf dist

# Restart TypeScript server in your IDE
# VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Package Version Reference

### Core Dependencies (React 18 Compatible)

```json
{
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "@types/react": "18.3.18",
  "@types/react-dom": "18.3.1",
  "wagmi": "2.12.17",
  "viem": "2.21.45",
  "@rainbow-me/rainbowkit": "2.1.7",
  "@tanstack/react-query": "5.59.16"
}
```

### Testing Dependencies

```json
{
  "@testing-library/react": "^16.0.1",
  "@testing-library/user-event": "^14.5.2",
  "cypress": "^13.16.1"
}
```

## Preventing Accidental Upgrades

Add this to your `package.json` to prevent accidental React 19 installation:

```json
{
  "pnpm": {
    "overrides": {
      "react": "18.3.1",
      "react-dom": "18.3.1"
    }
  }
}
```

## Upstream Issues & References

- [RainbowKit React 19 Support Tracking](https://github.com/rainbow-me/rainbowkit/issues)
- [Wagmi v3 requires React 19](https://wagmi.sh/react/guides/migrate-from-v2-to-v3)
- [React 19 Breaking Changes](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

## FAQ

### Q: When can I upgrade to React 19?

**A**: Wait until RainbowKit and Wagmi release React 19-compatible versions. Monitor:
- RainbowKit v3.x release (requires Wagmi v3)
- Wagmi v3.x stable release
- Testing library React 19 support

### Q: I'm getting "Module externalized for browser compatibility" warnings

**A**: These are Vite warnings about Node.js modules (like `buffer`) and are unrelated to React version. They don't affect functionality.

### Q: WalletConnect shows 400 errors in console

**A**: These are telemetry/analytics endpoint errors from `pulse.walletconnect.org` and don't affect wallet functionality. Safe to ignore.

### Q: My app shows a blank screen after downgrade

**A**: Try these steps:
1. Hard refresh the browser (Cmd/Ctrl + Shift + R)
2. Clear browser cache
3. Restart the dev server
4. Check browser console for actual errors

### Q: Can I use React 18.2.0 instead of 18.3.1?

**A**: Yes, any React 18.x version should work, but 18.3.1 is the latest stable release with bug fixes and is recommended.

## Getting Help

If you continue to experience issues after following this guide:

1. Check that all dependencies match the versions in "Package Version Reference"
2. Verify `pnpm-lock.yaml` doesn't contain React 19 references
3. Review the error message carefully - it may indicate a different issue
4. Check the project's GitHub issues for similar problems

## Last Updated

2025-11-25 - Verified with React 18.3.1, Wagmi 2.12.17, RainbowKit 2.1.7
