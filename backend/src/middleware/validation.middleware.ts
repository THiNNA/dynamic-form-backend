import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new ApiError(400, 'Validation failed', error.errors));
      }
      next(error);
    }
  };
}

const ValidationRuleSchema = z.object({
  type: z.enum(['required', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'email', 'url', 'custom']),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  message: z.string(),
});

const ConditionalLogicSchema = z.object({
  fieldName: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']),
  value: z.any(),
  action: z.enum(['show', 'hide', 'enable', 'disable', 'set_value']),
  targetValue: z.any().optional(),
});

const FieldOptionSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  disabled: z.boolean().optional(),
  icon: z.string().optional(),
});

const FormFieldSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    label: z.string(),
    type: z.enum([
      'text', 'textarea', 'number', 'email', 'password',
      'date', 'datetime', 'time',
      'select', 'multi-select', 'radio', 'checkbox',
      'file', 'image', 'toggle', 'slider', 'color', 'rating',
      'group', 'repeater',
    ]),
    placeholder: z.string().optional(),
    defaultValue: z.any().optional(),
    helpText: z.string().optional(),
    options: z.array(FieldOptionSchema).optional(),
    validations: z.array(ValidationRuleSchema).default([]),
    conditions: z.array(ConditionalLogicSchema).optional(),
    order: z.number().default(0),
    width: z.enum(['full', 'half', 'third', 'quarter']).default('full'),
    disabled: z.boolean().optional(),
    hidden: z.boolean().optional(),
    children: z.array(FormFieldSchema).optional(),
    minItems: z.number().optional(),
    maxItems: z.number().optional(),
    accept: z.string().optional(),
    maxFileSize: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    icon: z.string().optional(),
    className: z.string().optional(),
  })
);

const FormSettingsSchema = z.object({
  submitButtonText: z.string().default('Submit'),
  successMessage: z.string().default('Form submitted successfully!'),
  redirectUrl: z.string().url().or(z.literal('').transform(() => undefined)).optional(),
  allowMultipleSubmissions: z.boolean().default(true),
  requireAuthentication: z.boolean().default(false),
  notifyOnSubmission: z.boolean().default(false),
  notificationEmails: z.array(z.string().email()).optional(),
  theme: z.enum(['default', 'minimal', 'bordered']).optional(),
  layout: z.enum(['vertical', 'horizontal', 'inline']).optional(),
  showProgressBar: z.boolean().optional(),
  steps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    fieldIds: z.array(z.string()),
    order: z.number(),
  })).optional(),
}).default({});

export const CreateFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  fields: z.array(FormFieldSchema).default([]),
  settings: FormSettingsSchema,
  createdBy: z.string().default('system'),
});

export const UpdateFormSchema = CreateFormSchema.partial();

export const UpdateStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
});
