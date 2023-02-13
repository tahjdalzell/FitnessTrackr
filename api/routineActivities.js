const express = require("express");
const {
  canEditRoutineActivity,
  updateRoutineActivity,
  destroyRoutineActivity,
} = require("../db/routine_activities");
const router = express.Router();
const { requireUser } = require("./utils");
// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", requireUser, async (req, res, next) => {
  try {
    const id = req.params.routineActivityId;
    const { count, duration } = req.body;
    const username = req.user.username;
    const userId = req.user.id;

    const editRoutineAct = await canEditRoutineActivity(id, userId);
    if (!editRoutineAct) {
      res.status(403).send({
        error: "Forbidden",
        message: `User ${username} is not allowed to update In the evening`,
        name: "user",
      });
    }
    const modifyRoutineAct = await updateRoutineActivity({
      id,
      duration,
      count,
    });

    if (modifyRoutineAct) {
      res.send(modifyRoutineAct);
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
  const id = req.params.routineActivityId;
  const userId = req.user.id;
  const editRA = await canEditRoutineActivity(id, userId);
  const username = req.user.username;

  try {
    if (!editRA) {
      res.status(403);
      throw !editRA
        ? {
            name: "UnauthorizedUserError",
            message: `User ${username} is not allowed to delete In the afternoon`,
          }
        : {
            name: "RoutineNotFound",
            message: "Routine does not exist",
          };
    } else {
      await destroyRoutineActivity(id);
      res.send({ success: true, ...editRA });
    }
  } catch (error) {
    next(error);
  }
});
module.exports = router;
