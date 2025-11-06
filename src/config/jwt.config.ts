export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'khao_secret_key_min_32_chars_long',
  expiresIn: parseInt(process.env.JWT_EXPIRATION) || 3600,
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'khao_refresh_secret',
  refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION) || 604800,
};
