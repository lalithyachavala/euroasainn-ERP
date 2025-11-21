import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { redisService } from '../services/redis.service';
import { logger } from '../config/logger';
import { JwtPayload } from '../../../../packages/shared/src/types/index';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Check if token is blacklisted (fail gracefully if Redis is unavailable)
    try {
      const isBlacklisted = await redisService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          error: 'Token has been revoked',
        });
      }
    } catch (redisError) {
      // If Redis check fails, log but continue (fail open)
      logger.warn('Redis blacklist check failed, continuing with token verification:', redisError);
    }

    // Verify token
    const decoded = verifyToken(token) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error: any) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

