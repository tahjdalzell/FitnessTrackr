/* eslint-disable no-useless-catch */
const express = require("express");
// const { getAllRoutines } = require("../db/routines");
const {
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getUserByUsername,
  createUser,
} = require("../db/users");
const router = express.Router();
// const { requireUser } = require("./utils");
const jwt = require("jsonwebtoken");
const { getAllPublicRoutines } = require("../db");

// POST /api/users/register
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (password.length < 8) {
      res.send({
        name: "PasswordLengthError",
        message: "Password Too Short!",
        error: "Password needs to be 8 characters",
      });
    }

    const checkUser = await getUserByUsername(username);
    if (checkUser) {
      res.send({
        name: "UserExistsError",
        message: `User ${username} is already taken.`,
        error: "Error making name",
      });
    }

    const user = await createUser({
      username,
      password,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );
    res.send({
      message: "thank you for signing up",
      token,
      user: user,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/users/login
router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.send({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }
  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign(user, process.env.JWT_SECRET);
      res.send({
        message: "you're logged in!",
        user: user,
        token: token,
      });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is  incorrect",
      });
    }
  } catch (error) {
    next(error);
  }
});
// GET /api/users/me
router.get("/me", async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (token) {
      console.log(req.user);
      res.send(req.user);
    } else {
      res.status(401).send({
        error: "No Token",
        message: "You must be logged in to perform this action",
        name: "No User Token",
      });
    }
  } catch (error) {
    next(error);
  }
});
// GET /api/users/:username/routines

router.get("/:username/routines", async (req, res) => {
  const username = req.params.username;
  let routines;

  if (req.user && req.user.username === username) {
    // Get all routines for the logged in user
    routines = getAllRoutinesByUser(username);
  } else {
    // Get public routines for the specified user
    routines = getPublicRoutinesByUser(username);
  }

  res.send({ routines });
});

module.exports = router;
