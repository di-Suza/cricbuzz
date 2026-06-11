import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import playingXiRepository from './playingXi.repository.js';

class PlayingXiService extends ScaffoldService {
  constructor(repository = playingXiRepository) {
    super('playing-xi', repository);
  }
}

export { PlayingXiService };
export default new PlayingXiService();
