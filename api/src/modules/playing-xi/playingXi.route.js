import { Roles } from '../../shared/constants/roles.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { ScaffoldRoutes } from '../../shared/utils/moduleScaffold.js';
import playingXiController from './playingXi.controller.js';

class PlayingXiRoutes extends ScaffoldRoutes {
  constructor() {
    super(playingXiController, {
      mergeParams: true,
      middlewares: [authenticate, authorize(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.SCORER)],
    });
  }
}

export { PlayingXiRoutes };
export default new PlayingXiRoutes().getRouter();
