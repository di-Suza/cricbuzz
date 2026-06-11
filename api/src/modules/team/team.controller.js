import { ScaffoldController } from '../../shared/utils/moduleScaffold.js';
import teamService from './team.service.js';

class TeamController extends ScaffoldController {
  constructor(service = teamService) {
    super(service);
  }
}

export { TeamController };
export default new TeamController();
