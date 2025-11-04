import { getRedisClient } from '../config/redis';
import { logger } from '../config/logger';

export class RedisService {
  async blacklistToken(token: string, ttl: number = 900): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setex(`blacklist:${token}`, ttl, '1');
    } catch (error) {
      logger.error('Redis blacklist error:', error);
      throw error;
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const result = await redis.get(`blacklist:${token}`);
      return result === '1';
    } catch (error) {
      logger.error('Redis check error:', error);
      return false;
    }
  }

  async setCache(key: string, value: string, ttl: number = 3600): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.setex(`cache:${key}`, ttl, value);
    } catch (error) {
      logger.error('Redis cache set error:', error);
    }
  }

  async getCache(key: string): Promise<string | null> {
    try {
      const redis = getRedisClient();
      return await redis.get(`cache:${key}`);
    } catch (error) {
      logger.error('Redis cache get error:', error);
      return null;
    }
  }

  async deleteCache(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(`cache:${key}`);
    } catch (error) {
      logger.error('Redis cache delete error:', error);
    }
  }
}

export const redisService = new RedisService();
