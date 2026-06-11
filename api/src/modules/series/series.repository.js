import { ScaffoldRepository } from '../../shared/utils/moduleScaffold.js';

class SeriesRepository extends ScaffoldRepository {
  constructor() {
    super('series');
  }
}

export { SeriesRepository };
export default new SeriesRepository();
