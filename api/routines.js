const express = require("express");
const router = express.Router();
const { requireUser } = require("./utils");
const {
  getAllPublicRoutines,
  getRoutineById,
  destroyRoutine,
  createRoutine,
  updateRoutine,
} = require("../db/routines");
const { addActivityToRoutine } = require("../db/routine_activities");
// GET /api/routines
router.get("/", async (req, res) => {
  try {
    const routines = await getAllPublicRoutines();
    res.send(routines);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error retrieving routines!" });
  }
});

// POST /api/routines
router.post("/", async (req, res) => {
  try {
    const newRoutine = await createRoutine({
      creatorId: req.user.id,
      isPublic: req.body.isPublic,
      name: req.body.name,
      goal: req.body.goal,
    });
    res.send(newRoutine);
  } catch (error) {
    res.status(500).send({
      error: "Error Creating Routine",
      message: "You must be logged in to perform this action",
      name: "ROUTINE ERROR",
    });
  }
});

// PATCH /api/routines/:routineId
router.patch("/:routineId", requireUser, async (req, res, next) => {
  console.log("did i get here");
  try {
    // const auth = req.headers.authorization;
    // if (!auth) {
    //   return res.status(401).send({
    //     error: "No Token",
    //     message: "You must be logged in to perform this action",
    //     name: "No User Token",
    //   });
    // }
    const id = req.params.routineId;
    const fields = req.body;
    console.log(fields);
    const userId = req.user.id;

    console.log(id);
    const routine = await getRoutineById(id);
    console.log(routine);
    if (routine.creatorId !== userId) {
      res.status(403);  
      next({
        error: "ERROR 403",
        name: "CAN EDIT",
        message: `User ${req.user.username} is not allowed to update Every day`,
      });
    }

    const updatedRoutine = await updateRoutine({ id, ...fields });
    console.log(updateRoutine);
    res.send(updatedRoutine);
  } catch (error) {
    next(error);
  }
});
// DELETE /api/routines/:routineId
router.delete("/:routineId", requireUser, async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const routine = await getRoutineById(routineId);
    const username = req.user.username;

    if (routine && routine.creatorId === req.user.id) {
      await destroyRoutine(routineId);

      res.send({ success: true, ...routine });
    } else {
      res.status(403);
      throw routine
        ? {
            name: "UnauthorizedUserError",
            message: `User ${username} is not allowed to delete On even days`,
          }
        : {
            name: "RoutineNotFound",
            message: "Routine does not exist",
          };
    }
  } catch (error) {
    next(error);
  }
});
// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", async (req, res, next) => {
  try {
    const routineId = req.params.routineId;
    const { activityId, count, duration } = req.body;
    const getActToRoutine = await addActivityToRoutine({
      routineId,
      activityId,
      count,
      duration,
    });

    if (!getActToRoutine) {
      throw {
        error: "error",
        name: "No duplication!",
        message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
      };
    } else {
      res.send(getActToRoutine);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
