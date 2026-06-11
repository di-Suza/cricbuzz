import { ScaffoldController } from '../../../shared/utils/moduleScaffold.js';
import homeService from './home.service.js';

class HomePublicController extends ScaffoldController {
  constructor(service = homeService) {
    super(service);
  }
}

export { HomePublicController };
export default new HomePublicController();
