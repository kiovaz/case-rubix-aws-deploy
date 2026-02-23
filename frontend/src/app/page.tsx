"use client";

import Header from "@/components/molecules/header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, List, CheckCircle, XCircle } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/")
      .then((res) => res.json())
      .then((data) => setMensagem(data.message))
      .catch(() => setErro("Não foi possível conectar com a API."));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Header />
      <div className="pt-20 flex items-center justify-center p-6 min-h-screen">
        <div className="max-w-4xl w-full">
          <div className="bg-white shadow-2xl rounded-2xl p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Gerenciador Virtual de Livros
            </h1>

            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Aplicação web para gerenciamento completo de livros com
              funcionalidades de cadastro, edição e exclusão. Organize sua
              biblioteca de forma simples e eficiente.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              <button
                onClick={() => router.push("/livros")}
                className="group bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg font-semibold"
              >
                <List className="w-6 h-6" />
                <span>Ver Meus Livros</span>
              </button>

              <button
                onClick={() => router.push("/livros/novo")}
                className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg font-semibold"
              >
                <Plus className="w-6 h-6" />
                <span>Cadastrar Livro</span>
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500 mb-3">
                Status da Conexão com a API:
              </p>
              {mensagem && (
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">{mensagem}</p>
                </div>
              )}

              {erro && (
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">{erro}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
