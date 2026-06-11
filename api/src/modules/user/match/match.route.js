import { ScaffoldRoutes } from '../../../shared/utils/moduleScaffold.js';
import matchController from './match.controller.js';

class MatchPublicRoutes extends ScaffoldRoutes {
  constructor() {
    super(matchController);
  }
}

export { MatchPublicRoutes };
export default new MatchPublicRoutes().getRouter();
