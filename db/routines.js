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

    return routines;
  } catch (error) {
    console.error("Error getting routines!");
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT 
        routines.id, 
        routines."isPublic",
        routines."creatorId", 
        routines.name, 
        routines.goal, 
        users.username AS "creatorName" 
      FROM 
        routines 
      LEFT JOIN 
        users 
      ON 
        routines."creatorId" = users.id
      WHERE 
        routines."isPublic" = true
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

    return routines;
  } catch (error) {
    console.error("Error getting public routines!");
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
      SELECT 
        routines.id, 
        routines."isPublic",
        routines."creatorId", 
        routines.name, 
        routines.goal, 
        users.username AS "creatorName" 
      FROM 
        routines 
      LEFT JOIN 
        users 
      ON 
        routines."creatorId" = users.id
      WHERE 
        
        users.username = $1
    `,
      [username]
    );

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

    return routines;
  } catch (error) {
    console.error("Error getting routines for user!");
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    console.log(username);
    const { rows: routines } = await client.query(
      `
      SELECT 
        routines.id, 
        routines."isPublic",
        routines."creatorId", 
        routines.name, 
        routines.goal, 
        users.username AS "creatorName" 
      FROM 
        routines 
      LEFT JOIN 
        users 
      ON 
        routines."creatorId" = users.id
      WHERE 
        routines."isPublic" = true AND 
        users.username = $1
    `,
      [username]
    );

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
    console.log(routines);

    return routines;
  } catch (error) {
    console.error("Error getting public routines for user!");
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const routines = await getAllRoutines();

    return routines.filter((routine) => {
      return (
        routine.isPublic &&
        routine.activities.some((activity) => {
          return id === activity.id;
        })
      );
    });
  } catch (error) {
    console.error("Error Finding Routine by Activity");
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  let query = `UPDATE routines SET `;
  const setFields = [];
  const values = [id];
  let i = 2;

  if (fields.isPublic !== undefined) {
    setFields.push(`"isPublic" = $${i}`);
    values.push(fields.isPublic);
    i += 1;
  }

  if (fields.name !== undefined) {
    setFields.push(`name = $${i}`);
    values.push(fields.name);
    i += 1;
  }

  if (fields.goal !== undefined) {
    setFields.push(`goal = $${i}`);
    values.push(fields.goal);
    i += 1;
  }

  query += setFields.join(", ");
  query += ` WHERE id = $${1}`;

  await client.query(query, values);

  const {
    rows: [updatedRoutine],
  } = await client.query(
    `
      SELECT *
      FROM routines
      WHERE id = $1;
    `,
    [id]
  );

  return updatedRoutine;
}

async function destroyRoutine(id) {
  await client.query(
    `
      DELETE FROM routine_activities
      WHERE "routineId" = $1
    `,
    [id]
  );

  await client.query(
    `
      DELETE FROM routines
      WHERE id = $1
    `,
    [id]
  );
}

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
