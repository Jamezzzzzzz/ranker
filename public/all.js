const userId = localStorage.getItem("userId");
const username = localStorage.getItem("username");
document.addEventListener("DOMContentLoaded",async() =>{
    const welcome = document.getElementById("welcome-message");
    welcome.textContent = `Welcome, ${username}!`;

    fetchAllMovies();

});
async function fetchAllMovies() {
    try{
        const res = await fetch("/all-movies",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ userId })
        });

        if(res.ok){
            const movies = await res.json();
            update(movies);
        }
        else{
            console.error("failed to fetch all movies");
        }
    }
    catch(error){
        console.error("failed all movies error ",error);
    }
    
}
function update(movies){
    const movieList = document.getElementById("movie-container");
    movieList.innerHTML = "";
    movies.forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.name} (⭐ ${m.rating})`;
        movieList.appendChild(li);        
    });
}