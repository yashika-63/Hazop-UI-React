import React, { useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { strings } from "../string";
import { showToast } from "../CommonUI/CommonUI";

const MocPopup = ({ hazopId, onClose }) => {
    const [searchValue, setSearchValue] = useState("");
    const [mocList, setMocList] = useState([]);
    const [selectedMoc, setSelectedMoc] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [noData, setNoData] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearchMoc = async (e) => {
        const value = e.target.value;
        setSearchValue(value);

        if (value.length < 3) {
            setMocList([]);
            setNoData(false);
            return;
        }

        try {
            const res = await axios.get(
                `http://${strings.localhost}/api/moc/search?mocNo=${value}`
            );

            const list = res.data || [];

            setMocList(list);
            setNoData(list.length === 0);
        } catch (error) {
            console.error("Error searching MOC:", error);
            setNoData(true);
        }
    };

    const saveMocReference = async () => {
        try {
            await axios.post(
                `http://${strings.localhost}/api/moc-reference/save`,
                null,
                {
                    params: {
                        mocId: selectedMoc.MOCID,
                        hazopRegistrationId: hazopId
                    }
                }
            );

            showToast("MOC Saved Successfully!", 'success');
            setLoading(false);
            setShowConfirm(false);
            onClose();

        } catch (err) {
            const apiMessage =
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Error saving MOC";

            showToast(apiMessage, "error");

            setLoading(false);
            setShowConfirm(false);
        }
    };


    return (
        <div className="modal-overlay">
            <div className="modal-body">

                <h2 className="centerText">Select MOC</h2>

                <div className="search-container">
                    <div className="search-bar-wrapper">
                        <input
                            type="text"
                            placeholder="Search MOC..."
                            value={searchValue}
                            onChange={handleSearchMoc}
                        />

                        <FaSearch className="search-icon" />

                        {(mocList.length > 0 || noData) && (
                            <ul className="search-results">
                                {mocList.length > 0 ? (
                                    mocList.map((moc) => (
                                        <li
                                            key={moc.MOCID}
                                            onClick={() => {
                                                setSelectedMoc(moc);
                                                setMocList([]);
                                                setNoData(false);
                                                setSearchValue(moc.MOCTitle);
                                            }}
                                        >
                                            {moc.MOCID} - {moc.MOCTitle || "No Title"} - {moc.MocNo || "-"}
                                        </li>
                                    ))
                                ) : (
                                    <li className="error-text">No Data Found</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                {selectedMoc && (
                    <div className="selected-moc-box">
                        <h5>Selected MOC:</h5>

                        <div className="details-row">
                            <span className="label">MOC ID:</span>
                            <span className="value">{selectedMoc.MOCID || "-"}</span>
                        </div>

                        <div className="details-row">
                            <span className="label">MOC Title:</span>
                            <span className="value">{selectedMoc.MOCTitle || "-"}</span>
                        </div>

                        <div className="details-row">
                            <span className="label">MOC Number:</span>
                            <span className="value">{selectedMoc.MocNo || "-"}</span>
                        </div>
                    </div>
                )}

                <div className="confirm-buttons">
                    <button type="button" onClick={onClose} className="cancel-btn">
                        Close
                    </button>
                    <button
                        type="button"
                        disabled={!selectedMoc}
                        onClick={() => setShowConfirm(true)}
                        className="confirm-btn"
                    >
                        Save
                    </button>

                </div>

                {showConfirm && (
                    <div className="confirm-overlay">

                        {loading ? (
                            <div className="loading-overlay">
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <div className="confirm-box">
                                <h4>Confirmation</h4>
                                <p>Are you sure you want to Link with this MOC {selectedMoc.MOCTitle}-{selectedMoc.MocNo}?</p>

                                <div className="confirm-buttons">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowConfirm(false)}
                                    >
                                        No
                                    </button>

                                    <button
                                        type="button"
                                        className="confirm-btn"
                                        onClick={() => {
                                            setLoading(true); 
                                            saveMocReference();
                                        }}
                                    >
                                        Yes
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                )}



            </div>
        </div>
    );
};

export default MocPopup;
