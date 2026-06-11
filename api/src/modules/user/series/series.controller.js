import { ScaffoldController } from '../../../shared/utils/moduleScaffold.js';
import seriesService from './series.service.js';

class SeriesPublicController extends ScaffoldController {
  constructor(service = seriesService) {
    super(service);
  }
}

export { SeriesPublicController };
export default new SeriesPublicController();
