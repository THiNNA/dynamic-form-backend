import { Router } from 'express';
import { ResponseController } from '../controllers/response.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

// Public route - submit a response
router.post('/:id/submit', ResponseController.submitResponse);

// Protected routes
router.use(authMiddleware);

router.get('/:id/responses/export', ResponseController.exportResponses);
router.get('/:id/responses/stats', ResponseController.getStats);
router.get('/:id/responses', ResponseController.getResponses);
router.get('/:id/responses/:responseId', ResponseController.getResponseById);
router.delete('/:id/responses/:responseId', ResponseController.deleteResponse);

export default router;
