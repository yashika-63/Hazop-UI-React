import React, { useState } from "react";

const EmployeeForm = () => {
    const [employeeName, setEmployeeName] = useState("");
    const [designation, setDesignation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate form submission delay
        setTimeout(() => {
            alert(`Employee Name: ${employeeName}\nDesignation: ${designation}`);
            setEmployeeName("");
            setDesignation("");
            setLoading(false);
        }, 500);
    };

    return (
        <div>
            <div className="form-title">Employee Details</div>
            <form onSubmit={handleSubmit} >
                <div>
                    <label>
                        Employee Name:
                        <input
                            type="text"
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            placeholder="Enter employee name"
                            required

                        />
                    </label>
                </div>
                <div>
                    <label>
                        Designation:
                        <input
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="Enter designation"
                            required
                        />
                    </label>
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
};

export default EmployeeForm;
