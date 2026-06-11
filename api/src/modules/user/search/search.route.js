import { ScaffoldRoutes } from '../../../shared/utils/moduleScaffold.js';
import searchController from './search.controller.js';

class SearchPublicRoutes extends ScaffoldRoutes {
  constructor() {
    super(searchController);
  }
}

export { SearchPublicRoutes };
export default new SearchPublicRoutes().getRouter();
