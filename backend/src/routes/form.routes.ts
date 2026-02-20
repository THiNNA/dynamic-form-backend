import { Router } from 'express';
import { FormController } from '../controllers/form.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody, CreateFormSchema, UpdateFormSchema, UpdateStatusSchema } from '../middleware/validation.middleware';

const router = Router();

// Public route - get form by slug
router.get('/slug/:slug', FormController.getFormBySlug);

// Protected routes
router.use(authMiddleware);

router.get('/', FormController.listForms);
router.get('/:id', FormController.getFormById);
router.post('/', validateBody(CreateFormSchema), FormController.createForm);
router.put('/:id', validateBody(UpdateFormSchema), FormController.updateForm);
router.delete('/:id', FormController.deleteForm);
router.patch('/:id/status', validateBody(UpdateStatusSchema), FormController.updateStatus);
router.post('/:id/duplicate', FormController.duplicateForm);

// Field routes
router.post('/:id/fields', FormController.addField);
router.put('/:id/fields/:fieldId', FormController.updateField);
router.delete('/:id/fields/:fieldId', FormController.removeField);
router.patch('/:id/fields/reorder', FormController.reorderFields);

export default router;
