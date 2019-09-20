const { validationResult } = require('express-validator');

exports.getPosts = (req, res) => {
  res.status(200).json({
    posts: [{
      _id: 1,
      title: 'It is posts',
      content: 'Some content',
      imageUrl: 'static/images/duck.png',
      creator: {
        name: 'Roman',
      },
      createdAt: new Date(),
    }],
  });
};

exports.postCreatePost = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed, entered data is incorect',
      errors: errors.array(),
    });
  }

  const { title, content } = req.body;
  // Create post in db
  res.status(201).json({
    message: 'Post created successfully',
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: {
        name: 'Roman',
        createdAt: new Date(),
      },
    },
  });
};
