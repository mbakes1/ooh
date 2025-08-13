// Component variant types for consistent usage across the application
export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

export type CardVariant = "default" | "outline" | "elevated";
export type AlertVariant = "default" | "destructive" | "warning" | "success";
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Form component props for consistent typing
export interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxOption extends SelectOption {
  keywords?: string[];
}

// Theme configuration types
export interface ThemeConfig {
  style: "default" | "new-york";
  baseColor: "slate" | "gray" | "zinc" | "neutral" | "stone";
  cssVariables: boolean;
  radius: number;
}

// Component state types
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: string | Error;
}

export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Data table types for consistent table implementations
export interface DataTableColumn<T> {
  id: keyof T;
  header: string;
  accessorKey?: keyof T;
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  sorting?: {
    sortBy?: keyof T;
    sortOrder?: "asc" | "desc";
    onSortChange: (sortBy: keyof T, sortOrder: "asc" | "desc") => void;
  };
  filtering?: {
    filters: Record<string, any>;
    onFilterChange: (filters: Record<string, any>) => void;
  };
  selection?: {
    selectedRows: T[];
    onSelectionChange: (selectedRows: T[]) => void;
  };
}

// Dashboard component types
export interface DashboardCard {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Modal and dialog types
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export interface AlertDialogProps extends DialogProps {
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

// Toast notification types
export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Form schema types for Zod integration
export interface FormSchema<T = any> {
  schema: any; // Zod schema
  defaultValues: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
}

// Responsive design types
export type BreakpointSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  "2xl"?: T;
}

// Animation and transition types
export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

export interface TransitionProps {
  show: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
}
