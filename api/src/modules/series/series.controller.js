import { ScaffoldController } from '../../shared/utils/moduleScaffold.js';
import seriesService from './series.service.js';

class SeriesController extends ScaffoldController {
  constructor(service = seriesService) {
    super(service);
  }
}

export { SeriesController };
export default new SeriesController();
