import * as Yup from "yup";

export async function validateForm(schema, values) {
  try {
    // Validate using Yup schema
    await schema.validate(values, { abortEarly: false });
    return {
      isValid: true,
      errors: {},
    };
  } catch (validationError) {
    const errors = {};
    if (validationError.inner) {
      validationError.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
    }
    return {
      isValid: false,
      errors,
    };
  }
}
