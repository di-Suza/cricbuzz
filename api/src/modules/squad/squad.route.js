import { Roles } from '../../shared/constants/roles.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { ScaffoldRoutes } from '../../shared/utils/moduleScaffold.js';
import squadController from './squad.controller.js';

class SquadRoutes extends ScaffoldRoutes {
  constructor() {
    super(squadController, {
      mergeParams: true,
      middlewares: [authenticate, authorize(Roles.SUPER_ADMIN, Roles.ADMIN)],
    });
  }
}

export { SquadRoutes };
export default new SquadRoutes().getRouter();
