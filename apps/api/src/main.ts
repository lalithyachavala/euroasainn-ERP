import app from './app';
import { connectDatabase } from './config/database';
import { getRedisClient } from './config/redis';
import { getCasbinEnforcer } from './config/casbin';
import { config } from './config/environment';
import { logger, logError } from './config/logger';

async function bootstrap() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Connect to Redis
    getRedisClient();

    // Initialize CASBIN
    const enforcer = await getCasbinEnforcer();
    
    // Note: Policies should be seeded manually or via a migration script
    // Uncomment to seed default policies:
    // const { seedDefaultPolicies } = await import('../../../../packages/casbin-config/src/seed-policies');
    // await seedDefaultPolicies(enforcer);

    // Start server
    const port = config.port;
    app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
      logger.info(`📝 API available at http://localhost:${port}${config.apiPrefix}`);
      logger.info(`🏥 Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    logError(error as Error, 'Bootstrap');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

bootstrap();
