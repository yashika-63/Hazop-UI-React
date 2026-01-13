import React, { useState, useRef } from "react";
import axios from "axios";
import { FaMinus, FaFileAlt, FaCloudUploadAlt } from "react-icons/fa";
import { strings } from "../string";
import { showToast } from "../CommonUI/CommonUI";
import './HazopDocument.css';

const HazopDocumentUpload = React.forwardRef(({ disabled }, ref) => {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Ref for the hidden file input to allow bulk selection via button
    const hiddenFileInputRef = useRef(null);

    React.useImperativeHandle(ref, () => ({
        uploadDocuments: async (hazopId) => {
            if (!hazopId) return;
            // Filter out empty entries before uploading
            const validDocs = documents.filter(d => d.file !== null);

            if (!validDocs.length) {
                return;
            }

            setUploading(true);
            const empCode = localStorage.getItem("empCode") || "";

            try {
                for (let doc of validDocs) {
                    const formData = new FormData();
                    formData.append("file", doc.file);
                    formData.append("documentIdentityKey", "HAZOPDOCUMENT");
                    formData.append("empCode", empCode);
                    formData.append("status", true);
                    formData.append("primeryKey", "HAZOPFIRSTPAGEID");
                    formData.append("primeryKeyValue", hazopId);

                    await axios.post(
                        `${strings.localhost}/api/javaHazopDocument/upload/${hazopId}`,
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" },
                        }
                    );
                }

                showToast("Documents uploaded successfully!", "success");
                setDocuments([]); // Clear list on success
            } catch (err) {
                console.error("Document upload failed:", err);
                showToast("Failed to upload documents", "error");
            } finally {
                setUploading(false);
            }
        },
    }));

    // --- Drag and Drop Handlers ---
    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled && !uploading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled || uploading) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const newDocs = files.map(file => ({ file: file }));

            // Append new files to existing list, keeping any existing valid files
            setDocuments(prev => {
                const cleanPrev = prev.filter(doc => doc.file !== null);
                return [...cleanPrev, ...newDocs];
            });

            showToast(`${files.length} file(s) added`, "success");
        }
    };

    // --- Bulk File Select via Button ---
    const handleBulkFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newDocs = files.map(file => ({ file: file }));

            setDocuments(prev => {
                // Remove empty placeholders if any, then append new files
                const cleanPrev = prev.filter(doc => doc.file !== null);
                return [...cleanPrev, ...newDocs];
            });
        }
        // Reset input value to allow selecting the same file again if needed
        e.target.value = null;
    };

    // --- Trigger Hidden Input ---
    const onBrowseClick = () => {
        hiddenFileInputRef.current.click();
    };

    // --- Single File Change (for replacing a specific row) ---
    const handleFileChange = (index, file) => {
        const updated = [...documents];
        updated[index].file = file;
        setDocuments(updated);
    };

    const removeDocumentRow = (index) => {
        const updated = documents.filter((_, i) => i !== index);
        setDocuments(updated);
    };

    return (
        <div className="document-upload-container">
            <h4>Upload HAZOP Documents</h4>

            {/* Hidden Input for Bulk Selection */}
            <input
                type="file"
                multiple
                ref={hiddenFileInputRef}
                style={{ display: 'none' }}
                onChange={handleBulkFileSelect}
                disabled={disabled || uploading}
            />

            {/* DRAG AND DROP ZONE */}
            <div
                className={`drop-zone ${isDragging ? "dragging" : ""} ${disabled ? "disabled" : ""}`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <FaCloudUploadAlt className="upload-icon" />
                <p>Drag & Drop multiple files here</p>
                <span>or</span>
                <button
                    type="button"
                    className="browse-btn"
                    onClick={onBrowseClick} 
                    disabled={disabled || uploading}
                >
                    Browse Files
                </button>
            </div>

            {/* FILE LIST */}
            <div className="file-list">
                {documents.map((doc, index) => (
                    <div className="document-row" key={index}>
                        <div className="file-info">
                            <label className="custom-file-upload">
                                {doc.file ? "Change" : "Select"}
                                <input
                                    type="file"
                                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                                    disabled={disabled || uploading}
                                />
                            </label>

                            <span className="file-name" title={doc.file ? doc.file.name : ""}>
                                <FaFileAlt style={{ marginRight: '5px', color: '#666' }} />
                                {doc.file ? doc.file.name : "No file chosen"}
                            </span>
                        </div>

                        <button
                            type="button"
                            // className="remove-btn"
                            style={{ background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer' }}
                            onClick={() => removeDocumentRow(index)}
                            disabled={disabled || uploading}
                        >
                            <FaMinus />
                        </button>
                    </div>
                ))}
            </div>

            {documents.length === 0 && (
                <p className="no-files-text">No files selected</p>
            )}
        </div>
    );
});

export default HazopDocumentUpload;