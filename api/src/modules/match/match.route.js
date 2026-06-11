import { Roles } from '../../shared/constants/roles.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { ScaffoldRoutes } from '../../shared/utils/moduleScaffold.js';
import matchController from './match.controller.js';

class MatchRoutes extends ScaffoldRoutes {
  constructor() {
    super(matchController, {
      middlewares: [authenticate, authorize(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.SCORER)],
    });
  }
}

export { MatchRoutes };
export default new MatchRoutes().getRouter();
