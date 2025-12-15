import { useEffect } from "react";

export const addBulletPoint = (form, setForm, handleChange, additionalControlRef) => {
  const bullet = '\n• ';
  const newValue = !form.additionalControl.trim() ? bullet : form.additionalControl + bullet;
  handleChange({ target: { name: 'additionalControl', value: newValue } });
  setTimeout(() => {
    if (additionalControlRef.current) {
      additionalControlRef.current.focus();
      additionalControlRef.current.selectionStart = additionalControlRef.current.value.length;
      additionalControlRef.current.selectionEnd = additionalControlRef.current.value.length;
    }
  }, 0);
};

export const useRecommendationEffect = (form, setForm, setIsSaved) => {
  useEffect(() => {
    if (!form.additionalControl.trim()) {
      setForm(prev => ({ ...prev, additionalControl: '' }));
      setIsSaved(true);
    }
  }, [form.additionalControl]);
};
