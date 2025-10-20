const mongoose = require("mongoose");
const Post = require("../models/Post");
const { errorHandler } = require('../auth');


module.exports.addPost = (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).send({ message: "Admins are not allowed to create posts" });
  }

  const newPost = new Post({
    title: req.body.title,
    content: req.body.content,
    author_information: req.body.author_information
  });

  newPost.save()
    .then(post => {
      res.status(201).send({
        message: 'Post Added Successfully',
        post: JSON.parse(JSON.stringify(post, [
          '_id',
          'title',
          'content',
          'author_information',
          'creationAdded'
        ]))
      });
    }).catch(error => errorHandler(error, req, res));
};


module.exports.updatePost = (req, res) => {
  if (req.user.isAdmin) {
    return res.status(403).send({ message: "Admins are not allowed to update posts" });
  }

  const userId = req.user.id;

  Post.findById(req.params.postId)
    .then(post => {
      if (!post) {
        return res.status(404).send({ message: "Post not found" });
      }

      const updatedPost = {
        title: req.body.title,
        content: req.body.content
      };

      return Post.findByIdAndUpdate(req.params.postId, updatedPost, { new: true, runValidators: true });
    })
    .then(updated => {
      if (!updated) {
        return res.status(404).send({ message: "Post not found" });
      }

      res.status(200).send({
        message: "Post Updated Successfully",
        updatedPost: JSON.parse(JSON.stringify(updated, [
          '_id',
          'title',
          'content',
          'author_information',
          'creationAdded'
        ]))
      });
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).send({ message: "Post Deleted Successfully" });

  } catch (error) {
    return errorHandler(error, req, res);
  }
};


module.exports.getAllPosts = (req, res) => {

    Post.find({})
    .then(posts => {

        if (posts.length > 0) {
            return res.status(200).send({ posts });
        } else {
            return res.status(200).send({ message: 'No posts found.' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};



module.exports.getMovieById = (req, res) => {

    Post.findById(req.params.postId)
    .then(post => {

        if (post) {

            return res.status(200).send(post);

        } else {

            return res.status(404).json({ message: 'Post not found' });
        }
    }).catch(error => errorHandler(error, req, res));
};


module.exports.addPostComment = (req, res) => {
    
    const userId = req.user?.id;
    const postId = req.params.postId;
    const comment = req.body.comment;

    if (!comment || comment.trim() === "") {
        return res.status(400).send({ error: "Comment is required." });
    }

    Post.findById(postId)
    .then(post => {

        if (!post) {

            return res.status(404).send({ error: "Post not found." });
        }

        post.comments.push({
            userId: userId,
            comment: comment
        });

        return post.save();
    }).then(updatedPost => {
        return res.status(200).send({
            message: "Comment Added Successfully.",
            Post: updatedPost
        });
    }).catch(error => errorHandler(error, req, res));
};


module.exports.getPostComment = (req, res) => {

    let postId = req.params.postId;

    Post.findById(postId)
    .then(post => {
        
        if (!post) {
            return res.status(404).send({ error: "Comment not found." });
        }

        return res.status(200).send({ comments: post.comments });
    })
    .catch(error => errorHandler(error, req, res));
};


module.exports.deleteComment = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const post = await Post.findOne({ "comments._id": commentId });

    if (!post) {
      return res.status(404).send({ message: "Comment not found" });
    }

    post.comments = post.comments.filter(
      comment => comment._id.toString() !== commentId
    );

    await post.save();

    return res.status(200).send({ message: "Comment Deleted Successfully" });

  } catch (error) {
        return errorHandler(error, req, res);
  }
};