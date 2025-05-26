"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Shield, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Geçersiz e-posta veya şifre."); 
        return;
      }

      if (result?.ok) {
        router.push("/admin"); 
        router.refresh();
      }
    } catch (error) {
      setError("Giriş işlemi sırasında bir hata oluştu."); 
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sol Taraf - Gradient Arka Plan */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Dekoratif Elementler */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        {/* İçerik */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-20 text-white">
          <div className="mb-8">
            <Shield className="w-20 h-20 text-white/90" />
          </div>
          <h1 className="text-5xl font-bold mb-6 text-center">CelyxMed</h1>
          <p className="text-xl text-white/90 text-center max-w-md">
            Yönetim paneline hoş geldiniz. Güvenli giriş yaparak içeriklerinizi yönetebilirsiniz.
          </p>
          
          {/* Alt Bilgi */}
          <div className="absolute bottom-10 text-center">
            <p className="text-white/70 text-sm">
              © 2025 CelyxMed. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Login Formu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          {/* Mobilde Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              CelyxMed Admin
            </h2>
          </div>

          {/* Form Kartı */}
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Hoş Geldiniz</h2>
              <p className="text-gray-600">Yönetim paneline giriş yapın</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-start space-x-3 rounded-xl bg-red-50 p-4 border border-red-100">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl 
                             text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-all duration-200"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl 
                             text-gray-900 placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
                </label>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Şifremi unuttum
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 
                         bg-gradient-to-r from-violet-600 to-indigo-600 
                         text-white font-semibold rounded-xl shadow-lg
                         hover:from-violet-700 hover:to-indigo-700
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transform transition-all duration-200 hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Giriş yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Alt Bilgi */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Giriş yaparak{" "}
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  kullanım şartlarını
                </a>{" "}
                kabul etmiş olursunuz.
              </p>
            </div>
          </div>

          {/* Yardım Linki */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sorun mu yaşıyorsunuz?{" "}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Destek alın
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}