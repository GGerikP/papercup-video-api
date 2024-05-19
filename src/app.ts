import express from 'express';
import bodyParser from 'body-parser';
import createVideoRoutes from './routes/video';
import createAnnotationRoutes from './routes/annotation';
import { PrismaClient } from '@prisma/client';
import apiKeyMiddleware from './middleware/apiKeyMiddleware';
import config from './config';

const createApp = (prisma: PrismaClient): express.Application => {
  const app = express();

  app.use(bodyParser.json());
  app.use(apiKeyMiddleware(prisma))
  app.use('/videos', createVideoRoutes(prisma));
  app.use('/annotations', createAnnotationRoutes(prisma));

  return app;
};

export default createApp;
