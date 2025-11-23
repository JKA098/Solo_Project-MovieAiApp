// 1. embed + store all movies into supabase (one time)
// 1) import openai + supabase
import {openai, supabase} from './config.js'

// 2) import your movie content array (not movies.txt yet - just start with content.js first)
import movies from './content.js'
// 3) create async function called main()
async function main(input) {
    const data = await Promise.all(
        input.map(async (movie) => {
            const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-ada-002", // <-- hint: the ADA embedding model
                input: movie
            })

            return {
                content: movie,
                embedding: embeddingResponse.data[0].embedding  // <-- hint: from embeddingResponse
            }
        })
    );
    // 5) insert into supabase table “movies”
    await supabase.from("movies").insert(data)

    // 6) console.log done
    console.log("Movies seeded")

    
}
main(movies)


