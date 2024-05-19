import { Prisma, PrismaClient, Video } from '@prisma/client';

const getVideos = (prisma: PrismaClient) => async (): Promise<Video[]> => {
  return prisma.video.findMany({
    include: { annotations: true }
  });
};

const getVideoById = (prisma: PrismaClient) => async (id: number): Promise<Video | null> => {
  return prisma.video.findUnique({
    where: { id },
    include: { annotations: true }
  });
};

const getVideoByUUId = (prisma: PrismaClient) => async (uuid: string): Promise<Video | null> => {
    return prisma.video.findFirst({
      where: { uuid },
      include: { annotations: true }
    });
  };
  
const createVideo = (prisma: PrismaClient) => async (data: Prisma.VideoCreateInput): Promise<Video> => {
  return prisma.video.create({
    data
  });
};

const updateVideo = (prisma: PrismaClient) => async (id: number, data: Partial<Omit<Video, 'id'>>): Promise<Video> => {
  return prisma.video.update({
    where: { id },
    data
  });
};

const deleteVideo = (prisma: PrismaClient) => async (id: number): Promise<void> => {
  await prisma.video.delete({
    where: { id }
  });
};

export { getVideos, getVideoById, createVideo, updateVideo, deleteVideo };
