import { ScaffoldRepository } from '../../shared/utils/moduleScaffold.js';

class PlayerRepository extends ScaffoldRepository {
  constructor() {
    super('player');
  }
}

export { PlayerRepository };
export default new PlayerRepository();
