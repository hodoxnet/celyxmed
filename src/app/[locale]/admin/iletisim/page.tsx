"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Eye, Trash2, Check, X, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "Okunmadı" | "Okundu" | "Yanıtlandı";
}

export default function ContactPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");

  // Client-side authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/tr/admin/login");
    }
  }, [status, router]);

  // Yükleniyor durumu
  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
  }

  // Oturum yoksa gösterme
  if (status === "unauthenticated") {
    return null;
  }

  // Örnek iletişim mesajları
  const messages: ContactMessage[] = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      email: "ahmet@example.com",
      subject: "Hizmetleriniz hakkında bilgi almak istiyorum",
      message: "Merhaba, web sitenizde belirtilen hizmetleriniz hakkında daha detaylı bilgi almak istiyorum. Özellikle online danışmanlık hizmetiniz için ücretlendirme ve süreç nasıl işliyor?",
      date: "12 Mayıs 2025, 14:30",
      status: "Okunmadı"
    },
    {
      id: 2,
      name: "Ayşe Kaya",
      email: "ayse@example.com",
      subject: "Randevu talebi",
      message: "Randevu almak için sizinle iletişime geçmek istiyorum. En kısa sürede dönüş yaparsanız sevinirim.",
      date: "10 Mayıs 2025, 09:15",
      status: "Okundu"
    },
    {
      id: 3,
      name: "Mehmet Demir",
      email: "mehmet@example.com",
      subject: "İş birliği teklifi",
      message: "Firmamız adına sizinle iş birliği yapmak istiyoruz. Detayları görüşmek için uygun olduğunuz bir zamanda telefonla görüşebilir miyiz?",
      date: "8 Mayıs 2025, 16:45",
      status: "Yanıtlandı"
    },
    {
      id: 4,
      name: "Zeynep Kara",
      email: "zeynep@example.com",
      subject: "Teşekkür mesajı",
      message: "Geçtiğimiz hafta aldığım hizmet için teşekkür ederim. Çok memnun kaldım ve çevremdeki herkese tavsiye edeceğim.",
      date: "5 Mayıs 2025, 11:20",
      status: "Okundu"
    },
  ];

  // Aktif sekmeye göre mesajları filtrele
  const filteredMessages = 
    activeTab === "all" ? messages :
    activeTab === "unread" ? messages.filter(msg => msg.status === "Okunmadı") :
    messages.filter(msg => msg.status === "Okundu" || msg.status === "Yanıtlandı");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">İletişim Mesajları</h1>
        <p className="text-muted-foreground">
          İletişim formundan gelen mesajları görüntüleyin ve yönetin.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex rounded-md border">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            className="rounded-r-none"
            onClick={() => setActiveTab("all")}
          >
            Tümü ({messages.length})
          </Button>
          <Button
            variant={activeTab === "unread" ? "default" : "ghost"}
            className="rounded-none border-x"
            onClick={() => setActiveTab("unread")}
          >
            Okunmadı ({messages.filter(msg => msg.status === "Okunmadı").length})
          </Button>
          <Button
            variant={activeTab === "read" ? "default" : "ghost"}
            className="rounded-l-none"
            onClick={() => setActiveTab("read")}
          >
            Okundu ({messages.filter(msg => msg.status === "Okundu" || msg.status === "Yanıtlandı").length})
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Mesajlarda ara..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>Mesajlar</CardTitle>
          <CardDescription>
            {filteredMessages.length} mesaj görüntüleniyor
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y rounded-md border">
            {filteredMessages.map((message) => (
              <div key={message.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${
                        message.status === "Okunmadı" 
                          ? "bg-blue-500" 
                          : message.status === "Yanıtlandı"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`} />
                      <h3 className="font-medium">{message.name}</h3>
                      <span className="text-sm text-muted-foreground">&lt;{message.email}&gt;</span>
                    </div>
                    <p className="font-medium">{message.subject}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                    <p className="text-xs text-muted-foreground">{message.date}</p>
                  </div>
                  <div className="flex items-start space-x-1">
                    {message.status === "Okunmadı" && (
                      <Button variant="ghost" size="icon" title="Okundu olarak işaretle">
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" title="Görüntüle">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Sil">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> İstatistikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Toplam Mesaj</dt>
                <dd className="text-sm font-medium">{messages.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Okunmamış</dt>
                <dd className="text-sm font-medium">
                  {messages.filter(msg => msg.status === "Okunmadı").length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Yanıtlanmış</dt>
                <dd className="text-sm font-medium">
                  {messages.filter(msg => msg.status === "Yanıtlandı").length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">Bu Hafta</dt>
                <dd className="text-sm font-medium">2</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}