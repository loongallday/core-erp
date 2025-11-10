# Responsive Design Guidelines

## Overview

This document provides comprehensive guidelines for maintaining responsive design across the Core ERP application. These guidelines ensure consistent, mobile-first development that works seamlessly across all device sizes.

## Breakpoints

We use Tailwind CSS default breakpoints:

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| `xs` (default) | 0px | Mobile phones (portrait) |
| `sm` | 640px | Mobile phones (landscape), small tablets |
| `md` | 768px | Tablets, small laptops |
| `lg` | 1024px | Laptops, desktops |
| `xl` | 1280px | Large desktops |
| `2xl` | 1536px | Extra large screens |

## Fluid Typography System

### Overview

The application uses a fluid typography system with `clamp()` CSS function. This means text sizes automatically scale between breakpoints without manual responsive classes.

### Typography Scale

All text sizes are configured with fluid scaling in `tailwind.config.ts`:

```css
text-xs:   clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)   /* 12px → 14px */
text-sm:   clamp(0.875rem, 0.8rem + 0.35vw, 1rem)      /* 14px → 16px */
text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem)       /* 16px → 18px */
text-lg:   clamp(1.125rem, 1rem + 0.625vw, 1.25rem)    /* 18px → 20px */
text-xl:   clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)     /* 20px → 24px */
text-2xl:  clamp(1.5rem, 1.3rem + 1vw, 2rem)           /* 24px → 32px */
text-3xl:  clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)     /* 30px → 40px */
```

### Typography Usage Rules

1. **Use semantic text classes** - Apply `text-base`, `text-lg`, etc., not fixed pixel sizes
2. **Heading hierarchy**:
   - Page titles: `text-2xl md:text-3xl` (for extra emphasis)
   - Section headers: `text-xl`
   - Subsection headers: `text-lg`
   - Card titles: `text-base` or `text-lg`
3. **Body text**: Always use `text-base` (automatically fluid)
4. **Small text**: Use `text-sm` for labels, captions
5. **Tiny text**: Use `text-xs` for metadata, timestamps
6. **Never override with fixed px values** - Trust the fluid system

### Line Heights

Line heights are automatically optimized:
- Larger text (headings): 1.1 - 1.3
- Body text: 1.5 - 1.6
- Small text: 1.5

## Mandatory Responsive Components

### Overview

To enforce responsive design patterns, we've created base components that handle responsiveness automatically. **Use these components instead of raw HTML/CSS**.

### 1. PageContainer

**Purpose**: Standardized page content wrapper with responsive padding and max-width.

**Usage**:
```tsx
import { PageContainer } from '@/components/responsive/PageContainer'

<PageContainer className="py-6">
  {/* Page content */}
</PageContainer>
```

**Props**:
- `maxWidth`: `'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'` (default: `'xl'`)
- `className`: Additional Tailwind classes

**Features**:
- Automatic responsive padding (16px mobile → 32px desktop)
- Centered with max-width constraint
- Horizontal margins handled automatically

### 2. PageHeader

**Purpose**: Consistent page headers with automatic mobile stacking.

**Usage**:
```tsx
import { PageHeader } from '@/components/responsive/PageHeader'
import { ResponsiveButton } from '@/components/responsive/ResponsiveButton'

<PageHeader
  title="Users"
  subtitle="Manage system users"
  actions={
    <ResponsiveButton onClick={handleAdd}>
      <Plus className="h-4 w-4 mr-2" />
      Add User
    </ResponsiveButton>
  }
/>
```

**Props**:
- `title`: Page title (string)
- `subtitle`: Optional subtitle
- `actions`: React node for action buttons
- `sticky`: Boolean (default: true) - sticky header on scroll
- `className`: Additional classes

**Features**:
- Automatically stacks title and actions on mobile
- Sticky by default
- Consistent spacing and styling
- Text truncation for long titles

### 3. ResponsiveGrid

**Purpose**: CSS Grid that automatically adjusts columns based on available space.

**Usage**:
```tsx
import { ResponsiveGrid } from '@/components/responsive/ResponsiveGrid'

<ResponsiveGrid minWidth="280px" gap={4}>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</ResponsiveGrid>
```

**Props**:
- `minWidth`: Minimum column width (default: `'280px'`)
- `gap`: Gap size in Tailwind units (default: `4`)
- `className`: Additional classes

**Features**:
- Uses CSS Grid `auto-fit`
- No manual breakpoint classes needed
- Automatically responsive

### 4. ResponsiveStack

**Purpose**: Flex container that automatically stacks on mobile.

**Usage**:
```tsx
import { ResponsiveStack } from '@/components/responsive/ResponsiveStack'

<ResponsiveStack direction="row" spacing={3} align="center">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</ResponsiveStack>
```

**Props**:
- `direction`: `'row' | 'col'` (default: `'row'`)
- `spacing`: Gap size (default: `2`)
- `align`: `'start' | 'center' | 'end' | 'stretch'` (default: `'start'`)
- `justify`: `'start' | 'center' | 'end' | 'between' | 'around'`
- `breakpoint`: `'sm' | 'md' | 'lg'` (default: `'sm'`)

**Features**:
- Vertical on mobile, horizontal on larger screens
- Consistent spacing
- Automatic alignment

### 5. ResponsiveButton

**Purpose**: Button component that's full-width on mobile by default.

**Usage**:
```tsx
import { ResponsiveButton } from '@/components/responsive/ResponsiveButton'

<ResponsiveButton onClick={handleClick}>
  Submit
</ResponsiveButton>
```

**Props**:
- All standard Button props
- `fullWidthOnMobile`: Boolean (default: `true`)

**Features**:
- Full-width on mobile for easy tapping
- Auto-width on desktop
- Enforces touch-target size (44x44px minimum)

### 6. ResponsiveTable

**Purpose**: Table wrapper with horizontal scroll and sticky first column.

**Usage**:
```tsx
import { ResponsiveTable } from '@/components/responsive/ResponsiveTable'
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

<ResponsiveTable minWidth="640px">
  <TableHeader>
    <TableRow>
      <TableHead className="sticky left-0 bg-card z-10">Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="sticky left-0 bg-card z-10">John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</ResponsiveTable>
```

**Props**:
- `minWidth`: Minimum table width (default: `'640px'`)

**Features**:
- Horizontal scroll on small screens
- Thin custom scrollbar
- First column sticky for context

**Important**: Add `sticky left-0 bg-card z-10` to first column's TableHead and TableCell.

## Layout Rules

### 1. Touch Targets

**Rule**: All interactive elements must be at least 44x44px for accessibility.

**Implementation**:
```tsx
// Use the touch-target utility class
<Button className="touch-target">Click me</Button>

// Or use ResponsiveButton (includes touch-target by default)
<ResponsiveButton>Click me</ResponsiveButton>
```

**Applies to**:
- Buttons
- Links
- Checkboxes
- Radio buttons
- Switch toggles
- Icon buttons
- Menu items

### 2. Horizontal Padding

**Rule**: Minimum 16px (1rem) horizontal padding on mobile.

**Implementation**:
```tsx
// Use PageContainer (handles automatically)
<PageContainer>...</PageContainer>

// Or manual: px-4 sm:px-6 md:px-8
<div className="px-4 sm:px-6 md:px-8">...</div>
```

### 3. Vertical Spacing

**Rule**: Use consistent spacing scale.

**Implementation**:
```tsx
// Sections
<div className="py-6">...</div>

// Cards/Components
<div className="p-4 md:p-6">...</div>

// Tight spacing
<div className="space-y-2">...</div>

// Normal spacing
<div className="space-y-4">...</div>

// Loose spacing
<div className="space-y-6">...</div>
```

### 4. Forms

**Rules**:
- Full-width inputs on all screens
- Stack form buttons on mobile
- Touch-friendly input heights
- Clear error messages

**Implementation**:
```tsx
<form className="space-y-6">
  <div className="space-y-2">
    <Label>Name</Label>
    <Input className="touch-target" />
  </div>
  
  <div className="flex flex-col sm:flex-row gap-3">
    <Button type="submit" className="w-full sm:w-auto touch-target">
      Submit
    </Button>
    <Button type="button" variant="outline" className="w-full sm:w-auto touch-target">
      Cancel
    </Button>
  </div>
</form>
```

### 5. Tables

**Rules**:
- Always use ResponsiveTable wrapper
- Sticky first column for context
- Minimum table width to prevent squishing
- Horizontal scroll enabled

**Implementation**: See ResponsiveTable section above.

### 6. Navigation

**Rules**:
- Mobile: Hamburger menu with drawer
- Desktop: Fixed sidebar
- Consistent menu item sizing (touch-target)
- User info truncated on small screens

**Implementation**: Already implemented in AppLayout component.

## Prohibited Patterns

### ❌ Fixed Width Containers

**Bad**:
```tsx
<div style={{ width: '1200px' }}>...</div>
<div className="w-[800px]">...</div>
```

**Good**:
```tsx
<PageContainer maxWidth="xl">...</PageContainer>
<div className="max-w-4xl mx-auto">...</div>
```

### ❌ Hardcoded Pixel Text Sizes

**Bad**:
```tsx
<h1 style={{ fontSize: '32px' }}>Title</h1>
<p className="text-[14px]">Body</p>
```

**Good**:
```tsx
<h1 className="text-3xl">Title</h1>
<p className="text-base">Body</p>
```

### ❌ Non-Responsive Flex Layouts

**Bad**:
```tsx
<div className="flex gap-4">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

**Good**:
```tsx
<ResponsiveStack direction="row" spacing={3}>
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</ResponsiveStack>
```

### ❌ Tables Without Scroll Wrapper

**Bad**:
```tsx
<Table>
  <TableBody>...</TableBody>
</Table>
```

**Good**:
```tsx
<ResponsiveTable>
  <TableBody>...</TableBody>
</ResponsiveTable>
```

### ❌ Small Touch Targets

**Bad**:
```tsx
<button className="p-1">×</button>
<Checkbox className="w-3 h-3" />
```

**Good**:
```tsx
<Button size="icon" className="touch-target">×</Button>
<Checkbox className="w-5 h-5" />
```

### ❌ Custom Container Padding

**Bad**:
```tsx
<div className="container px-8">...</div>
```

**Good**:
```tsx
<PageContainer>...</PageContainer>
```

## Utility Classes Reference

### Touch Target
```tsx
className="touch-target" // min-width: 44px, min-height: 44px
```

### Thin Scrollbar
```tsx
className="scrollbar-thin" // Styled thin scrollbars
```

### Safe Area (for mobile notches)
```tsx
className="pt-safe pb-safe pl-safe pr-safe" // Safe area insets
className="p-safe" // All sides
```

### Responsive Container
```tsx
className="responsive-container" // Responsive padding + max-width
```

## Testing Checklist

For every new feature or page, test at the following breakpoints:

- [ ] **320px** - Small mobile (iPhone SE)
- [ ] **375px** - Standard mobile (iPhone 12/13)
- [ ] **640px** - Large mobile / small tablet
- [ ] **768px** - Tablet / iPad
- [ ] **1024px** - Laptop
- [ ] **1440px** - Desktop

### What to Check

1. **Typography**:
   - [ ] All text is readable
   - [ ] Headings scale appropriately
   - [ ] No text overflow or truncation issues
   - [ ] Line lengths are comfortable to read

2. **Layout**:
   - [ ] No horizontal overflow
   - [ ] Proper spacing on all screen sizes
   - [ ] Components stack correctly on mobile
   - [ ] Images/videos are responsive

3. **Interaction**:
   - [ ] All touch targets are at least 44x44px
   - [ ] Buttons are easily tappable
   - [ ] Forms are usable with mobile keyboard
   - [ ] Dropdown menus work on mobile

4. **Navigation**:
   - [ ] Mobile menu opens/closes properly
   - [ ] All menu items are accessible
   - [ ] Navigation doesn't overlap content

5. **Tables**:
   - [ ] Tables scroll horizontally on mobile
   - [ ] First column stays visible during scroll
   - [ ] All data is accessible

6. **Performance**:
   - [ ] Page loads quickly on mobile
   - [ ] No layout shift during load
   - [ ] Smooth animations and transitions

## Common Patterns

### Page Structure
```tsx
<AppLayout>
  <div>
    <PageHeader
      title="Page Title"
      subtitle="Description"
      actions={<ResponsiveButton>Action</ResponsiveButton>}
    />
    
    <PageContainer className="py-6">
      {/* Page content */}
    </PageContainer>
  </div>
</AppLayout>
```

### Card Grid
```tsx
<ResponsiveGrid minWidth="280px" gap={4}>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</ResponsiveGrid>
```

### Form with Actions
```tsx
<form className="space-y-6">
  {/* Form fields */}
  
  <div className="flex flex-col sm:flex-row gap-3 pt-4">
    <Button type="submit" className="w-full sm:w-auto touch-target">
      Submit
    </Button>
    <Button type="button" variant="outline" className="w-full sm:w-auto touch-target">
      Cancel
    </Button>
  </div>
</form>
```

### Data Table
```tsx
<ResponsiveTable minWidth="640px">
  <TableHeader>
    <TableRow>
      <TableHead className="sticky left-0 bg-card z-10">Name</TableHead>
      <TableHead>Column 2</TableHead>
      <TableHead>Column 3</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(item => (
      <TableRow key={item.id}>
        <TableCell className="sticky left-0 bg-card z-10">{item.name}</TableCell>
        <TableCell>{item.col2}</TableCell>
        <TableCell>{item.col3}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</ResponsiveTable>
```

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN: Responsive Web Design Basics](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Touch Target Sizes](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

## Maintenance

This document should be updated when:
- New responsive components are added
- Breakpoints are modified
- New patterns emerge
- Typography scale changes
- Accessibility requirements change

Last updated: November 2025

