# Contributing to KoboNFT

Thank you for your interest in contributing to KoboNFT! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations may be reported to the project team at conduct@kobo-nft.com. All complaints will be reviewed and investigated.

---

## Getting Started

### Prerequisites

```bash
# Required
- Node.js 20+
- pnpm 10.12.4+
- Git

# Optional (for smart contracts)
- Foundry
```

### Fork and Clone

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/kobo-nft.git
   cd kobo-nft
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/kobo-nft/kobo-nft.git
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

---

## Development Workflow

### 1. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feat/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, maintainable code
- Follow coding standards (see below)
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linting
pnpm run lint

# Run type checking
pnpm exec tsc --noEmit

# Run tests
pnpm test

# Run E2E tests
pnpm run test:e2e

# Build to verify
pnpm build
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new feature"

# Pre-commit hooks will run automatically
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feat/your-feature-name

# Create Pull Request on GitHub
```

---

## Coding Standards

### TypeScript

#### Type Safety
```typescript
// ✅ Good: Explicit types
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<UserProfile> {
  // ...
}

// ❌ Bad: Using any
function getUser(id: any): any {
  // ...
}
```

#### Null Safety
```typescript
// ✅ Good: Handle null/undefined
const user = await getUser(id);
if (!user) {
  throw new Error('User not found');
}

// ❌ Bad: Assume value exists
const user = await getUser(id);
user.name; // Could be null
```

#### Naming Conventions
```typescript
// ✅ Good: Descriptive names
const userProfileData = await fetchUserProfile(userId);
const isAuthenticated = checkAuthStatus();

// ❌ Bad: Unclear names
const data = await fetch(id);
const flag = check();
```

### React Components

#### Component Structure
```typescript
// ✅ Good: Well-structured component
interface ButtonProps {
  /** Button label text */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary';
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Reusable button component with multiple variants
 */
export function Button({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}
```

#### Hooks Best Practices
```typescript
// ✅ Good: Proper dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]); // Include all dependencies

// ❌ Bad: Missing dependencies
useEffect(() => {
  fetchData(userId);
}, []); // userId not in deps
```

#### Performance Optimization
```typescript
// ✅ Good: Memoization
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ Bad: No memoization for expensive operations
const expensiveValue = computeExpensiveValue(data); // Runs every render
```

### CSS/Styling

```css
/* ✅ Good: BEM naming */
.button {}
.button--primary {}
.button__icon {}

/* ❌ Bad: Generic names */
.btn {}
.blue {}
.icon {}
```

### File Organization

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── features/       # Feature-specific components
├── lib/                # Utility functions and services
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── pages/              # Page components
└── styles/             # Global styles
```

---

## Commit Guidelines

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) specification.

#### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

#### Examples

```bash
# Feature
feat(mint): add AI image generation

# Bug fix
fix(wallet): resolve connection timeout issue

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(api)!: change authentication flow

BREAKING CHANGE: API endpoints now require JWT tokens
```

#### Scope Guidelines

- `mint`: Minting functionality
- `battle`: Battle system
- `collab`: Collaboration features
- `governance`: DAO governance
- `wallet`: Wallet integration
- `ui`: UI components
- `api`: API endpoints
- `contract`: Smart contracts

### Commit Message Rules

1. **Use imperative mood**: "add feature" not "added feature"
2. **Keep subject under 72 characters**
3. **Capitalize first letter**
4. **No period at the end**
5. **Separate subject from body with blank line**
6. **Wrap body at 72 characters**
7. **Explain what and why, not how**

---

## Pull Request Process

### Before Creating PR

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log or debug code
- [ ] No commented-out code
- [ ] Commit messages follow conventions

### PR Title

Use conventional commit format:
```
feat(scope): add new feature
fix(scope): resolve bug
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least one approval required
3. **Address Feedback**: Respond to all comments
4. **Final Approval**: Maintainer approves
5. **Merge**: Squash and merge

### After Merge

- Delete your branch
- Update your fork
- Close related issues

---

## Testing Requirements

### Unit Tests

```typescript
// Example: Component test
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);
    
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Click" onClick={() => {}} disabled />);
    expect(screen.getByText('Click')).toBeDisabled();
  });
});
```

### E2E Tests

```typescript
// Example: E2E test
import { test, expect } from '@playwright/test';

test('user can mint NFT', async ({ page }) => {
  await page.goto('/mint');
  
  // Connect wallet
  await page.click('button:has-text("Connect Wallet")');
  await page.click('button:has-text("MetaMask")');
  
  // Fill form
  await page.fill('input[name="name"]', 'Test NFT');
  await page.fill('textarea[name="description"]', 'Test description');
  
  // Submit
  await page.click('button:has-text("Mint NFT")');
  
  // Verify success
  await expect(page.locator('text=NFT minted successfully')).toBeVisible();
});
```

### Coverage Requirements

- **Minimum**: 70% overall coverage
- **Critical paths**: 90%+ coverage
- **New features**: 80%+ coverage

---

## Documentation

### Code Documentation

#### JSDoc Comments
```typescript
/**
 * Mints a new NFT with the provided metadata
 * 
 * @param metadata - NFT metadata including name, description, and image
 * @param options - Optional minting configuration
 * @returns Promise resolving to the minted NFT token ID
 * @throws {Error} If minting fails or metadata is invalid
 * 
 * @example
 * ```typescript
 * const tokenId = await mintNFT({
 *   name: "My NFT",
 *   description: "A cool NFT",
 *   image: "ipfs://..."
 * });
 * ```
 */
export async function mintNFT(
  metadata: NFTMetadata,
  options?: MintOptions
): Promise<string> {
  // Implementation
}
```

#### Inline Comments
```typescript
// ✅ Good: Explain why, not what
// Use exponential backoff to avoid rate limiting
const delay = Math.pow(2, retryCount) * 1000;

// ❌ Bad: Obvious comment
// Set delay to 2^retryCount * 1000
const delay = Math.pow(2, retryCount) * 1000;
```

### README Updates

Update relevant README files when:
- Adding new features
- Changing APIs
- Updating dependencies
- Modifying configuration

### API Documentation

Update OpenAPI spec (`docs/api/openapi.yaml`) for:
- New endpoints
- Changed request/response formats
- New error codes

---

## Getting Help

### Resources

- **Documentation**: [docs/](./docs/)
- **API Reference**: [docs/api/](./docs/api/)
- **Examples**: [examples/](./examples/)

### Community

- **Discord**: [Join our server](https://discord.gg/kobo-nft)
- **GitHub Discussions**: [Ask questions](https://github.com/kobo-nft/kobo-nft/discussions)
- **Email**: dev@kobo-nft.com

### Reporting Issues

When reporting bugs, include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node version)
- Screenshots if applicable
- Error messages and stack traces

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for contributor NFT badges
- Invited to contributor events

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to KoboNFT! 🚀**

**Last Updated**: November 25, 2024
