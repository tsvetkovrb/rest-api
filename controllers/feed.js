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
  const { title } = req.body;
  // Create post in db
  res.status(201).json({
    message: 'Post created successfully',
    post: {
      id: new Date().toISOString(),
      title,
    },
  });
};
