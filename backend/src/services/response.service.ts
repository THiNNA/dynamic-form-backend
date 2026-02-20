import { ResponseModel } from '../models/response.model';
import { FormModel } from '../models/form.model';
import { ApiError } from '../utils/ApiError';
import { ValidationService } from './validation.service';

export interface SubmitResponseMeta {
  ip?: string;
  userAgent?: string;
  submittedBy?: string;
}

export interface GetResponsesQuery {
  page?: number;
  limit?: number;
}

export const ResponseService = {
  async submitResponse(formId: string, data: Record<string, any>, meta: SubmitResponseMeta) {
    const form = await FormModel.findById(formId);
    if (!form) throw new ApiError(404, 'Form not found');
    if (form.status !== 'published') throw new ApiError(400, 'Form is not accepting submissions');

    const errors = ValidationService.validateFormData(form.fields as any, data);
    if (Object.keys(errors).length > 0) {
      throw new ApiError(422, 'Validation failed', errors);
    }

    const response = new ResponseModel({
      formId,
      data,
      submittedAt: new Date(),
      ...meta,
    });

    return await response.save();
  },

  async getResponses(formId: string, query: GetResponsesQuery) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const form = await FormModel.findById(formId);
    if (!form) throw new ApiError(404, 'Form not found');

    const [responses, total] = await Promise.all([
      ResponseModel.find({ formId }).sort({ submittedAt: -1 }).skip(skip).limit(limit),
      ResponseModel.countDocuments({ formId }),
    ]);

    return {
      data: responses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getResponseById(formId: string, responseId: string) {
    const response = await ResponseModel.findOne({ _id: responseId, formId });
    if (!response) throw new ApiError(404, 'Response not found');
    return response;
  },

  async deleteResponse(formId: string, responseId: string) {
    const response = await ResponseModel.findOneAndDelete({ _id: responseId, formId });
    if (!response) throw new ApiError(404, 'Response not found');
    return response;
  },

  async exportResponses(formId: string, format: string) {
    const form = await FormModel.findById(formId);
    if (!form) throw new ApiError(404, 'Form not found');

    const responses = await ResponseModel.find({ formId }).sort({ submittedAt: -1 });

    if (format === 'csv') {
      if (responses.length === 0) return '';

      const fieldNames = form.fields.map((f: any) => f.name);
      const headers = ['submittedAt', 'submittedBy', 'ip', ...fieldNames];

      const rows = responses.map((r) => {
        const row: string[] = [
          r.submittedAt ? r.submittedAt.toISOString() : '',
          r.submittedBy || '',
          r.ip || '',
        ];
        fieldNames.forEach((name) => {
          const val = r.data[name];
          row.push(val !== undefined ? JSON.stringify(val) : '');
        });
        return row.map((v) => `"${String(v).replace(/\n/g, ' ').replace(/"/g, '""')}"`).join(',');
      });

      return [headers.join(','), ...rows].join('\n');
    }

    return responses;
  },

  async getStats(formId: string) {
    const form = await FormModel.findById(formId);
    if (!form) throw new ApiError(404, 'Form not found');

    const [count, first, last] = await Promise.all([
      ResponseModel.countDocuments({ formId }),
      ResponseModel.findOne({ formId }).sort({ submittedAt: 1 }).select('submittedAt'),
      ResponseModel.findOne({ formId }).sort({ submittedAt: -1 }).select('submittedAt'),
    ]);

    return {
      total: count,
      firstSubmission: first?.submittedAt || null,
      lastSubmission: last?.submittedAt || null,
      formTitle: form.title,
      formStatus: form.status,
    };
  },
};
