import api from "@/api/api";
import { getUser } from "@/lib/tokenStorage";

export const skillAssessmentService = {
  // Create and immediately submit the assessment in one call
  async submitAssessment(data) {
    try {
      const user = getUser();
      const employeeId = data.employee_id ?? user?.employee_id;

      if (!employeeId) {
        throw new Error(
          "No employee_id found. Make sure the user is logged in and linked to an employee record.",
        );
      }

      const response = await api.post("/skill-assessments", {
        employee_id: employeeId,
        scores: data.scores,
      });

      return {
        success: true,
        data: response.data,
        id: response.data?.data?.id,
      };
    } catch (error) {
      console.error("Error submitting assessment:", error);
      throw error;
    }
  },

  // Get assessments for current logged-in employee
  async getMyAssessments() {
    try {
      const user = getUser();
      const employeeId = user?.employee_id;

      if (!employeeId) {
        throw new Error("No employee_id found for current user.");
      }

      const response = await api.get(
        `/skill-assessments?employee_id=${employeeId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching assessments:", error);
      throw error;
    }
  },

  // Get a specific assessment
  async getAssessment(id) {
    try {
      const response = await api.get(`/skill-assessments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching assessment:", error);
      throw error;
    }
  },

  // Get assessments by employee ID
  async getAssessmentsByEmployee(employeeId) {
    try {
      const response = await api.get(
        `/skill-assessments?employee_id=${employeeId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching employee assessments:", error);
      throw error;
    }
  },

  // Check if employee already has a completed assessment
  async hasCompletedAssessment(employeeId) {
    try {
      const response = await api.get(
        `/skill-assessments?employee_id=${employeeId}&status=done`,
      );
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data.length > 0 : (data?.total ?? 0) > 0;
    } catch (error) {
      console.error("Error checking completed assessment:", error);
      return false;
    }
  },

  // Get skill gap analysis for an assessment
  async generateSkillGapAnalysis(assessmentId) {
    try {
      const response = await api.get(`/skill-gap-analysis/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error generating gap analysis:", error);
      throw error;
    }
  },

  // Export assessment report
  async exportAssessment(assessmentId) {
    try {
      const response = await api.get(
        `/skill-gap-analysis/export/${assessmentId}`,
        { responseType: "blob" },
      );
      return response.data;
    } catch (error) {
      console.error("Error exporting assessment:", error);
      throw error;
    }
  },

  // Create development plans from assessment
  async createDevelopmentPlans(assessmentId) {
    try {
      const response = await api.post(
        `/skill-gap-analysis/${assessmentId}/create-plans`,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating development plans:", error);
      throw error;
    }
  },
};
