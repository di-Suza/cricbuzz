import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';

import env from './config/env.js';
import authRoutes from './modules/auth/auth.route.js';
import commentaryRoutes from './modules/commentary/commentary.route.js';
import matchRoutes from './modules/match/match.route.js';
import playerRoutes from './modules/player/player.route.js';
import playingXiRoutes from './modules/playing-xi/playingXi.route.js';
import scoreRoutes from './modules/score/score.route.js';
import seriesRoutes from './modules/series/series.route.js';
import squadRoutes from './modules/squad/squad.route.js';
import responseCache from './modules/user/cache/responseCache.js';
import publicCommentaryRoutes from './modules/user/commentary/commentary.route.js';
import publicHomeRoutes from './modules/user/home/home.route.js';
import publicMatchRoutes from './modules/user/match/match.route.js';
import publicPlayerRoutes from './modules/user/player/player.route.js';
import publicPointsTableRoutes from './modules/user/points-table/pointsTable.route.js';
import publicSearchRoutes from './modules/user/search/search.route.js';
import publicSeriesRoutes from './modules/user/series/series.route.js';
import publicTeamRoutes from './modules/user/team/team.route.js';
import teamRoutes from './modules/team/team.route.js';
import userRoutes from './modules/users/user.route.js';
import errorHandler from './shared/middleware/errorHandler.js';
import notFound from './shared/middleware/notFound.js';
import requestLogger from './shared/middleware/requestLogger.js';
import { apiRateLimiter, securityHeaders } from './shared/middleware/security.js';

function getAllowedCorsOrigins() {
  if (env.CORS_ORIGIN === '*') return '*';

  const configuredOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
  const origins = new Set(configuredOrigins);

  if (env.NODE_ENV === 'development') {
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
  }

  return Array.from(origins);
}

class App {
  constructor() {
    this.app = express();
    this.registerGlobalMiddleware();
    this.registerHealthCheck();
    this.registerPublicRoutes();
    this.registerAdminRoutes();
    this.registerErrorMiddleware();
  }

  getInstance() {
    return this.app;
  }

  registerGlobalMiddleware() {
    this.app.disable('x-powered-by');
    this.app.use(requestLogger);
    this.app.use(securityHeaders);
    const allowedOrigins = getAllowedCorsOrigins();
    this.app.use(
      cors({
        origin: allowedOrigins === '*' ? true : allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );
    this.app.use(express.json({ limit: '5mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '5mb' }));
    this.app.use(cookieParser());
    this.app.use(apiRateLimiter);
  }

  registerHealthCheck() {
    this.app.get('/health', (_req, res) => {
      res.json({
        success: true,
        message: 'Cricket backend is healthy',
      });
    });
  }

  registerPublicRoutes() {
    this.app.use('/api/home', responseCache(10), publicHomeRoutes);
    this.app.use('/api/matches/:matchId/commentary', responseCache(5), publicCommentaryRoutes);
    this.app.use('/api/matches', responseCache(10), publicMatchRoutes);
    this.app.use('/api/series/:seriesId/points-table', responseCache(30), publicPointsTableRoutes);
    this.app.use('/api/search', responseCache(30), publicSearchRoutes);
    this.app.use('/api/series', responseCache(60), publicSeriesRoutes);
    this.app.use('/api/teams', responseCache(60), publicTeamRoutes);
    this.app.use('/api/players', responseCache(60), publicPlayerRoutes);
  }

  registerAdminRoutes() {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/teams/:teamId/squad', squadRoutes);
    this.app.use('/api/matches/:matchId/playing-xi', playingXiRoutes);
    this.app.use('/api/matches/:matchId/scores', scoreRoutes);
    this.app.use('/api/matches/:matchId/commentary', commentaryRoutes);
    this.app.use('/api/series', seriesRoutes);
    this.app.use('/api/teams', teamRoutes);
    this.app.use('/api/players', playerRoutes);
    this.app.use('/api/matches', matchRoutes);
  }

  registerErrorMiddleware() {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }
}

const appFactory = new App();

export { App };
export default appFactory.getInstance();
