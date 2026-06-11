import { ScaffoldRoutes } from '../../../shared/utils/moduleScaffold.js';
import playerController from './player.controller.js';

class PlayerPublicRoutes extends ScaffoldRoutes {
  constructor() {
    super(playerController);
  }
}

export { PlayerPublicRoutes };
export default new PlayerPublicRoutes().getRouter();
