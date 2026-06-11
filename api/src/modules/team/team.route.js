import { Roles } from '../../shared/constants/roles.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { ScaffoldRoutes } from '../../shared/utils/moduleScaffold.js';
import teamController from './team.controller.js';

class TeamRoutes extends ScaffoldRoutes {
  constructor() {
    super(teamController, {
      middlewares: [authenticate, authorize(Roles.SUPER_ADMIN, Roles.ADMIN)],
    });
  }
}

export { TeamRoutes };
export default new TeamRoutes().getRouter();
