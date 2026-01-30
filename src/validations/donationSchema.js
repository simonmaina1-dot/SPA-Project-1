import * as Yup from "yup";
import { nameField, emailField, amountField, paymentMethodField, donorNoteField } from "./commonFields";

export const donationSchema = Yup.object({
  name: nameField,
  email: emailField,
  amount: amountField,
  source: paymentMethodField,
  note: donorNoteField,
});
