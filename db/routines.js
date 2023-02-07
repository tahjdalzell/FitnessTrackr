const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routines],
    } = await client.query(
      `INSERT INTO routines ("creatorId","isPublic",name, goal)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [creatorId, isPublic, name, goal]
    );
    return routines;
  } catch (error) {
    console.error("Error creating routine!");
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(`SELECT * FROM routines WHERE id = $1;`[id]);
    return routine;
  } catch (error) {
    console.error("Error getting Routine by Id");
    throw error;
  }
}
async function getRoutinesWithoutActivities() {
  try {
    const { rows: routines } = await client.query(
      `SELECT *
      FROM routines
      WHERE id NOT IN (
        SELECT "routineId"
        FROM routine_activities
      );
      `
    );
    return routines;
  } catch (error) {
    console.error("Error retrieving routines without activities!");
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT 
        routines.id, 
        routines."creatorId", 
        routines."isPublic", 
        routines.name, 
        routines.goal, 
        users.username AS "creatorName" 
      FROM 
        routines 
      LEFT JOIN 
        users 
      ON 
        routines."creatorId" = users.id
    `);

    const { rows: routineActivities } = await client.query(`
      SELECT 
        routine_activities.id AS "routineActivityId", 
        routine_activities."routineId", 
        routine_activities."activityId"
        AS id, 
        routine_activities.duration, 
        routine_activities.count, 
        activities.name, 
        activities.description
      FROM 
        routine_activities 
      LEFT JOIN 
        activities 
      ON 
        routine_activities."activityId" = activities.id
    `);

    routines.forEach((routine) => {
      routine.activities = routineActivities.filter(
        (routineActivity) => routineActivity.routineId === routine.id
      );
    });
    // console.log("db", routines);

    return routines;
  } catch (error) {
    console.error("Error getting routines!");
    throw error;
  }
}

async function getAllPublicRoutines() {}

async function getAllRoutinesByUser({ username }) {}

async function getPublicRoutinesByUser({ username }) {}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
