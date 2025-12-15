import { strings } from "../string";

export const fetchNode = async (currentNodeId, setCurrentNodeData) => {
  if (!currentNodeId) return;
  const res = await fetch(`http://${strings.localhost}/api/hazopNode/${currentNodeId}`);
  if (res.ok) {
    const data = await res.json();
    setCurrentNodeData(data);
  }
};

export const fetchAllDetails = async (nodeID, setDetails, setForm, setTempRecommendations, setCurrentDetailId, setCurrentIndex, setIsSaved, setLoading, showToast) => {
  if (!nodeID) return;
  try {
    setLoading(true);
    const res = await fetch(`http://${strings.localhost}/api/hazopNodeDetail/node/${nodeID}`);
    if (!res.ok) throw new Error('Failed to fetch node details');
    const data = await res.json();
    if (data && data.length > 0) {
      setDetails(data);
      setCurrentIndex(0);
      const firstDetail = data[0];
      setForm({
        ...firstDetail,
        additionalControl: firstDetail.recommendations?.map(r => r.recommendation).join('\n') || '',
      });
      setTempRecommendations(firstDetail.recommendations || []);
      setCurrentDetailId(firstDetail.id);
      setIsSaved(true);
    }
  } catch (err) {
    console.error('Error fetching node details', err);
  } finally {
    setLoading(false);
  }
};

export const loadNodeDetails = async (nodeId, setDetails, setForm, setTempRecommendations, setCurrentDetailId, setCurrentIndex, setLoading, showToast) => {
  try {
    setLoading(true);
    const res = await fetch(`http://${strings.localhost}/api/hazopNodeDetail/node/${nodeId}`);
    const data = await res.json();
    setDetails(data);
    if (data.length > 0) {
      const firstDetail = data[0];
      const recsRes = await fetch(`http://${strings.localhost}/api/nodeRecommendation/getByDetailId/${firstDetail.id}`);
      const recommendations = await recsRes.json();
      setForm({
        ...firstDetail,
        additionalControl: recommendations.map(r => r.recommendation).join('\n'),
      });
      setTempRecommendations(recommendations);
      setCurrentDetailId(firstDetail.id);
      setCurrentIndex(0);
    } else {
      setForm(initialState);
      setTempRecommendations([]);
      setCurrentDetailId(null);
      setCurrentIndex(0);
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to load node details.', 'error');
  } finally {
    setLoading(false);
  }
};

export const reloadDetails = async (currentNodeId, setDetails) => {
  const res = await fetch(`http://${strings.localhost}/api/hazopNodeDetail/node/${currentNodeId}`);
  const data = await res.json();
  setDetails(data);
  return data;
};

export const handleSubmit = async (form, nodeID, currentNodeId, showToast, setLoading, setForm, setTempRecommendations, setCurrentDetailId, setIsSaved, validate, strings) => {
  if (!validate()) return;
  try {
    setLoading(true);
    const nodeDetailResponse = await fetch(`http://${strings.localhost}/api/hazopNodeDetail/saveDetails/${currentNodeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (nodeDetailResponse.ok) {
      setIsSaved(true);
      const nodeDetailResult = await nodeDetailResponse.json();
      const savedDetail = Array.isArray(nodeDetailResult) ? nodeDetailResult[0] : nodeDetailResult;
      const nodeDetailId = savedDetail.id;
      setCurrentDetailId(nodeDetailId);
      const cleanedRecommendations = form.additionalControl
        .split('\n')
        .map(line => line.replace(',', '').trim())
        .filter(line => line !== '');
      const recommendationsList = cleanedRecommendations.map((text, index) => {
        const existingRec = tempRecommendations[index];
        return {
          id: existingRec?.id,
          recommendation: text,
          remarkbyManagement: existingRec?.remarkbyManagement,
        };
      });
      const recommendationsResponse = await fetch(`http://${strings.localhost}/api/nodeRecommendation/save/${currentNodeId}/${nodeDetailId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recommendationsList),
      });
      if (recommendationsResponse.ok) {
        showToast('Details saved successfully!', 'success');
      } else {
        showToast('Failed to save recommendations.', 'error');
      }
    } else {
      showToast('Failed to save details.', 'error');
    }
  } catch (error) {
    console.error('Error saving details', error);
    showToast('Error saving details.', 'error');
  } finally {
    setLoading(false);
  }
};
