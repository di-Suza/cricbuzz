import { Roles } from '../../shared/constants/roles.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { ScaffoldRoutes } from '../../shared/utils/moduleScaffold.js';
import scoreController from './score.controller.js';

class ScoreRoutes extends ScaffoldRoutes {
  constructor() {
    super(scoreController, {
      mergeParams: true,
      middlewares: [authenticate, authorize(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.SCORER)],
    });
  }
}

export { ScoreRoutes };
export default new ScoreRoutes().getRouter();
