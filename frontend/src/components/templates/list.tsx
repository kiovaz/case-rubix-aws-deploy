"use client";

import { useEffect, useState } from "react";
import {
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  DollarSign,
  User,
  Search,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "../ConfirmModal";

interface Livro {
  id: number;
  titulo: string;
  autor: string;
  preco: number;
  data_publicacao: string;
  editora?: string;
}

export default function ListBooks() {
  const router = useRouter();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<
    "recente" | "antigo" | "nome" | "preco"
  >("recente");
  const [modalExclusao, setModalExclusao] = useState<{
    isOpen: boolean;
    livroId: number | null;
    livroTitulo: string;
  }>({
    isOpen: false,
    livroId: null,
    livroTitulo: "",
  });

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const carregarTodos = () => {
    setLoading(true);
    fetch("/api/livros")
      .then((res) => res.json())
      .then((data) => {
        setLivros(data);
        setErro(false);
        setLoading(false);
      })
      .catch(() => {
        setErro(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarTodos();
  }, []);

  // Filtrar livros pela busca
  const livrosFiltrados = livros.filter((livro) => {
    const termoBusca = busca.toLowerCase();
    return (
      livro.titulo.toLowerCase().includes(termoBusca) ||
      livro.autor.toLowerCase().includes(termoBusca) ||
      (livro.editora && livro.editora.toLowerCase().includes(termoBusca))
    );
  });

  // Ordenar livros
  const livrosOrdenados = [...livrosFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case "recente":
        return (
          new Date(b.data_publicacao).getTime() -
          new Date(a.data_publicacao).getTime()
        );
      case "antigo":
        return (
          new Date(a.data_publicacao).getTime() -
          new Date(b.data_publicacao).getTime()
        );
      case "nome":
        return a.titulo.localeCompare(b.titulo);
      case "preco":
        return b.preco - a.preco;
      default:
        return 0;
    }
  });

  const handleExcluirClick = (livro: Livro) => {
    setModalExclusao({
      isOpen: true,
      livroId: livro.id,
      livroTitulo: livro.titulo,
    });
  };

  const confirmarExclusao = async () => {
    if (!modalExclusao.livroId) return;

    try {
      const res = await fetch(
        `http://localhost:3333/livros/${modalExclusao.livroId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        alert("❌ Erro ao excluir o livro");
        return;
      }

      setLivros((livros) =>
        livros.filter((l) => l.id !== modalExclusao.livroId)
      );
      setModalExclusao({ isOpen: false, livroId: null, livroTitulo: "" });
    } catch {
      alert("❌ Erro de conexão com a API");
    }
  };

  const cancelarExclusao = () => {
    setModalExclusao({ isOpen: false, livroId: null, livroTitulo: "" });
  };

  const handleEditar = (livro: Livro) => {
    router.push(`/livros/${livro.id}/editar`);
  };

  // Calcular estatísticas
  const totalLivros = livros.length;
  const valorTotal = livros.reduce((acc, livro) => acc + livro.preco, 0);

  return (
    <div className="py-8 px-4 container mx-auto">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total de Livros</p>
              <p className="text-3xl text-gray-900">{totalLivros}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Valor Total</p>
              <p className="text-3xl text-gray-900">
                R$ {valorTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Resultados</p>
              <p className="text-3xl text-gray-900">{livrosOrdenados.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de busca e filtros */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por título, autor ou editora..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={ordenacao}
                onChange={(e) =>
                  setOrdenacao(
                    e.target.value as "recente" | "antigo" | "nome" | "preco"
                  )
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white cursor-pointer"
              >
                <option value="recente">Mais Recente</option>
                <option value="antigo">Mais Antigo</option>
                <option value="nome">Nome (A-Z)</option>
                <option value="preco">Maior Preço</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading e Erro */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando livros...</p>
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-600">
            ❌ Erro ao carregar livros. Verifique a conexão com a API.
          </p>
        </div>
      )}

      {/* Lista de livros */}
      {!loading && livrosOrdenados.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">
            {busca ? "Nenhum livro encontrado" : "Nenhum livro cadastrado"}
          </h3>
          <p className="text-gray-400">
            {busca
              ? "Tente buscar com outros termos"
              : "Adicione seu primeiro livro na página de cadastro"}
          </p>
        </div>
      )}

      {!loading && livrosOrdenados.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-gray-900">Catálogo de Livros</h2>
            <span className="text-gray-600">
              {livrosOrdenados.length}{" "}
              {livrosOrdenados.length === 1 ? "livro" : "livros"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {livrosOrdenados.map((livro) => (
              <div
                key={livro.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden group"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2"></div>

                <div className="p-6">
                  <h3 className="text-lg text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {livro.titulo}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm truncate">{livro.autor}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm truncate">
                        {livro.editora || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">
                        {formatarData(livro.data_publicacao)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-green-600 pt-2">
                      <DollarSign className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xl">
                        R$ {livro.preco.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditar(livro)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluirClick(livro)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={modalExclusao.isOpen}
        titulo="Confirmar Exclusão"
        mensagem={`Tem certeza que deseja excluir o livro "${modalExclusao.livroTitulo}"? Esta ação não pode ser desfeita.`}
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
      />
    </div>
  );
}
