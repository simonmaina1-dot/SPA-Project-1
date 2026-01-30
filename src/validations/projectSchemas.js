import * as Yup from "yup";

export const identitySchema = Yup.object({
  identityDocument: Yup.string()
    .url("Government ID / Passport URL must be a valid URL")
    .required("Government ID / Passport URL is required"),
});


export const personalInfoSchema = Yup.object({
  ownerName: Yup.string()
    .min(5, "Name must be at least 5 characters")
    .required("Full name is required"),

  ownerEmail: Yup.string()
    .email("Must be a valid email")
    .required("Email is required"),

  ownerPhone: Yup.string()
    .matches(
      /^(\+?\d{10,15})$/,
      "Phone number must be valid (10–15 digits, may start with +)"
    )
    .required("Phone number is required"),
});


export const projectDetailsSchema = Yup.object({
  title: Yup.string()
    .min(10, "Project title must be at least 10 characters")
    .required("Project title is required"),

  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),

  category: Yup.string().required("Category is required"),

  goal: Yup.number()
    .typeError("Funding goal must be a number")
    .positive("Funding goal must be greater than 0")
    .required("Funding goal is required"),

  imageUrl: Yup.string()
    .url("Cover image must be a valid URL")
    .notRequired()
    .transform((value) => (value === "" ? undefined : value)),

  galleryUrls: Yup.string()
    .notRequired()
    .transform((value) => (value === "" ? undefined : value))
    .test(
      "galleryUrls",
      "Gallery URLs must be comma-separated valid URLs",
      (value) => {
        if (!value) return true;
        return value
          .split(",")
          .map((url) => url.trim())
          .every((url) => /^https?:\/\/.+\..+/.test(url));
      }
    ),
});


export const criteriaSchema = Yup.object({
  criteriaMet: Yup.object()
    .required("Please confirm the project criteria")
    .test(
      "allCriteriaMet",
      "Please confirm each project criteria item",
      (obj) => obj && Object.values(obj).every(Boolean)
    ),
});


export const projectSchema = identitySchema
  .concat(personalInfoSchema)
  .concat(projectDetailsSchema)
  .concat(criteriaSchema);
