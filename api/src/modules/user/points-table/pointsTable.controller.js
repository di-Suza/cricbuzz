import { ScaffoldController } from '../../../shared/utils/moduleScaffold.js';
import pointsTableService from './pointsTable.service.js';

class PointsTablePublicController extends ScaffoldController {
  constructor(service = pointsTableService) {
    super(service);
  }
}

export { PointsTablePublicController };
export default new PointsTablePublicController();
