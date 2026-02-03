import * as Yup from "yup";
import { amountField, dateField } from "./commonFields";

export const usageSchema = Yup.object({
  amount: amountField,
  category: Yup.string().required("Category is required"),
  date: dateField,
  note: Yup.string().max(200, "Note must be under 200 characters").nullable(),
});
