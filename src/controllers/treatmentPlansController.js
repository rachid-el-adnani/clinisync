const treatmentPlansDAL = require('../dal/treatmentPlansDAL');
const exercisesDAL = require('../dal/exercisesDAL');
const progressNotesDAL = require('../dal/progressNotesDAL');

class TreatmentPlansController {
  /**
   * Create a new treatment plan
   */
  async createTreatmentPlan(req, res) {
    try {
      const { patient_id, therapist_id, title, diagnosis, start_date, end_date, notes, goals } = req.body;

      if (!patient_id || !therapist_id || !title || !start_date) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: patient_id, therapist_id, title, start_date'
        });
      }

      const treatmentPlanId = await treatmentPlansDAL.create({
        clinic_id: req.tenantContext.clinicId,
        patient_id,
        therapist_id,
        title,
        diagnosis,
        start_date,
        end_date,
        notes
      });

      // Add goals if provided
      if (goals && Array.isArray(goals)) {
        for (const goal of goals) {
          await treatmentPlansDAL.addGoal({
            treatment_plan_id: treatmentPlanId,
            goal_text: goal.goal_text,
            target_date: goal.target_date,
            notes: goal.notes
          });
        }
      }

      const treatmentPlan = await treatmentPlansDAL.findById(treatmentPlanId, req.tenantContext);

      res.status(201).json({
        success: true,
        message: 'Treatment plan created successfully',
        data: treatmentPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all treatment plans
   */
  async getTreatmentPlans(req, res) {
    try {
      const { patient_id, status } = req.query;
      const filters = {};

      if (patient_id) filters.patient_id = patient_id;
      if (status) filters.status = status;

      const treatmentPlans = await treatmentPlansDAL.findAll(req.tenantContext, filters);

      res.json({
        success: true,
        count: treatmentPlans.length,
        data: treatmentPlans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get treatment plan by ID with goals and exercises
   */
  async getTreatmentPlanById(req, res) {
    try {
      const { id } = req.params;

      const treatmentPlan = await treatmentPlansDAL.findById(id, req.tenantContext);

      if (!treatmentPlan) {
        return res.status(404).json({
          success: false,
          message: 'Treatment plan not found'
        });
      }

      // Get goals
      const goals = await treatmentPlansDAL.getGoals(id);

      // Get prescribed exercises
      const exercises = await exercisesDAL.getPrescribedExercises(id);

      // Get progress notes
      const progressNotes = await progressNotesDAL.findByTreatmentPlanId(id, req.tenantContext);

      res.json({
        success: true,
        data: {
          ...treatmentPlan,
          goals,
          exercises,
          progressNotes
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update treatment plan
   */
  async updateTreatmentPlan(req, res) {
    try {
      const { id } = req.params;
      const { title, diagnosis, end_date, status, notes } = req.body;

      await treatmentPlansDAL.update(id, { title, diagnosis, end_date, status, notes }, req.tenantContext);

      const updatedPlan = await treatmentPlansDAL.findById(id, req.tenantContext);

      res.json({
        success: true,
        message: 'Treatment plan updated successfully',
        data: updatedPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Add goal to treatment plan
   */
  async addGoal(req, res) {
    try {
      const { treatment_plan_id } = req.params;
      const { goal_text, target_date, notes } = req.body;

      if (!goal_text) {
        return res.status(400).json({
          success: false,
          message: 'goal_text is required'
        });
      }

      const goalId = await treatmentPlansDAL.addGoal({
        treatment_plan_id,
        goal_text,
        target_date,
        notes
      });

      res.status(201).json({
        success: true,
        message: 'Goal added successfully',
        data: { id: goalId }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update goal
   */
  async updateGoal(req, res) {
    try {
      const { goal_id } = req.params;
      const { goal_text, target_date, is_achieved, notes } = req.body;

      await treatmentPlansDAL.updateGoal(goal_id, { goal_text, target_date, is_achieved, notes });

      res.json({
        success: true,
        message: 'Goal updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Prescribe exercise to treatment plan
   */
  async prescribeExercise(req, res) {
    try {
      const { treatment_plan_id } = req.params;
      const { exercise_id, sets, reps, frequency_per_week, instructions } = req.body;

      if (!exercise_id) {
        return res.status(400).json({
          success: false,
          message: 'exercise_id is required'
        });
      }

      const prescribedId = await exercisesDAL.prescribeExercise({
        treatment_plan_id,
        exercise_id,
        sets,
        reps,
        frequency_per_week,
        instructions
      });

      res.status(201).json({
        success: true,
        message: 'Exercise prescribed successfully',
        data: { id: prescribedId }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create progress note
   */
  async createProgressNote(req, res) {
    try {
      const { session_id, patient_id, treatment_plan_id, subjective, objective, assessment, plan, pain_level } = req.body;

      if (!session_id || !patient_id) {
        return res.status(400).json({
          success: false,
          message: 'session_id and patient_id are required'
        });
      }

      const noteId = await progressNotesDAL.create({
        clinic_id: req.tenantContext.clinicId,
        session_id,
        patient_id,
        therapist_id: req.user.id,
        treatment_plan_id,
        subjective,
        objective,
        assessment,
        plan,
        pain_level
      });

      res.status(201).json({
        success: true,
        message: 'Progress note created successfully',
        data: { id: noteId }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get progress notes for a patient
   */
  async getProgressNotes(req, res) {
    try {
      const { patient_id } = req.params;

      const notes = await progressNotesDAL.findByPatientId(patient_id, req.tenantContext);

      res.json({
        success: true,
        count: notes.length,
        data: notes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TreatmentPlansController();

