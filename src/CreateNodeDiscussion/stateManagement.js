import { useState } from 'react';

export const initialState = {
  generalParameter: '',
  specificParameter: '',
  guidWord: '',
  deviation: '',
  causes: '',
  consequences: '',
  existineControl: '',
  existineProbability: '',
  existingSeverity: '',
  riskRating: '',
  additionalControl: '',
  additionalProbability: '',
  additionalSeverity: '',
  additionalRiskRating: '',
};

export const useNodeFormState = () => {
  const [form, setForm] = useState(initialState);
  const [rows, setRows] = useState(15);
  const [smallRows, setSmallRows] = useState(9);
  const [loading, setLoading] = useState(false);
  const [tempRecommendations, setTempRecommendations] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentDetailId, setCurrentDetailId] = useState(null);
  const [details, setDetails] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [recToDelete, setRecToDelete] = useState(null);
  const [recIndexToDelete, setRecIndexToDelete] = useState(null);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [currentNodeData, setCurrentNodeData] = useState(null);

  return {
    form,
    setForm,
    rows,
    setRows,
    smallRows,
    setSmallRows,
    loading,
    setLoading,
    tempRecommendations,
    setTempRecommendations,
    showConfirmation,
    setShowConfirmation,
    currentDetailId,
    setCurrentDetailId,
    details,
    setDetails,
    currentIndex,
    setCurrentIndex,
    isSaved,
    setIsSaved,
    showDeleteConfirmation,
    setShowDeleteConfirmation,
    recToDelete,
    setRecToDelete,
    recIndexToDelete,
    setRecIndexToDelete,
    currentNodeId,
    setCurrentNodeId,
    currentNodeData,
    setCurrentNodeData,
  };
};
