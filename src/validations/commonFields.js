import * as Yup from "yup";

export const emailField = Yup.string()
  .email("Invalid email format")
  .required("Email is required");

export const strongPasswordField = Yup.string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
  .matches(/[0-9]/, "Password must contain at least one number")
  .required("Password is required");

export const nameField = Yup.string()
  .min(5, "Name must be at least 5 characters")
  .required("Name is required");

export const roleField = Yup.string()
  .oneOf(["user", "admin"], "Role must be either user or admin")
  .required("Role is required");

export const urlField = Yup.string()
  .url("Must be a valid URL")
  .required("This field is required");

export const phoneField = Yup.string()
  .matches(/^\+?[0-9]{7,15}$/, "Invalid phone number")
  .required("Phone number is required");

export const titleField = Yup.string()
  .min(3, "Title must be at least 3 characters")
  .required("Project title is required");

export const descriptionField = Yup.string()
  .min(10, "Description must be at least 10 characters")
  .required("Description is required");

export const goalField = Yup.number()
  .positive("Funding goal must be positive")
  .required("Funding goal is required");

export const amountField = Yup.number()
  .min(1, "Amount must be at least 1 KSh")
  .required("Amount is required");

export const paymentMethodField = Yup.string()
  .oneOf(["card", "mpesa", "bank", "cash", "other"], "Invalid payment method")
  .required("Payment method is required");

export const donorNoteField = Yup.string()
  .max(300, "Note must be under 300 characters")
  .nullable();

export const messageField = Yup.string()
  .min(5, "Message must be at least 5 characters")
  .required("Message is required");

export const dateField = Yup.date()
  .required("Date is required")
  .typeError("Invalid date format");
