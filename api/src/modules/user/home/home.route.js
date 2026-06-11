import { ScaffoldRoutes } from '../../../shared/utils/moduleScaffold.js';
import homeController from './home.controller.js';

class HomePublicRoutes extends ScaffoldRoutes {
  constructor() {
    super(homeController);
  }
}

export { HomePublicRoutes };
export default new HomePublicRoutes().getRouter();
