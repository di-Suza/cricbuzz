import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import playerRepository from './player.repository.js';

class PlayerService extends ScaffoldService {
  constructor(repository = playerRepository) {
    super('player', repository);
  }
}

export { PlayerService };
export default new PlayerService();
