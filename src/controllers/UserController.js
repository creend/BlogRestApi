import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { validateRegister, validateLogin } from '../validation/user.js';

const user = {
  registerUser: async (req, res) => {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist)
      return res.status(400).send({ error: 'Email already exist' });

    const usernameExist = await User.findOne({ username: req.body.username });
    if (usernameExist)
      return res.status(400).send({ error: `This Username already exist` });

    if (req.body.password !== req.body.retypedPassword)
      return res.status(400).send({ error: `Passwords are not identical` });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      type: req.body.type,
      verified: false,
    });

    try {
      const savedUser = await user.save();
      res.status(500).send(savedUser);
    } catch (err) {
      res.status(404).send(err);
    }

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        type: user.type,
        password: user.password,
        email: user.email,
        verified: user.verified,
      },
      process.env.TOKEN_SECRET
    );

    const message = {
      from: 'covalmichael23@gmail.com',
      to: req.body.email,
      subject: 'Confirm register !',
      html: `
        <h1 style="font-size: 2rem;">Confirm email<h1>
        <a
          href="http://localhost:8000/api/verify?t=${token}" 
          target="_blank"
          style="text-decoration:none;">
          Potwierdz konto
        </a>
      `,
    };

    const transporter = nodemailer.createTransport({
      tls: {
        rejectUnauthorized: false,
      },
      service: 'gmail',
      auth: {
        user: process.env.MAIL,
        pass: process.env.PASSWORD,
      },
    });

    try {
      await transporter.sendMail(message);
    } catch (err) {
      res.status(400).send(err);
    }
  },

  verifyUser: async (req, res) => {
    const token = req.query.t;
    const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
    verifiedUser.verified = true;

    try {
      await User.findByIdAndUpdate(verifiedUser._id, verifiedUser);
      res.redirect('http://localhost:8000/api/');
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  },

  loginUser: async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send({ err: `Email or password is incorrect` });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      return res.status(400).send({ err: `Email or password is incorrect` });

    if (!user.verified)
      return res.status(400).send({ err: `Your account isn't verified` });
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        type: user.type,
        password: user.password,
        email: user.email,
        verified: user.verified,
      },
      process.env.TOKEN_SECRET
    );
    res.status(200).header('auth-token', token).send(token);
  },
};

export default user;
