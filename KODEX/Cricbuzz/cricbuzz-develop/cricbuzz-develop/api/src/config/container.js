class ModuleContainer {
  constructor() {
    this.registry = new Map();
  }

  register(name, metadata) {
    this.registry.set(name, Object.freeze({ name, ...metadata }));
    return this;
  }

  resolve(name) {
    return this.registry.get(name);
  }

  list() {
    return Array.from(this.registry.values());
  }
}

const container = new ModuleContainer()
  .register('auth', { surface: 'admin', purpose: 'register/login and token issuing' })
  .register('users', { surface: 'admin', purpose: 'SUPER_ADMIN user visibility' })
  .register('series', { surface: 'admin', purpose: 'series CRUD' })
  .register('team', { surface: 'admin', purpose: 'team CRUD and squad refs' })
  .register('player', { surface: 'admin', purpose: 'global player catalogue' })
  .register('squad', { surface: 'admin', purpose: 'team squad management' })
  .register('match', { surface: 'admin', purpose: 'match lifecycle' })
  .register('playing-xi', { surface: 'admin', purpose: 'playing XI selection' })
  .register('score', { surface: 'admin', purpose: 'live innings scoring' })
  .register('commentary', { surface: 'admin', purpose: 'ball-by-ball commentary' })
  .register('user-public', { surface: 'public', purpose: 'read-only cached fan APIs' });

export { ModuleContainer };
export default container;
