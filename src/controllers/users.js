import usersModel from "../models/users.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const getAllUser = async (req, res) => {
  try {
    const users = await usersModel.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const userRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existUsername = await usersModel.findOne({
      where: {
        username,
      },
    });

    if (existUsername) {
      return res.status(409).json({
        message: "Username already exist!",
      });
    }

    const existEmail = await usersModel.findOne({
      where: {
        email,
      },
    });

    if (existEmail) {
      return res.status(409).json({
        message: "Email already exist!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersModel.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully.",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const userLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await usersModel.findOne({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User doesn't exit!",
      });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(401).json({
        message: "Username or password is incorrect!",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: "20s",
      }
    );
    
    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.REFRESH_TOKEN,
      {
        expiresIn: "1d",
      }
    );

    await usersModel.update(
      {
        refresh_token: refreshToken,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      //   secure: true, (HTTPS ONLY)
    });

    res.status(200).json({
      message: "Login success.",
      accessToken,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
