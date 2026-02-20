import { Request, Response, NextFunction } from 'express';
import { FormService } from '../services/form.service';

export const FormController = {
  async listForms(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await FormService.listForms({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        status: status as string,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getFormById(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.getFormById(req.params.id);
      res.json({ success: true, data: form });
    } catch (err) {
      next(err);
    }
  },

  async getFormBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.getFormBySlug(req.params.slug);
      res.json({ success: true, data: form });
    } catch (err) {
      next(err);
    }
  },

  async createForm(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.createForm(req.body);
      res.status(201).json({ success: true, data: form, message: 'Form created successfully' });
    } catch (err) {
      next(err);
    }
  },

  async updateForm(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.updateForm(req.params.id, req.body);
      res.json({ success: true, data: form, message: 'Form updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  async deleteForm(req: Request, res: Response, next: NextFunction) {
    try {
      await FormService.deleteForm(req.params.id);
      res.json({ success: true, message: 'Form deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.updateStatus(req.params.id, req.body.status);
      res.json({ success: true, data: form, message: 'Form status updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  async addField(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.addField(req.params.id, req.body);
      res.status(201).json({ success: true, data: form, message: 'Field added successfully' });
    } catch (err) {
      next(err);
    }
  },

  async updateField(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.updateField(req.params.id, req.params.fieldId, req.body);
      res.json({ success: true, data: form, message: 'Field updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  async removeField(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.removeField(req.params.id, req.params.fieldId);
      res.json({ success: true, data: form, message: 'Field removed successfully' });
    } catch (err) {
      next(err);
    }
  },

  async reorderFields(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.reorderFields(req.params.id, req.body.fieldOrders);
      res.json({ success: true, data: form, message: 'Fields reordered successfully' });
    } catch (err) {
      next(err);
    }
  },

  async duplicateForm(req: Request, res: Response, next: NextFunction) {
    try {
      const form = await FormService.duplicateForm(req.params.id);
      res.status(201).json({ success: true, data: form, message: 'Form duplicated successfully' });
    } catch (err) {
      next(err);
    }
  },
};
