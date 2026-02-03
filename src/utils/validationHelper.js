export async function validateForm(schema, values) {
  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = values[field];

    if (rules.required && (!value || value.trim() === "")) {
      errors[field] = rules.message || `${field} is required`;
      continue;
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = rules.message || `${field} must be at least ${rules.minLength} characters`;
      continue;
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.message || `${field} format is invalid`;
      continue;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
