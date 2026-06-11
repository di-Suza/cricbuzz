import { ScaffoldController } from '../../../shared/utils/moduleScaffold.js';
import teamService from './team.service.js';

class TeamPublicController extends ScaffoldController {
  constructor(service = teamService) {
    super(service);
  }
}

export { TeamPublicController };
export default new TeamPublicController();
