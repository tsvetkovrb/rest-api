const router = require('express').Router();
const { body } = require('express-validator');

const feedController = require('../controllers/feed');

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/post
router.post('/post', [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 }),
], feedController.postCreatePost);

router.get('/post/:postId', feedController.getPost);
router.put('/post/:postId', [
  body('title').trim().isLength({ min: 5 }),
  body('content').trim().isLength({ min: 5 }),
], feedController.updatePost)
module.exports = router;
