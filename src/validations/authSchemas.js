import * as Yup from "yup";
import { emailField, strongPasswordField, nameField, roleField } from "./commonFields";

// Login schema for SignIn form
export const loginSchema = Yup.object({
  email: emailField,
  password: strongPasswordField,
  role: roleField,
});

// Register schema for SignUp form
export const registerSchema = Yup.object({
  name: nameField,
  email: emailField,
  password: strongPasswordField,
});
