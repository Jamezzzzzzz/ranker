let currentUserId = null;
document.addEventListener("DOMContentLoaded",() =>{
    const loginButton = document.getElementById("login-button");
    const usernameInput = document.getElementById("username-input");
    const welcome = document.getElementById("welcome-message");

    const storedUsername = localStorage.getItem("username");
    const storedUserId = localStorage.getItem("userId");

    if (storedUsername && storedUserId) {
        welcome.textContent = `Welcome ${storedUsername}!`;
        currentUserId = storedUserId;
    } else {
        welcome.textContent = "Please login!";
    }

    loginButton.addEventListener("click",async()=>{
        const username = usernameInput.value.trim();
        if(!username){
            alert("must enter username");
            return;
        }
        const res = await fetch("/login",{
            method: "POST",
            headers:{"Content-Type": "application/json" },
            body:JSON.stringify({username})
        });
        if(res.ok){
            const data = await res.json();
            currentUserId = data.user_id;
            localStorage.setItem("userId", currentUserId);
            localStorage.setItem("username",username);
            alert(`logged in as ${username}`);
            welcome.textContent = `welcome ${username}!`;

        }
        else{
            alert("login failed");
        }


    })

    
    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
        welcome.textContent = "please login!"
      });
})