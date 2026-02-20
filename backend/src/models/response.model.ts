import mongoose, { Schema, Document } from 'mongoose';
import { FormResponse } from '../types/form.types';

export interface IResponse extends Omit<FormResponse, 'id'>, Document {}

const ResponseSchema = new Schema<IResponse>(
  {
    formId: { type: String, required: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    submittedBy: { type: String },
    submittedAt: { type: Date, default: Date.now },
    ip: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ResponseSchema.index({ formId: 1, submittedAt: -1 });

export const ResponseModel = mongoose.model<IResponse>('Response', ResponseSchema);
