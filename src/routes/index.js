import express from 'express';
import UserController from '../controllers/UserController.js';
import PostController from '../controllers/PostController.js';
import verifyToken from '../middleweares/verifyToken.js';

const postController = new PostController();
const userController = new UserController();
const router = express.Router();

router.get('/posts', postController.findPosts);
router.get('/posts/:title', postController.findPost);
router.get('/verify', userController.verifyUser);
router.get('/reset/mail', userController.resetPassword);

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/reset/mail', userController.sendPasswordResetMail);
router.post('/reset/password');
router.post('/posts', verifyToken, postController.addNewPost);
router.post('/user', userController.findUserByJWT);

router.put('/posts/:title', verifyToken, postController.editPost);

router.delete('/posts/:title', verifyToken, postController.deletePost);

export default router;
