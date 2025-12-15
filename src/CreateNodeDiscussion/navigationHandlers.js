export const handleSaveAndNext = async (form, nodeID, currentNodeId, showToast, setLoading, setForm, setRows, setSmallRows, setIsSaved, validate, strings) => {
  if (!validate()) return;
  try {
    setLoading(true);
    const discussionPayload = {
      generalParameter: form.generalParameter,
      specificParameter: form.specificParameter,
      guidWord: form.guidWord,
      deviation: form.deviation,
      causes: form.causes,
      consequences: form.consequences,
      existineControl: form.existineControl,
      existineProbability: parseInt(form.existineProbability, 10),
      existingSeverity: parseInt(form.existingSeverity, 10),
      riskRating: parseInt(form.riskRating, 10),
      additionalControl: form.additionalControl,
      additionalProbability: parseInt(form.additionalProbability, 10),
      additionalSeverity: parseInt(form.additionalSeverity, 10),
      additionalRiskRating: parseInt(form.additionalRiskRating, 10),
      node: { id: nodeID },
    };
    const detailRes = await fetch(`http://${strings.localhost}/api/hazopNodeDetail/saveDetails/${currentNodeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discussionPayload),
    });
    const savedDetails = await detailRes.json();
    const nodeDetailId = savedDetails[0].id;
    setCurrentDetailId(nodeDetailId);
    const cleanedRecommendations = form.additionalControl
      .split('\n')
      .map(line => line.replace(',', '').trim())
      .filter(line => line !== '');
    const recommendationsList = cleanedRecommendations.map(text => ({
      recommendation: text,
    }));
    for (let rec of recommendationsList) {
      const url = rec.id
        ? `http://${strings.localhost}/api/nodeRecommendation/update/${rec.id}`
        : `http://${strings.localhost}/api/nodeRecommendation/save/${currentNodeId}/${nodeDetailId}`;
      await fetch(url, {
        method: rec.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rec),
      });
    }
    showToast('Saved Successfully!', 'success');
    setForm(initialState);
    setRows(15);
    setSmallRows(7);
    setIsSaved(true);
  } catch (error) {
    console.error('Save Error', error);
    showToast('Failed to Save', 'error');
  } finally {
    setLoading(false);
  }
};

export const handlePrevNextNode = async (direction, isSaved, showToast, currentNodeId, setCurrentNodeId, setForm, setTempRecommendations, setCurrentDetailId, setCurrentIndex, setLoading, nodeID, fetchNodeByDirection, loadNodeDetails) => {
  if (!isSaved) {
    showToast('Please save the form before switching nodes.', 'warn');
    return;
  }
  const nextNode = await fetchNodeByDirection(direction, nodeID, currentNodeId);
  if (!nextNode) {
    showToast(direction === 'previous' ? 'No previous node found.' : 'No next node found.', 'info');
    return;
  }
  setCurrentNodeId(nextNode.id);
  try {
    setLoading(true);
    const res = await fetch(`http://${strings.localhost}/api/hazopNodeDetail/node/${nextNode.id}`);
    const detailsData = await res.json();
    if (detailsData && detailsData.length > 0) {
      const firstDetail = detailsData[0];
      const recsRes = await fetch(`http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${firstDetail.id}`);
      const recommendations = await recsRes.json();
      setForm({
        ...firstDetail,
        additionalControl: recommendations.map(r => r.recommendation).join('\n'),
      });
      setTempRecommendations(recommendations);
      setCurrentDetailId(firstDetail.id);
      setCurrentIndex(0);
      setIsSaved(true);
    } else {
      setForm(initialState);
      setTempRecommendations([]);
      setCurrentDetailId(null);
      setCurrentIndex(0);
      setIsSaved(true);
      showToast('Blank form opened for new node.', 'info');
    }
  } catch (err) {
    console.error('Error loading node details', err);
    showToast('Failed to load node details.', 'error');
  } finally {
    setLoading(false);
  }
};

export const handlePrevNext = async (direction, isSaved, showToast, currentDetailId, setForm, setTempRecommendations, setCurrentDetailId, fetchDetailByDirection, loadRecommendations) => {
  if (!isSaved) {
    showToast('Please save the form before navigating.', 'warn');
    return;
  }
  if (!currentDetailId && direction === 'previous') {
    const lastRecord = await fetchDetailByDirection('previous');
    if (!lastRecord) {
      showToast('No previous record found.', 'info');
      return;
    }
    const recs = await loadRecommendations(lastRecord.id);
    setForm({
      ...lastRecord,
      additionalControl: recs.map(r => r.recommendation).join('\n'),
    });
    setTempRecommendations(recs);
    setCurrentDetailId(lastRecord.id);
    return;
  }
  const nextDetail = await fetchDetailByDirection(direction);
  if (!nextDetail && direction === 'next') {
    setForm(initialState);
    setTempRecommendations([]);
    setCurrentDetailId(null);
    showToast('Blank form opened. Enter new details.', 'info');
    return;
  }
  if (!nextDetail && direction === 'previous') {
    showToast('No previous record found.', 'info');
    return;
  }
  const recs = await loadRecommendations(nextDetail.id);
  setForm({
    ...nextDetail,
    additionalControl: recs.map(r => r.recommendation).join('\n'),
  });
  setTempRecommendations(recs);
  setCurrentDetailId(nextDetail.id);
};

export const openNextRecord = async (currentIndex, setForm, setTempRecommendations, setCurrentDetailId, setCurrentIndex, setIsSaved, showToast, reloadDetails, loadRecommendations) => {
  if (!validate()) return;
  if (!isSaved) {
    showToast('Please save the form before navigating.', 'warn');
    return;
  }
  const updatedDetails = await reloadDetails();
  const nextIndex = currentIndex + 1;
  if (nextIndex < updatedDetails.length) {
    const detail = updatedDetails[nextIndex];
    const recs = await loadRecommendations(detail.id);
    setForm({
      ...detail,
      additionalControl: recs.map(r => r.recommendation).join('\n'),
    });
    setTempRecommendations(recs);
    setCurrentDetailId(detail.id);
    setCurrentIndex(nextIndex);
    setIsSaved(true);
    return;
  }
  setForm(initialState);
  setTempRecommendations([]);
  setCurrentDetailId(null);
  setCurrentIndex(updatedDetails.length);
  setIsSaved(true);
  showToast('Blank form opened. Enter new details.', 'info');
};

export const loadRecommendations = async (detailId) => {
  try {
    const res = await fetch(`http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${detailId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Error loading recommendations', e);
    return [];
  }
};

export const fetchNodeByDirection = async (direction, nodeID, currentNodeId) => {
  if (!nodeID) return null;
  try {
    setLoading(true);
    const currentIdParam = currentNodeId || 0;
    const nodeRes = await fetch(`http://${strings.localhost}/api/hazopNode/${currentNodeId}`);
    if (!nodeRes.ok) throw new Error('Failed to fetch node');
    const nodeData = await nodeRes.json();
    const registrationId = nodeData.javaHazopRegistration?.id || 0;
    const res = await fetch(`http://${strings.localhost}/api/hazopNode/node/getByDirection?currentId=${currentIdParam}&registrationId=${registrationId}&direction=${direction}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching node by direction', error);
    showToast('Failed to fetch node.', 'error');
    return null;
  } finally {
    setLoading(false);
  }
};

export const saveCurrentDetails = async (currentForm, tempRecommendations, currentNodeId, setForm, showToast, setLoading, reloadDetails) => {
  setIsSaved(true);
  try {
    setLoading(true);
    const nodeDetailRes = await fetch(`http://${strings.localhost}/api/hazopNodeDetail/update/${currentForm.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentForm),
    });
    await reloadDetails();
    if (!nodeDetailRes.ok) throw new Error('Failed to update node detail');
    for (let rec of tempRecommendations) {
      const recPayload = {
        recommendation: rec.recommendation,
        remarkbyManagement: rec.remarkbyManagement,
      };
      const url = rec.id
        ? `http://${strings.localhost}/api/nodeRecommendation/update/${rec.id}`
        : `http://${strings.localhost}/api/nodeRecommendation/save/${currentNodeId}/${currentForm.id}`;
      await fetch(url, {
        method: rec.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recPayload),
      });
    }
    showToast('Saved Successfully', 'success');
  } catch (error) {
    console.error('Error saving current form', error);
    showToast('Failed to save changes', 'error');
  } finally {
    setLoading(false);
  }
};

export const handleDeleteClick = (rec, index, setRecToDelete, setRecIndexToDelete, setShowDeleteConfirmation) => {
  setRecToDelete(rec);
  setRecIndexToDelete(index);
  setShowDeleteConfirmation(true);
};

export const confirmDelete = async (recToDelete, recIndexToDelete, tempRecommendations, setTempRecommendations, form, setForm, currentDetailId, setLoading, showToast, setRecToDelete, setRecIndexToDelete, setShowDeleteConfirmation) => {
  if (!recToDelete) return;
  setShowDeleteConfirmation(false);
  setLoading(true);
  try {
    const updatedRecs = tempRecommendations.filter((_, i) => i !== recIndexToDelete);
    const updatedForm = {
      ...form,
      additionalControl: updatedRecs.map(r => r.recommendation).join('\n'),
    };
    setTempRecommendations(updatedRecs);
    setForm(updatedForm);
    if (recToDelete.id) {
      const deleteRes = await fetch(`http://${strings.localhost}/api/nodeRecommendation/delete/${recToDelete.id}`, { method: 'DELETE' });
      if (!deleteRes.ok) throw new Error('Failed to delete recommendation');
    }
    const updateRes = await fetch(`http://${strings.localhost}/api/hazopNodeDetail/update/${currentDetailId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedForm),
    });
    if (!updateRes.ok) throw new Error('Failed to update node details');
    showToast('Recommendation deleted successfully.', 'success');
  } catch (error) {
    console.error(error);
    showToast('Error deleting recommendation.', 'error');
  } finally {
    setLoading(false);
    setRecToDelete(null);
    setRecIndexToDelete(null);
  }
};

export const cancelDelete = (setRecToDelete, setRecIndexToDelete, setShowDeleteConfirmation) => {
  setRecToDelete(null);
  setRecIndexToDelete(null);
  setShowDeleteConfirmation(false);
};
