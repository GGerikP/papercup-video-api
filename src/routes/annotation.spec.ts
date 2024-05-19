import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import createApp from '../app';

jest.mock('@prisma/client', () => {
    const actualPrismaClient = jest.requireActual('@prisma/client');
    return {
        ...actualPrismaClient,
        PrismaClient: jest.fn().mockImplementation(() => ({
            video: {
                findUnique: jest.fn().mockResolvedValue([{
                    id: 1
                    ,lengthMilliSecs: 2000
                }])
            },
            annotation: {
                findMany: jest.fn().mockResolvedValue([{
                    id: 1
                    ,startTimeMilliSecs: 0
                    ,endTimeMilliSecs: 1000
                    ,videoId: 1
                    ,type: 'type1'
                    ,additionalNotes: 'notes'
                }]),
                findUnique: jest.fn().mockResolvedValue({
                    id: 1
                    ,startTimeMilliSecs: 0
                    ,endTimeMilliSecs: 1000
                    ,videoId: 1
                    ,type: 'type1'
                    ,additionalNotes: 'notes'
                }),
                create: jest.fn((args) => {
                    if (args.data && args.data.startTimeMilliSecs === 1000) {
                        return Promise.resolve({
                            id: 1
                            ,startTimeMilliSecs: 1000
                            ,endTimeMilliSecs: 1000
                            ,videoId: 1
                        })
                    } else {
                        return Promise.resolve({
                            id: 1
                            ,startTimeMilliSecs: 0
                            ,endTimeMilliSecs: 1000
                            ,videoId: 1
                            ,type: 'type1'
                            ,additionalNotes: 'notes'
                        })
                    }
                }),
                update: jest.fn((args) => {
                    if (args.where && args.where.id === 1) {
                        return Promise.resolve({
                            id: 1
                            ,startTimeMilliSecs: 5000
                            ,endTimeMilliSecs: 10000
                            ,videoId: 1
                            ,type: 'type2'
                            ,additionalNotes: 'updated notes'
                        })
                    } else {
                        return Promise.resolve({
                            id: 1
                            ,startTimeMilliSecs: 0
                            ,endTimeMilliSecs: 1000
                            ,videoId: 1
                            ,type: 'type1'
                            ,additionalNotes: 'notes'
                        })
                    }
                }),
                delete: jest.fn().mockResolvedValue({
                    id: 1
                    ,startTimeMilliSecs: 0
                    ,endTimeMilliSecs: 1000
                    ,videoId: 1
                    ,type: 'type1'
                    ,additionalNotes: 'notes'
                }),
            },
        })),
    };
});

const prisma = new PrismaClient();
const app = createApp(prisma);
const secretKey = 'my-fancy-secret-key';
const token = `APIKey-V1 ${secretKey}}`;

describe('Annotation API', () => {
    it('should get all annotations', async () => {
        const response = await request(app).get('/annotations').set('Authorization', token);;
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{
            id: 1
            ,startTimeMilliSecs: 0
            ,endTimeMilliSecs: 1000
            ,videoId: 1
            ,type: 'type1'
            ,additionalNotes: 'notes'
            ,startTime: "00:00:00"
            ,endTime: "00:00:01"
        }]);
    });

    it('should get an annotation by id', async () => {
        const response = await request(app).get('/annotations/1').set('Authorization', token);;
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: 1
            ,startTimeMilliSecs: 0
            ,endTimeMilliSecs: 1000
            ,videoId: 1
            ,type: 'type1'
            ,additionalNotes: 'notes'
            ,startTime: '00:00:00'
            ,endTime: '00:00:01'
        });
    });

    it('should create a new annotation', async () => {
        const newAnnotation = {
            startTime: "00:00:00"
            ,startTimeMilliSecs: 0
            ,endTime: "00:00:01"
            ,endTimeMilliSecs: 1000
            ,videoId: 1
            ,type: 'type1'
            ,additionalNotes: 'notes'
        };
        const response = await request(app).post('/annotations').send(newAnnotation).set('Authorization', token);;
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: 1, ...newAnnotation });
    });

    it('should create a new annotation with minimal information', async () => {

        const newAnnotation = {
            startTime: "00:00:01"
            ,startTimeMilliSecs: 1000
            ,endTime: "00:00:01"
            ,endTimeMilliSecs: 1000
            ,videoId: 1
        };
        const response = await request(app).post('/annotations').send(newAnnotation).set('Authorization', token);;
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: 1, ...newAnnotation });
    });

    it('should update an annotation by id', async () => {
        const updatedAnnotation = {
            startTime: "00:00:05"
            ,startTimeMilliSecs: 5000
            ,endTime: "00:00:10"
            ,endTimeMilliSecs: 10000
            ,videoId: 1
            ,type: 'type2'
            ,additionalNotes: 'updated notes'
        };
        const response = await request(app).put('/annotations/1').send(updatedAnnotation).set('Authorization', token);;
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: 1, ...updatedAnnotation });
    });

    it('should delete an annotation by id', async () => {
        const response = await request(app).delete('/annotations/1').set('Authorization', token);;
        expect(response.status).toBe(204);
    });
});
