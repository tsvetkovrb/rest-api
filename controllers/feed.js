exports.getPosts = (req, res) => {
  res.status(200).json({
    posts: [{ title: 'It is posts' }],
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
