const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const app = express();
const db = new Database("db/ranker.db"); // ✅ path to your database
db.pragma('foreign_keys = ON');
app.use(express.json()); // Allows Express to understand JSON requests
app.use(express.static(path.join(__dirname, "public")));


app.post("/login",(req,res) =>{
    const { username } = req.body;
    let user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if(!user){
        db.prepare("INSERT INTO users (username) VALUES (?)").run(username);
        user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    }
    res.json({ user_id:user.id });
})

app.post("/add-movie",(req, res) => {
    const {name, rating,userId} = req.body;
    console.log("received:", name, rating);

    try{
        db.prepare(`
            INSERT OR IGNORE INTO items(name)
            VALUES (?)
            `).run(name);
            
            const movieId = db.prepare("SELECT id FROM items WHERE name = ?").get(name)?.id;
            console.log("Inserted or found movie ID",movieId);

            const existing = db.prepare(`
                SELECT * FROM ranks WHERE user_id = ? AND item_id = ?
                `).get(userId, movieId);
            if(existing){
                db.prepare(`
                    UPDATE ranks SET rating = ? WHERE user_id = ? AND item_id = ?
                    `).run(rating, userId, movieId);
                console.log("updated rating for user", userId)
            }

            else{
                db.prepare(`
                    INSERT INTO ranks (user_id, item_id, rating)
                    VALUES (?,?,?)
                    `).run(userId, movieId, rating);
                console.log("Iserted ne rating")
            }
                   
            const topMovies = db.prepare(`
                SELECT i.name, r.rating
                FROM items i
                JOIN ranks r ON r.item_id = i.id
                WHERE r.user_id = ?
                GROUP BY i.id
                ORDER BY rating DESC
                LIMIT 5
                `).all(userId);

                console.log("Top movies returned",topMovies);
                res.json(topMovies);
            
            }catch(err){
                console.error("ERROR:", err);
                res.status(500).json({error:"Failed to add movie"});
            }
})

app.post("/top-movies",(req, res) => {
    const { userId } = req.body;
    if(!userId){
        return res.status(400).json({error:"User ID is required"});
    }
    try{
        const topMovies = db.prepare(`
            SELECT i.name, r.rating
            FROM items i
            JOIN ranks r ON r.item_id = i.id
            WHERE r.user_id = ?
            ORDER BY r.rating DESC
            LIMIT 5
            `).all(userId);
        res.json(topMovies);
    }
    catch(err){
        console.error("Fetch top movies error: ",err.message);
        res.status(500).json({error:"Failed to fetch top movies"});
    }
})
app.post("/all-movies",(req,res)=>{
    const { userId } = req.body;
    try{
        const allMovies = db.prepare(`
            SELECT i.name, r.rating 
            FROM items i JOIN ranks r ON r.item_id = i.id
            WHERE r.user_id = ?
            ORDER BY r.rating DESC
            `).all(userId);
        res.json(allMovies);
    }
    catch(err){
        console.error("Fetch all movies error: ",err.message);
        res.status(500).json({error:"Failed to fetch all movies"});
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});