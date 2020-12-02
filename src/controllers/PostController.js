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
      edited: false,
    };
    const { error } = validatePost(newPostBody);

    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    if (req.user.type == USER_TYPES[2]) {
      return res.status(400).send('Access denied');
    }

    const post = new Post(newPostBody);

    try {
      const savedPost = await post.save();
      res.status(200).send(savedPost);
    } catch (err) {
      res.status(400).send({ err });
    }
  },

  findPosts: async (req, res) => {
    const searchRule = {};

    const postQuery = req.query.q;
    const postOrder =
      req.query.order !== 'desc' && req.query.order !== 'asc'
        ? 'desc'
        : req.query.order;
    const page =
      parseInt(req.query.page) - 1 >= 0 ? parseInt(req.query.page) || 0 : 1;

    const perPage = parseInt(req.query.per_page) || 2;

    if (postQuery) {
      const regExp = new RegExp(`.*${postQuery}.*`, 'i');
      searchRule.title = regExp;
    }

    try {
      const findedPosts = await Post.find(searchRule)
        .skip(page - 1)
        .limit(perPage)
        .sort({
          createdAt: postOrder,
        });

      const count = await Post.countDocuments(searchRule);
      const requiredPages = Math.ceil(count / perPage);

      if (findedPosts.length <= 0) {
        return res.status(400).send(`Cannot find posts`);
      }

      res.status(200).send({ posts: findedPosts, count, requiredPages });
    } catch (err) {
      return res.status(400).send(err);
    }
  },

  findPost: async (req, res) => {
    try {
      const post = await Post.findOne({ _id: req.params.id });
      if (!post) return res.status(400).send({ err: 'Cannot find post' });
      res.status(200).send(post);
    } catch (err) {
      res.status(400).send(`Cannot find post with id: ${req.params.id}`);
    }
  },

  editPost: async (req, res) => {
    try {
      const searchedPost = await Post.findOne({ _id: req.params.id });
      if (
        searchedPost.userType === USER_TYPES[1] ||
        searchedPost.author === req.user.username
      ) {
        const newPostBody = {
          edited: true,
          userType: searchedPost.userType,
          createdAt: searchedPost.createdAt,
          title: req.body.title,
          content: req.body.content,
          author: searchedPost.author,
        };
        await searchedPost.update(newPostBody);
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
      const searchedPost = await Post.findOne({ _id: req.params.id });
      if (!searchedPost) return res.status(400).send('Post doesnt exist');
      if (
        searchedPost.userType === USER_TYPES[1] ||
        searchedPost.author === req.user.username
      ) {
        await Post.deleteOne({ _id: req.params.id });
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
