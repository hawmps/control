// =============================================================================
// CORE ENTITY TYPES
// =============================================================================


export interface Item {
  id: number;
  name: string;
  description?: string;
  category?: string;
  item_type?: string;
  owner?: string;
  criticality: CriticalityLevel;
  created_at: string;
  updated_at: string;
}

// Alias for backward compatibility during migration
export interface Environment extends Item {}

export interface SecurityControl {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SubControl {
  id: number;
  control_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ControlImplementation {
  id: number;
  item_id: number; // Will be renamed to environment_id in future migration
  control_id: number;
  status: ControlStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  title: string;
  content?: string;
  type: DocumentType;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// ENUM TYPES
// =============================================================================

export enum ItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

// Alias for backward compatibility
export const EnvironmentStatus = ItemStatus;

export enum CriticalityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ControlType {
  PREVENTIVE = 'preventive',
  DETECTIVE = 'detective',
  CORRECTIVE = 'corrective',
  COMPENSATING = 'compensating'
}

export enum ImplementationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  IMPLEMENTED = 'implemented',
  TESTED = 'tested',
  NOT_APPLICABLE = 'not_applicable',
  EXCEPTION_APPROVED = 'exception_approved'
}

export enum ControlStatus {
  RED = 'red',
  YELLOW = 'yellow', 
  GREEN = 'green'
}

export enum DocumentType {
  REPORT = 'report',
  POLICY = 'policy',
  MANUAL = 'manual',
  TEMPLATE = 'template'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}


// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface FilterConfig {
  field: string;
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sort?: SortConfig;
  filters?: FilterConfig[];
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

export interface Column<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: any, item?: T) => React.ReactNode;
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export interface NavItem {
  path: string;
  label: string;
  icon?: React.ComponentType<any>;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

// =============================================================================
// THEME TYPES
// =============================================================================

export interface ThemeConfig {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

// =============================================================================
// GENERIC UTILITY TYPES
// =============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ID = string | number;
export type Timestamp = string;

export interface Identifiable {
  id: ID;
}

export interface Timestamped {
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Auditable extends Timestamped {
  created_by: ID;
  updated_by?: ID;
}