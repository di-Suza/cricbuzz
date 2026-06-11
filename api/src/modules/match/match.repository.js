import { ScaffoldRepository } from '../../shared/utils/moduleScaffold.js';

class MatchRepository extends ScaffoldRepository {
  constructor() {
    super('match');
  }
}

export { MatchRepository };
export default new MatchRepository();
