import { ScaffoldController } from '../../shared/utils/moduleScaffold.js';
import commentaryService from './commentary.service.js';

class CommentaryController extends ScaffoldController {
  constructor(service = commentaryService) {
    super(service);
  }
}

export { CommentaryController };
export default new CommentaryController();
