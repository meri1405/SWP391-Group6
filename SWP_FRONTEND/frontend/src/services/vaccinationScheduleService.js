import { parentApi } from "../api/parentApi";

/**
 * Service for handling vaccination schedule data operations
 */
export class VaccinationScheduleService {
  /**
   * Fetches all students and their vaccination data
   * @returns {Promise<{completed: Array, upcoming: Array}>}
   */
  static async fetchVaccinationData() {
    try {
      const students = await parentApi.getMyStudents();
      console.log("Students data:", students);
      console.log("First student structure:", students[0]);
      
      const completedVaccinations = await this.fetchCompletedVaccinations(students);
      const upcomingVaccinations = await this.fetchUpcomingVaccinations();

      console.log("Final completed vaccinations:", completedVaccinations);
      console.log("Final upcoming vaccinations:", upcomingVaccinations);
      
      return {
        completed: completedVaccinations,
        upcoming: upcomingVaccinations
      };
    } catch (error) {
      console.error("Error loading vaccination data:", error);
      throw new Error("Không thể tải dữ liệu lịch tiêm chủng. Vui lòng thử lại.");
    }
  }

  /**
   * Fetches completed vaccinations from students' health profiles
   * @param {Array} students - Array of student objects
   * @returns {Promise<Array>}
   */
  static async fetchCompletedVaccinations(students) {
    const allCompletedVaccinations = [];

    for (const student of students) {
      try {
        console.log("Processing student:", student);
        const healthProfileData = await parentApi.getHealthProfilesByStudentId(student.id);
        console.log(`Health profile for student ${student.fullName}:`, healthProfileData);
        
        if (healthProfileData && healthProfileData.length > 0) {
          const healthProfile = healthProfileData[0];
          
          if (healthProfile.vaccinationHistory && healthProfile.vaccinationHistory.length > 0) {
            const studentVaccinations = this.mapVaccinationHistory(
              healthProfile.vaccinationHistory, 
              student
            );
            allCompletedVaccinations.push(...studentVaccinations);
          }
        }
      } catch (profileError) {
        console.error(`Error loading health profile for student ${student.fullName}:`, profileError);
      }
    }

    return allCompletedVaccinations;
  }

  /**
   * Fetches upcoming vaccinations from vaccination forms
   * @returns {Promise<Array>}
   */
  static async fetchUpcomingVaccinations() {
    try {
      const vaccinationForms = await parentApi.getVaccinationForms();
      console.log("Vaccination forms:", vaccinationForms);
      
      const confirmedForms = vaccinationForms.filter(form => 
        form.confirmationStatus === 'CONFIRMED' && 
        new Date(form.scheduledDate) > new Date()
      );
      
      return this.mapUpcomingVaccinations(confirmedForms);
    } catch (formsError) {
      console.error("Error loading vaccination forms:", formsError);
      return [];
    }
  }

  /**
   * Maps vaccination history data to the required format
   * @param {Array} vaccinationHistory - Raw vaccination history data
   * @param {Object} student - Student object
   * @returns {Array}
   */
  static mapVaccinationHistory(vaccinationHistory, student) {
    return vaccinationHistory.map(vaccination => ({
      id: `${student.id}-${vaccination.id}`,
      vaccine: `${vaccination.vaccineName}${vaccination.doseNumber ? ` (lần ${vaccination.doseNumber})` : ''}`,
      date: vaccination.dateOfVaccination,
      location: vaccination.placeOfVaccination,
      batchNumber: vaccination.manufacturer || '--',
      nextDue: null,
      status: "completed",
      studentName: student.fullName,
      studentClassName: student.className || '--',
      notes: vaccination.notes
    }));
  }

  /**
   * Maps upcoming vaccination forms to the required format
   * @param {Array} confirmedForms - Confirmed vaccination forms
   * @returns {Array}
   */
  static mapUpcomingVaccinations(confirmedForms) {
    return confirmedForms.map(form => ({
      id: form.id,
      vaccine: `${form.vaccineName}${form.doseNumber ? ` (lần ${form.doseNumber})` : ''}`,
      scheduledDate: form.scheduledDate,
      location: form.location,
      status: "scheduled",
      priority: "medium",
      studentName: form.studentFullName,
      studentClassName: form.studentClassName || '--',
      campaignName: form.campaignName,
      formId: form.id
    }));
  }
}
