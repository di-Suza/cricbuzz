import { ScaffoldRoutes } from '../../../shared/utils/moduleScaffold.js';
import seriesController from './series.controller.js';

class SeriesPublicRoutes extends ScaffoldRoutes {
  constructor() {
    super(seriesController);
  }
}

export { SeriesPublicRoutes };
export default new SeriesPublicRoutes().getRouter();
