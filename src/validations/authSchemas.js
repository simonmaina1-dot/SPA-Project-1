import * as Yup from "yup";
import { emailField, strongPasswordField, nameField } from "./commonFields";

// Login schema for SignIn form 
export const loginSchema = Yup.object({
  email: emailField,
  password: strongPasswordField,
});

// Register schema 
export const registerSchema = Yup.object({
  name: nameField,
  email: emailField,
  password: strongPasswordField, 
});
