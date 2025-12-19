import { FaEdit, FaEllipsisV, FaEye, FaTasks, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { strings } from "../string";
import axios from "axios";
import { useEffect } from "react";

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date)) return "N/A";  // <-- prevents NaN-NaN-NaN
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};


export const formatDateToBackend = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const showToast = (message, type) => {
  const options = {
    className:
      type === "success"
        ? "my-toast my-toast-success"
        : type === "error"
          ? "my-toast my-toast-error"
          : type === "warn"
            ? "my-toast my-toast-warn"
            : "my-toast my-toast-info",
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  if (type === "success") toast.success(message, options);
  else if (type === "error") toast.error(message, options);
  else if (type === "warn") toast.warn(message, options);
  else toast.info(message, options);
};

function ScrollableViewer({ content }) {
  return (
    <div className="scrollable-viewer">
      {content}
    </div>
  );
}



export const truncateWords = (text, wordLimit = 3) => {
  if (!text) return "-";
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};



export const truncateText = (text, maxLength = 80) => {
  if (!text) return "-";
  return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
};

export const getRiskClass = (risk) => {
  if (!risk) return "risk-default";

  const r = Number(risk);

  if ([1, 2, 3, 4, 5].includes(r)) return "risk-trivial-text";
  if ([6, 8, 9, 10].includes(r)) return "risk-tolerable-text";
  if ([12, 15].includes(r)) return "risk-moderate-text";
  if ([16, 18].includes(r)) return "risk-substantial-text";
  if ([20, 25].includes(r)) return "risk-intolerable-text";

  return "risk-default";
};
export const getRiskColor = (risk) => {
  if (!risk) return '#fff';
  const r = Number(risk);

  if ([1, 2, 3, 4, 5].includes(r)) return '#207229';        // Trivial
  if ([6, 8, 9, 10].includes(r)) return '#56a744';          // Tolerable
  if ([12, 15].includes(r)) return '#fef65e';              // Moderate
  if ([16, 18].includes(r)) return '#fa9201';              // Substantial
  if ([20, 25].includes(r)) return '#f91111';              // Intolerable
  return '#fff';
};


export const getBorderColor = (risk) => {
  const r = Number(risk);

  if ([1, 2, 3, 4, 5].includes(r)) return trivial;
  if ([6, 8, 9, 10].includes(r)) return tolerable;
  if ([12, 15].includes(r)) return moderate;
  if ([16, 18].includes(r)) return substantial;
  if ([20, 25].includes(r)) return intolerable;

  return "#ccc";
};




export const root = document.documentElement;
export const trivial = getComputedStyle(root).getPropertyValue("--trivial").trim();
export const tolerable = getComputedStyle(root)
  .getPropertyValue("--tolerable")
  .trim();
export const moderate = getComputedStyle(root).getPropertyValue("--moderate").trim();
export const substantial = getComputedStyle(root)
  .getPropertyValue("--substantial")
  .trim();
export const intolerable = getComputedStyle(root)
  .getPropertyValue("--intolerable")
  .trim();


export const getRiskLevelText = (risk) => {
  const r = Number(risk);

  if ([1, 2, 3, 4, 5].includes(r)) return "Trivial";
  if ([6, 8, 9, 10].includes(r)) return "Tolerable";
  if ([12, 15].includes(r)) return "Moderate";
  if ([16, 18].includes(r)) return "Substantial";
  if ([20, 25].includes(r)) return "Intolerable";

  return "";
};

export const getRiskTextClass = (risk) => {
  const r = Number(risk);

  if ([1, 2, 3, 4, 5].includes(r)) return "risk-badge risk-trivial";
  if ([6, 8, 9, 10].includes(r)) return "risk-badge risk-tolerable";
  if ([12, 15].includes(r)) return "risk-badge risk-moderate";
  if ([16, 18].includes(r)) return "risk-badge risk-substantial";
  if ([20, 25].includes(r)) return "risk-badge risk-intolerable";

  return "risk-default";
};
export const fetchDataByKey = async (keyvalue) => {
  const companyId = localStorage.getItem("companyId");

  try {
    const response = await axios.get(`http://${strings.localhost}/api/JavaMasterData/getByKey/${companyId}/${keyvalue}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(item => ({
        masterId: item.masterId,
        data: item.data || '',
        category: item.category || '',
      }));
    }
    console.error(`Invalid data structure or empty response for ${keyvalue}`);
    return [];
  } catch (error) {
    console.error(`Error fetching data for ${keyvalue}:`, error);
    throw error;
  }
};



export const fetchSitesByDepartment = async (departmentKey, setSiteOptions) => {
  try {
    if (!departmentKey) {
      setSiteOptions([]);
      return;
    }

    const siteData = await fetchDataByKey(departmentKey); // call fetchDataByKey
    setSiteOptions(siteData);
  } catch (err) {
    console.error("Error fetching sites for department", err);
    setSiteOptions([]);
  }
};



export const StatusIcon = ({ status }) => {
  // Define colors for different statuses
  const statusColors = {
    completed: "green",   // Done
    ongoing: "blue",      // In progress
    pending: "orange",    // Waiting / Not started
    default: "gray"       // Unknown / Not applicable
  };

  return (
    <FaTasks
      style={{
        color: statusColors[status] || statusColors.default,
        fontSize: "20px",
        marginRight: "8px"
      }}
      title={status} // Hover shows status
    />
  );
};



export const getFontSize = (textLength) => {
  if (textLength < 500) return 11;
  if (textLength < 1000) return 10;
  return 8; // For very large text
};

// Function to adjust column width dynamically based on text length
export const getColumnWidth = (textLength) => {
  if (textLength < 500) return '8%';
  if (textLength < 1000) return '12%';
  return '18%'; // For very large text
};

// Component to truncate text with "..."
export const TruncateText = ({ text, maxLength }) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};


