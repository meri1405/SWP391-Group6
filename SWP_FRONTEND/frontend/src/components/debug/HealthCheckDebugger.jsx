import React, { useState } from "react";
import axios from "axios";

const HealthCheckDebugger = () => {
  const [campaignId, setCampaignId] = useState("");
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://swp391-group6.onrender.com";

  const testDebugEndpoint = async () => {
    if (!campaignId) {
      alert("Please enter a campaign ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("=== Testing Debug Endpoint ===");
      console.log("Campaign ID:", campaignId);

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Call debug endpoint
      const response = await axios.get(
        `${API_BASE_URL}/api/health-check-campaigns/${campaignId}/debug-forms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Debug Response:", response.data);
      setDebugData(response.data);

      // Also test both regular endpoints for comparison
      const eligibleResponse = await axios.get(
        `${API_BASE_URL}/api/health-check-campaigns/${campaignId}/eligible-students-with-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const confirmedResponse = await axios.get(
        `${API_BASE_URL}/api/health-check-campaigns/${campaignId}/confirmed-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Eligible Students Response:", eligibleResponse.data);
      console.log("Confirmed Students Response:", confirmedResponse.data);

      // Add comparison data
      setDebugData((prev) => ({
        ...prev,
        eligibleStudentsAPI: eligibleResponse.data,
        confirmedStudentsAPI: confirmedResponse.data,
        apiComparison: {
          eligibleTotal: eligibleResponse.data.length,
          eligibleConfirmed: eligibleResponse.data.filter(
            (s) => s.status === "CONFIRMED"
          ).length,
          confirmedAPI: confirmedResponse.data.length,
        },
      }));
    } catch (err) {
      console.error("Debug Error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>🔍 Health Check Campaign Debugger</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Campaign ID:
          <input
            type="number"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
            placeholder="Enter campaign ID"
          />
        </label>
        <button
          onClick={testDebugEndpoint}
          disabled={loading}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            backgroundColor: "#1890ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Testing..." : "🧪 Test Debug API"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fff2f0",
            border: "1px solid #ffccc7",
            borderRadius: "4px",
            padding: "15px",
            marginBottom: "20px",
            color: "#f5222d",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {debugData && (
        <div>
          <h3>📊 Debug Results</h3>

          {/* Summary */}
          <div
            style={{
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
            <h4>Summary</h4>
            <p>
              <strong>Campaign:</strong> {debugData.campaignName}
            </p>
            <p>
              <strong>Total Forms:</strong> {debugData.totalForms}
            </p>
            <p>
              <strong>Confirmed (Method 1):</strong>{" "}
              {debugData.confirmedFromMethod1}
            </p>
            <p>
              <strong>Confirmed (Method 2):</strong>{" "}
              {debugData.confirmedFromMethod2}
            </p>
            <p>
              <strong>Status:</strong>
              {debugData.confirmedFromMethod1 === debugData.confirmedFromMethod2
                ? " ✅ Consistent"
                : " ❌ DISCREPANCY FOUND!"}
            </p>

            {debugData.apiComparison && (
              <div style={{ marginTop: "10px" }}>
                <h5>API Comparison:</h5>
                <p>
                  Eligible Students API: {debugData.apiComparison.eligibleTotal}{" "}
                  total, {debugData.apiComparison.eligibleConfirmed} confirmed
                </p>
                <p>
                  Confirmed Students API: {debugData.apiComparison.confirmedAPI}{" "}
                  confirmed
                </p>
              </div>
            )}
          </div>

          {/* Status Counts */}
          <div style={{ marginBottom: "20px" }}>
            <h4>📈 Status Counts</h4>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "10px",
                borderRadius: "4px",
                overflow: "auto",
              }}
            >
              {formatJson(debugData.statusCounts)}
            </pre>
          </div>

          {/* Missing Students */}
          {debugData.missingFromMethod2 &&
            debugData.missingFromMethod2.length > 0 && (
              <div
                style={{
                  background: "#fff2f0",
                  border: "1px solid #ffccc7",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "20px",
                }}
              >
                <h4>❌ Missing from Method 2</h4>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "4px",
                    overflow: "auto",
                  }}
                >
                  {formatJson(debugData.missingFromMethod2)}
                </pre>
              </div>
            )}

          {/* Form Details */}
          <div style={{ marginBottom: "20px" }}>
            <h4>📋 Form Details</h4>
            <div style={{ maxHeight: "400px", overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={{ border: "1px solid #e8e8e8", padding: "8px" }}>
                      Form ID
                    </th>
                    <th style={{ border: "1px solid #e8e8e8", padding: "8px" }}>
                      Student ID
                    </th>
                    <th style={{ border: "1px solid #e8e8e8", padding: "8px" }}>
                      Student Name
                    </th>
                    <th style={{ border: "1px solid #e8e8e8", padding: "8px" }}>
                      Status
                    </th>
                    <th style={{ border: "1px solid #e8e8e8", padding: "8px" }}>
                      Sent At
                    </th>
                    <th style={{ border: "1px solid #e8e8e8", padding: "8px" }}>
                      Responded At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {debugData.formDetails?.map((form) => (
                    <tr key={form.formId}>
                      <td
                        style={{ border: "1px solid #e8e8e8", padding: "8px" }}
                      >
                        {form.formId}
                      </td>
                      <td
                        style={{ border: "1px solid #e8e8e8", padding: "8px" }}
                      >
                        {form.studentId}
                      </td>
                      <td
                        style={{ border: "1px solid #e8e8e8", padding: "8px" }}
                      >
                        {form.studentName}
                      </td>
                      <td
                        style={{
                          border: "1px solid #e8e8e8",
                          padding: "8px",
                          backgroundColor:
                            form.status === "CONFIRMED"
                              ? "#f6ffed"
                              : form.status === "DECLINED"
                              ? "#fff2f0"
                              : "#fffbe6",
                          color:
                            form.status === "CONFIRMED"
                              ? "#52c41a"
                              : form.status === "DECLINED"
                              ? "#f5222d"
                              : "#faad14",
                        }}
                      >
                        {form.status}
                      </td>
                      <td
                        style={{ border: "1px solid #e8e8e8", padding: "8px" }}
                      >
                        {form.sentAt || "N/A"}
                      </td>
                      <td
                        style={{ border: "1px solid #e8e8e8", padding: "8px" }}
                      >
                        {form.respondedAt || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw Debug Data */}
          <details style={{ marginTop: "20px" }}>
            <summary
              style={{
                cursor: "pointer",
                padding: "10px",
                background: "#f0f0f0",
              }}
            >
              🔍 Raw Debug Data
            </summary>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "4px",
                overflow: "auto",
                maxHeight: "500px",
              }}
            >
              {formatJson(debugData)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default HealthCheckDebugger;
