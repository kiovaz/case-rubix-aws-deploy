import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  listarLivros,
  buscarLivroPorId,
  cadastrarLivro,
  atualizarLivro,
  deletarLivro,
  Livro,
} from "./db/livro";

const app = Fastify();

// Libera acesso do frontend
app.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

// Rota de teste
app.get("/", (req, reply) => {
  reply.send({ message: "API Fastify está funcionando! 🙏" });
});

// GET /livros → lista todos os livros
app.get("/livros", (request, reply) => {
  const livros = listarLivros();
  return reply.send(livros);
});

// GET /livros/:id → busca por ID
app.get("/livros/:id", (request, reply) => {
  const id = Number((request.params as any).id);
  const livro = buscarLivroPorId(id);

  if (!livro) {
    return reply.status(404).send({ error: "Livro não encontrado" });
  }

  return reply.send(livro);
});

// POST /livros → cria novo
app.post("/livros", async (request, reply) => {
  const data = request.body as Omit<Livro, "id">;

  if (!data.titulo || !data.autor || !data.preco || !data.data_publicacao) {
    return reply.status(400).send({ error: "Dados incompletos" });
  }

  cadastrarLivro(data);
  return reply.status(201).send({ message: "Livro criado" });
});

// PUT /livros/:id → atualiza
app.put("/livros/:id", async (request, reply) => {
  const id = Number((request.params as any).id);
  const livro = buscarLivroPorId(id);

  if (!livro) {
    return reply.status(404).send({ error: "Livro não encontrado" });
  }

  const data = request.body as Omit<Livro, "id">;
  atualizarLivro(id, data);
  return reply.send({ message: "Livro atualizado" });
});

// DELETE /livros/:id → remove
app.delete("/livros/:id", (request, reply) => {
  const id = Number((request.params as any).id);
  deletarLivro(id);
  return reply.send({ message: "Livro deletado" });
});

// Inicia o servidor
app.listen({ 
  port: Number(process.env.PORT) || 3333,
  host: '0.0.0.0' // Aceita conexões de outros containers
}, () => {
  console.log("🚀 Servidor rodando em http://localhost:3333");
});
