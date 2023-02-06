/* eslint-disable no-useless-catch */
const client = require("./client");

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routineActivities],
    } = await client.query(
      `INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
      `,
      [routineId, activityId, count, duration]
    );

    return routineActivities;
  } catch (error) {
    console.error("Error adding activity to routine!");
    throw error;
  }
}

async function getRoutineActivityById(id) {
  // eslint-disable-next-line no-useless-catch
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
      SELECT * FROM routine_activities
      WHERE id = $1;
    `,
      [id]
    );

    return routineActivity;
  } catch (error) {
    console.error("Error getting routine activity by ID!");
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const { rows: routineActivities } = await client.query(
      `
      SELECT * FROM routine_activities
      WHERE "routineId" = $1;
    `,
      [id]
    );

    return routineActivities;
  } catch (error) {
    console.error("Error getting Activites by Routine");
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try {
    const setFields = Object.entries(fields)
      .map(([key], index) => `${key} = $${index + 2}`)
      .join(", ");
    const {
      rows: [updatedRoutineActivity],
    } = await client.query(
      `UPDATE routine_activities SET ${setFields} WHERE id = $1 RETURNING *`,
      [id, ...Object.values(fields)]
    );
    return updatedRoutineActivity;
  } catch (error) {
    console.error("Error updating routine activity!");
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {
      rows: [deletedRoutineActivity],
    } = await client.query(
      `DELETE FROM routine_activities WHERE id = $1 RETURNING *`,
      [id]
    );
    return deletedRoutineActivity;
  } catch (error) {
    console.error("Error deleting routine activity!");
    throw error;
  }
}
async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(`SELECT * FROM routine_activities WHERE id = $1;`, [
      routineActivityId,
    ]);
    // Assuming that a routine activity is editable if the user who created it is the same as the user who wants to edit it.
    const canEdit = routineActivity.id === userId;
    return canEdit;
  } catch (error) {
    console.error("Error Editing Routine Activity");
    throw error;
  }
}
module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
