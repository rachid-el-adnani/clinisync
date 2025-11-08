const exercisesDAL = require('../dal/exercisesDAL');

class ExercisesController {
  /**
   * Get all exercises (system-wide + clinic-specific)
   */
  async getAllExercises(req, res) {
    try {
      const exercises = await exercisesDAL.findAll(req.tenantContext.clinicId);

      res.json({
        success: true,
        count: exercises.length,
        data: exercises
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create a new exercise (clinic-specific)
   */
  async createExercise(req, res) {
    try {
      const { name, description, instructions, video_url, image_url, body_part, difficulty } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Exercise name is required'
        });
      }

      const exerciseId = await exercisesDAL.create({
        clinic_id: req.tenantContext.clinicId,
        name,
        description,
        instructions,
        video_url,
        image_url,
        body_part,
        difficulty
      });

      const exercise = await exercisesDAL.findById(exerciseId);

      res.status(201).json({
        success: true,
        message: 'Exercise created successfully',
        data: exercise
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update exercise
   */
  async updateExercise(req, res) {
    try {
      const { id } = req.params;
      const { name, description, instructions, video_url, image_url, body_part, difficulty } = req.body;

      await exercisesDAL.update(id, { name, description, instructions, video_url, image_url, body_part, difficulty });

      const exercise = await exercisesDAL.findById(id);

      res.json({
        success: true,
        message: 'Exercise updated successfully',
        data: exercise
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ExercisesController();

