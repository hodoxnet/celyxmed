import { UseFormReturn, FieldValues } from "react-hook-form";
import { HizmetDetayFormValues } from "@/lib/validators/admin";
import { GeneralSetting, GeneralSettingTranslation } from '@/generated/prisma'; // Prisma tiplerini doğru yoldan import ediyoruz

// Define a form type that's less strict to avoid type errors
// This allows component props to accept any compatible form object
export type HizmetDetayForm = any;

// GeneralSetting ve seçilen dile ait çeviriyi birleştiren tip
export type GeneralSettingWithTranslation = Omit<GeneralSetting, 'createdAt' | 'updatedAt'> & {
  translation: Omit<GeneralSettingTranslation, 'id' | 'generalSettingId' | 'languageCode' | 'createdAt' | 'updatedAt'>;
  // createdAt ve updatedAt alanlarını GeneralSetting'den alabiliriz, bu yüzden translation'dan çıkarıyoruz.
  // id, generalSettingId, languageCode da translation objesinde gereksiz.
};
