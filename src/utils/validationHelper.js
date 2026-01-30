import { ValidationError } from "yup";

/**
 * Validates form values against a Yup schema.
 * @param {Yup.ObjectSchema} schema - The Yup schema to validate against
 * @param {Object} values - The form values to validate
 * @returns {Object} - Returns { isValid, errors }
 *   isValid: boolean
 *   errors: object mapping field names to error messages
 */
export async function validateForm(schema, values) {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof ValidationError) {
      const errorMap = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errorMap[err.path] = err.message;
        }
      });
      return { isValid: false, errors: errorMap };
    }
    return { isValid: false, errors: { general: "Validation failed" } };
  }
}
