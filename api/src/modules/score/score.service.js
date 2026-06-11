import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import scoreRepository from './score.repository.js';

class ScoreService extends ScaffoldService {
  constructor(repository = scoreRepository) {
    super('score', repository);
  }
}

export { ScoreService };
export default new ScoreService();
