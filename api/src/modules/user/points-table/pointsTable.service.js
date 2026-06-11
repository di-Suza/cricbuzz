import { ScaffoldService } from '../../../shared/utils/moduleScaffold.js';

class PointsTablePublicService extends ScaffoldService {
  constructor() {
    super('public-points-table');
  }
}

export { PointsTablePublicService };
export default new PointsTablePublicService();
