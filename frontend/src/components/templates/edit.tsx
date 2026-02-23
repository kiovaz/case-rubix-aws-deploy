"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";

export default function BookEdit() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>(); // pega o id da rota dinâmica

  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    preco: "",
    data_publicacao: "",
    editora: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`/api/livros/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          titulo: data.titulo,
          autor: data.autor,
          preco: data.preco.toString(),
          data_publicacao: data.data_publicacao,
          editora: data.editora || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setErro("❌ Erro ao buscar livro");
        setLoading(false);
      });
  }, [id]);

  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      novosErros.titulo = "Título é obrigatório";
    }

    if (!formData.autor.trim()) {
      novosErros.autor = "Autor é obrigatório";
    }

    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      novosErros.preco = "Preço deve ser maior que zero";
    }

    if (!formData.data_publicacao) {
      novosErros.data_publicacao = "Data de publicação é obrigatória";
    }

    if (!formData.editora.trim()) {
      novosErros.editora = "Editora é obrigatória";
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const livroAtualizado = {
      titulo: formData.titulo,
      autor: formData.autor,
      preco: parseFloat(formData.preco),
      data_publicacao: formData.data_publicacao,
      editora: formData.editora,
    };

    try {
      const res = await fetch(`/api/livros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(livroAtualizado),
      });

      if (!res.ok) {
        alert("❌ Erro ao atualizar livro");
        return;
      }

      setMensagem("✅ Livro atualizado!");
      setTimeout(() => router.push("/livros"), 1500);
    } catch {
      alert("❌ Erro de conexão com a API");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCancelar = () => {
    router.push("/livros");
  };

  if (loading) return <p className="p-6 text-center">Carregando...</p>;
  if (erro) return <p className="p-6 text-center text-red-600">{erro}</p>;

  return (
    <div className="min-h-[calc(100vh-250px)] py-8 px-4 container mx-auto">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleCancelar}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para listagem
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl text-gray-900 mb-2">Editar Livro</h2>
            <p className="text-gray-600">Atualize as informações do livro</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="titulo" className="block text-gray-700 mb-2">
                  Título do Livro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.titulo ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: Clean Code: A Handbook of Agile Software Craftsmanship"
                />
                {errors.titulo && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-red-500 text-sm">{errors.titulo}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="autor" className="block text-gray-700 mb-2">
                    Autor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="autor"
                    name="autor"
                    value={formData.autor}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.autor ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ex: Robert C. Martin"
                  />
                  {errors.autor && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-500 text-sm">{errors.autor}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="editora" className="block text-gray-700 mb-2">
                    Editora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="editora"
                    name="editora"
                    value={formData.editora}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.editora ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ex: Prentice Hall"
                  />
                  {errors.editora && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-500 text-sm">{errors.editora}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="preco" className="block text-gray-700 mb-2">
                    Preço (R$) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="preco"
                    name="preco"
                    value={formData.preco}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.preco ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                  {errors.preco && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-500 text-sm">{errors.preco}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="data_publicacao"
                    className="block text-gray-700 mb-2"
                  >
                    Data de Publicação <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="data_publicacao"
                    name="data_publicacao"
                    value={formData.data_publicacao}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      errors.data_publicacao
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.data_publicacao && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-red-500 text-sm">
                        {errors.data_publicacao}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={handleCancelar}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Save className="w-5 h-5" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        {mensagem && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800">{mensagem}</p>
          </div>
        )}
      </div>
    </div>
  );
}
