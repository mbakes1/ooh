# Design Document

## Overview

This design document outlines the comprehensive UI refactor strategy for migrating the digital billboard marketplace application to use shadcn/ui as the single source of truth for all UI components. The application already has a solid foundation with some shadcn/ui components implemented, but requires systematic migration to ensure consistency, modern design patterns, and improved maintainability.

The migration will focus on replacing custom UI implementations with shadcn/ui equivalents, implementing shadcn/ui blocks for complex patterns, and establishing a cohesive design system throughout the application.

## Architecture

### Current State Analysis

The application currently has:

- **Existing shadcn/ui components**: Button, Card, Input, Form, Avatar, Badge, Dropdown Menu, Navigation Menu, Popover, Progress, Scroll Area, Select, Switch, Table, Tabs, Textarea, Toast Provider, Tooltip
- **Mixed implementation patterns**: Some components use shadcn/ui (like forms), while others use custom implementations (like headers, navigation)
- **Inconsistent styling**: Mix of Tailwind classes and custom styles
- **Form handling**: Already using React Hook Form with Zod validation

### Target Architecture

The target architecture will implement:

1. **Complete shadcn/ui Component Library**
   - All UI components sourced from shadcn/ui
   - Consistent component API and styling
   - Proper TypeScript integration

2. **shadcn/ui Blocks Integration**
   - Dashboard blocks for admin and user dashboards
   - Authentication blocks for login/register flows
   - Data table blocks for listings and management
   - Navigation blocks for headers and sidebars

3. **Unified Design System**
   - CSS variables for theming
   - Consistent spacing and typography

   - Responsive design patterns
   - only light mode no dark mode

## Components and Interfaces

### Core UI Components Migration

#### Missing Components to Add

Based on the application analysis, the following shadcn/ui components need to be added:

```bash
# Navigation and Layout
npx shadcn@latest add sidebar
npx shadcn@latest add breadcrumb
npx shadcn@latest add sheet
npx shadcn@latest add separator

# Form Components
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add slider
npx shadcn@latest add combobox

# Feedback and Overlays
npx shadcn@latest add alert
npx shadcn@latest add alert-dialog
npx shadcn@latest add dialog
npx shadcn@latest add drawer

# Data Display
npx shadcn@latest add skeleton
npx shadcn@latest add calendar
npx shadcn@latest add chart

# Utility Components
npx shadcn@latest add aspect-ratio
npx shadcn@latest add collapsible
npx shadcn@latest add context-menu
npx shadcn@latest add hover-card
npx shadcn@latest add menubar
npx shadcn@latest add resizable
npx shadcn@latest add toggle
npx shadcn@latest add toggle-group
```

#### Component Interface Standardization

All components will follow shadcn/ui patterns:

```typescript
// Standard component interface
interface ComponentProps extends React.ComponentProps<"div"> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

// Form component interface
interface FormComponentProps {
  control: Control<any>;
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
}
```

### Application Component Refactoring

#### Authentication Components

**Current State**: Custom form implementations with mixed styling
**Target State**: shadcn/ui Form blocks with consistent patterns

```typescript
// Login Form - migrate to shadcn/ui Form block pattern
interface LoginFormProps {
  callbackUrl?: string;
}

// Register Form - implement with shadcn/ui components
interface RegisterFormProps {
  onSuccess?: () => void;
}

// Password Reset - use shadcn/ui Alert Dialog pattern
interface PasswordResetProps {
  token?: string;
}
```

#### Navigation Components

**Current State**: Custom header with mixed Tailwind classes
**Target State**: shadcn/ui Navigation Menu and Sidebar components

```typescript
// Header Navigation - migrate to NavigationMenu
interface HeaderProps {
  user?: User;
  unreadCount?: number;
}

// Sidebar Navigation - implement with Sidebar component
interface SidebarProps {
  items: NavigationItem[];
  collapsed?: boolean;
}

// Mobile Navigation - use Sheet component
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### Billboard Management Components

**Current State**: Custom form with step-by-step wizard
**Target State**: shadcn/ui Form with Tabs or Steps component

```typescript
// Billboard Listing Form - enhance with shadcn/ui patterns
interface BillboardListingFormProps {
  initialData?: Partial<BillboardListingInput>;
  onSubmit: (data: BillboardListingInput) => Promise<void>;
  isEditing?: boolean;
}

// Billboard Card - migrate to shadcn/ui Card patterns
interface BillboardCardProps {
  billboard: Billboard;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

#### Dashboard Components

**Current State**: Custom dashboard layouts
**Target State**: shadcn/ui Dashboard blocks

```typescript
// Admin Dashboard - implement with dashboard blocks
interface AdminDashboardProps {
  analytics: AnalyticsData;
  recentActivity: Activity[];
}

// User Dashboard - use Card and Chart components
interface UserDashboardProps {
  user: User;
  billboards: Billboard[];
  messages: Message[];
}
```

## Data Models

### Theme Configuration

```typescript
// Theme configuration using shadcn/ui CSS variables
interface ThemeConfig {
  style: "default" | "new-york";
  baseColor: "slate" | "gray" | "zinc" | "neutral" | "stone";
  cssVariables: boolean;
  darkMode: boolean;
}

// CSS Variables structure
interface CSSVariables {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: string;
}
```

### Component Variant System

```typescript
// Standardized variant system across components
type ComponentVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";
type ComponentSize = "default" | "sm" | "lg" | "icon";

interface VariantConfig {
  variant: ComponentVariant;
  size: ComponentSize;
  className?: string;
}
```

## Error Handling

### Form Validation Enhancement

```typescript
// Enhanced form error handling with shadcn/ui patterns
interface FormErrorState {
  field: string;
  message: string;
  type: "validation" | "server" | "network";
}

// Error display components
interface ErrorAlertProps {
  errors: FormErrorState[];
  onDismiss?: () => void;
}

interface FieldErrorProps {
  error?: string;
  touched?: boolean;
}
```

### Global Error Boundaries

```typescript
// Error boundary with shadcn/ui Alert components
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}
```

## Testing Strategy

### Component Testing Approach

1. **Unit Tests for shadcn/ui Components**
   - Test component rendering with different variants
   - Verify accessibility attributes
   - Test keyboard navigation
   - Validate theme switching

2. **Integration Tests for Application Components**
   - Test form submission flows
   - Verify navigation functionality
   - Test responsive behavior
   - Validate data loading states

3. **Visual Regression Tests**
   - Screenshot testing for component consistency
   - Theme switching validation
   - Responsive design verification

### Testing Tools Integration

```typescript
// Testing utilities for shadcn/ui components
interface TestingUtils {
  renderWithTheme: (
    component: React.ReactElement,
    theme?: ThemeConfig
  ) => RenderResult;
  mockFormProvider: (defaultValues?: any) => React.ComponentType;
  createMockUser: (role?: UserRole) => User;
}

// Accessibility testing helpers
interface A11yTestUtils {
  checkAriaLabels: (container: HTMLElement) => void;
  testKeyboardNavigation: (container: HTMLElement) => void;
  validateColorContrast: (element: HTMLElement) => void;
}
```

### Migration Testing Strategy

1. **Phase 1**: Test existing shadcn/ui components
2. **Phase 2**: Test newly added components
3. **Phase 3**: Test refactored application components
4. **Phase 4**: End-to-end testing of complete flows
5. **Phase 5**: Performance and accessibility validation

## Implementation Phases

### Phase 1: Foundation Setup (Components.json & Missing Components)

- Update components.json configuration
- Install missing shadcn/ui components
- Set up proper theming with CSS variables
- Configure dark mode support

### Phase 2: Core UI Component Migration

- Migrate authentication forms to shadcn/ui Form patterns
- Replace custom buttons, inputs, and form elements
- Implement consistent error handling
- Update validation patterns

### Phase 3: Navigation and Layout Migration

- Migrate header to NavigationMenu component
- Implement Sidebar for dashboard navigation
- Replace mobile menu with Sheet component
- Add Breadcrumb navigation

### Phase 4: Complex Component Migration

- Migrate billboard listing forms to shadcn/ui patterns
- Implement data tables with shadcn/ui Table
- Replace custom modals with Dialog/AlertDialog
- Migrate dashboard components

### Phase 5: Advanced Features and Blocks

- Implement shadcn/ui dashboard blocks
- Add Chart components for analytics
- Implement Calendar for availability
- Add advanced form components (Combobox, etc.)

### Phase 6: Polish and Optimization

- Implement skeleton loading states
- Add proper toast notifications
- Optimize bundle size with tree shaking
- Performance testing and optimization

## Design Decisions and Rationales

### Component Library Choice

- **Decision**: Use shadcn/ui as the single source of truth
- **Rationale**: Provides consistent, accessible, and customizable components with excellent TypeScript support

### Theming Strategy

- **Decision**: Use CSS variables with shadcn/ui theming system
- **Rationale**: Enables easy theme switching, consistent design tokens, and maintainable styling

### Form Handling

- **Decision**: Continue using React Hook Form with Zod validation
- **Rationale**: Already implemented and works well with shadcn/ui Form components

### Migration Approach

- **Decision**: Incremental migration by component type
- **Rationale**: Reduces risk, allows for testing at each phase, and maintains application functionality

### Block Implementation

- **Decision**: Use shadcn/ui blocks for complex patterns
- **Rationale**: Provides proven, accessible patterns for common UI needs like dashboards and forms

This design provides a comprehensive roadmap for migrating the application to shadcn/ui while maintaining functionality and improving the overall user experience through consistent, modern UI patterns.
