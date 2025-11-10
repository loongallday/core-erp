# Responsive Design ESLint Rules

## Overview

This document describes the ESLint rules configured to help enforce responsive design patterns in the Core ERP codebase.

## Configured Rules

### 1. Fixed Width Detection

**Rule**: Warns about fixed pixel widths in inline styles and Tailwind classes.

**Pattern Detected**:
```tsx
// ❌ Will trigger warning
<div style={{ width: '800px' }}>...</div>
<div className="w-[800px]">...</div>
```

**Recommended Alternative**:
```tsx
// ✅ Use max-width with responsive units
<div className="max-w-4xl mx-auto">...</div>
<PageContainer maxWidth="xl">...</PageContainer>
```

### 2. Responsive Component Reminders

**Rule**: Warning comments that start with "RESPONSIVE" will be highlighted.

**Usage**:
```tsx
// RESPONSIVE: Consider using ResponsiveStack here instead of raw flex
<div className="flex gap-4">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

## Manual Code Review Checklist

While ESLint can catch some patterns, the following require manual code review:

### Components to Check

- [ ] All page headers use `PageHeader` component
- [ ] All page content wrapped in `PageContainer`
- [ ] Grid layouts use `ResponsiveGrid`
- [ ] Flex layouts that should stack use `ResponsiveStack`
- [ ] Primary CTAs use `ResponsiveButton`
- [ ] All tables use `ResponsiveTable` wrapper

### Patterns to Check

- [ ] Touch targets are at least 44x44px (use `touch-target` class)
- [ ] Text uses fluid typography (text-base, text-lg, etc.)
- [ ] No hardcoded pixel font sizes
- [ ] Forms stack buttons on mobile (flex-col sm:flex-row)
- [ ] Tables have horizontal scroll on mobile
- [ ] Images are responsive (max-w-full)

### Classes to Look For

#### ❌ Problematic Patterns

```tsx
// Fixed widths
className="w-[800px]"
style={{ width: '800px' }}

// Non-responsive flex
className="flex" // without flex-col mobile consideration

// Fixed text sizes
style={{ fontSize: '16px' }}
className="text-[16px]"

// Small touch targets
className="p-1" // on buttons
className="w-3 h-3" // on checkboxes

// Tables without wrapper
<Table>...</Table> // should be <ResponsiveTable>

// Manual container padding
className="container px-8" // should use PageContainer
```

#### ✅ Good Patterns

```tsx
// Responsive widths
className="max-w-4xl"
className="w-full"

// Responsive flex
className="flex flex-col sm:flex-row"
<ResponsiveStack direction="row">...</ResponsiveStack>

// Fluid text
className="text-base"
className="text-2xl md:text-3xl"

// Touch targets
className="touch-target"
className="w-5 h-5" // on checkboxes

// Wrapped tables
<ResponsiveTable>
  <TableHeader>...</TableHeader>
</ResponsiveTable>

// Proper containers
<PageContainer>...</PageContainer>
```

## Extending ESLint Rules

To add more responsive design rules, edit `eslint.config.js`:

```javascript
rules: {
  'no-restricted-syntax': [
    'warn',
    {
      // Add custom selectors to catch non-responsive patterns
      selector: "YOUR_AST_SELECTOR",
      message: 'Your custom message',
    },
  ],
}
```

### Useful AST Selectors

To find AST selectors for patterns you want to catch:

1. Use [AST Explorer](https://astexplorer.net/)
2. Select parser: `@typescript-eslint/parser`
3. Paste your code
4. Explore the AST to find the selector pattern

## IDE Integration

### VS Code

Install the ESLint extension:
```bash
ext install dbaeumer.vscode-eslint
```

Add to `.vscode/settings.json`:
```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Running ESLint

```bash
# Check for issues
npm run lint

# Auto-fix issues (where possible)
npm run lint -- --fix
```

## Limitations

ESLint cannot catch all non-responsive patterns because:

1. **Runtime values**: Can't analyze dynamic className values
2. **Complex logic**: Can't understand component composition
3. **Prop spreading**: Can't track props through spread operators
4. **Third-party components**: Can't analyze external component internals

Therefore, **manual code review remains essential** for responsive design compliance.

## Best Practices

1. **Use responsive components** - They enforce patterns automatically
2. **Run ESLint regularly** - Catch issues early
3. **Code review checklist** - Use the manual checklist above
4. **Test on devices** - ESLint can't replace real testing
5. **Document exceptions** - If you must break a rule, document why

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [AST Explorer](https://astexplorer.net/)
- [typescript-eslint](https://typescript-eslint.io/)
- [Responsive Guidelines](./RESPONSIVE_GUIDELINES.md)

## Maintenance

Update this document when:
- New ESLint rules are added
- Patterns change
- New anti-patterns are discovered
- Tools are updated

Last updated: November 2025

