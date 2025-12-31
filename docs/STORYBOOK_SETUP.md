# Storybook Setup Guide

Guide for setting up Storybook visual documentation for KoboNFT components.

## 📋 Overview

Storybook provides interactive visual documentation for React components, allowing developers to:
- Browse component library
- Test components in isolation
- Document component props and variants
- Develop components independently

## 🚀 Installation

### 1. Install Storybook

```bash
# Initialize Storybook (will auto-detect Vite + React)
pnpm dlx storybook@latest init

# Or install manually
pnpm add -D @storybook/react @storybook/react-vite @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-links @storybook/addon-a11y
```

### 2. Configure Storybook

The init command will create `.storybook/` directory with configuration files.

#### `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

#### `.storybook/preview.ts`

```typescript
import type { Preview } from '@storybook/react';
import '../src/styles/globals.css'; // Import Tailwind styles

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

### 3. Add Scripts to package.json

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

## 📝 Writing Stories

### Basic Component Story

```typescript
// src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Button',
    variant: 'outline',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};
```

### Complex Component Story

```typescript
// src/components/AIGenerator.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AIGenerator } from './AIGenerator';

const meta = {
  title: 'Features/AIGenerator',
  component: AIGenerator,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AIGenerator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onGenerate: (result) => console.log('Generated:', result),
  },
};

export const WithInitialPrompt: Story = {
  args: {
    initialPrompt: 'A majestic dragon flying over mountains',
    onGenerate: (result) => console.log('Generated:', result),
  },
};
```

### Story with Interactions

```typescript
// src/components/MintForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { MintForm } from './MintForm';

const meta = {
  title: 'Features/MintForm',
  component: MintForm,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MintForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FilledForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Fill in the form
    await userEvent.type(canvas.getByLabelText('Name'), 'My NFT');
    await userEvent.type(canvas.getByLabelText('Description'), 'A cool NFT');
    
    // Verify form state
    expect(canvas.getByLabelText('Name')).toHaveValue('My NFT');
  },
};
```

## 🎨 Component Coverage

### Priority Components to Document

#### UI Components (shadcn/ui)
- [ ] Button
- [ ] Input
- [ ] Dialog
- [ ] Card
- [ ] Tabs
- [ ] Select
- [ ] Checkbox
- [ ] Radio Group
- [ ] Switch
- [ ] Tooltip
- [ ] Dropdown Menu
- [ ] Alert
- [ ] Badge
- [ ] Avatar

#### Feature Components
- [ ] AIGenerator
- [ ] GlassCylinderMint
- [ ] NFTCard
- [ ] BattleCard
- [ ] CollaborationCard
- [ ] WalletConnect
- [ ] MintForm
- [ ] BattleVoting
- [ ] GovernanceProposal

#### Layout Components
- [ ] Header
- [ ] Footer
- [ ] Sidebar
- [ ] Navigation

## 🚀 Running Storybook

### Development Mode

```bash
# Start Storybook dev server
pnpm storybook

# Opens at http://localhost:6006
```

### Build Static Storybook

```bash
# Build static Storybook site
pnpm build-storybook

# Output in storybook-static/
# Can be deployed to any static hosting
```

### Deploy Storybook

#### Option 1: Vercel
```bash
# Deploy to Vercel
vercel storybook-static
```

#### Option 2: GitHub Pages
```bash
# Build Storybook
pnpm build-storybook

# Deploy to gh-pages branch
npx gh-pages -d storybook-static
```

#### Option 3: Chromatic (Recommended)
```bash
# Install Chromatic
pnpm add -D chromatic

# Publish to Chromatic
pnpm dlx chromatic --project-token=<your-token>
```

## 📚 Best Practices

### Story Organization

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.stories.tsx      # Co-located with component
│   └── features/
│       ├── AIGenerator.tsx
│       └── AIGenerator.stories.tsx
```

### Story Naming

```typescript
// ✅ Good: Descriptive names
export const PrimaryButton: Story = { ... };
export const LargeDestructiveButton: Story = { ... };

// ❌ Bad: Generic names
export const Story1: Story = { ... };
export const Test: Story = { ... };
```

### Documentation

```typescript
/**
 * Primary UI button component with multiple variants.
 * 
 * Supports different sizes, variants, and states.
 */
const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'A versatile button component built on Radix UI primitives.',
      },
    },
  },
} satisfies Meta<typeof Button>;
```

### Accessibility Testing

```typescript
const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
} satisfies Meta<typeof Button>;
```

## 🔧 Advanced Configuration

### Custom Webpack Config

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // ... other config
  viteFinal: async (config) => {
    // Customize Vite config
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': '/src',
        },
      },
    };
  },
};
```

### Custom Theme

```typescript
// .storybook/preview.ts
import { create } from '@storybook/theming/create';

const theme = create({
  base: 'dark',
  brandTitle: 'KoboNFT',
  brandUrl: 'https://kobo-nft.com',
  brandImage: '/logo.svg',
});

const preview: Preview = {
  parameters: {
    docs: {
      theme,
    },
  },
};
```

### Global Decorators

```typescript
// .storybook/preview.tsx
import { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/components/theme-provider';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
};
```

## 📊 Integration with CI/CD

### GitHub Actions

```yaml
# .github/workflows/storybook.yml
name: Storybook

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build Storybook
        run: pnpm build-storybook
      
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: storybook
          path: storybook-static/
```

### Visual Regression Testing

```bash
# Install Chromatic
pnpm add -D chromatic

# Add script to package.json
{
  "scripts": {
    "chromatic": "chromatic --exit-zero-on-changes"
  }
}

# Run in CI
pnpm chromatic --project-token=$CHROMATIC_TOKEN
```

## 🐛 Troubleshooting

### Issue: Tailwind styles not loading

**Solution**: Import globals.css in preview.ts
```typescript
// .storybook/preview.ts
import '../src/styles/globals.css';
```

### Issue: Module resolution errors

**Solution**: Configure path aliases in main.ts
```typescript
viteFinal: async (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../src'),
  };
  return config;
}
```

### Issue: React hooks errors

**Solution**: Ensure React is properly configured
```typescript
// .storybook/preview.tsx
import React from 'react';
```

## 📖 Resources

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Storybook Vite Plugin](https://github.com/storybookjs/builder-vite)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)
- [Storybook Addons](https://storybook.js.org/addons)

---

**Last Updated**: November 25, 2024
