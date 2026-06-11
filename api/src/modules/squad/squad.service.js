import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import squadRepository from './squad.repository.js';

class SquadService extends ScaffoldService {
  constructor(repository = squadRepository) {
    super('squad', repository);
  }
}

export { SquadService };
export default new SquadService();
