import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessToken: {
    secret: process.env.JWT_SECRET,
    expiresIn: '86400s', // 1 hour in seconds
  },
  refreshToken: {
    // Fixed typo in 'refreshToken'
    secret: process.env.JWT_SECRET,
    expiresIn: '604800s', // 24 hours in seconds
  },
  development: {
    ignoreExpiration: true,
  },
  production: {
    ignoreExpiration: false,
  },
}));
