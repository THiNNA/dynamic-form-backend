import { Request, Response, NextFunction } from 'express';
import { ResponseService } from '../services/response.service';

export const ResponseController = {
  async submitResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ResponseService.submitResponse(
        req.params.id,
        req.body,
        {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          submittedBy: req.body._submittedBy,
        }
      );
      res.status(201).json({ success: true, data: response, message: 'Response submitted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getResponses(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await ResponseService.getResponses(req.params.id, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getResponseById(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await ResponseService.getResponseById(req.params.id, req.params.responseId);
      res.json({ success: true, data: response });
    } catch (err) {
      next(err);
    }
  },

  async deleteResponse(req: Request, res: Response, next: NextFunction) {
    try {
      await ResponseService.deleteResponse(req.params.id, req.params.responseId);
      res.json({ success: true, message: 'Response deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async exportResponses(req: Request, res: Response, next: NextFunction) {
    try {
      const format = (req.query.format as string) || 'json';
      const data = await ResponseService.exportResponses(req.params.id, format);

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="responses-${req.params.id}.csv"`);
        return res.send(data);
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ResponseService.getStats(req.params.id);
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },
};
