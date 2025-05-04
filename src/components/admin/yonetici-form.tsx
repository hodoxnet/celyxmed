"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { adminFormSchema, AdminFormValues } from '@/lib/validators/admin';
import { Admin } from '@/app/[locale]/admin/yoneticiler/page'; // Admin tipini import et

interface YoneticiFormProps {
  initialData?: Admin | null; // Düzenleme için başlangıç verisi
  onSubmit: (values: AdminFormValues) => Promise<void>; // Form gönderildiğinde çağrılacak fonksiyon
  isSubmitting: boolean; // Form gönderilirken butonun durumunu yönetmek için
}

export function YoneticiForm({ initialData, onSubmit, isSubmitting }: YoneticiFormProps) {
  const isEditMode = !!initialData;

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "", // Şifre alanı başlangıçta boş
    },
  });

  const handleSubmit = async (values: AdminFormValues) => {
    // Düzenleme modunda ve şifre girilmemişse, şifre alanını gönderme
    const dataToSend: Partial<AdminFormValues> = { ...values };
    if (isEditMode && !values.password) {
      delete dataToSend.password;
    }
    await onSubmit(dataToSend as AdminFormValues); // onSubmit'i çağır
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İsim</FormLabel>
              <FormControl>
                <Input placeholder="Yöneticinin ismi" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input type="email" placeholder="yonetici@example.com" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şifre {isEditMode ? '(Değiştirmek istemiyorsanız boş bırakın)' : ''}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : (isEditMode ? 'Güncelle' : 'Ekle')}
        </Button>
      </form>
    </Form>
  );
}
