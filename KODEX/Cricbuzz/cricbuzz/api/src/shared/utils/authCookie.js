import env from '../../config/env.js';

class AuthCookie {
  static refreshCookieOptions() {
    return {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      maxAge: env.REFRESH_COOKIE_MAX_AGE_MS,
      path: '/',
      ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    };
  }

  static setRefreshToken(res, refreshToken) {
    res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, AuthCookie.refreshCookieOptions());
  }

  static clearRefreshToken(res) {
    const { maxAge, ...options } = AuthCookie.refreshCookieOptions();
    res.clearCookie(env.REFRESH_COOKIE_NAME, options);
  }

  static getRefreshToken(req) {
    return req.cookies?.[env.REFRESH_COOKIE_NAME] || null;
  }
}

export default AuthCookie;
