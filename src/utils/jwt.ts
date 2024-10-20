
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET_KEY;

if (!secretKey || !refreshTokenSecret) {
  throw new Error('JWT_SECRET_KEY or JWT_REFRESH_SECRET_KEY is not defined in the environment variables');
}

export const generateToken = (userId: string) => {
  const accessToken = jwt.sign({ userId }, secretKey, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, refreshTokenSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secretKey) as { userId: string };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, refreshTokenSecret) as { userId: string };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
