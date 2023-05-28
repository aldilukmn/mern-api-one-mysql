import jwt from "jsonwebtoken";
import usersModel from "../models/users.js";
import dotenv from "dotenv";
dotenv.config();

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Missing token!",
      });
    }

    const user = await usersModel.findOne({
      where: {
        refresh_token: refreshToken,
      },
    });

    if (!user) {
      return res.status(403).json({
        message: "Invalid token!",
      });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: "Invalid token!",
        });
      }
    });

    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: "15s",
      }
    );
    
    res.status(200).json({
      accessToken,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
