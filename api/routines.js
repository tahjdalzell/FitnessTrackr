const express = require("express");
const router = express.Router();
const {
  getAllPublicRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
} = require("../db/routines");

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
router.patch("/:routineId", async (req, res, next) => {
  try {
    const { routineId } = req.params;
    const routineToUpdate = await getRoutineById(routineId);

    if (!routineToUpdate) {
      return res.status(404).send({ error: "Routine not found" });
    }

    if (!req.user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    if (routineToUpdate.creatorId !== req.user.id) {
      return res.status(403).send({ error: "Forbidden" });
    }

    const updatedRoutine = await updateRoutine(routineId, req.body);
    res.status(200).send(updatedRoutine);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
