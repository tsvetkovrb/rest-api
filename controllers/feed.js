const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');

function clearImage(filePath) {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, error => {
    console.log(error);
  });
}

exports.getPosts = (req, res, next) => {
  const { page = 1 } = req.query;
  const perPage = 2;
  let totalItems = 0;
  Post.find().countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find().skip((page - 1) * perPage).limit(perPage);
    })
    .then(posts => {
      res.status(200).json({
        message: 'Fetched posts success',
        posts,
        totalItems,
      });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 404;
      }
      next(error);
    });
};

exports.postCreatePost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorect');
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No images provided');
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;
  const { title, content } = req.body;
  let creator;

  const post = new Post({
    title,
    content,
    creator: req.userId,
    imageUrl,
  });
  post
    .save()
    .then(() => User.findById(req.userId))
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(() => {
      res.status(201).json({
        message: 'Post created successfully',
        post,
        creator: {
          _id: creator._id,
          name: creator.name,
        },
      });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.getPost = (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Post fetched',
        post,
      });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorect');
    error.statusCode = 422;
    throw error;
  }

  const { postId } = req.params;
  const { title, content } = req.body;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) {
    const error = new Error('No file picked');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then(post => {
      console.log('TCL: exports.updatePost -> post', post, req.userId);
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized');
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      res.status(200).json({
        message: 'Post updated',
        post: result,
      });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 404;
      }
      next(error);
    });
};

exports.deletePost = (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized');
        error.statusCode = 403;
        throw error;
      }
      // check log in user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(() => User.findById(req.userId))
    .then(user => {
      console.log('11111111111', user.posts);
      user.posts.pull(postId);
      console.log('22222222222', user.posts);
      return user.save();
    })
    .then(() => {
      res.status(200).json({ message: 'Post was deleted' });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 404;
      }
      next(error);
    });
};
