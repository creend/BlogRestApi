import express from 'express';
import user from '../controllers/UserController.js';
import post from '../controllers/PostController.js';
import verifyToken from '../middleweares/verifyToken.js';

const router = express.Router();

router.get('/', (req, res) => res.send('HOME'));
router.get('/posts', post.findPosts);
router.get('/posts/:id', post.findPost);
router.get('/verify', user.verifyUser);
router.get('/reset/mail', user.resetPassword);

router.post('/register', user.registerUser);
router.post('/login', user.loginUser);
router.post('/reset/mail', user.sendPasswordResetMail);
router.post('/reset/password');
router.post('/posts', verifyToken, post.addNewPost);
router.post('/user', user.findUserByJWT);

router.put('/posts/:id', verifyToken, post.editPost);

router.delete('/posts/:id', verifyToken, post.deletePost);

export default router;
