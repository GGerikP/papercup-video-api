import { Router } from 'express';
import { Annotation, Prisma, PrismaClient, Video } from '@prisma/client';
import { getAnnotations, getAnnotationById, createAnnotation, updateAnnotation, deleteAnnotation } from '../models/annotation';
import { getVideoById } from '../models/video';
import { convertHHMMSSToMilliSeconds, convertMilliSecondsToHHMMSS } from '../utils/formatTime';

type ErrorResponse = {
    status: number;
    error: string;
}
const validateRequest = async (
    prisma: PrismaClient
    , videoId: number
    , startTimeMilliSecs: number
    , endTimeMilliSecs: number): Promise<ErrorResponse | null> => {
    try {
        const video: Video = await getVideoById(prisma)(videoId);
        if (endTimeMilliSecs > video.lengthMilliSecs) {
            const annotationEndTime = convertMilliSecondsToHHMMSS(endTimeMilliSecs);
            const videoEndTime = convertMilliSecondsToHHMMSS(video.lengthMilliSecs);
            return {
                status: 400,
                error: `Bad Request: End Time (${annotationEndTime}) cannot be greater than the video end time (${videoEndTime})`
            }
            return;
        } else if (startTimeMilliSecs > endTimeMilliSecs) {
            return {
                status: 400,
                error: `Bad Request: Start time cannot be before end time`
            }
        } else if (startTimeMilliSecs === null || endTimeMilliSecs === null) {
            return {
                status: 400,
                error: `Bad Request: Start and end times must be supplied`
            }
        }
    } catch (error) {
        return {
            status: 400,
            error: `Bad Request: Invalid Video ID ${videoId} supplied`
        }
    }
}

interface AnnotationResponse extends Annotation {
    startTime: string;
    endTime: string;
}
const transformAnnotationResponse = (annotation: Annotation) => {
    return {
        ...annotation
        , startTimeMilliSecs: (Math.floor(annotation.startTimeMilliSecs / 1000) * 1000)
        , endTimeMilliSecs: (Math.floor(annotation.endTimeMilliSecs / 1000) * 1000)
        , startTime: convertMilliSecondsToHHMMSS(annotation.startTimeMilliSecs)
        , endTime: convertMilliSecondsToHHMMSS(annotation.endTimeMilliSecs)
    }
}

const createAnnotationRoutes = (prisma: PrismaClient): Router => {
    const router = Router();

    router.get('/', async (req, res) => {
        const annotations = (await getAnnotations(prisma)()).map((annotation) => transformAnnotationResponse(annotation));
        res.json(annotations);
    });

    router.get('/:id', async (req, res) => {
        const annotation = await getAnnotationById(prisma)(parseInt(req.params.id));
        if (!annotation) {
            res.status(404).json({ error: `Error updating annotation: ${parseInt(req.params.id)} not found` });
            return;
        }
        res.json(transformAnnotationResponse(annotation));
    });

    router.post('/', async (req, res) => {
        try {
            const {
                startTime
                , endTime
                , videoId
                , type
                , additionalNotes
            } = req.body;

            const startTimeMilliSecs = convertHHMMSSToMilliSeconds(startTime);
            const endTimeMilliSecs = convertHHMMSSToMilliSeconds(endTime);

            const validationError: ErrorResponse = await validateRequest(prisma, parseInt(videoId), startTimeMilliSecs, endTimeMilliSecs)
            if (validationError) {
                res.status(validationError.status).json({ error: validationError.error });
                return;
            }

            const annotationData: Prisma.AnnotationCreateInput = {
                startTimeMilliSecs,
                endTimeMilliSecs,
                video: { connect: { id: parseInt(videoId) } },
                type,
                additionalNotes,
            };

            const annotation = transformAnnotationResponse(await createAnnotation(prisma)(annotationData));

            res.json(annotation);
        } catch (err) {
            const error = err as Error;
            console.log(`ERROR: ${error.message}`);
            res.status(500).json({ error: `Error creating annotation: ${error.message}` });
        }
    }
    );

    router.put('/:id', async (req, res) => {

        try {
            const id = parseInt(req.params.id);
            const {
                startTime
                , endTime
                , type
                , additionalNotes
            } = req.body;

            const startTimeMilliSecs = convertHHMMSSToMilliSeconds(startTime);
            const endTimeMilliSecs = convertHHMMSSToMilliSeconds(endTime);

            const oldAnnotation = await getAnnotationById(prisma)(id);
            if (!oldAnnotation) {
                res.status(404).json({ error: `Error updating annotation: ${id} not found` });
                return;
            }
            const updstartTimeMilliSecs = startTimeMilliSecs ? startTimeMilliSecs : oldAnnotation.startTimeMilliSecs;
            const updEndTimeMilliSecs = startTimeMilliSecs ? startTimeMilliSecs : oldAnnotation.startTimeMilliSecs;
            const validationError: ErrorResponse = await validateRequest(prisma, oldAnnotation.videoId, updstartTimeMilliSecs, updEndTimeMilliSecs)
            if (validationError) {
                res.status(validationError.status).json({ error: validationError.error });
                return;
            }
            type AnnotationCreateData = Partial<Omit<Prisma.AnnotationCreateInput, 'id'>>;
            const annotationData: AnnotationCreateData = {
                startTimeMilliSecs: updstartTimeMilliSecs
                , endTimeMilliSecs: updEndTimeMilliSecs
                , type
                , additionalNotes
            };

            const annotation = transformAnnotationResponse(await updateAnnotation(prisma)(id, annotationData));
            res.json(annotation);

        } catch (err) {
            const error = err as Error;
            console.log(`Error: ${error}`);
            res.status(500).json({ error: `Error updating annotation: ${error.message}` });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = parseInt(req.params.id);
        try {
            await deleteAnnotation(prisma)(id);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2025' || err.code === 'P2016') {
                    res.status(404).json({ error: `Annotation id ${id} not found` });
                    return;
                }
            }
            res.status(500).json({ error: `Something went wrong deleting annoation ${id}`});
            return;
        }
        res.status(204).send();
    });

    return router;
};

export default createAnnotationRoutes;