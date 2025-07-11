import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { parentApi } from "../../../api/parentApi";
import "../../../styles/HealthCheckResults.css";

const HealthCheckResults = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [healthCheckResults, setHealthCheckResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("history"); // "history", "table", "detail"
  const [selectedResult, setSelectedResult] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistoryData, setFilteredHistoryData] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    dateRange: "all", // "all", "last30", "last90", "lastYear"
  });
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [selectedTooltip, setSelectedTooltip] = useState(null);
  const { getToken } = useAuth();

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedTooltip && !event.target.closest(".result-summary")) {
        setSelectedTooltip(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedTooltip]);

  // Helper function to convert array date format to ISO string
  const convertArrayDateToISO = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) {
      return new Date().toISOString();
    }

    try {
      // Format: [year, month, day, hour, minute, second, nanoseconds]
      const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] =
        dateArray;

      // Month is 1-based in the array but 0-based in JavaScript Date
      const jsDate = new Date(
        year,
        month - 1,
        day,
        hour,
        minute,
        second,
        Math.floor(nano / 1000000)
      );

      return jsDate.toISOString();
    } catch (error) {
      console.error("Error converting date array:", dateArray, error);
      return new Date().toISOString();
    }
  };

  // Debug function to test API directly
  const testBackendData = async () => {
    try {
      const token = getToken();
      console.log("=== TESTING BACKEND DATA ===");
      console.log("Token:", token ? "Present" : "Missing");

      // Test 1: Get students
      console.log("1. Testing getMyStudents...");
      const studentsResponse = await parentApi.getMyStudents(token);
      console.log("Students response:", studentsResponse);

      setDebugInfo((prev) => ({
        ...prev,
        students: studentsResponse,
        studentsCount: studentsResponse?.length || 0,
      }));

      if (studentsResponse && studentsResponse.length > 0) {
        const firstStudent = studentsResponse[0];
        const studentId = firstStudent.id || firstStudent.studentID;

        console.log("2. Testing health check results for student:", studentId);
        console.log("Full student object:", firstStudent);

        // Test 2: Get health check results
        try {
          const healthCheckResponse =
            await parentApi.getAllHealthCheckResultsForStudent(
              studentId,
              token
            );
          console.log("Health check response:", healthCheckResponse);

          setDebugInfo((prev) => ({
            ...prev,
            healthCheckResponse: healthCheckResponse,
            campaignCount: healthCheckResponse?.campaignResults?.length || 0,
            totalResults: healthCheckResponse?.totalResults || 0,
          }));
        } catch (healthCheckError) {
          console.error("Health check error:", healthCheckError);
          console.error("Error response:", healthCheckError.response?.data);
          console.error("Error status:", healthCheckError.response?.status);
          setDebugInfo((prev) => ({
            ...prev,
            healthCheckError: healthCheckError.message,
            healthCheckErrorDetails: healthCheckError.response?.data,
            healthCheckErrorStatus: healthCheckError.response?.status,
          }));
        }

        // Test 3: Check if parent profile endpoint works (basic connectivity test)
        console.log("3. Testing basic parent API connectivity...");
        try {
          const profileResponse = await fetch(`/api/parent/profile`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log("Parent profile API status:", profileResponse.status);
          const profileText = await profileResponse.text();
          console.log(
            "Parent profile response (first 500 chars):",
            profileText.substring(0, 500)
          );

          setDebugInfo((prev) => ({
            ...prev,
            parentProfileStatus: profileResponse.status,
            parentProfileWorking: profileResponse.status === 200,
          }));
        } catch (profileError) {
          console.error("Parent profile API error:", profileError);
          setDebugInfo((prev) => ({
            ...prev,
            parentProfileError: profileError.message,
          }));
        }

        // Test 4: Direct API call to debug the exact endpoint
        console.log("4. Testing direct health check API call...");
        try {
          const response = await fetch(
            `/api/parent/health-check/students/${studentId}/results`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Direct API response status:", response.status);
          console.log(
            "Direct API response headers:",
            Object.fromEntries(response.headers.entries())
          );
          console.log(
            "Direct API response content-type:",
            response.headers.get("content-type")
          );

          // Get raw text first to avoid JSON parsing errors
          const responseText = await response.text();
          console.log("Direct API response text length:", responseText.length);
          console.log(
            "Direct API response text (first 1000 chars):",
            responseText.substring(0, 1000)
          );
          console.log(
            "Direct API response text (last 1000 chars):",
            responseText.substring(Math.max(0, responseText.length - 1000))
          );

          let responseData;
          try {
            responseData = JSON.parse(responseText);
            console.log("Successfully parsed JSON:", responseData);
          } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError.message);
            console.log("Response is not valid JSON. Raw text:", responseText);

            // Try to extract valid JSON from the beginning of corrupted response
            try {
              console.log(
                "Attempting to extract valid JSON from corrupted response..."
              );

              // Look for the error message at the end to find where valid JSON ends
              const errorMessageIndex = responseText.lastIndexOf(
                '{"success":false,"error"'
              );
              if (errorMessageIndex > 0) {
                // Extract JSON before the error message
                let validJsonPart = responseText.substring(
                  0,
                  errorMessageIndex
                );

                // Remove trailing incomplete JSON by finding last complete object
                let bracketCount = 0;
                let lastValidIndex = -1;

                for (let i = 0; i < validJsonPart.length; i++) {
                  if (validJsonPart[i] === "{") bracketCount++;
                  if (validJsonPart[i] === "}") {
                    bracketCount--;
                    if (bracketCount === 0) {
                      lastValidIndex = i;
                    }
                  }
                }

                if (lastValidIndex > 0) {
                  const cleanJson = validJsonPart.substring(
                    0,
                    lastValidIndex + 1
                  );
                  console.log("Extracted clean JSON length:", cleanJson.length);
                  console.log(
                    "Clean JSON preview:",
                    cleanJson.substring(0, 500)
                  );

                  responseData = JSON.parse(cleanJson);
                  console.log(
                    "Successfully parsed extracted JSON:",
                    responseData
                  );
                } else {
                  throw new Error("Could not extract valid JSON");
                }
              } else {
                throw new Error("No error message marker found");
              }
            } catch (extractError) {
              console.error(
                "Failed to extract valid JSON:",
                extractError.message
              );
              responseData = {
                error: "Corrupted JSON response",
                originalError: jsonError.message,
                extractError: extractError.message,
                rawText: responseText.substring(0, 2000),
              };
            }
          }

          setDebugInfo((prev) => ({
            ...prev,
            directApiResponse: responseData,
            directApiStatus: response.status,
            directApiContentType: response.headers.get("content-type"),
            directApiResponseLength: responseText.length,
          }));
        } catch (directError) {
          console.error("Direct API error:", directError);
          setDebugInfo((prev) => ({
            ...prev,
            directApiError: directError.message,
          }));
        }
      }
    } catch (error) {
      console.error("Test backend error:", error);
      setDebugInfo((prev) => ({
        ...prev,
        error: error.message,
      }));
    }
  };

  // Function to simulate sample data for testing display
  const loadSampleData = () => {
    const sampleData = [
      {
        id: "sample_1",
        studentId: selectedStudent?.id || selectedStudent?.studentID,
        campaignId: "campaign_1",
        campaignName: "Khám sức khỏe định kỳ 2024",
        campaignLocation: "Phòng y tế trường",
        category: "HEARING",
        status: "MINOR_CONCERN",
        isAbnormal: true,
        weight: 45,
        height: 150,
        bmi: 20.0,
        resultNotes: "Học sinh có dấu hiệu giảm thính lực nhẹ ở tai phải",
        recommendations: "Nên theo dõi thêm và kiểm tra lại sau 3 tháng",
        performedAt: new Date().toISOString(),
        nurseName: "Y tá Nguyễn Thị Lan",
        campaignStartDate: "2024-01-15",
        campaignEndDate: "2024-01-20",
        campaignDescription: "Đợt khám sức khỏe định kỳ đầu năm học",
        checkupType: "Khám thính lực",
      },
      {
        id: "sample_2",
        studentId: selectedStudent?.id || selectedStudent?.studentID,
        campaignId: "campaign_1",
        campaignName: "Khám sức khỏe định kỳ 2024",
        campaignLocation: "Phòng y tế trường",
        category: "VISION",
        status: "NORMAL",
        isAbnormal: false,
        weight: 45,
        height: 150,
        bmi: 20.0,
        resultNotes: "Thị lực bình thường, không cần điều chỉnh",
        recommendations: null,
        performedAt: new Date().toISOString(),
        nurseName: "Y tá Nguyễn Thị Lan",
        campaignStartDate: "2024-01-15",
        campaignEndDate: "2024-01-20",
        campaignDescription: "Đợt khám sức khỏe định kỳ đầu năm học",
        checkupType: "Khám thị lực",
      },
    ];

    console.log("Loading sample data:", sampleData);
    setHistoryData(sampleData);
    setFilteredHistoryData(sampleData);

    // Create fake campaign results
    const sampleCampaignResults = [
      {
        campaign: {
          id: "campaign_1",
          name: "Khám sức khỏe định kỳ 2024",
          location: "Phòng y tế trường",
          startDate: "2024-01-15",
          endDate: "2024-01-20",
          description: "Đợt khám sức khỏe định kỳ đầu năm học",
        },
        categoryResults: {
          sample_1: sampleData[0],
          sample_2: sampleData[1],
        },
        hasResults: true,
      },
    ];

    setHealthCheckResults(sampleCampaignResults);

    setDebugInfo((prev) => ({
      ...prev,
      totalResults: sampleData.length,
      campaignCount: 1,
      healthCheckError: null,
      sampleDataLoaded: true,
    }));
  };

  const loadHealthCheckResults = useCallback(
    async (studentId) => {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();

        console.log("=== DEBUG: Loading health check results ===");
        console.log("Student ID:", studentId);
        console.log("Token:", token ? "Present" : "Missing");

        let response;
        try {
          response = await parentApi.getAllHealthCheckResultsForStudent(
            studentId,
            token
          );
        } catch (apiError) {
          console.error("API Error:", apiError);
          // If it's a JSON parsing error, try direct fetch with our workaround
          if (apiError.message && apiError.message.includes("JSON")) {
            console.log(
              "JSON parsing error detected, trying direct approach..."
            );
            try {
              const directResponse = await fetch(
                `/api/parent/health-check/students/${studentId}/results`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              const directText = await directResponse.text();

              // Use our JSON extraction logic
              const errorMessageIndex = directText.lastIndexOf(
                '{"success":false,"error"'
              );
              if (errorMessageIndex > 0) {
                let validJsonPart = directText.substring(0, errorMessageIndex);
                let bracketCount = 0;
                let lastValidIndex = -1;

                for (let i = 0; i < validJsonPart.length; i++) {
                  if (validJsonPart[i] === "{") bracketCount++;
                  if (validJsonPart[i] === "}") {
                    bracketCount--;
                    if (bracketCount === 0) lastValidIndex = i;
                  }
                }

                if (lastValidIndex > 0) {
                  const cleanJson = validJsonPart.substring(
                    0,
                    lastValidIndex + 1
                  );
                  response = JSON.parse(cleanJson);
                  console.log(
                    "Successfully extracted response from corrupted JSON"
                  );
                } else {
                  throw apiError;
                }
              } else {
                throw apiError;
              }
            } catch (directError) {
              console.error("Direct fetch also failed:", directError);
              throw apiError;
            }
          } else {
            throw apiError;
          }
        }

        console.log("=== DEBUG: API Response ===");
        console.log("Full response:", response);

        // Handle different response structures
        let campaignResults = [];
        let totalResults = 0;

        if (response) {
          // New structure with campaignResults
          if (
            response.campaignResults &&
            Array.isArray(response.campaignResults)
          ) {
            campaignResults = response.campaignResults;
            totalResults = response.totalResults || 0;
          }
          // Fallback: direct array of results
          else if (Array.isArray(response)) {
            campaignResults = response;
            totalResults = response.length;
          }
          // Fallback: single campaign result
          else if (response.campaign || response.categoryResults) {
            campaignResults = [response];
            totalResults = 1;
          }
        }

        console.log("=== DEBUG: Processed response structure ===");
        console.log("Campaign results:", campaignResults);
        console.log("Total results:", totalResults);

        console.log("=== DEBUG: Processing results ===");
        console.log("Campaign results length:", campaignResults.length);
        console.log("Total results from API:", totalResults);

        console.log("=== FINAL PROCESSING RESULTS ===");
        console.log("About to set healthCheckResults:", campaignResults);
        setHealthCheckResults(campaignResults);

        // Create comprehensive history data
        const history = [];

        console.log("=== About to process campaign results ===");
        campaignResults.forEach((campaignResult, index) => {
          console.log(`Processing campaign ${index + 1}:`, campaignResult);

          // Handle different campaign result structures
          let campaign = campaignResult.campaign || campaignResult;
          let categoryResults =
            campaignResult.categoryResults || campaignResult.results || {};
          let overallResults = campaignResult.overallResults || {};

          console.log("Processing campaign structure:");
          console.log("- Campaign info:", campaign);
          console.log("- Category results:", categoryResults);
          console.log("- Overall results:", overallResults);

          // If campaign info is missing, create a default one
          if (!campaign.name && !campaign.title) {
            campaign = {
              id: `campaign_${index}`,
              name: "Đợt khám sức khỏe",
              location: "Phòng y tế trường",
              description: "Khám sức khỏe định kỳ",
              startDate: null,
              endDate: null,
            };
          }

          // If no category results but we have direct result data
          if (
            Object.keys(categoryResults).length === 0 &&
            campaignResult.status
          ) {
            categoryResults = {
              [campaignResult.id || "general"]: campaignResult,
            };
          }

          if (Object.keys(categoryResults).length > 0) {
            console.log("Processing category results:", categoryResults);

            Object.entries(categoryResults).forEach(
              ([categoryName, result]) => {
                console.log(`Processing category ${categoryName}:`, result);

                // Extract basic health metrics
                let weight = result.weight || overallResults.weight || null;
                let height = result.height || overallResults.height || null;

                // Try to get height/weight from nested health profile
                if (result.hearingDetails?.healthProfile) {
                  weight = weight || result.hearingDetails.healthProfile.weight;
                  height = height || result.hearingDetails.healthProfile.height;
                }

                const bmi =
                  result.bmi ||
                  overallResults.bmi ||
                  (weight && height
                    ? weight / Math.pow(height / 100, 2)
                    : null);

                // Convert date format
                const performedAt = result.performedAt
                  ? convertArrayDateToISO(result.performedAt)
                  : new Date().toISOString();

                // Extract category-specific information
                let resultNotes = "";
                let recommendations = "";
                let doctorName = "";

                if (categoryName === "HEARING" && result.hearingDetails) {
                  const hearing = result.hearingDetails;
                  resultNotes = `Tai trái: ${
                    hearing.leftEar || "N/A"
                  }dB, Tai phải: ${hearing.rightEar || "N/A"}dB`;
                  recommendations = hearing.recommendations || "";
                  doctorName = hearing.doctorName || "";

                  if (hearing.description) {
                    resultNotes += `. ${hearing.description}`;
                  }
                }

                // Determine status based on isAbnormal flag
                let status = "NORMAL";
                if (result.isAbnormal === true) {
                  status = "ABNORMAL";
                } else if (result.isAbnormal === false) {
                  status = "NORMAL";
                }

                const historyItem = {
                  id: `${categoryName}_${studentId}_${Date.now()}`,
                  studentId: studentId,
                  campaignId: campaign.id || campaign.campaignId || "unknown",
                  campaignName:
                    campaign.name || campaign.title || "Đợt khám sức khỏe",
                  campaignLocation: campaign.location || "Phòng y tế trường",
                  category: categoryName,
                  status: status,
                  isAbnormal: result.isAbnormal || false,
                  weight: weight,
                  height: height,
                  bmi: bmi,
                  resultNotes:
                    resultNotes || result.notes || result.description || "",
                  recommendations:
                    recommendations ||
                    result.recommendations ||
                    result.recommendation ||
                    "",
                  performedAt: performedAt,
                  nurseName:
                    result.nurseName ||
                    result.nurseFullName ||
                    overallResults.nurseName ||
                    "",
                  doctorName: doctorName,

                  // Category-specific details (keep the raw data for detailed view)
                  visionDetails: result.visionDetails,
                  hearingDetails: result.hearingDetails,
                  oralDetails: result.oralDetails,
                  skinDetails: result.skinDetails,
                  respiratoryDetails: result.respiratoryDetails,

                  // Overall campaign info
                  campaignStartDate: campaign.startDate
                    ? convertArrayDateToISO(campaign.startDate)
                    : null,
                  campaignEndDate: campaign.endDate
                    ? convertArrayDateToISO(campaign.endDate)
                    : null,
                  campaignDescription: campaign.description || "",

                  // Additional fields for better display
                  overallStatus:
                    result.overallStatus || campaign.status || status,
                  checkupType: `Khám ${
                    categoryName === "HEARING"
                      ? "thính lực"
                      : categoryName === "VISION"
                      ? "thị lực"
                      : categoryName === "ORAL"
                      ? "răng miệng"
                      : categoryName === "SKIN"
                      ? "da liễu"
                      : categoryName === "RESPIRATORY"
                      ? "hô hấp"
                      : "tổng quát"
                  }`,
                };

                console.log("Created history item:", historyItem);
                console.log("Pushing history item for category:", categoryName);
                history.push(historyItem);
              }
            );
          } else {
            console.log(
              "No category results, creating general entry for campaign:",
              campaign.name
            );

            // Create a general entry even if no specific results
            history.push({
              id: campaign.id || "campaign_" + index,
              studentId: studentId,
              campaignId: campaign.id || campaign.campaignId,
              campaignName:
                campaign.name || campaign.title || "Đợt khám sức khỏe",
              campaignLocation: campaign.location || "Trường học",
              category: "GENERAL",
              status: campaign.status || "PENDING",
              isAbnormal: false,
              weight: overallResults.weight,
              height: overallResults.height,
              bmi: overallResults.bmi,
              resultNotes: "Chưa có kết quả chi tiết",
              recommendations: null,
              performedAt: campaign.createdAt || new Date().toISOString(),
              nurseName: overallResults.nurseName,
              campaignStartDate: campaign.startDate,
              campaignEndDate: campaign.endDate,
              campaignDescription: campaign.description,
              overallStatus: campaign.status,
              checkupType: "Khám tổng quát",
            });
          }
        });

        console.log("=== DEBUG: Final history data ===");
        console.log("History length:", history.length);
        console.log("History data:", history);

        // Sort by performed date (newest first)
        history.sort(
          (a, b) => new Date(b.performedAt) - new Date(a.performedAt)
        );

        setHistoryData(history);
        setFilteredHistoryData(history);

        // Update debug info
        setDebugInfo((prev) => ({
          ...prev,
          healthCheckResponse: response,
          campaignCount: campaignResults.length,
          totalResults: history.length,
          processedHistory: history,
        }));

        console.log("=== DEBUG: State updated ===");
        console.log("History data set:", history.length, "items");
        console.log(
          "Health check results set:",
          campaignResults.length,
          "campaigns"
        );
        console.log("Setting historyData state with:", history);
        console.log("Setting filteredHistoryData state with:", history);
      } catch (error) {
        console.error("=== DEBUG: Error loading health check results ===");
        console.error("Error details:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        setError("Không thể tải kết quả khám sức khỏe");
        setHealthCheckResults([]);
        setHistoryData([]);
        setFilteredHistoryData([]);

        setDebugInfo((prev) => ({
          ...prev,
          healthCheckError: error.message,
          totalResults: 0,
          campaignCount: 0,
        }));
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  // Filter history data based on filters
  useEffect(() => {
    let filtered = [...historyData];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "last30":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "last90":
          filterDate.setDate(now.getDate() - 90);
          break;
        case "lastYear":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(
        (item) => new Date(item.performedAt) >= filterDate
      );
    }

    setFilteredHistoryData(filtered);
  }, [historyData, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      status: "",
      dateRange: "all",
    });
  };

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const studentsData = await parentApi.getMyStudents(token);
      setStudents(studentsData);

      // Auto-select first student if available
      if (studentsData.length > 0) {
        setSelectedStudent(studentsData[0]);
        await loadHealthCheckResults(
          studentsData[0].id || studentsData[0].studentID
        );
      }
    } catch (error) {
      console.error("Error loading students:", error);
      setError("Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  }, [getToken, loadHealthCheckResults]);

  useEffect(() => {
    loadStudents();
    // Auto-test backend data on mount
    testBackendData();
  }, [loadStudents]);

  const handleStudentChange = async (student) => {
    setSelectedStudent(student);
    if (student) {
      await loadHealthCheckResults(student.id || student.studentID);
    }
  };

  const handleViewDetails = (campaignResult) => {
    setSelectedResult(campaignResult);
    setViewMode("detail");
  };

  const handleBackToTable = () => {
    setViewMode("history");
    setSelectedResult(null);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedResult(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có thông tin";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Chưa có thông tin";
    try {
      return new Date(dateTimeString).toLocaleString("vi-VN");
    } catch {
      return dateTimeString;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "NORMAL":
        return "Bình thường";
      case "ABNORMAL":
        return "Bất thường";
      case "REQUIRES_ATTENTION":
        return "Cần chú ý";
      case "MINOR_CONCERN":
        return "Cần theo dõi";
      case "PENDING":
        return "Đang chờ";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return status || "Chưa có thông tin";
    }
  };

  const getCategoryValue = (category, result) => {
    // Format category-specific details
    switch (category) {
      case "HEARING":
        if (result.hearingDetails) {
          const hearing = result.hearingDetails;
          if (hearing.leftEar !== undefined && hearing.rightEar !== undefined) {
            let hearingResult = `Tai trái: ${hearing.leftEar}dB, Tai phải: ${hearing.rightEar}dB`;

            // Add description if available
            if (hearing.description) {
              hearingResult += ` - ${hearing.description}`;
            }

            // Add status interpretation
            const avgHearing = (hearing.leftEar + hearing.rightEar) / 2;
            if (avgHearing <= 25) {
              hearingResult += " (Nghe bình thường)";
            } else if (avgHearing <= 40) {
              hearingResult += " (Suy giảm thính lực nhẹ)";
            } else if (avgHearing <= 55) {
              hearingResult += " (Suy giảm thính lực trung bình)";
            } else {
              hearingResult += " (Suy giảm thính lực nặng)";
            }

            return hearingResult;
          }
        }
        break;

      case "VISION":
        if (result.visionDetails) {
          const vision = result.visionDetails;
          if (
            vision.visionLeft !== undefined &&
            vision.visionRight !== undefined
          ) {
            let visionResult = `Mắt trái: ${vision.visionLeft}, Mắt phải: ${vision.visionRight}`;

            // Add glasses information if available
            if (vision.needsGlasses) {
              visionResult += " (Cần đeo kính)";
            }

            // Add description if available
            if (vision.visionDescription) {
              visionResult += ` - ${vision.visionDescription}`;
            }

            return visionResult;
          }
        }
        break;

      case "ORAL":
        if (result.oralDetails) {
          const oral = result.oralDetails;
          let oralResult = "";

          if (oral.cavitiesCount !== undefined) {
            oralResult = `Răng sâu: ${oral.cavitiesCount} răng`;
          }

          if (oral.teethCondition) {
            oralResult += oralResult
              ? `, Tình trạng răng: ${oral.teethCondition}`
              : `Tình trạng răng: ${oral.teethCondition}`;
          }

          if (oral.gumsCondition) {
            oralResult += oralResult
              ? `, Nướu: ${oral.gumsCondition}`
              : `Nướu: ${oral.gumsCondition}`;
          }

          if (oral.gingivitis) {
            oralResult += oralResult ? ", Viêm nướu: Có" : "Viêm nướu: Có";
          }

          if (oralResult) {
            return oralResult;
          }
        }
        break;

      case "SKIN":
        if (result.skinDetails) {
          const skin = result.skinDetails;
          if (skin.skinCondition) {
            return `Tình trạng da: ${skin.skinCondition}`;
          }
        }
        break;

      case "RESPIRATORY":
        if (result.respiratoryDetails) {
          const respiratory = result.respiratoryDetails;
          if (respiratory.breathingRate !== undefined) {
            return `Nhịp thở: ${respiratory.breathingRate} lần/phút`;
          }
        }
        break;
    }

    // Check if we have recommendations or notes to display
    if (result.recommendations) {
      return result.recommendations;
    }

    // If no specific details are available, return a generic message
    return result.resultNotes || "Bình thường";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "NORMAL":
        return "status-normal";
      case "ABNORMAL":
        return "status-abnormal";
      case "REQUIRES_ATTENTION":
        return "status-attention";
      case "MINOR_CONCERN":
        return "status-minor-concern";
      case "PENDING":
        return "status-pending";
      case "COMPLETED":
        return "status-completed";
      default:
        return "";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "NORMAL":
        return "#52c41a";
      case "ABNORMAL":
        return "#f5222d";
      case "REQUIRES_ATTENTION":
        return "#faad14";
      case "MINOR_CONCERN":
        return "#fa8c16";
      case "PENDING":
        return "#1890ff";
      case "COMPLETED":
        return "#52c41a";
      default:
        return "#d9d9d9";
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case "VISION":
        return "Thị lực";
      case "HEARING":
        return "Thính lực";
      case "ORAL":
        return "Răng miệng";
      case "SKIN":
        return "Da liễu";
      case "RESPIRATORY":
        return "Hô hấp";
      case "GENERAL":
        return "Tổng quát";
      default:
        return category || "Khác";
    }
  };

  // Format detail key names to be more readable
  const formatDetailKey = (key) => {
    switch (key) {
      // Vision fields
      case "visionLeft":
        return "Mắt trái";
      case "visionRight":
        return "Mắt phải";
      case "visionLeftWithGlass":
        return "Mắt trái (với kính)";
      case "visionRightWithGlass":
        return "Mắt phải (với kính)";
      case "needsGlasses":
        return "Cần đeo kính";
      case "visionDescription":
        return "Mô tả thị lực";
      case "eyeMovement":
        return "Chuyển động mắt";
      case "eyePressure":
        return "Áp lực mắt";
      // Hearing fields
      case "leftEar":
        return "Tai trái";
      case "rightEar":
        return "Tai phải";
      case "hearingAcuity":
        return "Độ nhạy thính giác";
      case "tympanometry":
        return "Đo nhĩ lượng";
      case "earWaxPresent":
        return "Có ráy tai";
      case "earInfection":
        return "Nhiễm trùng tai";
      // Oral fields
      case "teethCondition":
        return "Tình trạng răng";
      case "gumsCondition":
        return "Tình trạng nướu";
      case "tongueCondition":
        return "Tình trạng lưỡi";
      case "oralHygiene":
        return "Vệ sinh răng miệng";
      case "cavitiesCount":
        return "Số răng sâu";
      case "plaquePresent":
        return "Có mảng bám";
      case "gingivitis":
        return "Viêm nướu";
      case "mouthUlcers":
        return "Loét miệng";
      // Skin fields
      case "skinColor":
        return "Màu da";
      case "skinTone":
        return "Tông da";
      case "rashes":
        return "Phát ban";
      case "lesions":
        return "Tổn thương";
      case "dryness":
        return "Khô da";
      case "skinCondition":
        return "Tình trạng da";
      case "hasAllergies":
        return "Có dị ứng";
      case "eczema":
        return "Chàm";
      case "psoriasis":
        return "Vẩy nến";
      case "skinInfection":
        return "Nhiễm trùng da";
      case "allergies":
        return "Dị ứng";
      case "acne":
        return "Mụn trứng cá";
      case "scars":
        return "Sẹo";
      case "birthmarks":
        return "Nốt ruồi/bớt";
      case "treatment":
        return "Điều trị";
      case "followUpDate":
        return "Ngày tái khám";
      // Respiratory fields
      case "breathingRate":
        return "Nhịp thở";
      case "breathingSound":
        return "Âm thở";
      case "wheezing":
        return "Thở khò khè";
      case "cough":
        return "Ho";
      case "breathingDifficulty":
        return "Khó thở";
      case "oxygenSaturation":
        return "Độ bão hòa oxy";
      case "chestExpansion":
        return "Độ giãn nở lồng ngực";
      case "lungSounds":
        return "Âm phổi";
      case "asthmaHistory":
        return "Tiền sử hen suyễn";
      case "allergicRhinitis":
        return "Viêm mũi dị ứng";
      // Common fields
      case "doctorName":
        return "Bác sĩ thực hiện";
      case "dateOfExamination":
        return "Ngày khám";
      case "description":
        return "Mô tả";
      case "recommendations":
        return "Khuyến nghị";
      case "isAbnormal":
        return "Bất thường";
      case "id":
        return "ID";
      default:
        return (
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")
        );
    }
  };

  // Helper function to format JSON details
  const formatDetails = (details) => {
    if (!details || typeof details !== "object") {
      return "Không có thông tin chi tiết";
    }

    try {
      if (Array.isArray(details)) {
        return details.map((item, index) => (
          <div key={index} className="detail-item">
            {Object.entries(item).map(([key, value]) => (
              <div key={key}>
                <strong>{formatDetailKey(key)}:</strong>{" "}
                {formatValue(key, value)}
              </div>
            ))}
          </div>
        ));
      } else {
        return Object.entries(details).map(([key, value]) => (
          <div key={key}>
            <strong>{formatDetailKey(key)}:</strong> {formatValue(key, value)}
          </div>
        ));
      }
    } catch (error) {
      console.error("Error formatting details:", error);
      return "Lỗi hiển thị chi tiết";
    }
  };

  // Helper function to format values based on their type
  const formatValue = (key, value) => {
    if (value === null || value === undefined) return "N/A";

    // Format boolean values
    if (typeof value === "boolean") {
      if (
        key.startsWith("is") ||
        key.includes("Present") ||
        key.includes("has") ||
        [
          "rashes",
          "lesions",
          "dryness",
          "wheezing",
          "cough",
          "breathingDifficulty",
          "needsGlasses",
          "gingivitis",
          "mouthUlcers",
          "eczema",
          "psoriasis",
          "skinInfection",
          "allergies",
          "acne",
          "scars",
          "birthmarks",
          "asthmaHistory",
          "allergicRhinitis",
        ].includes(key)
      ) {
        return value ? "Có" : "Không";
      }
    }

    // Format date values
    if (
      key.includes("Date") &&
      typeof value === "string" &&
      (value.includes("-") || value.includes("/"))
    ) {
      try {
        return new Date(value).toLocaleDateString("vi-VN");
      } catch {
        return value;
      }
    }

    return value.toString();
  };

  // Function to get detailed information for tooltip
  const getDetailedInfo = (category, result) => {
    const details = {
      basicInfo: {
        category: getCategoryText(category),
        status: getStatusText(result.status),
        date: formatDateTime(result.performedAt),
        nurse: result.nurseName || "N/A",
      },
      specificDetails: {},
    };

    switch (category) {
      case "HEARING":
        if (result.hearingDetails) {
          const hearing = result.hearingDetails;
          details.specificDetails = {
            leftEar: `${hearing.leftEar}dB`,
            rightEar: `${hearing.rightEar}dB`,
            description: hearing.description || "Không có mô tả",
            dateOfExamination: hearing.dateOfExamination
              ? formatDate(hearing.dateOfExamination)
              : "N/A",
            doctorName: hearing.doctorName || "N/A",
            isAbnormal: hearing.isAbnormal ? "Có" : "Không",
          };
        }
        break;
      case "VISION":
        if (result.visionDetails) {
          const vision = result.visionDetails;
          details.specificDetails = {
            visionLeft: vision.visionLeft || "N/A",
            visionRight: vision.visionRight || "N/A",
            needsGlasses: vision.needsGlasses ? "Có" : "Không",
            visionDescription: vision.visionDescription || "Không có mô tả",
          };
        }
        break;
      case "ORAL":
        if (result.oralDetails) {
          const oral = result.oralDetails;
          details.specificDetails = {
            cavitiesCount: oral.cavitiesCount || "0",
            teethCondition: oral.teethCondition || "N/A",
            gumsCondition: oral.gumsCondition || "N/A",
            gingivitis: oral.gingivitis ? "Có" : "Không",
            oralHygiene: oral.oralHygiene || "N/A",
          };
        }
        break;
    }

    return details;
  };

  if (loading && students.length === 0) {
    return (
      <div className="health-check-results">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Debug render state
  console.log("=== RENDER DEBUG ===");
  console.log("Loading:", loading);
  console.log("Error:", error);
  console.log("HealthCheckResults length:", healthCheckResults.length);
  console.log("HistoryData length:", historyData.length);
  console.log("FilteredHistoryData length:", filteredHistoryData.length);
  console.log("ViewMode:", viewMode);

  return (
    <div className="health-check-results">
      <div className="health-check-results-header">
        {students.length > 1 && (
          <div className="student-selector">
            <label htmlFor="student-select">Chọn học sinh:</label>
            <select
              id="student-select"
              value={selectedStudent?.id || selectedStudent?.studentID || ""}
              onChange={(e) => {
                const student = students.find(
                  (s) => (s.id || s.studentID) === parseInt(e.target.value)
                );
                handleStudentChange(student);
              }}
            >
              {students.map((student) => (
                <option
                  key={student.id || student.studentID}
                  value={student.id || student.studentID}
                >
                  {student.firstName} {student.lastName} - {student.className}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Debug Panel Toggle */}
        <div className="debug-controls">
          <button
            className="debug-toggle-btn"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
          >
            🔍 Debug Mode
          </button>
          <button className="test-backend-btn" onClick={testBackendData}>
            🧪 Test Backend
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="debug-panel">
          <h3>🔍 Debug Information</h3>
          <div className="debug-content">
            <div className="debug-section">
              <h4>Backend Status</h4>
              <p>Students count: {debugInfo.studentsCount || 0}</p>
              <p>Campaign count: {debugInfo.campaignCount || 0}</p>
              <p>Total results: {debugInfo.totalResults || 0}</p>

              {/* Parent API Connectivity */}
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                }}
              >
                <strong>Parent API Connectivity:</strong>
                {debugInfo.parentProfileWorking !== undefined && (
                  <p
                    style={{
                      color: debugInfo.parentProfileWorking ? "green" : "red",
                    }}
                  >
                    Profile Endpoint:{" "}
                    {debugInfo.parentProfileWorking
                      ? "✅ Working"
                      : "❌ Failed"}
                    (Status: {debugInfo.parentProfileStatus})
                  </p>
                )}
                {debugInfo.parentProfileError && (
                  <p className="error">
                    Profile API Error: {debugInfo.parentProfileError}
                  </p>
                )}
              </div>

              {debugInfo.error && (
                <p className="error">Error: {debugInfo.error}</p>
              )}
              {debugInfo.healthCheckError && (
                <div className="error">
                  <p>Health Check Error: {debugInfo.healthCheckError}</p>
                  <p>Error Status: {debugInfo.healthCheckErrorStatus}</p>
                  <p>
                    Error Details:{" "}
                    {JSON.stringify(debugInfo.healthCheckErrorDetails)}
                  </p>
                </div>
              )}
              {debugInfo.directApiResponse && (
                <div>
                  <p>Direct API Status: {debugInfo.directApiStatus}</p>
                  <p>
                    Direct API Content-Type: {debugInfo.directApiContentType}
                  </p>
                  <p>
                    Direct API Response Length:{" "}
                    {debugInfo.directApiResponseLength}
                  </p>
                  <details>
                    <summary>Direct API Response</summary>
                    <pre
                      style={{
                        fontSize: "12px",
                        maxHeight: "200px",
                        overflow: "auto",
                      }}
                    >
                      {JSON.stringify(debugInfo.directApiResponse, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
              {debugInfo.directApiError && (
                <p className="error">
                  Direct API Error: {debugInfo.directApiError}
                </p>
              )}
            </div>

            <div className="debug-section">
              <h4>Current State</h4>
              <p>
                Selected student: {selectedStudent?.firstName}{" "}
                {selectedStudent?.lastName}
              </p>
              <p>Health check results: {healthCheckResults.length}</p>
              <p>History data: {historyData.length}</p>
              <p>Filtered data: {filteredHistoryData.length}</p>
              <p>Loading: {loading ? "Yes" : "No"}</p>
            </div>

            <div className="debug-section">
              <h4>Raw Data</h4>
              <details>
                <summary>Students Response</summary>
                <pre>{JSON.stringify(debugInfo.students, null, 2)}</pre>
              </details>
              <details>
                <summary>Health Check Response</summary>
                <pre>
                  {JSON.stringify(debugInfo.healthCheckResponse, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* Show debug info even when panel is closed */}
      {debugInfo.totalResults === 0 && debugInfo.campaignCount === 0 && (
        <div className="data-status-alert">
          <div className="alert-content">
            <i className="fas fa-info-circle"></i>
            <div>
              <h4>Trạng thái dữ liệu</h4>
              <p>Chưa có dữ liệu khám sức khỏe trong hệ thống</p>
              <p>Số học sinh: {debugInfo.studentsCount || 0}</p>
              <p>Số chiến dịch: {debugInfo.campaignCount || 0}</p>
              <p>Tổng kết quả: {debugInfo.totalResults || 0}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={loadStudents} className="retry-btn">
            Thử lại
          </button>
        </div>
      )}

      {loading && selectedStudent && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải kết quả khám sức khỏe...</p>
        </div>
      )}

      {!loading &&
        selectedStudent &&
        healthCheckResults.length === 0 &&
        historyData.length === 0 && (
          <div className="no-results">
            <i className="fas fa-clipboard-list"></i>
            <h3>Chưa có kết quả khám sức khỏe</h3>
            <p>
              Học sinh {selectedStudent.firstName} {selectedStudent.lastName}{" "}
              chưa có kết quả khám sức khỏe nào.
            </p>

            <div className="status-summary">
              <div className="summary-item">
                <span className="summary-label">Học sinh:</span>
                <span className="summary-value">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Lớp:</span>
                <span className="summary-value">
                  {selectedStudent.className || "Chưa có thông tin"}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Trạng thái API:</span>
                <span className="summary-value">
                  {debugInfo.healthCheckError
                    ? "Có lỗi"
                    : "Hoạt động bình thường"}
                </span>
              </div>
            </div>

            {debugInfo.healthCheckError && (
              <div className="error-details">
                <h4>⚠️ Chi tiết lỗi:</h4>
                <p>{debugInfo.healthCheckError}</p>
              </div>
            )}

            <div className="possible-reasons">
              <h4>🤔 Các nguyên nhân có thể:</h4>
              <ul>
                <li>Y tá chưa ghi nhận kết quả khám cho học sinh này</li>
                <li>
                  Kết quả đã được ghi nhận nhưng chưa được gửi đến hệ thống
                </li>
                <li>Có lỗi trong quá trình đồng bộ dữ liệu</li>
                <li>Học sinh chưa tham gia bất kỳ đợt khám sức khỏe nào</li>
              </ul>
            </div>

            <div className="next-steps">
              <h4>📋 Các bước tiếp theo:</h4>
              <ol>
                <li>
                  Kiểm tra với Y tá trường học xem đã có kết quả khám chưa
                </li>
                <li>Đảm bảo học sinh đã tham gia đợt khám sức khỏe</li>
                <li>Liên hệ với trường học để xác nhận tình trạng</li>
                <li>Thử làm mới trang để tải lại dữ liệu</li>
              </ol>

              <div className="action-buttons">
                <button
                  onClick={() =>
                    loadHealthCheckResults(
                      selectedStudent.id || selectedStudent.studentID
                    )
                  }
                  className="refresh-btn"
                >
                  🔄 Làm mới dữ liệu
                </button>
                <button onClick={testBackendData} className="test-btn">
                  🧪 Kiểm tra kết nối
                </button>
                <button onClick={loadSampleData} className="sample-btn">
                  📋 Xem mẫu dữ liệu
                </button>
                <button
                  onClick={() => {
                    if (
                      debugInfo.directApiResponse &&
                      !debugInfo.directApiResponse.error
                    ) {
                      console.log(
                        "Using extracted API data to populate results..."
                      );

                      // Process the extracted response data
                      const extractedResponse = debugInfo.directApiResponse;
                      console.log("Extracted response:", extractedResponse);

                      // Use the existing processing logic with extracted data
                      if (extractedResponse.campaignResults) {
                        console.log(
                          "Processing extracted campaign results:",
                          extractedResponse.campaignResults
                        );
                        setHealthCheckResults(
                          extractedResponse.campaignResults
                        );

                        // Also process into history format
                        const history = [];
                        extractedResponse.campaignResults.forEach(
                          (campaignResult, index) => {
                            const categoryResults =
                              campaignResult.categoryResults || {};

                            Object.entries(categoryResults).forEach(
                              ([categoryName, result]) => {
                                const historyItem = {
                                  id: `${categoryName}_${
                                    selectedStudent.id
                                  }_${Date.now()}`,
                                  studentId:
                                    selectedStudent.id ||
                                    selectedStudent.studentID,
                                  campaignId: "extracted_campaign",
                                  campaignName: "Đợt khám sức khỏe từ server",
                                  campaignLocation: "Phòng y tế trường",
                                  category: categoryName,
                                  status: result.isAbnormal
                                    ? "ABNORMAL"
                                    : "NORMAL",
                                  isAbnormal: result.isAbnormal || false,
                                  weight:
                                    result.weight ||
                                    result.hearingDetails?.healthProfile
                                      ?.weight,
                                  height:
                                    result.hearingDetails?.healthProfile
                                      ?.height,
                                  bmi: null,
                                  resultNotes: result.hearingDetails
                                    ? `Tai trái: ${result.hearingDetails.leftEar}dB, Tai phải: ${result.hearingDetails.rightEar}dB`
                                    : "",
                                  recommendations:
                                    result.hearingDetails?.recommendations ||
                                    "",
                                  performedAt: convertArrayDateToISO(
                                    result.performedAt
                                  ),
                                  nurseName: result.nurseName || "",
                                  doctorName:
                                    result.hearingDetails?.doctorName || "",
                                  hearingDetails: result.hearingDetails,
                                  checkupType: `Khám ${
                                    categoryName === "HEARING"
                                      ? "thính lực"
                                      : "tổng quát"
                                  }`,
                                };
                                history.push(historyItem);
                              }
                            );
                          }
                        );

                        setHistoryData(history);
                        setFilteredHistoryData(history);
                        console.log("Populated with extracted data:", history);
                      }
                    } else {
                      alert("Không có dữ liệu đã extract để sử dụng");
                    }
                  }}
                  className="refresh-btn"
                  style={{ backgroundColor: "#52c41a" }}
                >
                  ✨ Sử dụng dữ liệu đã trích xuất
                </button>
              </div>
            </div>

            <div className="instructions-panel">
              <details>
                <summary>
                  🔧 Thông tin kỹ thuật (dành cho nhà phát triển)
                </summary>
                <div className="instructions-content">
                  <p>Quy trình hoàn chình để có kết quả khám sức khỏe:</p>
                  <ol>
                    <li>
                      <strong>Tạo chiến dịch khám sức khỏe</strong> (MANAGER)
                      <br />
                      <code>POST /api/manager/health-check-campaigns</code>
                    </li>
                    <li>
                      <strong>Gửi form cho phụ huynh</strong> (MANAGER/NURSE)
                      <br />
                      <code>
                        POST /api/health-check-campaigns/{"{campaignId}"}
                        /send-forms
                      </code>
                    </li>
                    <li>
                      <strong>Phụ huynh xác nhận tham gia</strong>
                      <br />
                      <code>
                        POST /api/parent/health-check-forms/{"{formId}"}/confirm
                      </code>
                    </li>
                    <li>
                      <strong>Y tá ghi kết quả khám</strong> (SCHOOLNURSE)
                      <br />
                      <code>
                        POST /api/health-check-campaigns/record-result
                      </code>
                    </li>
                    <li>
                      <strong>Gửi kết quả cho phụ huynh</strong> (NURSE)
                      <br />
                      <code>POST /api/health-check/send-results</code>
                    </li>
                  </ol>

                  <div className="current-api-status">
                    <h5>📊 Trạng thái hiện tại:</h5>
                    <ul>
                      <li>
                        API Endpoint:{" "}
                        <code>
                          GET /api/parent/health-check/students/
                          {selectedStudent.id || selectedStudent.studentID}
                          /results
                        </code>
                      </li>
                      <li>
                        Số lượng campaigns: {debugInfo.campaignCount || 0}
                      </li>
                      <li>Tổng kết quả: {debugInfo.totalResults || 0}</li>
                      <li>Lỗi: {debugInfo.healthCheckError || "Không có"}</li>
                    </ul>
                  </div>
                </div>
              </details>
            </div>
          </div>
        )}

      {!loading && selectedStudent && historyData.length > 0 && (
        <div className="results-found-message">
          <div className="success-indicator">
            <i className="fas fa-check-circle"></i>
            <span>
              Đã tìm thấy {historyData.length} kết quả khám sức khỏe cho{" "}
              {selectedStudent.firstName} {selectedStudent.lastName}
            </span>
          </div>
        </div>
      )}

      {!loading && historyData.length > 0 && (
        <div className="view-mode-controls">
          <div className="control-buttons">
            <button
              className={`view-mode-btn ${
                viewMode === "history" ? "active" : ""
              }`}
              onClick={() => handleViewModeChange("history")}
            >
              <i className="fas fa-history"></i> Lịch sử tổng hợp
            </button>
            <button
              className={`view-mode-btn ${
                viewMode === "table" ? "active" : ""
              }`}
              onClick={() => handleViewModeChange("table")}
            >
              <i className="fas fa-table"></i> Theo chiến dịch
            </button>
            <button
              className={`view-mode-btn ${
                viewMode === "cards" ? "active" : ""
              }`}
              onClick={() => handleViewModeChange("cards")}
            >
              <i className="fas fa-th-large"></i> Dạng thẻ
            </button>
          </div>
        </div>
      )}

      {!loading && historyData.length > 0 && viewMode === "history" && (
        <div className="history-view-container">
          <div className="history-header">
            <h3>Lịch Sử Khám Sức Khỏe Tổng Hợp</h3>
            <div className="history-summary">
              <span className="summary-item">
                <i className="fas fa-clipboard-check"></i>
                Tổng cộng: {historyData.length} kết quả
              </span>
              <span className="summary-item">
                <i className="fas fa-filter"></i>
                Đang hiển thị: {filteredHistoryData.length} kết quả
              </span>
            </div>
          </div>
          <div className="filters-container">
            <div className="filter-group">
              <label htmlFor="category-filter">Loại kết quả:</label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="VISION">Thị lực</option>
                <option value="HEARING">Thính lực</option>
                <option value="ORAL">Răng miệng</option>
                <option value="SKIN">Da liễu</option>
                <option value="RESPIRATORY">Hô hấp</option>
                <option value="GENERAL">Tổng quát</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="status-filter">Trạng thái:</label>
              <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="NORMAL">Bình thường</option>
                <option value="ABNORMAL">Bất thường</option>
                <option value="REQUIRES_ATTENTION">Cần chú ý</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="date-range-filter">Khoảng thời gian:</label>
              <select
                id="date-range-filter"
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
              >
                <option value="all">Tất cả</option>
                <option value="last30">30 ngày gần đây</option>
                <option value="last90">90 ngày gần đây</option>
                <option value="lastYear">1 năm gần đây</option>
              </select>
            </div>
            <button onClick={clearFilters} className="clear-filters-btn">
              Xóa bộ lọc
            </button>
          </div>
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Ngày khám</th>
                  <th>Loại khám</th>
                  <th>Chiến dịch</th>
                  <th>Kết quả</th>
                  <th>Trạng thái</th>
                  <th>Chỉ số</th>
                  <th>Y tá</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistoryData.map((item) => (
                  <tr key={item.id}>
                    <td className="date-cell">
                      {formatDate(item.performedAt)}
                    </td>
                    <td className="category-cell">
                      <span className="category-badge">
                        {getCategoryText(item.category)}
                      </span>
                    </td>
                    <td className="campaign-cell">
                      <div className="campaign-info">
                        <strong>{item.campaignName}</strong>
                        {item.campaignLocation && (
                          <div className="campaign-location">
                            <i className="fas fa-map-marker-alt"></i>
                            {item.campaignLocation}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="result-cell">
                      <div className="result-summary">
                        <div
                          className="result-value clickable"
                          onClick={() =>
                            setSelectedTooltip(
                              selectedTooltip === item.id ? null : item.id
                            )
                          }
                          title="Nhấp để xem chi tiết"
                        >
                          {getCategoryValue(item.category, item)}
                          <i className="fas fa-info-circle result-info-icon"></i>
                        </div>
                        {item.recommendations && (
                          <div className="result-recommendations">
                            <small>
                              <strong>Khuyến nghị:</strong>{" "}
                              {item.recommendations}
                            </small>
                          </div>
                        )}
                        {selectedTooltip === item.id && (
                          <div className="result-tooltip">
                            <div className="tooltip-header">
                              <strong>
                                Chi tiết khám {getCategoryText(item.category)}
                              </strong>
                              <button
                                className="tooltip-close"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTooltip(null);
                                }}
                              >
                                ×
                              </button>
                            </div>
                            <div className="tooltip-content">
                              <div className="tooltip-basic-info">
                                <p>
                                  <strong>Trạng thái:</strong>{" "}
                                  {getStatusText(item.status)}
                                </p>
                                <p>
                                  <strong>Ngày khám:</strong>{" "}
                                  {formatDateTime(item.performedAt)}
                                </p>
                                <p>
                                  <strong>Y tá:</strong>{" "}
                                  {item.nurseName || "N/A"}
                                </p>
                              </div>
                              {item.resultNotes && (
                                <div className="tooltip-notes">
                                  <p>
                                    <strong>Ghi chú:</strong> {item.resultNotes}
                                  </p>
                                </div>
                              )}
                              {item.recommendations && (
                                <div className="tooltip-recommendations">
                                  <p>
                                    <strong>Khuyến nghị:</strong>{" "}
                                    {item.recommendations}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="status-cell">
                      <span
                        className={`status-badge ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="metrics-cell">
                      <div className="metrics-info">
                        {item.height && (
                          <div className="metric-item">
                            <span className="metric-label">Cao:</span>
                            <span className="metric-value">
                              {item.height}cm
                            </span>
                          </div>
                        )}
                        {item.weight && (
                          <div className="metric-item">
                            <span className="metric-label">Nặng:</span>
                            <span className="metric-value">
                              {item.weight}kg
                            </span>
                          </div>
                        )}
                        {item.bmi && (
                          <div className="metric-item">
                            <span className="metric-label">BMI:</span>
                            <span className="metric-value">
                              {item.bmi.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="nurse-cell">{item.nurseName || "N/A"}</td>
                    <td className="notes-cell">
                      {item.resultNotes ? (
                        <div className="notes-content" title={item.resultNotes}>
                          {item.resultNotes.length > 50
                            ? item.resultNotes.substring(0, 50) + "..."
                            : item.resultNotes}
                        </div>
                      ) : (
                        <span className="no-notes">Không có ghi chú</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredHistoryData.length === 0 && (
              <div className="no-results-message">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy kết quả nào phù hợp với bộ lọc đã chọn.</p>
                <button onClick={clearFilters} className="clear-filters-btn">
                  Xóa bộ lọc để xem tất cả
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && historyData.length > 0 && viewMode === "table" && (
        <div className="results-table-container">
          <div className="table-header">
            <h3>Kết Quả Khám Sức Khỏe Theo Chiến Dịch</h3>
          </div>
          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Chiến dịch</th>
                  <th>Ngày khám</th>
                  <th>Địa điểm</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {healthCheckResults.map((campaignResult) => (
                  <tr key={campaignResult.campaign.id}>
                    <td>
                      <div className="campaign-info">
                        <strong>{campaignResult.campaign.name}</strong>
                        {campaignResult.campaign.description && (
                          <div className="campaign-desc">
                            {campaignResult.campaign.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {formatDate(campaignResult.campaign.startDate)} -{" "}
                      {formatDate(campaignResult.campaign.endDate)}
                    </td>
                    <td>
                      {campaignResult.campaign.location || "Chưa có thông tin"}
                    </td>
                    <td>
                      <span className="status-indicator">
                        {campaignResult.hasResults
                          ? "Đã có kết quả"
                          : "Chưa có kết quả"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-details-btn"
                        onClick={() => handleViewDetails(campaignResult)}
                        disabled={!campaignResult.hasResults}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading &&
        historyData.length > 0 &&
        viewMode === "detail" &&
        selectedResult && (
          <div className="detail-view-container">
            <div className="detail-header">
              <button className="back-btn" onClick={handleBackToTable}>
                <i className="fas fa-arrow-left"></i> Quay lại lịch sử
              </button>
              <h3>Chi Tiết Kết Quả Khám Sức Khỏe</h3>
            </div>

            <div className="health-check-report">
              <div className="report-header">
                <h2>KẾT QUẢ KHÁM SỨC KHỎE HỌC SINH</h2>
              </div>

              <div className="student-report-info">
                <div className="info-row">
                  <span className="label">Họ tên:</span>
                  <span className="value">{selectedStudent.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ngày tháng năm sinh:</span>
                  <span className="value">
                    {selectedStudent?.dateOfBirth
                      ? formatDate(selectedStudent?.dateOfBirth)
                      : "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Lớp:</span>
                  <span className="value">{selectedStudent.className}</span>
                </div>
                <div className="info-row">
                  <span className="label">Ngày khám:</span>
                  <span className="value">
                    {formatDate(selectedResult.overallResults?.performedAt)}
                  </span>
                </div>
              </div>

              <div className="campaign-info-section">
                <h3>Thông Tin Chiến Dịch</h3>
                <div className="info-row">
                  <span className="label">Tên chiến dịch:</span>
                  <span className="value">{selectedResult.campaign.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Mô tả:</span>
                  <span className="value">
                    {selectedResult.campaign.description || "Không có mô tả"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Thời gian:</span>
                  <span className="value">
                    {formatDate(selectedResult.campaign.startDate)} -{" "}
                    {formatDate(selectedResult.campaign.endDate)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Địa điểm:</span>
                  <span className="value">
                    {selectedResult.campaign.location || "Chưa có thông tin"}
                  </span>
                </div>
              </div>

              <div className="health-metrics-section">
                <h3>Chỉ Số Sức Khỏe</h3>
                {selectedResult.overallResults?.height && (
                  <div className="info-row">
                    <span className="label">Chiều cao:</span>
                    <span className="value">
                      {selectedResult.overallResults.height} cm
                    </span>
                    <span className="conclusion">Bình thường</span>
                  </div>
                )}
                {selectedResult.overallResults?.weight && (
                  <div className="info-row">
                    <span className="label">Cân nặng:</span>
                    <span className="value">
                      {selectedResult.overallResults.weight} kg
                    </span>
                    <span className="conclusion">Bình thường</span>
                  </div>
                )}
                {selectedResult.overallResults?.bmi && (
                  <div className="info-row">
                    <span className="label">BMI:</span>
                    <span className="value">
                      {selectedResult.overallResults.bmi.toFixed(1)}
                    </span>
                    <span className="conclusion">Bình thường</span>
                  </div>
                )}
              </div>
              {console.log(selectedResult.categoryResults)}

              {selectedResult.categoryResults &&
                Object.keys(selectedResult.categoryResults).length > 0 && (
                  <div className="category-results-section">
                    <h3>Kết Quả Khám Chi Tiết</h3>
                    {Object.entries(selectedResult.categoryResults).map(
                      ([resultId, result]) => (
                        <div key={resultId} className="category-result">
                          <div className="info-row">
                            <span className="label">
                              {getCategoryText(result.category)}:
                            </span>
                            <span className="value">
                              {getCategoryValue(result.category, result)}
                            </span>
                            <span
                              className={`conclusion ${getStatusClass(
                                result.status
                              )}`}
                            >
                              {getStatusText(result.status)}
                            </span>
                          </div>

                          {result.resultNotes && (
                            <div className="detail-row">
                              <span className="label">Ghi chú:</span>
                              <span className="value">
                                {result.resultNotes}
                              </span>
                            </div>
                          )}

                          {result.recommendations && (
                            <div className="detail-row">
                              <span className="label">Khuyến nghị:</span>
                              <span className="value">
                                {result.recommendations}
                              </span>
                            </div>
                          )}

                          {/* Add any other specific fields that might be in the data */}
                          {result.performedAt && (
                            <div className="detail-row">
                              <span className="label">Ngày thực hiện:</span>
                              <span className="value">
                                {formatDateTime(result.performedAt)}
                              </span>
                            </div>
                          )}

                          {result.nurseName && (
                            <div className="detail-row">
                              <span className="label">Y tá thực hiện:</span>
                              <span className="value">{result.nurseName}</span>
                            </div>
                          )}

                          {/* Display specific details based on category */}
                          {result.category === "VISION" &&
                            result.visionDetails && (
                              <div className="detail-row">
                                <span className="label">Chi tiết thị lực:</span>
                                <span className="value">
                                  {formatDetails(result.visionDetails)}
                                </span>
                              </div>
                            )}

                          {result.category === "HEARING" &&
                            result.hearingDetails && (
                              <div className="detail-row">
                                <span className="label">
                                  Chi tiết thính lực:
                                </span>
                                <span className="value">
                                  {formatDetails(result.hearingDetails)}
                                </span>
                              </div>
                            )}

                          {result.category === "ORAL" && result.oralDetails && (
                            <div className="detail-row">
                              <span className="label">
                                Chi tiết răng miệng:
                              </span>
                              <span className="value">
                                {formatDetails(result.oralDetails)}
                              </span>
                            </div>
                          )}

                          {result.category === "SKIN" && result.skinDetails && (
                            <div className="detail-row">
                              <span className="label">Chi tiết da liễu:</span>
                              <span className="value">
                                {formatDetails(result.skinDetails)}
                              </span>
                            </div>
                          )}

                          {result.category === "RESPIRATORY" &&
                            result.respiratoryDetails && (
                              <div className="detail-row">
                                <span className="label">Chi tiết hô hấp:</span>
                                <span className="value">
                                  {formatDetails(result.respiratoryDetails)}
                                </span>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                )}

              {(!selectedResult.categoryResults ||
                Object.keys(selectedResult.categoryResults).length === 0) && (
                <div className="no-detailed-results">
                  <p>Chưa có kết quả chi tiết cho đợt khám này.</p>
                </div>
              )}
            </div>
          </div>
        )}

      {!loading && historyData.length > 0 && viewMode === "cards" && (
        <div className="results-container">
          {healthCheckResults.map((campaignResult) => (
            <div
              key={campaignResult.campaign.id}
              className="campaign-result-card"
            >
              <div className="campaign-header">
                <h3>{campaignResult.campaign.name}</h3>
                <div className="campaign-meta">
                  <span>
                    <i className="fas fa-calendar"></i>{" "}
                    {formatDate(campaignResult.campaign.startDate)} -{" "}
                    {formatDate(campaignResult.campaign.endDate)}
                  </span>
                  {campaignResult.campaign.location && (
                    <span>
                      <i className="fas fa-map-marker-alt"></i>{" "}
                      {campaignResult.campaign.location}
                    </span>
                  )}
                </div>
              </div>

              {campaignResult.campaign.description && (
                <div className="campaign-description">
                  <p>{campaignResult.campaign.description}</p>
                </div>
              )}

              {/* Overall measurements section */}
              {campaignResult.overallResults &&
                Object.keys(campaignResult.overallResults).length > 0 && (
                  <div className="overall-measurements">
                    <h4>Chỉ số tổng quát</h4>
                    <div className="measurements-grid">
                      {campaignResult.overallResults.height && (
                        <div className="measurement-item">
                          <label>Chiều cao:</label>
                          <span>{campaignResult.overallResults.height} cm</span>
                        </div>
                      )}
                      {campaignResult.overallResults.weight && (
                        <div className="measurement-item">
                          <label>Cân nặng:</label>
                          <span>{campaignResult.overallResults.weight} kg</span>
                        </div>
                      )}
                      {campaignResult.overallResults.bmi && (
                        <div className="measurement-item">
                          <label>BMI:</label>
                          <span>
                            {campaignResult.overallResults.bmi.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {campaignResult.overallResults.performedAt && (
                        <div className="measurement-item">
                          <label>Ngày khám:</label>
                          <span>
                            {formatDateTime(
                              campaignResult.overallResults.performedAt
                            )}
                          </span>
                        </div>
                      )}
                      {campaignResult.overallResults.nurseName && (
                        <div className="measurement-item">
                          <label>Y tá thực hiện:</label>
                          <span>{campaignResult.overallResults.nurseName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Category results section */}
              {campaignResult.categoryResults &&
                Object.keys(campaignResult.categoryResults).length > 0 && (
                  <div className="results-grid">
                    {Object.entries(campaignResult.categoryResults).map(
                      ([resultId, result]) => (
                        <div key={resultId} className="result-card">
                          <div className="result-header">
                            <h4>{getCategoryText(result.category)}</h4>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(result.status),
                              }}
                            >
                              {getStatusText(result.status)}
                            </span>
                          </div>

                          <div className="result-details">
                            {result.resultNotes && (
                              <div className="result-notes">
                                <label>Ghi chú:</label>
                                <p>{result.resultNotes}</p>
                              </div>
                            )}

                            {result.recommendations && (
                              <div className="recommendations">
                                <label>Khuyến nghị:</label>
                                <p>{result.recommendations}</p>
                              </div>
                            )}

                            {/* Category-specific details */}
                            {result.category === "VISION" &&
                              result.visionDetails && (
                                <div className="category-details">
                                  <label>Chi tiết thị lực:</label>
                                  <div className="details-content">
                                    {formatDetails(result.visionDetails)}
                                  </div>
                                </div>
                              )}

                            {result.category === "HEARING" &&
                              result.hearingDetails && (
                                <div className="category-details">
                                  <label>Chi tiết thính lực:</label>
                                  <div className="details-content">
                                    {formatDetails(result.hearingDetails)}
                                  </div>
                                </div>
                              )}

                            {result.category === "ORAL" &&
                              result.oralDetails && (
                                <div className="category-details">
                                  <label>Chi tiết răng miệng:</label>
                                  <div className="details-content">
                                    {formatDetails(result.oralDetails)}
                                  </div>
                                </div>
                              )}

                            {result.category === "SKIN" &&
                              result.skinDetails && (
                                <div className="category-details">
                                  <label>Chi tiết da liễu:</label>
                                  <div className="details-content">
                                    {formatDetails(result.skinDetails)}
                                  </div>
                                </div>
                              )}

                            {result.category === "RESPIRATORY" &&
                              result.respiratoryDetails && (
                                <div className="category-details">
                                  <label>Chi tiết hô hấp:</label>
                                  <div className="details-content">
                                    {formatDetails(result.respiratoryDetails)}
                                  </div>
                                </div>
                              )}

                            <div className="result-meta">
                              <span>
                                <i className="fas fa-clock"></i>{" "}
                                {formatDateTime(result.performedAt)}
                              </span>
                              {result.nurseName && (
                                <span>
                                  <i className="fas fa-user-md"></i> Y tá:{" "}
                                  {result.nurseName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

              {(!campaignResult.categoryResults ||
                Object.keys(campaignResult.categoryResults).length === 0) && (
                <div className="no-category-results">
                  <p>Chưa có kết quả chi tiết cho đợt khám này.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealthCheckResults;
