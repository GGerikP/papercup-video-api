import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import createApp from '../app';

jest.mock('@prisma/client', () => {
  const actualPrismaClient = jest.requireActual('@prisma/client');
  return {
    ...actualPrismaClient,
    PrismaClient: jest.fn().mockImplementation(() => ({
      video: {
        findMany: jest.fn().mockResolvedValue([{
          id: 1
          , url: 'http://example.com/video1'
          , description: 'A sample video'
          , lengthMilliSecs: 5000
        }]),
        findUnique: jest.fn().mockResolvedValue({
          id: 1
          , url: 'http://example.com/video1'
          , description: 'A sample video'
          , lengthMilliSecs: 5000
        }),
        create: jest.fn().mockResolvedValue({
          id: 1
          , url: 'http://example.com/video1'
          , description: 'A sample video'
          , lengthMilliSecs: 5000
        }),
        update: jest.fn().mockResolvedValue({
          id: 1
          , url: 'http://example.com/video1'
          , description: 'An updated sample video'
          , lengthMilliSecs: 5000
        }),
        delete: jest.fn().mockResolvedValue({
          id: 1
          , url: 'http://example.com/video1'
          , description: 'A sample video'
        }),
      },
    })),
  };
});

const prisma = new PrismaClient();
const app = createApp(prisma);
const secretKey = 'my-fancy-secret-key';
const token = `APIKey-V1 ${secretKey}}`;

describe('Video API', () => {

  it('should get all videos', async () => {
    const response = await request(app).get('/videos').set('Authorization', token);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([{
      id: 1
      , url: 'http://example.com/video1'
      , description: 'A sample video'
      , length: "00:00:05"
      , lengthMilliSecs: 5000
    }]);
  });

  it('should get a video by id', async () => {
    const response = await request(app).get('/videos/1').set('Authorization', token);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1
      , url: 'http://example.com/video1'
      , description: 'A sample video'
      , length: "00:00:05"
      , lengthMilliSecs: 5000
    });
  });

  it('should create a new video', async () => {
    const newVideo = {
      url: 'http://example.com/video1'
      , description: 'A sample video'
      , length: "00:00:05"
      , lengthMilliSecs: 5000
    };
    const response = await request(app).post('/videos').send(newVideo).set('Authorization', token);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, ...newVideo });
  });

  it('should update a video by id', async () => {
    const updatedVideo = {
      url: 'http://example.com/video1'
      , description: 'An updated sample video'
      , length: "00:00:05"
      , lengthMilliSecs: 5000
    };
    const response = await request(app).put('/videos/1').send(updatedVideo).set('Authorization', token);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, ...updatedVideo });
  });

  it('should delete a video by id', async () => {
    const response = await request(app).delete('/videos/1').set('Authorization', token);
    expect(response.status).toBe(204);
  });
});
