# Navigation and Routing Architecture

## Overview
The KoboNFT application uses React Router v6 for client-side routing with a comprehensive navigation system that supports both desktop and mobile experiences.

## Main Navigation Component

### Location
`src/components/layout/MainNavigation.tsx`

### Features
- **Responsive Design**: Separate desktop and mobile navigation layouts
- **Active State Tracking**: Visual indicators for current page
- **Smooth Animations**: Framer Motion animations for menu transitions
- **Accessibility**: Full ARIA labels and keyboard navigation support
- **Feature Tour Integration**: Quick access to restart the feature discovery tour

### Navigation Items
```typescript
const navigationItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/create', label: 'Create', icon: Sparkles },
  { path: '/gallery', label: 'Gallery', icon: Image },
  { path: '/battles', label: 'Battles', icon: Swords },
  { path: '/collaborations', label: 'Collaborations', icon: Users },
  { path: '/ar-viewer', label: 'AR Viewer', icon: Glasses },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];
```

### Desktop Navigation
- Fixed top navigation bar with backdrop blur
- Horizontal layout with icon + label buttons
- Active tab indicator with animated gradient background
- Feature tour and wallet connection buttons in header

### Mobile Navigation
- Collapsible hamburger menu
- Full-screen dropdown with vertical layout
- Touch-optimized button sizes
- Animated open/close transitions

## Routing Configuration

### Location
`src/App.tsx`

### Route Structure
```
/ (Homepage)
├── /create (NFT Creation)
├── /gallery (NFT Gallery)
├── /battles (Battle Arena)
├── /collaborations (Collaborative Minting)
├── /ar-viewer (AR/VR Viewer)
├── /dashboard (Protected - User Dashboard)
├── /onboarding (Onboarding Flow)
└── /login (Authentication)
```

### Protected Routes
The `/dashboard` route is protected using the `ProtectedRoute` component:
- Requires user authentication
- Redirects to `/login` if not authenticated
- Preserves intended destination for post-login redirect

## Homepage Architecture

### Location
`src/pages/Homepage.tsx`

### Showcase Components
The homepage integrates four main showcase sections:

#### 1. Battle Showcase
- **Component**: `src/components/homepage/BattleShowcase.tsx`
- **Purpose**: Display active NFT battles
- **Features**:
  - Live data from `battleService`
  - Top 3 active battles
  - Battle stats (participants, prize pool, status)
  - CTA to battles page
  - Error handling with retry functionality
  - Loading skeletons

#### 2. Collaboration Showcase
- **Component**: `src/components/homepage/CollabShowcase.tsx`
- **Purpose**: Display active collaboration sessions
- **Features**:
  - Live data from `collabService`
  - Top 3 active sessions
  - Participant counts and progress bars
  - Time remaining countdown
  - CTA to collaborations page
  - Error handling with retry functionality

#### 3. Dynamic Traits Showcase
- **Component**: `src/components/homepage/TraitShowcase.tsx`
- **Purpose**: Demonstrate dynamic NFT trait capabilities
- **Features**:
  - Interactive demo cards
  - Three trait types: Interaction-based, Time-based, Community-driven
  - Click-to-activate animations
  - Visual feedback on activation
  - CTA to traits page

#### 4. AR/VR Showcase
- **Component**: `src/components/homepage/ARShowcase.tsx`
- **Purpose**: Highlight AR/VR preview capabilities
- **Features**:
  - Immersive preview card with animations
  - Three platform types: Mobile AR, Web Gallery, VR Ready
  - Hover interactions
  - CTA to onboarding/AR demo

### Layout Structure
```
<Homepage>
  <Hero />
  <BattleShowcase />
  <CollabShowcase />
  <TraitShowcase />
  <ARShowcase />
  <HowItWorks />
  <NFTCarousel />
  <Roadmap />
  <Footer />
</Homepage>
```

## Accessibility Features

### ARIA Labels
All navigation elements include proper ARIA labels:
- `aria-label` for buttons and links
- `aria-current="page"` for active navigation items
- `aria-expanded` for mobile menu state
- `aria-controls` for menu relationships
- `aria-hidden="true"` for decorative icons

### Keyboard Navigation
- Full keyboard support for all interactive elements
- Tab navigation through menu items
- Enter/Space activation for interactive cards
- Focus management for mobile menu

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Role attributes for custom components
- Live regions for dynamic content updates

## Error Handling

### Showcase Components
All showcase components implement comprehensive error handling:

1. **Error State Management**
   ```typescript
   const [error, setError] = useState<string | null>(null);
   ```

2. **Try-Catch Blocks**
   - Wrap all async data fetching
   - Set user-friendly error messages
   - Log errors to console for debugging

3. **Error UI**
   - Dedicated error state display
   - Retry button for failed requests
   - Visual distinction with red accents

4. **Loading States**
   - Skeleton loaders during data fetch
   - Prevents layout shift
   - Improves perceived performance

### Example Error Handling Pattern
```typescript
const loadData = async () => {
  try {
    setError(null);
    const data = await fetchData();
    setData(data);
  } catch (error) {
    console.error('Failed to load data:', error);
    setError('Unable to load data. Please try again later.');
  } finally {
    setLoading(false);
  }
};
```

## Feature Tour Integration

### Tour Trigger
The navigation includes a "Feature Tour" button that:
- Checks localStorage for tour completion status
- Clears completion flags to restart tour
- Redirects to homepage to begin tour
- Available in both desktop and mobile navigation

### Tour State Management
- `kobo_feature_tour_completed`: Marks tour as completed
- `kobo_feature_tour_dismissed`: Marks tour as dismissed
- Clearing both flags allows tour restart

## Best Practices

### Adding New Routes
1. Add route configuration in `App.tsx`
2. Add navigation item to `MainNavigation.tsx`
3. Create page component in `src/pages/`
4. Update this documentation

### Creating Showcase Components
1. Implement error handling with try-catch
2. Add loading states with skeletons
3. Include accessibility attributes
4. Add proper TypeScript types
5. Implement responsive design
6. Add error retry functionality

### Navigation Updates
1. Maintain consistent icon usage
2. Keep labels concise (1-2 words)
3. Test on mobile and desktop
4. Verify accessibility with screen readers
5. Ensure active state is visually clear

## Performance Considerations

### Code Splitting
- Route-based code splitting via React Router
- Lazy loading for heavy components
- Reduces initial bundle size

### Animation Performance
- Use Framer Motion's optimized animations
- Leverage GPU acceleration with transforms
- Avoid animating expensive properties

### Data Fetching
- Fetch only top N items for showcases
- Implement pagination for full pages
- Cache data where appropriate
- Show loading states immediately

## Future Enhancements

### Planned Features
- Breadcrumb navigation for deep routes
- Search functionality in navigation
- User profile dropdown in header
- Notification center integration
- Quick actions menu
- Keyboard shortcuts overlay

### Accessibility Improvements
- High contrast mode support
- Reduced motion preferences
- Font size customization
- Focus visible improvements
