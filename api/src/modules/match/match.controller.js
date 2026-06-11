import { ScaffoldController } from '../../shared/utils/moduleScaffold.js';
import matchService from './match.service.js';

class MatchController extends ScaffoldController {
  constructor(service = matchService) {
    super(service);
  }
}

export { MatchController };
export default new MatchController();
