import { ScaffoldService } from '../../shared/utils/moduleScaffold.js';
import seriesRepository from './series.repository.js';

class SeriesService extends ScaffoldService {
  constructor(repository = seriesRepository) {
    super('series', repository);
  }
}

export { SeriesService };
export default new SeriesService();
