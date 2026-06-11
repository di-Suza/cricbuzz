import { ScaffoldService } from '../../../shared/utils/moduleScaffold.js';

class HomePublicService extends ScaffoldService {
  constructor() {
    super('public-home');
  }
}

export { HomePublicService };
export default new HomePublicService();
