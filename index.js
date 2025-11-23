import { openai, supabase } from './config.js';
const questionsView = document.getElementById("questionsView")
const movieOutputView = document.getElementById("movieOutputView")

const goBtn = document.getElementById("goBtn")
const againBtn = document.getElementById("againBtn")

// go button, workings, simple js
// goBtn.addEventListener("click", function(){
//     document.getElementById("movieTitle").textContent = "School of Rock (2009)"
//     document.getElementById("movieDescription").textContent = "A fun and stupid movie about a wannabe rocker turned fraud substitute teacher forming a rock band with his students to win the Battle of the Bands"

//     questionsView.classList.add("hidden")
//     movieOutputView.classList.remove("hidden")

// })

goBtn.addEventListener("click", async function () {
    // 1️⃣ collect user text values
    const favorite = document.getElementById("favorite").value
    const newOrClassic = document.getElementById("newOrClassic").value
    const tone = document.getElementById("tone").value

    // 2️⃣ combine them
    const userQuery = `${favorite} ${newOrClassic} ${tone}`

    // 3️⃣ show loading state (optional)
    document.getElementById("movieTitle").textContent= "Thinking..."
    document.getElementById("movieDescription").textContent = "Fetching your perfect movie..."

    // 4️⃣ create embedding
    const userEmbedding = await createUserEmbedding()

    // 5️⃣ find nearest matches from Supabase
    const matchedMovies = await findNearestMovies()
    // 6️⃣ get AI recommendation
    const recommendation = await getMovieRecommendation()

    // 7️⃣ display recommendation on screen
    document.getElementById("movieTitle").textContent = "Your Movie Recommendation"
    document.getElementById("movieDescription").textContent = recommendation

    // 8️⃣ toggle views
    questionsView.classList.add("hidden")
    movieOutputView.classList.remove("hidden")
})

// STEP 2: create embedding from user inputs
//  creates embedding, that takes as input favorite movie, 
// new or classic movie and tone of the moie
// the reason why we use an async function, is because
// we have to wait for other processes to be finished
//  first, so that something can be returned
async function createUserEmbedding() {
    const favorite = document.getElementById("favorite").value
    const newOrClassic = document.getElementById("newOrClassic").value
    const tone = document.getElementById("tone").value
    
    //  combine into one user query
    const conbinedInput = `${favorite} ${newOrClassic} ${tone}`

    //  embeddings
    const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: conbinedInput
            
        })

        //  return the vector
        return embeddingResponse.data[0].embedding
    
}
// call it to check if it is working
const userVector = await createUserEmbedding()
console.log('User embedding:', userVector)

// STEP 3: Query Supabase for nearest movie matches
async function findNearestMovies(userEmbedding) {
    // 1️⃣ Call the RPC (hint: supabase.rpc)

    const { data } = await supabase.rpc('match_movies', {
        query_embedding: userEmbedding,   // vector to compare against table embeddings
        match_threshold: 0.50,        // Choose an appropriate threshold for your data
        match_count: 4                // Choose the number of matches
    });

    // 1) Handle RPC error
    if (error) {
        console.error("Supabase RPC error:", error);
        return "Error contacting database.";
    }

    // 2) Handle null / empty data
    if (!data || data.length === 0) {
        console.warn("No matches returned from Supabase.");
        return "No matches found.";
    }

    // 2️⃣ Join all returned 'content' fields into one string

    const combinedMatches = data.map(obj => obj.content).join("\n")

    return combinedMatches

}

// const userEmbedding = await createUserEmbedding();
const matches  = await findNearestMovies(userEmbedding)
console.log("MATCHES:\n", matches);

// STEP 4: Use OpenAI to generate movie recommendation
async function getMovieRecommendation(matchedMovies,
    userQuery
) {
    // 1️⃣ Create a system message (hint: describes 
    // assistant personality)
    const systemMessage ={
        role: 'system',
        content: "You are a friendly movie expert who recommends films and briefly explains why."
    }
    
    // 2️⃣ Create a user message combining context + question

    const userMessage = {
        role: "user",
        content: `Context: ${matchedMovies} \n\nUser preferences: ${userQuery}`
    }
    // 3️⃣ Call OpenAI chat completions

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [systemMessage, userMessage],
        temperature: 0.5,
        frequency_penalty: 0.5
      });

    // 4️⃣ Extract the model’s reply
      const recommendation = response.choices[0].message.content

      return recommendation

}

//  testing STEP 4:
// const embedding = await createUserEmbedding()
// const matches = await findNearestMovies(userEmbedding)
const userInput = "I want something new, exciting and funny"
const recommendation = await getMovieRecommendation(matches, userInput)
console.log("🎬 AI Recommendation:", recommendation)


// again button workings
againBtn.addEventListener("click", function(){
    questionsView.classList.add("hidden")
    movieOutputView.classList.remove("hidden")

    // New reset stuff
    document.getElementById("favorite").value = ""
    document.getElementById("newOrClassic").value = ""
    document.getElementById("tone").value = ""

    document.getElementById("movieTitle").textContent = ""
    document.getElementById("movieDescription").textContent = ""

    // TOGGLE BACK TO QUESTIONS VIEW
    movieOutputView.classList.add("hidden")
    questionsView.classList.remove("hidden")
})
