const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Chandu Your server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`chandu your DbAnd server getting ERROR: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


//API 1 =Returns a list of all movie names in the movie table
app.get("/movies/" , async (request ,response) =>{
    const movieDBQuery =`
    SELECT movie_name 
    FROM movie ;`
    const API1response = await db.all(movieDBQuery);
    response.send(API1response.map((eachMovie) =>({
        movieName :eachMovie.movie_name        
    }))
    );
});

// API 2 = Creates a new movie in the movie table. `movie_id` is auto-incremented
app.post("/movies/" , async (request ,response) =>{
    const { directorId, movieName, leadActor } = request.body;
    const addMovieDBQuery =`
    INSERT INTO 
    movie(director_id,movie_name,lead_actor) 
    VALUES
    (${directorId},'${movieName}','${leadActor}')
    ;` ;
    await db.run(addMovieDBQuery);
    response.send("Movie Successfully Added");
});

//API 3 = Returns a movie based on the movie ID
const dbResponseTodbObject = (dbObject) =>{
    return {
        movieId: dbObject.movie_id,
        directorId: dbObject.director_id,
        movieName: dbObject.movie_name,
        leadActor: dbObject.lead_actor,
    }  ;     
};

app.get("/movies/:movieId/", async(request,response) =>{
    const {movieId} = request.params;
    const getAmovieQuery =`
    SELECT *
    FROM movie
    WHERE 
    movie_id = ${movieId};` ; 
    const API3response =await db.get(getAmovieQuery);
    response.send(dbResponseTodbObject(API3response));
});

//API 4 = Updates the details of a movie in the movie table based on the movie ID 
app.put("/movies/:movieId/" ,async (request ,response) =>{
    const { movieId } = request.params;
    const movieDetails = request.body;
    const {directorId, movieName, leadActor } = movieDetails;
    const UpdateMovieDBQuery =`
    UPDATE 
        movie
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId} ;` ;
    await db.run(UpdateMovieDBQuery);
    response.send("Movie Details Updated");
    

});

//API 5 = Deletes a movie from the movie table based on the movie ID
app.delete("/movies/:movieId",async (request ,response) =>{
    const { movieId } = request.params;
    const delMovieDBQuery =`
    DELETE FROM 
        movie
    WHERE 
        movie_id = ${movieId} ;` ;
   await db.run(delMovieDBQuery);
   response.send("Movie Removed");
});

//API 6 = Returns a list of all directors in the director table
const directordbResponseTodbObject = (dbObject) =>{
    return {
        directorId:dbObject.director_id,
        directorName:dbObject.director_name,
    };
} ;

app.get("/directors/" , async (request ,response) =>{
    const directorDBQuery =`
    SELECT * 
    FROM director ;`
    const API6response = await db.all(directorDBQuery);
    response.send(API6response.map((eachDirector) =>
        directordbResponseTodbObject(eachDirector)));
});

// API 7 = Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/" , async (request ,response) =>{
    const { directorId } = request.params;
    const directorMovNameDBQuery =`
    SELECT movie_name 
    FROM movie
    WHERE director_id = ${directorId} ;`
    const API7response = await db.all(directorMovNameDBQuery);
    response.send(API7response.map((eachMovie) =>({
        movieName:eachMovie.movie_name }))
        );
});

module.exports =app;