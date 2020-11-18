import Post from '../models/Post.js';
import jwt from 'jsonwebtoken';
import { validatePost } from '../validation/post.js';
import { USER_TYPES } from '../models/User.js';

const post = {
  addNewPost: async (req, res) => {
    const newPostBody = {
      author: req.user.username,
      userType: req.user.type,
      title: req.body.title,
      content: req.body.content,
    };
    const { error } = validatePost(newPostBody);

    if (error) return res.status(400).send(error.details[0].message);
    if (req.user.type == USER_TYPES[2])
      return res.status(400).send('Access denied');

    const post = new Post(newPostBody);

    try {
      const savedPost = await post.save();
      res.status(200).send(savedPost);
    } catch (err) {
      res.status(400).send(err);
    }
  },

  getPosts: async (req, res) => {
    const userPostQuery = req.query.q;
    const searchRule = {};
    if (userPostQuery) {
      const regExp = new RegExp(`.*${userPostQuery}.*`, 'i');
      searchRule.title = regExp;
    }
    try {
      const findedPosts = await Post.find(searchRule);
      if (findedPosts.length <= 0)
        return res
          .status(400)
          .send(`Cannot find posts called ${userPostQuery}`);
      res.status(200).send(findedPosts);
    } catch (err) {
      return res.status(400).send(err);
    }
  },

  getPost: (req, res) => {
    Post.findOne({ slug: req.params.slug }, (err, data) => {
      if (err) return res.status(400).send(err);
      res.status(200).send(data);
    });
  },

  findPost: async (req, res) => {
    try {
      const userPostQuery = req.query.q;
      const regExp = new RegExp(`.*${userPostQuery}.*`);
      const postsFinded = await Post.find({ title: regExp });
      console.log(postsFinded);
      if (postsFinded.length <= 0)
        return res.status(400).send(`Cannot find post called ${req.query.q}`);
      res.status(200).send(postsFinded);
    } catch (err) {
      res.status(400).send(err);
    }
  },

  editPost: async (req, res) => {
    // JESZCZE DO DOPRACOWANIA
    try {
      const searchedPost = await Post.findOne({ slug: req.params.slug });
      console.log(searchedPost);
      if (
        searchedPost.userType === USER_TYPES[1] ||
        searchedPost.author === req.user.username
      ) {
        const newPostBody = {
          edited: true,
          userType: searchedPost.userType,
          date: searchedPost.date,
          title: req.body.title,
          content: req.body.content,
          author: searchedPost.author,
        };
        await searchedPost.update(newPostBody);
        console.log(searchedPost);
        res.status(200).send(searchedPost);
      } else {
        res.status(400).send('Access denied');
      }
    } catch (err) {
      res.status(400).send(err);
    }
  },

  deletePost: async (req, res) => {
    try {
      const searchedPost = await Post.findOne({ slug: req.params.slug });
      if (!searchedPost) return res.status(400).send('Post doesnt exist');
      if (
        searchedPost.userType === USER_TYPES[1] ||
        searchedPost.author === req.user.username
      ) {
        await Post.deleteOne({ slug: req.params.slug });
        res.status(200).send('Succesfuely deleted');
      } else {
        res.status(400).send('Access denied');
      }
    } catch (err) {
      res.status(400).send(err);
    }
  },
};

export default post;
