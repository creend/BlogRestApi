import express from 'express';
import user from '../controllers/UserController.js';
import post from '../controllers/PostController.js';
import verifyToken from '../middleweares/verifyToken.js';

const router = express.Router();

router.get('/', (req, res) => res.send('HOME'));
router.get('/posts', post.getPosts);
router.get('/posts/:slug', post.getPost);
router.get('/verify', user.verifyUser);
router.get('/reset', user.resetPassword);

router.post('/register', user.registerUser);
router.post('/login', user.loginUser);
router.post('/reset', user.sendPasswordResetMail);
router.post('/posts', verifyToken, post.addNewPost);

router.put('/posts/:slug', verifyToken, post.editPost);

router.delete('/posts/:slug', verifyToken, post.deletePost);

export default router;
