import { authMiddleware } from '@auth/middleware';
import { Router } from '@awaitjs/express';
import * as controller from '@praise/controllers';
import { UserRole } from '@user/types';

// Praise-routes
const praiseRouter = Router();
praiseRouter.getAsync('/all', controller.all);
praiseRouter.getAsync('/export', controller.exportPraise);
praiseRouter.getAsync('/:id', controller.single);
praiseRouter.patchAsync(
  '/:id/quantify',
  authMiddleware(UserRole.QUANTIFIER),
  controller.quantify
);

export { praiseRouter };
