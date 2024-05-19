import { Router } from 'express';
import { Prisma, PrismaClient, Video } from '@prisma/client';
import { getVideos, getVideoById, createVideo, updateVideo, deleteVideo } from '../models/video';
import { convertHHMMSSToMilliSeconds, convertMilliSecondsToHHMMSS } from '../utils/formatTime';

interface VideoResponse extends Video {
    length: string;
}

const transformVideoResponse = (video: Video | null): VideoResponse | null => {
    if (!video) {
        return;
    }
    return {
        ...video
        , length: convertMilliSecondsToHHMMSS(video.lengthMilliSecs)
    }
}

const createVideoRoutes = (prisma: PrismaClient): Router => {
    const router = Router();

    router.get('/', async (req, res) => {
        const videos = (await getVideos(prisma)()).map(video => transformVideoResponse(video));
        res.json(videos);
    });

    router.get('/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        const video = await getVideoById(prisma)(id);
        if (!video) {
            res.status(404).json({ error: `Video with id ${id} not found.` })
            return;
        }
        res.json(transformVideoResponse(video));
    });

    router.post('/', async (req, res) => {
        const {
            url
            , description
            , length
        } = req.body;

        try {
            const videoData: Prisma.VideoCreateInput = {
                url
                , description
                , lengthMilliSecs: convertHHMMSSToMilliSeconds(length)
            };

            const video = transformVideoResponse(await createVideo(prisma)(videoData));

            res.json(video);
        } catch (err) {
            const error = err as Error;
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    res.status(409).json({ error: `A video with the URL ${url} already exists.` });
                    return;
                }
            }
            res.status(500).json({ error: `Error creating video: ${error.message}` });
        }
    }
    );

    router.put('/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const {
                url
                , description
                , length
            } = req.body;

            const videoData: Partial<Omit<Video, 'id'>> = {
                url
                , description
                , lengthMilliSecs: convertHHMMSSToMilliSeconds(length)
                , updatedAt: new Date()
            };

            const video = transformVideoResponse(await updateVideo(prisma)(id, videoData));
            res.json(video);
        } catch (error) {
            console.log(`error = ${error}`);
            res.status(500).json({ error: 'Error updating video' });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        try {
            await deleteVideo(prisma)(id);
        } catch (err) {
            const error = err as Error;
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2025' || err.code === 'P2016') {
                    res.status(404).json({ error: `Video id ${id} not found` });
                    return;
                }
            }
            res.status(500).json({ error: `Something went wrong deleting video ${id}: ${error.message}` });
            return;
        }
        res.status(204).send();
    });
    return router;
};

export default createVideoRoutes;
