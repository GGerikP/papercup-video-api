import { Prisma, PrismaClient, Annotation } from '@prisma/client';

const getAnnotations = (prisma: PrismaClient) => async (): Promise<Annotation[]> => {
    return prisma.annotation.findMany();
};

const getAnnotationById = (prisma: PrismaClient) => async (id: number): Promise<Annotation | null> => {
    return prisma.annotation.findUnique({
        where: { id }
    });
};

const createAnnotation = (prisma: PrismaClient) => async (data: Prisma.AnnotationCreateInput): Promise<Annotation> => {
    return await prisma.annotation.create({
        data
    });
};

const updateAnnotation = (prisma: PrismaClient) => async (id: number, data: Partial<Omit<Prisma.AnnotationCreateInput, 'id'>>): Promise<Annotation> => {
    return prisma.annotation.update({
        where: { id },
        data
    });
};

const deleteAnnotation = (prisma: PrismaClient) => async (id: number): Promise<void> => {
    await prisma.annotation.delete({
        where: { id }
    });
};

export { getAnnotations, getAnnotationById, createAnnotation, updateAnnotation, deleteAnnotation };
