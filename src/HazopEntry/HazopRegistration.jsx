import React from "react";

const HazopRegistration = ({ closePopup }) => {
  return (
    <div>
      <h3>Create HAZOP</h3>

      <p>Your HAZOP registration form goes here.</p>

      <button onClick={closePopup} style={{ marginTop: "20px" }}>
        Close
      </button>
    </div>
  );
};

export default HazopRegistration;
