import { ScaffoldController } from '../../../shared/utils/moduleScaffold.js';
import searchService from './search.service.js';

class SearchPublicController extends ScaffoldController {
  constructor(service = searchService) {
    super(service);
  }
}

export { SearchPublicController };
export default new SearchPublicController();
