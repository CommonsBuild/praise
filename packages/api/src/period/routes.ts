import { Router } from '@awaitjs/express';
import * as periodController from '@period/controllers';

// Period-routes
const periodRouter = Router();

periodRouter.getAsync('/all', periodController.all);
periodRouter.getAsync('/:periodId', periodController.single);
periodRouter.getAsync('/:periodId/praise', periodController.praise);

// ADMIN Period-routes
const adminPeriodRouter = Router();
adminPeriodRouter.postAsync('/create', periodController.create);
adminPeriodRouter.patchAsync('/:periodId/update', periodController.update);
adminPeriodRouter.patchAsync('/:periodId/close', periodController.close);
adminPeriodRouter.getAsync(
  '/:periodId/verifyQuantifierPoolSize',
  periodController.verifyQuantifierPoolSize
);
adminPeriodRouter.patchAsync(
  '/:periodId/assignQuantifiers',
  periodController.assignQuantifiers
);

export { periodRouter, adminPeriodRouter };
