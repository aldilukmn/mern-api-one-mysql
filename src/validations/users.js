import { check, validationResult } from "express-validator";

export const validator = (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ message: error.array()[0].msg });
  }

  next();
};

export const validationRegister = [
  check("username")
    .notEmpty()
    .trim()
    .withMessage("Username is required!")
    .matches(/^[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*$/)
    .withMessage("Invalid username format!"),
  check("email").notEmpty().withMessage("Email is required!").isEmail().withMessage("Invalid email format!"),
  check("password")
    .notEmpty()
    .withMessage("Password is required!")
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("Password and Confirm Password do not match!");
      }
      return true;
    })
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error("Password should not contain spaces");
      }
      return true;
    }),
];

export const validationLogin = [
  check("username")
    .notEmpty()
    .trim()
    .withMessage("Username is required!")
    .matches(/^[a-zA-Z0-9]*[a-zA-Z][a-zA-Z0-9]*$/)
    .withMessage("Invalid username format!"),
  check("password")
    .notEmpty()
    .withMessage("Password is required!")
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error("Password should not contain spaces");
      }
      return true;
    }),
];
