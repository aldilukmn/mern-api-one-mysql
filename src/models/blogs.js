import { Sequelize } from "sequelize";
import db from "../config/database.js";
import users from "./users.js";

const { DataTypes } = Sequelize;

const blogs = db.define(
  "blogs",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 100],
      },
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
  }
);

users.hasMany(blogs);
blogs.belongsTo(users, { foreignKey: "userId" });

export default blogs;
