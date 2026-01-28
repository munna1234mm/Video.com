import express from 'express';
import { getVideos, getVideo, searchVideos } from '../controllers/videoController.js';

const router = express.Router();

router.get('/', getVideos);
router.get('/search', searchVideos);
router.get('/:id', getVideo);

export default router;
