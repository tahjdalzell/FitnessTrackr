const client = require("./client");

// database functions
async function createActivity({ name, description }) {
  try {
    const {
      rows: [activities],
    } = await client.query(
      `
      INSERT INTO activities(name, description) 
      VALUES($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `,
      [name, description]
    );

    return activities;
  } catch (error) {
    console.log("Error : Failed to create Activity");
  }
}

async function getAllActivities() {
  try {
    const { rows: activities } = await client.query(
      `SELECT *
      FROM activities;
      `
    );
    return activities;
  } catch (error) {
    console.error("Error retrieving all activities!", error);
  }
}

async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(`SELECT * FROM activities WHERE id = $1`, [id]);
    return activity;
  } catch (error) {
    console.error(`Error getting activity with id ${id}`);
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const {
      rows: [activity],
    } = await client.query(`SELECT * FROM activities WHERE name = $1`, [name]);

    return activity;
  } catch (error) {
    console.error(`Error retrieving activity by name: ${error.message}`);
    throw error;
  }
}

async function attachActivitiesToRoutines(routines) {
  try {
    const activities = await client.query(`SELECT * FROM activities`);

    const updatedRoutines = routines.map((routine) => {
      const routineActivities = activities.filter(
        (activity) => activity.routineId === routine.id
      );

      return {
        ...routine,
        activities: routineActivities,
      };
    });

    return updatedRoutines;
  } catch (error) {
    console.error(`Error attaching activities to routines: ${error.message}`);
    throw error;
  }
}

async function updateActivity({ id, ...fields }) {
  try {
    const setFields = Object.entries(fields)
      .map(([key], index) => `${key} = $${index + 2}`)
      .join(", ");

    const {
      rows: [updatedActivity],
    } = await client.query(
      `UPDATE activities SET ${setFields} WHERE id = $1 RETURNING *`,
      [id, ...Object.values(fields)]
    );

    return updatedActivity;
  } catch (error) {
    console.error(`Error updating activity: ${error.message}`);
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
