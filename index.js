const express = require('express');
const cors = require('cors');
require('dotenv').config();
const tvShows = require('./tvshows.json');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 4000;
console.log(process.env.DB_USER)
console.log(process.env.DB_PASS)
const app = express();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ry27zgj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


console.log(uri);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middleware
app.use(cors());
app.use(express.json());

const allMovie = [
  {
    id: 1,
    image: "https://i.postimg.cc/Y2g5j6JV/gladiator-ii.jpg",
    title: "GLADIATOR",
    highlight: "2",
    year: "2024",
    rating: "⭐ 8.2/10",
    genre: "Action, Drama, History",
    description:
      "The long-awaited sequel to Gladiator follows the story of Lucius as he steps into the arena once more.",
  },
  {
    id: 2,
    image: "https://i.postimg.cc/sfbD7xjH/paradise.jpg",
    title: "PARADISE",
    highlight: "2025",
    year: "2025",
    rating: "⭐ 7.9/10",
    genre: "Sci-Fi, Thriller",
    description:
      "In a dystopian future, a scientist discovers a hidden utopia—but at what cost?",
  },
  {
    id: 3,
    image: "https://i.postimg.cc/d3gMChG2/orion.jpg",
    title: "ORION AND THE",
    highlight: "DARK",
    year: "2024",
    rating: "⭐ 7.5/10",
    genre: "Animation, Fantasy",
    description:
      "A young boy named Orion faces his fears in a thrilling animated journey through the unknown.",
  },
  { 
    id: 4,
    image: "https://i.postimg.cc/Z5y5V7nc/dune-part-two-6648aab15a856.jpg",
    title: "DUNE: PART TWO",
    highlight: "2024",
    year: "2024",
    rating: "⭐ 9.0/10",
    genre: "Sci-Fi, Adventure, Drama",
    description:
      "Paul Atreides unites with the Fremen to seek revenge against those who destroyed his family, while navigating a dangerous prophecy that could change the universe forever.",
  },
  {
    id: 5,
    image: "https://i.postimg.cc/KzmccmNq/the-gorge-67594b9b42095.jpg",
    title: "THE GORGE",
    highlight: "2024",
    year: "2024",
    rating: "⭐ 7.8/10",
    genre: "Action, Romance, Thriller",
    description:
      "Two operatives in a high-stakes world of espionage share an intense romance, navigating danger and deception in a thrilling rollercoaster of love and betrayal.",
  },
];

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const databaseMovies = client.db('moviePortal').collection('movies');
    const FavoriteDb = client.db("favoriteMovies").collection("Fmovies");
    const bannerDb = client.db("bannerMovie").collection("Bmovies");
    const tvSeries = client.db("tvSeries").collection('shows');

    app.get("/movies",async(req,res)=>{
    const {searchParams} = req.query;
    let option ={};
if(searchParams){
  option={title:{$regex:searchParams,$option:"i"}};
}
    const cursor = databaseMovies.find().sort({rating:-1});
    const result = await cursor.toArray();
    res.send(result);
  })

  app.get("/movies/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await databaseMovies.findOne(query);
      res.send(result);
  
    })
  
  
       app.post("/movies", async(req,res)=>{
        const movieInfo = req.body;
      console.log(movieInfo );
  
       const data = await databaseMovies.insertOne(movieInfo );
       res.send(data);
  
       });
  
       app.put("/movies/:id", async(req,res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const movie = req.body;
        console.log(movie);
  
        const updateMovie ={
          $set:{
              
  title:movie.title,
  poster:movie.poster,
  genre:movie.genre,
  releaseYear:movie.releaseYear,
  rating:movie.rating,
  duration:movie.duration,
  summary:movie.summary,
          }
        }
        const result = await databaseMovies.updateOne(filter,updateMovie,options)
        res.send(result);
       })
  
       app.delete("/movies/:id", async(req,res)=>{
        const id = req.params.id;
        console.log(id)
         const query = {_id: new ObjectId(id)}
         const deleteMovie = await databaseMovies.deleteOne(query);
         res.send(deleteMovie);
       });
  
       //for favorite section
       app.get("/favorite/:email", async (req, res) => {
        const email  = req.params.email;
        console.log("Email:", email);
      
        const cursor = FavoriteDb.find({ User: email });
        const result = await cursor.toArray();
        res.send(result);
      });
  
       app.post("/favorite",async(req,res)=>{
        const Fdata = req.body;
        // console.log(Fdata);
        const data = await FavoriteDb.insertOne(Fdata)
        res.send(data);
       });
  
       app.delete("/favorite/:id",async(req,res)=>{
        const id = req.params.id;
        console.log(id)
        const query = {_id: new ObjectId(id)}
        const deleteFav = await FavoriteDb.deleteOne(query);
        res.send(deleteFav);
  
       })
  
       //for banner
       const count = await bannerDb.countDocuments();
       if (count === 0) {
         const options = { ordered: true };
         await bannerDb.insertMany(allMovie, options);
        
       }
   
       app.get("/banner", async (req, res) => {
         const movies = await bannerDb.find().toArray();
         res.send(movies);
       });
       //latest movies
       app.get("/Latest",async(req,res)=>{
  
        const latest = await databaseMovies.find().sort({releaseYear:-1})
        const result = await latest.toArray();
      res.send(result);
       })
  
       //tvhsows
       const count2 = await tvSeries.countDocuments();
       if(count2 ===0){
  
        await tvSeries.insertMany(tvShows)
       }
  
       app.get("/tv-shows",async(req,res)=>{
          const result = await tvSeries.find().toArray();
          res.send(result);
       })
  
       app.get("/tv-shows/:id",async(req,res)=>{
        const id = req.params.id;
  
        const query = {_id: new ObjectId(id)}
        const result = await tvSeries.findOne(query)
        res.send(result);
  
  
       }) 

  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }

}

run().catch(console.dir);


const object ={
  "name":"mahin",
  "enroll": 200303246
  };

  

    // Add your API routes here, example:
    app.get("/", (req, res) => {
      res.send(object);
    });

    // Start listening only after MongoDB is connected
    app.listen(port, () => {
      console.log(`Server running on port: ${port}`);
    });


