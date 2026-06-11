import { ScaffoldRepository } from '../../shared/utils/moduleScaffold.js';

class PlayingXiRepository extends ScaffoldRepository {
  constructor() {
    super('playing-xi');
  }
}

export { PlayingXiRepository };
export default new PlayingXiRepository();
