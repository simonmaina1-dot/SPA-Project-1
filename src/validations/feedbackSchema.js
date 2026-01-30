import * as Yup from "yup";
import { nameField, emailField, messageField } from "./commonFields";

export const feedbackSchema = Yup.object({
  name: nameField,
  email: emailField,
  message: messageField,
});
