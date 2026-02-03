import * as Yup from "yup";

export const addProjectSchema = Yup.object({
  title: Yup.string()
    .min(10, "Project title must be at least 10 characters")
    .required("Project title is required"),
  description: Yup.string()
    .min(20, "Description must be at least 20 characters")
    .required("Description is required"),
  category: Yup.string().required("Category is required"),
  goal: Yup.number()
    .positive("Funding goal must be greater than 0")
    .required("Funding goal is required"),
  imageUrl: Yup.string().url("Must be a valid URL").nullable(),
  galleryUrls: Yup.string()
    .test("galleryUrls", "Must be comma-separated URLs", (value) => {
      if (!value) return true;
      return value.split(",").every((url) =>
        /^https?:\/\/.+\..+/.test(url.trim())
      );
    }),
});
