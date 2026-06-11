import { ScaffoldService } from '../../../shared/utils/moduleScaffold.js';

class SeriesPublicService extends ScaffoldService {
  constructor() {
    super('public-series');
  }
}

export { SeriesPublicService };
export default new SeriesPublicService();
