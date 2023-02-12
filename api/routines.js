const express = require("express");
const router = express.Router();
const { getAllPublicRoutines } = require("../db/routines");

// GET /api/routines
router.get("/routines", async (req, res) => {
  try {
    const routines = await getAllPublicRoutines();
    res.send(routines);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error retrieving routines!" });
  }
});

// POST /api/routines

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
