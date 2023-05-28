import usersModel from "../models/users.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const getAllUser = async (req, res) => {
  try {
    const users = await usersModel.findAll({
      attributes: ["uuid", "username", "email", "role"],
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error,
    });
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
    res.status(500).json({
      message: error,
    });
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

    req.session.userId = user.uuid;

    const { uuid, email, role } = user;
    const uname = user.username;

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      //   secure: true, (HTTPS ONLY)
    });

    res.status(200).json({
      message: "Login success.",
      accessToken,
      uuid,
      username: uname,
      email,
      role,
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
};

export const me = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Please login first!",
    });
  }

  const user = await usersModel.findOne({
    attributes: ["uuid", "username", "email", "role"],
    where: {
      uuid: req.session.userId,
    },
  });

  if (!user) {
    return res.status(404).jso({
      message: "User not found!",
    });
  }

  res.status(200).json({
    message: "User found.",
    user,
  });
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(204).json({
      message: "No content!",
    });
  }

  const user = await usersModel.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!user) {
    return res.status(204).json({
      message: "No content!",
    });
  }

  await user.update(
    {
      refresh_token: null,
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  res.clearCookie("refresh_token");

  req.session.destroy((err) => {
    if (err) {
      return res.status(400).json({
        message: "Cannot logout!",
      });
    }

    res.status(200).json({
      message: "Logout success.",
    });
  });
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await usersModel.findOne({
      attributes: ["username", "email", "role"],
      where: {
        uuid: id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User doesn't exit!",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

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
      role,
    });

    res.status(201).json({
      message: "User registered successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const user = await usersModel.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User doesn't exit!",
      });
    }

    let hashedPassword = user.password; // Default value is the existing password

    if (password !== "" && password !== null) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await usersModel.update(
      {
        username,
        email,
        password: hashedPassword,
        role,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    const updatedUser = await usersModel.findOne({
      where: {
        id: user.id,
      },
    });

    console.log(updatedUser.username, updatedUser.email, updatedUser.role);

    // console.log(updatedRows);

    res.status(200).json({
      message: "User updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await usersModel.findOne({
      where: {
        uuid: id,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User doesn't exit!",
      });
    }

    await usersModel.destroy({
      where: {
        id: user.id,
      },
    });

    res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
};
