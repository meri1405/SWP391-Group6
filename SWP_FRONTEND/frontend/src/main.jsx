import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import "./styles/MedicalSupplyInventory.css";
import "./styles/RestockRequestList.css";
import "./styles/HealthCheckCampaign.css";
// Import WebSocketService to ensure it's initialized at app startup
import "./services/webSocketService";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
