import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import matchRepository from './match.repository.js';

class MatchService extends ScaffoldService {
  constructor(repository = matchRepository) {
    super('match', repository);
  }
}

export { MatchService };
export default new MatchService();
