  const root = document.documentElement;
  const trivial = getComputedStyle(root).getPropertyValue("--trivial").trim();
  const tolerable = getComputedStyle(root)
    .getPropertyValue("--tolerable")
    .trim();
  const moderate = getComputedStyle(root).getPropertyValue("--moderate").trim();
  const substantial = getComputedStyle(root)
    .getPropertyValue("--substantial")
    .trim();
  const intolerable = getComputedStyle(root)
    .getPropertyValue("--intolerable")
    .trim();

export const isAdditionalRequired = (form) => {
  if (!form || !form.riskRating) return false;
  const riskRating = parseInt(form.riskRating, 10) || 0;
  return riskRating >= 12;
};

export const renderScaleSelect = (name, value, handleChange, className, style) => (
  <select name={name} value={value} onChange={handleChange} className={className} style={style}>
    <option value="">Select</option>
    {[1, 2, 3, 4, 5].map(n => (
      <option key={n} value={n}>{n}</option>
    ))}
  </select>
);

export const getBorderColor = (risk) => {
  const r = Number(risk);
  if ([1, 2, 3, 4, 5].includes(r)) return trivial;
  if ([6, 8, 9, 10].includes(r)) return tolerable;
  if ([12, 15].includes(r)) return moderate;
  if ([16, 18].includes(r)) return substantial;
  if ([20, 25].includes(r)) return intolerable;
  return '#ccc';
};

export const getRiskClass = (risk) => {
  const r = Number(risk);
  if ([1, 2, 3, 4, 5].includes(r)) return 'risk-trivial';
  if ([6, 8, 9, 10].includes(r)) return 'risk-tolerable';
  if ([12, 15].includes(r)) return 'risk-moderate';
  if ([16, 18].includes(r)) return 'risk-substantial';
  if ([20, 25].includes(r)) return 'risk-intolerable';
  return 'risk-default';
};

export const getRiskLevelText = (risk) => {
  const r = Number(risk);
  if ([1, 2, 3, 4, 5].includes(r)) return 'Trivial';
  if ([6, 8, 9, 10].includes(r)) return 'Tolerable';
  if ([12, 15].includes(r)) return 'Moderate';
  if ([16, 18].includes(r)) return 'Substantial';
  if ([20, 25].includes(r)) return 'Intolerable';
  return '';
};

export const getRiskTextClass = (risk) => {
  const r = Number(risk);
  if ([1, 2, 3, 4, 5].includes(r)) return 'risk-badge risk-trivial';
  if ([6, 8, 9, 10].includes(r)) return 'risk-badge risk-tolerable';
  if ([12, 15].includes(r)) return 'risk-badge risk-moderate';
  if ([16, 18].includes(r)) return 'risk-badge risk-substantial';
  if ([20, 25].includes(r)) return 'risk-badge risk-intolerable';
  return 'risk-default';
};
