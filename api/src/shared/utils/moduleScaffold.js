import express from 'express';

import asyncHandler from './asyncHandler.js';

class ScaffoldRepository {
  constructor(moduleName) {
    this.moduleName = moduleName;
  }
}

class ScaffoldService {
  constructor(moduleName, repository = new ScaffoldRepository(moduleName)) {
    this.moduleName = moduleName;
    this.repository = repository;
  }

  status() {
    return {
      module: this.moduleName,
      status: 'ready',
      message: `${this.moduleName} module skeleton is mounted and ready for implementation`,
    };
  }
}

class ScaffoldController {
  constructor(service) {
    this.service = service;
    this.status = asyncHandler(this.status.bind(this));
  }

  async status(_req, res) {
    res.json({
      success: true,
      data: this.service.status(),
    });
  }
}

class ScaffoldRoutes {
  constructor(controller, options = {}) {
    this.router = express.Router({ mergeParams: Boolean(options.mergeParams) });
    this.controller = controller;
    this.middlewares = options.middlewares || [];
    this.register();
  }

  register() {
    if (this.middlewares.length > 0) {
      this.router.use(...this.middlewares);
    }

    this.router.get('/', this.controller.status);
  }

  getRouter() {
    return this.router;
  }
}

export {
  ScaffoldRepository,
  ScaffoldService,
  ScaffoldController,
  ScaffoldRoutes,
};
