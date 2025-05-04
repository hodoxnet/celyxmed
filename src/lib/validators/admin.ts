import * as z from "zod";

// Yeni yönetici ekleme ve düzenleme için şema
// Düzenlemede şifre opsiyonel olabilir, eklemede zorunlu.
// Bu nedenle iki ayrı şema veya birleşik bir şema kullanabiliriz.
// Şimdilik birleşik yapalım ve düzenlemede şifre boşsa güncellenmeyecek şekilde ayarlayalım.

export const adminFormSchema = z.object({
  name: z.string().min(2, {
    message: "İsim en az 2 karakter olmalıdır.",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz.",
  }),
  // Şifre: Eklemede zorunlu, düzenlemede opsiyonel (boş bırakılırsa değişmez)
  // `refine` ile bu kontrolü yapabiliriz veya form içinde yönetebiliriz.
  // Şimdilik form içinde yönetelim, şemada opsiyonel yapalım.
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır.",
  }).optional().or(z.literal('')), // Boş string'e de izin ver (düzenleme için)
});

export type AdminFormValues = z.infer<typeof adminFormSchema>;
