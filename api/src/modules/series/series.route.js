import { Roles } from '../../shared/constants/roles.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { ScaffoldRoutes } from '../../shared/utils/moduleScaffold.js';
import seriesController from './series.controller.js';

class SeriesRoutes extends ScaffoldRoutes {
  constructor() {
    super(seriesController, {
      middlewares: [authenticate, authorize(Roles.SUPER_ADMIN, Roles.ADMIN)],
    });
  }
}

export { SeriesRoutes };
export default new SeriesRoutes().getRouter();
