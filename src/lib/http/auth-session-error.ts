export class AuthSessionExpiredError extends Error {
  constructor() {
    super('Tu sesión expiró. Inicia sesión nuevamente.');
    this.name = 'AuthSessionExpiredError';
  }
}
