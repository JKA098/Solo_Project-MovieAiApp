# 🎬 PopChoice AI – Smart Movie Recommendation App

*A RAG-powered movie recommender built with OpenAI, Supabase, and Vanilla JavaScript*

![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20JS-yellow)
![OpenAI](https://img.shields.io/badge/OpenAI-Embeddings%20%7C%20GPT-orange)
![Supabase](https://img.shields.io/badge/Supabase-Vector%20DB-brightgreen)
![RAG](https://img.shields.io/badge/Architecture-RAG%20Pipeline-blueviolet)
![Status](https://img.shields.io/badge/Project-Frontend%20%2B%20AI-lightgrey)
![License](https://img.shields.io/badge/License-MIT-blue)

---

# 📌 Overview

PopChoice AI is a fully-functional movie recommendation app powered by:

* **OpenAI Embeddings**
* **Supabase Vector Search**
* **OpenAI Chat Completions (GPT-4 / GPT-3.5)**
* **Vanilla HTML, CSS, JavaScript**

Users enter their preferences:

* Favorite movie & why
* New vs. classic
* Fun vs. serious

Your app converts the input into an embedding vector, queries Supabase for similar movie descriptions, and passes those matches to OpenAI to produce the final movie recommendation.

This is a real **RAG pipeline (Retrieval-Augmented Generation)**.

---

# 🚀 Features

## 🔍 Intelligent Retrieval

Uses **text-embedding-ada-002** to generate semantic embeddings from the user input.

## 🧠 AI-Generated Recommendations

GPT generates a personalized movie recommendation.

## 💾 Supabase Vector Database

Stores embeddings and provides nearest-neighbor search using the `match_movies` RPC.

## 🎨 Clean UI/UX

Two-page layout with:

* Question view
* Recommendation view
* Loading state
* Reset ("Go Again") button

## 🛠 Modular Architecture

All logic is split into clean functions:

* `createUserEmbedding()`
* `findNearestMovies()`
* `getMovieRecommendation()`

---

# 🧱 Tech Stack

| Area            | Technology                                      |
| --------------- | ----------------------------------------------- |
| Language        | JavaScript (ES Modules)                         |
| AI & Embeddings | OpenAI API (text-embedding-ada-002, GPT models) |
| Vector DB       | Supabase + pgvector                             |
| Backend Logic   | Supabase RPC (`match_movies`)                   |
| Frontend        | HTML, CSS, JS                                   |
| Build           | No framework required                           |

---

# 📦 Project Structure

```
popchoice-ai/
│
├── index.html
├── index.css
├── index.js
│
├── config.js
├── content.js           # list of movie objects
├── seedMovies.js        # one-time script to seed data into Supabase
│
└── README.md
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone the Repository

```
git clone <your-repo-url>
cd popchoice-ai
```

## 2️⃣ Install Dependencies

```
npm install openai @supabase/supabase-js
```

## 3️⃣ Configure Environment Variables

Create a `.env` file:

```
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_API_KEY=your_supabase_service_role_key
```

⚠️ Use **SERVICE ROLE KEY**, not the anon key, for inserting embeddings.

---

# 🗄️ Supabase Setup

## 1. Create `movies` Table

```
create table movies (
  id bigserial primary key,
  content text,
  embedding vector(1536)
);
```

## 2. Create RPC Function `match_movies`

```
create or replace function match_movies(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    1 - (movies.embedding <=> query_embedding) as similarity
  from movies
  where 1 - (movies.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

---

# 📥 Seed the Movie Database

Run the one-time seed script:

```
node seedMovies.js
```

Expected output:

```
Movies seeded
```

---

# 🔄 RAG Pipeline (How It Works)

```
User Inputs → Create Embedding → Vector Search (Supabase) → GPT Analysis → Movie Recommendation
```

---

# 🧩 Core Logic

## Create Embedding

```js
async function createUserEmbedding() {
    const favorite = document.getElementById("favorite").value
    const newOrClassic = document.getElementById("newOrClassic").value
    const tone = document.getElementById("tone").value

    const combinedInput = `${favorite} ${newOrClassic} ${tone}`

    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: combinedInput
    })

    return response.data[0].embedding
}
```

## Query Supabase

```js
async function findNearestMovies(userEmbedding) {
    const { data, error } = await supabase.rpc("match_movies", {
        query_embedding: userEmbedding,
        match_threshold: 0.5,
        match_count: 4
    })

    return data.map(obj => obj.content).join("\n")
}
```

## Generate Recommendation

```js
async function getMovieRecommendation(matchedMovies, userQuery) {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
            { role: "system", content: "You are a friendly movie expert..." },
            { role: "user", content: `Context: ${matchedMovies}\n\nUser preferences: ${userQuery}` }
        ]
    })

    return response.choices[0].message.content
}
```

---

# 🖥️ Run the App

Open:

```
index.html
```

If needed:

```
npx serve
```

---

# 🔧 Troubleshooting

### ❗ Supabase RPC Error

Make sure the argument names match exactly:

* `query_embedding`
* `match_threshold`
* `match_count`

### ❗ Incorrect Embedding Length

Correct path:

```
embeddingResponse.data[0].embedding
```

---

# 📌 Future Enhancements

* Add movie posters via TMDB API
* Add star ratings + genres
* Add “Why this movie?” explanation
* Add retry button + better error messaging
* Expand movie dataset
* Add favorites / history

---

# 📄 License

MIT License
