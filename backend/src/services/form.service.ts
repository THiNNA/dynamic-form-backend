import { FormModel } from '../models/form.model';
import { ApiError } from '../utils/ApiError';
import { generateSlug, ensureUniqueSlug, generateId } from '../utils/helpers';
import { FormField } from '../types/form.types';

export interface ListFormsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface FieldOrder {
  fieldId: string;
  order: number;
}

export const FormService = {
  async createForm(data: any) {
    const slug = data.slug || generateSlug(data.title);
    const uniqueSlug = await ensureUniqueSlug(slug, FormModel);

    const form = new FormModel({
      ...data,
      slug: uniqueSlug,
    });

    return await form.save();
  },

  async updateForm(id: string, data: any) {
    const form = await FormModel.findById(id);
    if (!form) throw new ApiError(404, 'Form not found');

    if (data.title && !data.slug) {
      data.slug = await ensureUniqueSlug(generateSlug(data.title), FormModel, id);
    } else if (data.slug) {
      data.slug = await ensureUniqueSlug(data.slug, FormModel, id);
    }

    Object.assign(form, data);
    return await form.save();
  },

  async deleteForm(id: string) {
    const form = await FormModel.findByIdAndDelete(id);
    if (!form) throw new ApiError(404, 'Form not found');
    return form;
  },

  async listForms(query: ListFormsQuery) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }

    const [forms, total] = await Promise.all([
      FormModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      FormModel.countDocuments(filter),
    ]);

    return {
      data: forms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getFormById(id: string) {
    const form = await FormModel.findById(id);
    if (!form) throw new ApiError(404, 'Form not found');
    return form;
  },

  async getFormBySlug(slug: string) {
    const form = await FormModel.findOne({ slug });
    if (!form) throw new ApiError(404, 'Form not found');
    return form;
  },

  async updateStatus(id: string, status: string) {
    const form = await FormModel.findById(id);
    if (!form) throw new ApiError(404, 'Form not found');
    form.status = status as any;
    return await form.save();
  },

  async addField(formId: string, field: FormField) {
    const form = await FormModel.findById(formId);
    if (!form) throw new ApiError(404, 'Form not found');

    if (!field.id) {
      field.id = generateId();
    }
    field.order = form.fields.length;

    form.fields.push(field as any);
    return await form.save();
  },

  async updateField(formId: string, fieldId: string, data: Partial<FormField>) {
    const form = await FormModel.findById(formId);
    if (!form) throw new ApiError(404, 'Form not found');

    const fieldIndex = form.fields.findIndex((f: any) => f.id === fieldId);
    if (fieldIndex === -1) throw new ApiError(404, 'Field not found');

    Object.assign(form.fields[fieldIndex], data);
    form.markModified('fields');
    return await form.save();
  },

  async removeField(formId: string, fieldId: string) {
    const form = await FormModel.findById(formId);
    if (!form) throw new ApiError(404, 'Form not found');

    const fieldIndex = form.fields.findIndex((f: any) => f.id === fieldId);
    if (fieldIndex === -1) throw new ApiError(404, 'Field not found');

    form.fields.splice(fieldIndex, 1);
    form.markModified('fields');
    return await form.save();
  },

  async reorderFields(formId: string, fieldOrders: FieldOrder[]) {
    const form = await FormModel.findById(formId);
    if (!form) throw new ApiError(404, 'Form not found');

    fieldOrders.forEach(({ fieldId, order }) => {
      const field = form.fields.find((f: any) => f.id === fieldId);
      if (field) {
        (field as any).order = order;
      }
    });

    form.fields.sort((a: any, b: any) => a.order - b.order);
    form.markModified('fields');
    return await form.save();
  },

  async duplicateForm(id: string) {
    const form = await FormModel.findById(id);
    if (!form) throw new ApiError(404, 'Form not found');

    const formObj = form.toObject();
    delete (formObj as any)._id;
    delete (formObj as any).__v;
    delete (formObj as any).createdAt;
    delete (formObj as any).updatedAt;

    const newSlug = await ensureUniqueSlug(formObj.slug + '-copy', FormModel);

    const newForm = new FormModel({
      ...formObj,
      title: formObj.title + ' (Copy)',
      slug: newSlug,
      status: 'draft',
      version: 1,
    });

    return await newForm.save();
  },
};
