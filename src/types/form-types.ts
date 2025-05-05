import { UseFormReturn } from "react-hook-form";
import { HizmetDetayFormValues } from "@/lib/validators/admin";

// Define a single shared form type to be used across all components
export type HizmetDetayForm = UseFormReturn<HizmetDetayFormValues>;