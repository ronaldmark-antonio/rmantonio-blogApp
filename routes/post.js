const express = require("express");
const postController = require("../controllers/post");

const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

router.post("/addPost", verify, postController.addPost);
router.patch("/updatePost/:postId", verify, postController.updatePost);
router.delete("/deletePost/:postId", verify, postController.deletePost);
router.get("/getPosts", postController.getAllPosts);
router.get("/getPosts/:postId", postController.getMovieById);
router.patch("/addComment/:postId", postController.addPostComment);
router.get("/getComment/:postId", postController.getPostComment);
router.delete("/deleteComment/:commentId", verify, verifyAdmin, postController.deleteComment);

module.exports = router;
