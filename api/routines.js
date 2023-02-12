const express = require("express");
const router = express.Router();
const { getAllPublicRoutines } = require("../db/routines");

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
router.post('/',(req,res)=>{
    if (!req.user) {
        res.status(401).send({messgae: 'You must be logged in to create a routine'})
    }
    // Get the routine data from the req body 
    

    const {name,description,exercises} =req.body

})

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
