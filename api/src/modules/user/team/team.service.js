import { ScaffoldService } from '../../../shared/utils/moduleScaffold.js';

class TeamPublicService extends ScaffoldService {
  constructor() {
    super('public-team');
  }
}

export { TeamPublicService };
export default new TeamPublicService();
