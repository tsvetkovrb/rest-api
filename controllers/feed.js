const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      res.status(200).json({
        message: 'Fetched posts success',
        posts,
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

  // Create post in db
  const post = new Post({
    title,
    content,
    creator: {
      name: 'Roman',
    },
    imageUrl,
  });
  post
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully',
        post: result,
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
      if (!post) {
        const error = new Error('Could not find post');
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl)
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

function clearImage(filePath) {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, error => {
    console.log(error)
  })
}