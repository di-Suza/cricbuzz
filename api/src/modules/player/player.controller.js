import { ScaffoldController } from '../../shared/utils/moduleScaffold.js';
import playerService from './player.service.js';

class PlayerController extends ScaffoldController {
  constructor(service = playerService) {
    super(service);
  }

  getAll = async (req, res, next) => {
    try {
      const data = await this.service.getAllPlayers();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const data = await this.service.getPlayerById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const data = await this.service.createPlayer(req.body, req.file);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = await this.service.updatePlayer(req.params.id, req.body, req.file);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.service.deletePlayer(req.params.id);
      res.status(200).json({ success: true, message: 'Player deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export { PlayerController };
export default new PlayerController();
