import { ScaffoldController } from '../../shared/utils/moduleScaffold.js';
import squadService from './squad.service.js';

class SquadController extends ScaffoldController {
  constructor(service = squadService) {
    super(service);
  }
}

export { SquadController };
export default new SquadController();
