import { UseFormReturn, FieldValues } from "react-hook-form";
import { HizmetDetayFormValues } from "@/lib/validators/admin";

// Define a form type that's less strict to avoid type errors
// This allows component props to accept any compatible form object
export type HizmetDetayForm = any;