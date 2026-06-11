import { ScaffoldRoutes } from '../../../shared/utils/moduleScaffold.js';
import pointsTableController from './pointsTable.controller.js';

class PointsTablePublicRoutes extends ScaffoldRoutes {
  constructor() {
    super(pointsTableController, { mergeParams: true });
  }
}

export { PointsTablePublicRoutes };
export default new PointsTablePublicRoutes().getRouter();
