import { useCallback, useState } from "react";

export default function useForm(initialValues) {
  const [values, setValues] = useState(initialValues);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(
    (nextValues = initialValues) => {
      setValues(nextValues);
    },
    [initialValues]
  );

  return { values, handleChange, setFieldValue, reset, setValues };
}
