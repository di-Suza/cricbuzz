import { ScaffoldController } from '../../../shared/utils/moduleScaffold.js';
import matchService from './match.service.js';

class MatchPublicController extends ScaffoldController {
  constructor(service = matchService) {
    super(service);
  }
}

export { MatchPublicController };
export default new MatchPublicController();
