import { ScaffoldController } from '../../shared/utils/moduleScaffold.js';
import scoreService from './score.service.js';

class ScoreController extends ScaffoldController {
  constructor(service = scoreService) {
    super(service);
  }
}

export { ScoreController };
export default new ScoreController();
