import { ScaffoldController } from '../../../shared/utils/moduleScaffold.js';
import commentaryService from './commentary.service.js';

class CommentaryPublicController extends ScaffoldController {
  constructor(service = commentaryService) {
    super(service);
  }
}

export { CommentaryPublicController };
export default new CommentaryPublicController();
