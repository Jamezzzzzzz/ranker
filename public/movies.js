const userId = localStorage.getItem("userId");
const welcome = document.getElementById("welcome-message");

document.addEventListener("DOMContentLoaded",async ()=>{
    
    const rateButton = document.getElementById("search-button");
    const movieInput = document.getElementById("movie-input");
    const ratingInput = document.getElementById("rating-input");
    const username = localStorage.getItem("username");
    if(!userId){
        alert("you must login first!");
        window.location.href = "index.html";
        return;       
    }
    welcome.textContent = `Welcome, ${username}!`;
    
    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
      });
    fetchTopMovies();
    rateButton.addEventListener("click",async() =>{
        const name = movieInput.value.toLowerCase().trim();
        const rating = parseInt(ratingInput.value);
        if(!name || !rating){
            alert("must enter movie and rating!");
            return;
        }
        const res = await fetch("/add-movie",{
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify({ name, rating, userId })
        })
        if(res.ok){
            const topMovies = await res.json();
            updateUI(topMovies);
        }
        else{
            alert("failed to add movie");
        }
        movieInput.value = "";
        ratingInput.value = "";

    });

});
async function fetchTopMovies() {
    try{
        const res = await fetch("/top-movies",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({ userId })
        });

        if(res.ok){
            const movies = await res.json();
            updateUI(movies);
        }
        else{
            console.error("Failed to fetch top movies");
        }
    }
    catch(error){
        console.error("fetch top movies errpr: ", error);

    } 
}
function updateUI(movies){
    const rankList = document.getElementById("rank-container");
    rankList.innerHTML = "";
    movies.forEach((m) => {
        const li = document.createElement("li");
        li.textContent = `${m.name} (⭐ ${m.rating})`;
        rankList.appendChild(li);
    });   
}
