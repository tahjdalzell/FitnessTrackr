const express = require("express");
const router = express.Router();
const { requireUser } = require("./utils");
const {
  getActivityById,
  getPublicRoutinesByActivity,
  getAllActivities,
  updateActivity,
  getActivityByName,
  createActivity,
} = require("../db");
// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
  try {
    const id = req.params.activityId;
    const activity = await getActivityById(id);
    console.log("CURRENT", id, activity);

    if (activity) {
      const routine = await getPublicRoutinesByActivity(activity);
      res.send(routine);
    } else {
      throw {
        error: "ErrorMissingActivity",
        name: "Missing Activity Error",
        message: `Activity ${id} not found`,
      };
    }
  } catch (error) {
    next(error);
  }
});
// GET /api/activities
router.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch (error) {
    console.error("error get activities/ endpoint", error);
    next(error);
  }
});

// POST /api/activities
router.post("/", requireUser, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const newActivity = await createActivity({ name, description });
    if (newActivity) {
      res.send(newActivity);
    } else {
      next({
        name: "DuplicateActivityError",
        message: `An activity with name ${name} already exists`,
      });
    }
  } catch (error) {
    console.error("error post activities/ endpoint", error);
  }
});

// PATCH /api/activities/:activityId
router.patch("/:activityId", requireUser, async (req, res, next) => {
  const id = req.params.activityId;
  const { name, description } = req.body;

  const modActivity = await updateActivity({ id, name, description });
  const existingActivity = await getActivityByName(name);

  if (modActivity) {
    res.send(modActivity);
  } else if (existingActivity && name === existingActivity.name) {
    next({
      error: "ErrorActivityExists",
      name: "Activity Exists Error",
      message: `An activity with name ${name} already exists`,
    });
  } else {
    next({
      error: "ErrorActivityNotFound",
      name: "Activity not found",
      message: `Activity ${id} not found`,
    });
  }
});
module.exports = router;
