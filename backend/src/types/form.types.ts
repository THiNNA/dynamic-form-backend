export type FieldType =
  | "text" | "textarea" | "number" | "email" | "password"
  | "date" | "datetime" | "time"
  | "select" | "multi-select" | "radio" | "checkbox"
  | "file" | "image" | "toggle" | "slider" | "color" | "rating"
  | "group" | "repeater";

export interface ValidationRule {
  type: "required" | "min" | "max" | "minLength" | "maxLength"
      | "pattern" | "email" | "url" | "custom";
  value?: string | number | boolean;
  message: string;
}

export interface ConditionalLogic {
  fieldName: string;
  operator: "equals" | "not_equals" | "contains"
          | "greater_than" | "less_than" | "is_empty" | "is_not_empty";
  value: any;
  action: "show" | "hide" | "enable" | "disable" | "set_value";
  targetValue?: any;
}

export interface FieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  helpText?: string;
  options?: FieldOption[];
  validations: ValidationRule[];
  conditions?: ConditionalLogic[];
  order: number;
  width: "full" | "half" | "third" | "quarter";
  disabled?: boolean;
  hidden?: boolean;
  children?: FormField[];
  minItems?: number;
  maxItems?: number;
  accept?: string;
  maxFileSize?: number;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  icon?: string;
  className?: string;
}

export interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  redirectUrl?: string;
  allowMultipleSubmissions: boolean;
  requireAuthentication: boolean;
  notifyOnSubmission: boolean;
  notificationEmails?: string[];
  theme?: "default" | "minimal" | "bordered";
  layout?: "vertical" | "horizontal" | "inline";
  showProgressBar?: boolean;
  steps?: FormStep[];
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fieldIds: string[];
  order: number;
}

export interface DynamicForm {
  id: string;
  title: string;
  description?: string;
  slug: string;
  status: "draft" | "published" | "archived";
  fields: FormField[];
  settings: FormSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedBy?: string;
  submittedAt: Date;
  ip?: string;
  userAgent?: string;
}
