import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import teamRepository from './team.repository.js';

class TeamService extends ScaffoldService {
  constructor(repository = teamRepository) {
    super('team', repository);
  }
}

export { TeamService };
export default new TeamService();
