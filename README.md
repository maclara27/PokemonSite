# 📜 Diário de Campo do Naturalista — Compêndio Universal

Um compêndio científico de exploração de toda a fauna Pokémon construído com a estética de um **caderno de campo do século XIX**. Inspirado em diários de naturalistas botânicos e zoológicos clássicos, com papel envelhecido, ilustrações litográficas (*official artwork* com tratamento de nanquim e aquarela), fitas adesivas, carimbos de tinta, selos de cera e uma visualização em **Astrolábio / Rosa dos Ventos SVG** para os atributos de combate.

---

## 🧭 Funcionalidades Atualizadas

1. **Folha de Início (Home)**:
   - **Espécime em Observação**: Destaque de um Pokémon aleatório de qualquer geração existente (1 a 1025+) com botão para sortear novo espécime.
   - **Fichário de Busca Sem Acentos**: Pesquisa instantânea por nome ou número, tolerante a acentos e pontuação (ex: `flabebe`, `mimikyu`, `25`).
   - **Filtro por Geração (I a IX)**: Navegue por Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar/Hisui e Paldea.
   - **Filtro por Tipo Elemental**: 17 tipos clássicos em selos de cera botânicos.
   - **Amostragem de Espécimes Fundamentais**: Fichas com recortes fixados por fita adesiva e rotações sutis no fundo.
2. **Fichário Completo (Catálogo Universal)**:
   - Descoberta dinâmica do total de espécies via PokéAPI (`/pokemon-species?limit=2000`).
   - Carregamento sob demanda em lotes de 24 espécimes com botão *"Folhear Mais Anotações..."*.
   - Grade orgânica com textos 100% nítidos (sem desfoque por transformações CSS).
3. **Página de Dissecação Anatômica (Detalhe do Espécime)**:
   - **Ilustração Oficial & Fallback**: *Official-artwork* com tratamento litográfico e fallback automático para sprite clássico caso a arte esteja ausente.
   - **Escala de Campo**: Régua de altura e balança de peso com conversão métrica.
   - **Notas do Pesquisador**: Registros de campo em Português para as Gerações I (1-151) e II (152-251), com fallback suave para crônicas oficiais e etiqueta `[tradução de campo pendente]`.
   - **Rosa dos Ventos dos Atributos**: Astrolábio radial SVG com 6 eixos de compasso náutico e polígono aquarelado.
   - **Habilidades Observadas**: Efeito descritivo e destaque de **Habilidade Oculta** com selo especial (suporta Pokémon sem habilidade oculta).
   - **Metamorfoses & Evoluções**: Linhagem evolutiva completa com suporte robusto a **evoluções ramificadas múltiplas** (como as 8 evoluções do Eevee).
   - **Navegação de Campo**: Atalhos circulares para o espécime anterior e próximo.

---

## 🛠️ Tecnologias e Arquitetura

- **Vite 6** + **React 19** + **TypeScript**
- **CSS Puro Moderno** (sem Tailwind, sem bibliotecas de UI)
- **Zero Emojis**: Todos os ícones são SVGs inline desenhados em traço de tinta (lupa, pena, régua, balança, pergaminho, livro, alfinete)
- **Roteamento por Hash** (`#/`, `#/catalogo`, `#/pokemon/:id`)
- **Acessibilidade e Desempenho**:
  - Foco por teclado com anel de nanquim escuro e relevo
  - Suporte completo a `prefers-reduced-motion`
  - Responsivo a partir de 360px de largura de tela
  - Textos manuscritos nítidos com Caveat em 20px sem rotação no container de texto

---

## 🚀 Como Executar

1. Inicie o servidor:
   ```bash
   npm run dev
   ```

2. Acesse:
   ```
   http://localhost:5173/#/
   ```

3. Para testar o build:
   ```bash
   npm run build
   ```
