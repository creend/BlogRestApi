import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { validateRegister, validateLogin } from '../validation/user.js';

class UserController {
  registerUser = async (req, res) => {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send('Email already exist');

    const usernameExist = await User.findOne({ username: req.body.username });
    if (usernameExist) return res.status(400).send(`Username already exist`);

    if (req.body.password !== req.body.retypedPassword)
      return res.status(400).send(`Passwords are not identical`);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      type: req.body.type,
      verified: false,
    });

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        type: user.type,
        verified: user.verified,
      },
      process.env.TOKEN_SECRET
    );

    const messageHTML = `
      <h1 style="font-size: 2rem;">Confirm email<h1>
      <a
        href="http://localhost:3000/verify?t=${token}" 
        target="_blank"
        style="text-decoration:none;">
        Potwierdz konto
      </a>
    `;

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

    const message = {
      from: 'covalmichael23@gmail.com',
      to: req.body.email,
      subject: 'Verify User !',
      html: messageHTML,
    };

    try {
      await transporter.sendMail(message);
    } catch (err) {
      return res.status(400).send({ err: 'Cannot send email' });
    }

    try {
      const savedUser = await user.save();
      res.status(200).send(savedUser);
    } catch (err) {
      return res.status(404).send(err);
    }
  };

  verifyUser = async (req, res) => {
    const token = req.query.t;
    const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
    verifiedUser.verified = true;

    try {
      await User.findByIdAndUpdate(verifiedUser._id, verifiedUser);
      res.status(200).send(verifiedUser.verified);
    } catch (err) {
      res.status(400).send(err);
    }
  };

  sendPasswordResetMail = async (req, res) => {
    // DO DOPRACOWANIA
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .send({ error: `There is not accout with ${email} email` });

    const token = jwt.sign({ email }, process.env.TOKEN_SECRET);

    const messageHTML = `
      <h1 style="font-size: 2rem;">Zresetuj hasło<h1>
      <a
        href="http://localhost:3000/api/reset?t=${token}" 
        target="_blank"
        style="text-decoration:none;">
        Zresetuj hasło
      </a>
    `;

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

    const message = {
      from: 'covalmichael23@gmail.com',
      to: req.body.email,
      subject: 'Reset password',
      html: messageHTML,
    };

    try {
      await transporter.sendMail(message);
      res.status(200).send('Email sended!');
    } catch (err) {
      res.status(400).send(err);
    }
  };

  resetPassword = async (req, res) => {
    // DO DOPRACOWANIA
    const token = req.query.t;
    const tokenData = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await User.findOne({ email: tokenData.email });
  };

  loginUser = async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send(`Email or password is incorrect`);

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      return res.status(400).send(`Email or password is incorrect`);

    if (!user.verified)
      return res.status(400).send(`Your account isn't verified`);
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        type: user.type,
        verified: user.verified,
      },
      process.env.TOKEN_SECRET
    );
    res.status(200).header('auth-token', token).send(token);
  };

  findUserByJWT = async (req, res) => {
    try {
      const token = req.body.token;
      const user = jwt.verify(token, process.env.TOKEN_SECRET);
      res.status(200).send(user);
    } catch (err) {
      res.status(400).send(err);
    }
  };
}

export default UserController;
