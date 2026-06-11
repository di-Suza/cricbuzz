import { ScaffoldRepository } from '../../shared/utils/moduleScaffold.js';

class ScoreRepository extends ScaffoldRepository {
  constructor() {
    super('score');
  }
}

export { ScoreRepository };
export default new ScoreRepository();
