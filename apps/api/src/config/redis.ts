import Redis from 'ioredis';
import { config } from './environment';
import { logger } from './logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      // Fail fast instead of stalling requests
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      connectTimeout: 3_000,
      // Keepalive to reduce ECONNRESET on idle connections
      keepAlive: 5_000,
      // Backoff but cap to avoid long stalls
      retryStrategy: (times) => Math.min(200 + times * 200, 2_000),
      // Reconnect only on connection drops, not on MOVED/ASK/etc.
      reconnectOnError: (err) => {
        const msg = err.message.toLowerCase();
        if (msg.includes("econnreset") || msg.includes("connection is closed")) {
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      logger.error('❌ Redis connection error:', err);
    });
  }

  return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}
