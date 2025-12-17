import React, { useState } from "react";
import axios from "axios";
import { FaPlus, FaMinus, FaFileAlt } from "react-icons/fa";
import { strings } from "../string";
import { showToast } from "../CommonUI/CommonUI";
import './HazopDocument.css';

const HazopDocumentUpload = React.forwardRef(({ disabled }, ref) => {
    const [documents, setDocuments] = useState([{ file: null }]);
    const [uploading, setUploading] = useState(false);

    // Expose a function to parent using ref
    React.useImperativeHandle(ref, () => ({
        uploadDocuments: async (hazopId) => {
            if (!hazopId) return;
            if (!documents.length) return;

            setUploading(true);
            const empCode = localStorage.getItem("empCode") || "";

            try {
                for (let doc of documents) {
                    if (!doc.file) continue;

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
            } catch (err) {
                console.error("Document upload failed:", err);
                showToast("Failed to upload documents", "error");
            } finally {
                setUploading(false);
            }
        },
    }));

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
        setDocuments(updated.length ? updated : [{ file: null }]);
    };

    return (
        <div className="document-upload-container">
            <h4>Upload HAZOP Documents</h4>
            {documents.map((doc, index) => (
               <div className="document-row" key={index}>
               <label className="custom-file-upload">
                 Choose File
                 <input
                   type="file"
                   onChange={(e) => handleFileChange(index, e.target.files[0])}
                   disabled={disabled || uploading}
                 />
               </label>
               
               {/* Add some spacing and show filename */}
               <span className="file-name">
                 {doc.file ? doc.file.name : "No file chosen"}
               </span>
               
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

            <button
                type="button"
                className="adddocument-btn"
                onClick={addDocumentRow}
                disabled={disabled || uploading}
            >
                <FaFileAlt /> Upload Document
            </button>
        </div>
    );
});

export default HazopDocumentUpload;
