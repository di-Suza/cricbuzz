import { ScaffoldRepository } from '../../shared/utils/moduleScaffold.js';

class TeamRepository extends ScaffoldRepository {
  constructor() {
    super('team');
  }
}

export { TeamRepository };
export default new TeamRepository();
