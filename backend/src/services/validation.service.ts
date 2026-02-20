import { FormField, ValidationRule } from '../types/form.types';

function isFieldHidden(field: FormField, data: Record<string, any>): boolean {
  if (!field.conditions || field.conditions.length === 0) return field.hidden || false;

  for (const condition of field.conditions) {
    const fieldValue = data[condition.fieldName];

    let conditionMet = false;
    switch (condition.operator) {
      case 'equals':
        conditionMet = fieldValue === condition.value;
        break;
      case 'not_equals':
        conditionMet = fieldValue !== condition.value;
        break;
      case 'contains':
        conditionMet = String(fieldValue).includes(String(condition.value));
        break;
      case 'greater_than':
        conditionMet = Number(fieldValue) > Number(condition.value);
        break;
      case 'less_than':
        conditionMet = Number(fieldValue) < Number(condition.value);
        break;
      case 'is_empty':
        conditionMet = !fieldValue || fieldValue === '';
        break;
      case 'is_not_empty':
        conditionMet = !!fieldValue && fieldValue !== '';
        break;
    }

    if (conditionMet && condition.action === 'hide') return true;
    if (conditionMet && condition.action === 'show') return false;
  }

  return field.hidden || false;
}

function validateRule(rule: ValidationRule, value: any, _fieldName: string): string | null {
  switch (rule.type) {
    case 'required':
      if (value === undefined || value === null || value === '' ||
        (Array.isArray(value) && value.length === 0)) {
        return rule.message;
      }
      break;
    case 'min':
      if (value !== undefined && value !== null && Number(value) < Number(rule.value)) {
        return rule.message;
      }
      break;
    case 'max':
      if (value !== undefined && value !== null && Number(value) > Number(rule.value)) {
        return rule.message;
      }
      break;
    case 'minLength':
      if (value && String(value).length < Number(rule.value)) {
        return rule.message;
      }
      break;
    case 'maxLength':
      if (value && String(value).length > Number(rule.value)) {
        return rule.message;
      }
      break;
    case 'pattern':
      if (value && rule.value) {
        const regex = new RegExp(String(rule.value));
        if (!regex.test(String(value))) {
          return rule.message;
        }
      }
      break;
    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
        return rule.message;
      }
      break;
    case 'url':
      if (value) {
        try {
          new URL(String(value));
        } catch {
          return rule.message;
        }
      }
      break;
  }
  return null;
}

function validateField(field: FormField, value: any, data: Record<string, any>): string | null {
  if (isFieldHidden(field, data)) return null;

  for (const rule of field.validations) {
    const error = validateRule(rule, value, field.name);
    if (error) return error;
  }

  return null;
}

export const ValidationService = {
  validateFormData(fields: FormField[], data: Record<string, any>): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const field of fields) {
      const value = data[field.name];

      if (field.type === 'group' && field.children) {
        const groupErrors = this.validateFormData(field.children, data);
        Object.assign(errors, groupErrors);
        continue;
      }

      if (field.type === 'repeater' && field.children) {
        const repeaterValue = Array.isArray(value) ? value : [];

        if (field.minItems && repeaterValue.length < field.minItems) {
          errors[field.name] = `Minimum ${field.minItems} items required`;
          continue;
        }
        if (field.maxItems && repeaterValue.length > field.maxItems) {
          errors[field.name] = `Maximum ${field.maxItems} items allowed`;
          continue;
        }

        repeaterValue.forEach((item: Record<string, any>, index: number) => {
          if (field.children) {
            const itemErrors = this.validateFormData(field.children, item);
            Object.entries(itemErrors).forEach(([key, msg]) => {
              errors[`${field.name}[${index}].${key}`] = msg;
            });
          }
        });
        continue;
      }

      const error = validateField(field, value, data);
      if (error) {
        errors[field.name] = error;
      }
    }

    return errors;
  },
};
