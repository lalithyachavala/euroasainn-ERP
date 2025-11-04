import { Router } from 'express';
import { businessRuleController } from '../controllers/business-rule.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', businessRuleController.create.bind(businessRuleController));
router.get('/', businessRuleController.getAll.bind(businessRuleController));
router.post('/validate', businessRuleController.validate.bind(businessRuleController));
router.get('/:id', businessRuleController.getById.bind(businessRuleController));
router.put('/:id', businessRuleController.update.bind(businessRuleController));
router.delete('/:id', businessRuleController.delete.bind(businessRuleController));
router.post('/:id/execute', businessRuleController.execute.bind(businessRuleController));

export default router;
