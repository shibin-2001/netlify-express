import express from 'express';
import{
    getUser,
    getUserFollowers,
    addRemoveFollowing,
    getUserFollowing,
    getAllUsers,
    readNotifications,
} from '../controllers/users.js'
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();

// READ

router.get('/all/:id',verifyToken,getAllUsers)
router.get('/:id',verifyToken,getUser)

router.get('/:id/Followers',verifyToken,getUserFollowers)
router.get('/:id/following',verifyToken,getUserFollowing)

// UPDATE 
router.patch('/:id/:friendId',verifyToken,addRemoveFollowing)
router.put('/notifications/:id',verifyToken,readNotifications)
export default router