# Code Review Checklist

Comprehensive checklist for reviewing pull requests before merging.

## 📋 General

- [ ] **PR Title**: Follows conventional commit format (`feat:`, `fix:`, `docs:`, etc.)
- [ ] **Description**: Clear description of changes and motivation
- [ ] **Issue Link**: References related issue(s) if applicable
- [ ] **Breaking Changes**: Documented if any breaking changes introduced
- [ ] **Screenshots**: Included for UI changes
- [ ] **Size**: PR is reasonably sized (< 500 lines preferred)

## 🔍 Code Quality

### TypeScript
- [ ] **Type Safety**: No `any` types unless absolutely necessary
- [ ] **Type Definitions**: Proper interfaces/types for all data structures
- [ ] **Null Safety**: Proper handling of null/undefined values
- [ ] **Generics**: Used appropriately for reusable components
- [ ] **Enums**: Used for fixed sets of values

### Code Style
- [ ] **Naming**: Clear, descriptive variable/function names
- [ ] **Formatting**: Code follows project style guide
- [ ] **Comments**: Complex logic is commented
- [ ] **JSDoc**: Public APIs have JSDoc comments
- [ ] **Consistency**: Follows existing patterns in codebase

### React Best Practices
- [ ] **Hooks**: Proper use of React hooks (dependencies, cleanup)
- [ ] **Performance**: Memoization used where appropriate (`useMemo`, `useCallback`)
- [ ] **Keys**: Proper keys for list items
- [ ] **Props**: Props are properly typed
- [ ] **State**: State management is appropriate (local vs global)
- [ ] **Effects**: Side effects are properly handled

### Component Design
- [ ] **Single Responsibility**: Components have single, clear purpose
- [ ] **Reusability**: Components are reusable where appropriate
- [ ] **Composition**: Proper use of component composition
- [ ] **Props Interface**: Clean, well-documented props interface
- [ ] **Default Props**: Sensible defaults provided

## 🧪 Testing

### Unit Tests
- [ ] **Coverage**: New code has unit tests
- [ ] **Edge Cases**: Tests cover edge cases
- [ ] **Mocking**: Proper mocking of dependencies
- [ ] **Assertions**: Clear, meaningful assertions
- [ ] **Test Names**: Descriptive test names

### E2E Tests
- [ ] **User Flows**: Critical user flows are tested
- [ ] **Happy Path**: Happy path scenarios covered
- [ ] **Error Cases**: Error scenarios tested
- [ ] **Accessibility**: Accessibility tested

### Manual Testing
- [ ] **Functionality**: Feature works as expected
- [ ] **Edge Cases**: Edge cases manually verified
- [ ] **Browser Testing**: Tested in Chrome, Firefox, Safari
- [ ] **Mobile**: Tested on mobile devices
- [ ] **Performance**: No performance regressions

## 🔒 Security

### Input Validation
- [ ] **Sanitization**: User inputs are sanitized
- [ ] **Validation**: Inputs are validated before processing
- [ ] **XSS Prevention**: No XSS vulnerabilities
- [ ] **SQL Injection**: No SQL injection risks (if applicable)

### Authentication & Authorization
- [ ] **Auth Checks**: Proper authentication checks
- [ ] **Authorization**: Proper authorization for sensitive operations
- [ ] **Token Handling**: Secure token storage and handling
- [ ] **Session Management**: Proper session management

### Data Security
- [ ] **Sensitive Data**: No sensitive data in logs
- [ ] **Encryption**: Sensitive data encrypted
- [ ] **API Keys**: No hardcoded API keys
- [ ] **Environment Variables**: Secrets in environment variables

## ♿ Accessibility

- [ ] **Keyboard Navigation**: Fully keyboard accessible
- [ ] **Screen Readers**: Works with screen readers
- [ ] **ARIA Labels**: Proper ARIA labels
- [ ] **Color Contrast**: Sufficient color contrast (WCAG AA)
- [ ] **Focus Management**: Proper focus management
- [ ] **Alt Text**: Images have alt text

## 🎨 UI/UX

### Design
- [ ] **Design System**: Follows design system
- [ ] **Consistency**: Consistent with existing UI
- [ ] **Responsive**: Works on all screen sizes
- [ ] **Loading States**: Proper loading indicators
- [ ] **Error States**: Clear error messages

### User Experience
- [ ] **Intuitive**: Feature is intuitive to use
- [ ] **Feedback**: User receives appropriate feedback
- [ ] **Performance**: UI feels responsive
- [ ] **Animations**: Smooth, purposeful animations
- [ ] **Empty States**: Proper empty state handling

## 📊 Performance

### Frontend Performance
- [ ] **Bundle Size**: No significant bundle size increase
- [ ] **Code Splitting**: Proper code splitting
- [ ] **Lazy Loading**: Components lazy loaded where appropriate
- [ ] **Image Optimization**: Images optimized
- [ ] **Caching**: Proper caching strategies

### Runtime Performance
- [ ] **Re-renders**: Minimal unnecessary re-renders
- [ ] **Memory Leaks**: No memory leaks
- [ ] **Network Requests**: Optimized network requests
- [ ] **Debouncing**: Debouncing/throttling where needed

## 🔗 Smart Contracts (if applicable)

- [ ] **Gas Optimization**: Gas usage optimized
- [ ] **Security**: No known vulnerabilities
- [ ] **Testing**: Comprehensive test coverage
- [ ] **Events**: Proper event emissions
- [ ] **Error Handling**: Clear error messages

## 📚 Documentation

- [ ] **README**: README updated if needed
- [ ] **API Docs**: API documentation updated
- [ ] **Comments**: Complex logic commented
- [ ] **Migration Guide**: Migration guide for breaking changes
- [ ] **Changelog**: CHANGELOG updated

## 🚀 Deployment

### Pre-deployment
- [ ] **Environment Variables**: New env vars documented
- [ ] **Database Migrations**: Migrations tested
- [ ] **Backwards Compatibility**: Backwards compatible or migration path provided
- [ ] **Feature Flags**: Feature flags used for risky changes

### Post-deployment
- [ ] **Monitoring**: Monitoring/alerting configured
- [ ] **Rollback Plan**: Rollback plan documented
- [ ] **Performance Metrics**: Performance metrics tracked

## 🔄 Git

- [ ] **Commit Messages**: Follow conventional commits
- [ ] **Commit Size**: Commits are atomic and focused
- [ ] **Branch Name**: Descriptive branch name
- [ ] **Conflicts**: No merge conflicts
- [ ] **History**: Clean git history

## ✅ CI/CD

- [ ] **Linting**: Passes linting checks
- [ ] **Type Checking**: Passes type checking
- [ ] **Tests**: All tests passing
- [ ] **Build**: Build succeeds
- [ ] **Security Scan**: Security scan passes

## 📝 Compliance

- [ ] **License**: No license violations
- [ ] **Copyright**: Proper copyright notices
- [ ] **Privacy**: GDPR compliance maintained
- [ ] **Terms**: Terms of service compliance

## 🎯 Business Logic

- [ ] **Requirements**: Meets all requirements
- [ ] **Edge Cases**: Business edge cases handled
- [ ] **Data Integrity**: Data integrity maintained
- [ ] **Validation**: Business rules validated

## 🐛 Error Handling

- [ ] **Try-Catch**: Proper error handling
- [ ] **User Messages**: User-friendly error messages
- [ ] **Logging**: Errors logged appropriately
- [ ] **Recovery**: Graceful error recovery
- [ ] **Sentry**: Errors tracked in Sentry

## 📱 Mobile Considerations

- [ ] **Touch Targets**: Touch targets are large enough
- [ ] **Gestures**: Mobile gestures work properly
- [ ] **Viewport**: Proper viewport configuration
- [ ] **Performance**: Good performance on mobile devices

## 🌐 Internationalization (if applicable)

- [ ] **Translations**: All text is translatable
- [ ] **Date/Time**: Proper date/time formatting
- [ ] **Currency**: Proper currency formatting
- [ ] **RTL Support**: RTL languages supported if needed

## 🔧 Maintenance

- [ ] **Dependencies**: Dependencies up to date
- [ ] **Deprecations**: No deprecated APIs used
- [ ] **Technical Debt**: Technical debt documented
- [ ] **Refactoring**: Opportunities for refactoring noted

---

## Approval Criteria

### Required for Merge
- [ ] All CI/CD checks passing
- [ ] At least 1 approval from code owner
- [ ] No unresolved comments
- [ ] All critical items checked

### Recommended
- [ ] 2+ approvals for critical changes
- [ ] QA team approval for major features
- [ ] Security team approval for security-sensitive changes
- [ ] Product owner approval for UX changes

---

## Review Process

1. **Self Review**: Author reviews own PR first
2. **Automated Checks**: Wait for CI/CD to complete
3. **Peer Review**: Request reviews from team members
4. **Address Feedback**: Respond to all comments
5. **Final Check**: Ensure all items checked
6. **Merge**: Squash and merge with clean commit message

---

## Notes for Reviewers

- **Be Constructive**: Provide constructive feedback
- **Be Specific**: Point to specific lines/files
- **Ask Questions**: Ask questions to understand intent
- **Suggest Alternatives**: Suggest better approaches
- **Acknowledge Good Work**: Praise good solutions
- **Be Timely**: Review within 24 hours

---

## Notes for Authors

- **Small PRs**: Keep PRs small and focused
- **Self Review**: Review your own code first
- **Context**: Provide sufficient context
- **Tests**: Include tests with your changes
- **Documentation**: Update docs as needed
- **Respond Promptly**: Address feedback quickly
- **Be Open**: Be open to feedback and suggestions

---

**Last Updated**: November 25, 2024
