import { PrismaClient } from '@prisma/client';
import createApp from './app';

const port = process.env.PORT || 3000;

const prisma = new PrismaClient();
const app = createApp(prisma);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
