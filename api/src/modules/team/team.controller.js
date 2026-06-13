import { ScaffoldController } from '../../shared/utils/moduleScaffold.js';
import teamService from './team.service.js';

class TeamController extends ScaffoldController {
  constructor(service = teamService) {
    super(service);
  }

  getAll = async (req, res, next) => {
    try {
      const data = await this.service.getAllTeams();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const data = await this.service.getTeamById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const data = await this.service.createTeam(req.body, req.file);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const data = await this.service.updateTeam(req.params.id, req.body, req.file);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.service.deleteTeam(req.params.id);
      res.status(200).json({ success: true, message: 'Team deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  assignPlayer = async (req, res, next) => {
    try {
      const { playerId } = req.body;
      const data = await this.service.assignPlayer(req.params.id, playerId);
      res.status(200).json({
        success: true,
        data,
        message: 'Player assigned successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  removePlayer = async (req, res, next) => {
    try {
      const { playerId } = req.body;
      const data = await this.service.removePlayer(req.params.id, playerId);
      res.status(200).json({
        success: true,
        data,
        message: 'Player removed successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export { TeamController };
export default new TeamController();
