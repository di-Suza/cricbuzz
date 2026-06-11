import { ScaffoldRoutes } from '../../../shared/utils/moduleScaffold.js';
import teamController from './team.controller.js';

class TeamPublicRoutes extends ScaffoldRoutes {
  constructor() {
    super(teamController);
  }
}

export { TeamPublicRoutes };
export default new TeamPublicRoutes().getRouter();
