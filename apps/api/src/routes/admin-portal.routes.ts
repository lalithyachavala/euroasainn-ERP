import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePortal } from '../middleware/portal.middleware';
import { PortalType } from '@euroasiann/shared';

const router = Router();

router.use(authMiddleware);
router.use(requirePortal(PortalType.ADMIN));

// Organizations (unified endpoint)
router.get('/organizations', organizationController.getOrganizations.bind(organizationController));
router.post('/organizations', organizationController.createOrganization.bind(organizationController));
router.get('/organizations/:id', organizationController.getOrganizationById.bind(organizationController));
router.put('/organizations/:id', organizationController.updateOrganization.bind(organizationController));
router.delete('/organizations/:id', organizationController.deleteOrganization.bind(organizationController));

// Legacy endpoints (for backward compatibility)
router.get('/customer-orgs', organizationController.getOrganizations.bind(organizationController));
router.post('/customer-orgs', organizationController.createOrganization.bind(organizationController));
router.get('/vendor-orgs', organizationController.getOrganizations.bind(organizationController));
router.post('/vendor-orgs', organizationController.createOrganization.bind(organizationController));

export default router;
