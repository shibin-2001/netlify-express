import express from 'express';
import {createComment, deleteComment, deletePost, getFeedPosts,getUserPosts,likePost} from '../controllers/posts.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// READ
router.get('/:userId',verifyToken,getFeedPosts);

router.get('/:userId/posts',verifyToken,getUserPosts);


// UPDATE
 router.patch('/:id/like',verifyToken,likePost);
 router.post('/:id/comment',verifyToken,createComment);
 router.patch('/:id/comment',verifyToken,deleteComment);
 router.patch('/delete/:id',verifyToken,deletePost);

 export default router;