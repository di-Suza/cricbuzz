import { Roles } from '../../shared/constants/roles.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { ScaffoldRoutes } from '../../shared/utils/moduleScaffold.js';
import playerController from './player.controller.js';

class PlayerRoutes extends ScaffoldRoutes {
  constructor() {
    super(playerController, {
      middlewares: [authenticate, authorize(Roles.SUPER_ADMIN, Roles.ADMIN)],
    });
  }
}

export { PlayerRoutes };
export default new PlayerRoutes().getRouter();
