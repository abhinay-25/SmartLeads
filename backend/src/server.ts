import 'dotenv/config';
import app from './app';
import { connectDatabase } from '@config/database.config';
import { env } from '@config/env.config';
import { logger } from '@utils/logger';

const bootstrap = async (): Promise<void> => {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Start HTTP server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
      logger.info(`📊 Environment: ${env.NODE_ENV}`);
    });

    // 3. Graceful shutdown
    const gracefulShutdown = (signal: string): void => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 4. Unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Rejection:', reason);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

void bootstrap();
