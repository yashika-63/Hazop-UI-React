import React, { useState } from "react";
import axios from "axios";
import { FaPlus, FaMinus, FaFileAlt, FaCloudUploadAlt } from "react-icons/fa";
import { strings } from "../string";
import { showToast } from "../CommonUI/CommonUI";
import './HazopDocument.css';

const HazopDocumentUpload = React.forwardRef(({ disabled }, ref) => {
    const [documents, setDocuments] = useState([]); 
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    React.useImperativeHandle(ref, () => ({
        uploadDocuments: async (hazopId) => {
            if (!hazopId) return;
            // Filter out empty entries before uploading
            const validDocs = documents.filter(d => d.file !== null);
            
            if (!validDocs.length) {
                // showToast("No files selected to upload", "warning"); 
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
                        `http://${strings.localhost}/api/javaHazopDocument/upload/${hazopId}`,
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" },
                        }
                    );
                }

                showToast("Documents uploaded successfully!", "success");
                // Optional: Clear documents after success
                setDocuments([]); 
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
            // Create a new entry for each dropped file
            const newDocs = files.map(file => ({ file: file }));
            
            // Append new files to existing list
            // We also filter out any initial "empty" placeholders if expanding
            setDocuments(prev => {
                const cleanPrev = prev.filter(doc => doc.file !== null);
                return [...cleanPrev, ...newDocs];
            });
            
            showToast(`${files.length} file(s) added`, "success");
        }
    };

    // --- Manual Input Handlers ---
    const handleFileChange = (index, file) => {
        const updated = [...documents];
        updated[index].file = file;
        setDocuments(updated);
    };

    const addDocumentRow = () => {
        setDocuments([...documents, { file: null }]);
    };

    const removeDocumentRow = (index) => {
        const updated = documents.filter((_, i) => i !== index);
        setDocuments(updated);
    };

    return (
        <div className="document-upload-container">
            <h4>Upload HAZOP Documents</h4>

            {/* DRAG AND DROP ZONE */}
            <div 
                className={`drop-zone ${isDragging ? "dragging" : ""} ${disabled ? "disabled" : ""}`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <FaCloudUploadAlt className="upload-icon" />
                <p>Drag & Drop files here</p>
                <span>or</span>
                <button 
                    type="button" 
                    className="browse-btn" 
                    onClick={addDocumentRow}
                    disabled={disabled || uploading}
                >
                    Browse / Upload document
                </button>
            </div>

            {/* FILE LIST */}
            <div className="file-list">
                {documents.map((doc, index) => (
                    <div className="document-row" key={index}>
                        <div className="file-info">
                            <label className="custom-file-upload">
                                {doc.file ? "Change File" : "Choose File"}
                                <input
                                    type="file"
                                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                                    disabled={disabled || uploading}
                                />
                            </label>
                            
                            <span className="file-name" title={doc.file ? doc.file.name : ""}>
                                <FaFileAlt style={{marginRight: '5px', color: '#666'}}/>
                                {doc.file ? doc.file.name : "No file chosen"}
                            </span>
                        </div>

                        <button
                            type="button"
                            className="remove-btn"
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