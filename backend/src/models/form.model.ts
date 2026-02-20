import mongoose, { Schema, Document } from 'mongoose';
import { DynamicForm } from '../types/form.types';

export interface IForm extends Omit<DynamicForm, 'id'>, Document {}

const ValidationRuleSchema = new Schema({
  type: { type: String, required: true },
  value: { type: Schema.Types.Mixed },
  message: { type: String, required: true },
}, { _id: false });

const ConditionalLogicSchema = new Schema({
  fieldName: { type: String, required: true },
  operator: { type: String, required: true },
  value: { type: Schema.Types.Mixed },
  action: { type: String, required: true },
  targetValue: { type: Schema.Types.Mixed },
}, { _id: false });

const FieldOptionSchema = new Schema({
  label: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  disabled: { type: Boolean },
  icon: { type: String },
}, { _id: false });

const FormFieldSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  placeholder: { type: String },
  defaultValue: { type: Schema.Types.Mixed },
  helpText: { type: String },
  options: [FieldOptionSchema],
  validations: [ValidationRuleSchema],
  conditions: [ConditionalLogicSchema],
  order: { type: Number, required: true, default: 0 },
  width: { type: String, default: 'full' },
  disabled: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  minItems: { type: Number },
  maxItems: { type: Number },
  accept: { type: String },
  maxFileSize: { type: Number },
  min: { type: Number },
  max: { type: Number },
  step: { type: Number },
  prefix: { type: String },
  suffix: { type: String },
  icon: { type: String },
  className: { type: String },
}, { _id: false });

FormFieldSchema.add({ children: [FormFieldSchema] });

const FormStepSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  fieldIds: [{ type: String }],
  order: { type: Number, required: true },
}, { _id: false });

const FormSettingsSchema = new Schema({
  submitButtonText: { type: String, default: 'Submit' },
  successMessage: { type: String, default: 'Form submitted successfully!' },
  redirectUrl: { type: String },
  allowMultipleSubmissions: { type: Boolean, default: true },
  requireAuthentication: { type: Boolean, default: false },
  notifyOnSubmission: { type: Boolean, default: false },
  notificationEmails: [{ type: String }],
  theme: { type: String, default: 'default' },
  layout: { type: String, default: 'vertical' },
  showProgressBar: { type: Boolean, default: false },
  steps: [FormStepSchema],
}, { _id: false });

const FormSchema = new Schema<IForm>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true, lowercase: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    fields: [FormFieldSchema],
    settings: { type: FormSettingsSchema, default: () => ({}) },
    createdBy: { type: String, required: true },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const VERSION_FIELDS = ['fields', 'title', 'settings', 'status', 'description'];

FormSchema.pre('save', function (next) {
  if (!this.isNew && VERSION_FIELDS.some((field) => this.isModified(field))) {
    this.version = (this.version || 1) + 1;
  }
  next();
});

FormSchema.index({ slug: 1 });
FormSchema.index({ status: 1 });
FormSchema.index({ createdAt: -1 });

export const FormModel = mongoose.model<IForm>('Form', FormSchema);
