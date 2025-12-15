export const handleChange = (e, setForm, setRows, setSmallRows, setTempRecommendations, setIsSaved) => {
  setIsSaved(false);
  const { name, value } = e.target;
  setForm((prevForm) => {
    const updatedForm = { ...prevForm, [name]: value };
    if (name === 'additionalControl') {
      const lines = value.split('\n').map(line => line.replace(',', '').trim()).filter(line => line !== '');
      const recommendations = lines.map(text => ({ recommendation: text, remarkbyManagement: '' }));
      setTempRecommendations(recommendations);
    }
    if (name === 'causes' || name === 'consequences' || name === 'deviation') {
      const lineCount = value.split('\n').length;
      setRows(Math.min(20, Math.max(15, lineCount)));
    }
    if (name === 'additionalControl' || name === 'existineControl') {
      const lineCount = value.split('\n').length;
      setSmallRows(Math.min(12, Math.max(9, lineCount)));
    }
    if (name === 'existineProbability' || name === 'existingSeverity') {
      const probability = parseInt(updatedForm.existineProbability, 10) || 1;
      const severity = parseInt(updatedForm.existingSeverity, 10) || 1;
      updatedForm.riskRating = (probability * severity).toString();
    }
    if (name === 'additionalProbability' || name === 'additionalSeverity') {
      const probability = parseInt(updatedForm.additionalProbability, 10) || 1;
      const severity = parseInt(updatedForm.additionalSeverity, 10) || 1;
      updatedForm.additionalRiskRating = (probability * severity).toString();
    }
    return updatedForm;
  });
};

export const validate = (form, showToast, isAdditionalRequired) => {
  if (!form.generalParameter.trim()) {
    showToast('General Parameter is required.', 'warn');
    return false;
  }
  if (!form.specificParameter.trim()) {
    showToast('Specific Parameter is required.', 'warn');
    return false;
  }
  if (!form.guidWord.trim()) {
    showToast('Guide Word is required.', 'warn');
    return false;
  }
  if (!form.causes.trim()) {
    showToast('Causes is required.', 'warn');
    return false;
  }
  if (!form.consequences.trim()) {
    showToast('Consequences is required.', 'warn');
    return false;
  }
  if (!form.deviation.trim()) {
    showToast('Deviation is required.', 'warn');
    return false;
  }
  if (!form.existineControl.trim()) {
    showToast('Existing Control is required.', 'warn');
    return false;
  }
  if (!form.existineProbability) {
    showToast('Existing Probability is required.', 'warn');
    return false;
  }
  if (!form.existingSeverity) {
    showToast('Existing Severity is required.', 'warn');
    return false;
  }
  if (!form.riskRating) {
    showToast('Risk Rating is required.', 'warn');
    return false;
  }
  if (isAdditionalRequired()) {
    if (!form.additionalControl.trim()) {
      showToast('Additional Control is required when Risk Rating is 12 or higher.', 'warn');
      return false;
    }
    if (!form.additionalProbability) {
      showToast('Additional Probability is required when Risk Rating is 12 or higher.', 'warn');
      return false;
    }
    if (!form.additionalSeverity) {
      showToast('Additional Severity is required when Risk Rating is 12 or higher.', 'warn');
      return false;
    }
  }
  return true;
};
