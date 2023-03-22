const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017';
const db = 'slotmachine';
//let game=null;


module.exports = class MongodbOps{
    //connection setup with MongoDB
    static game;
 static async mongodbConnection() {
    const client = new MongoClient(uri, { useUnifiedTopology: true});
    let game;
    try {
      await client.connect();
      console.log(db);
      const database = client.db(db);
      game = database.collection('game');
      //console.log(game);
      //return game;
      //game_result = database.collection('game_result');
    } catch (err) {
      console.log(err.stack);
    }
    
    //await client.close();
  }
//mongodbConnection();

//updating the game.tickets to add the player data
 static async addPlayerDataToGame(playerdata,gameID,game){                 
    try{
        game.updateOne({"gameID" : gameID}, {$push: {"tickets": playerdata}});
    }
    catch(err){
        console.log(err.stack)
    }
}

//This is the skeleton of the game all the data will be store in the single game object no separate tabel
static async insertGameDataToMongoDB(gamedata){  
    console.log(gamedata);                     
    try{
        MongodbOps.game.insertOne(gamedata);
    }
    catch(err){
        console.log(err.stack)
    }
}

//Update the game result in MongoDB
static async updateresultinDB(gameID,slot1,slot2,game){
    try{
        game.updateOne({"gameID" : gameID}, {$set: {"slot1": slot1, "slot2": slot2}});
    }
    catch(err){
        console.log(err.stack);
    }
}

//get current game data to render
static async getcurrentgamedata(gameID,game){
    try{
        const currdata = await game.find({"gameID": gameID});
        //const data = await currdata.toArray();
        let data = null;
        if(await currdata.hasNext()) {
            const recipe = await currdata.next();
            data = recipe.tickets;
          }

        //let data = JSON.stringify(currdata);
        console.log(data);
        return data;
    }
    catch(err){
        console.log(err.stack);
    }
}
}


// //connection setup with MongoDB
// async function mongodbConnection() {
//     const client = new MongoClient(uri, { useUnifiedTopology: true});
//     try {
//       await client.connect();
//       const database = client.db(db);
//       game = database.collection('game');
//       //game_result = database.collection('game_result');
//     } catch (err) {
//       console.log(err.stack);
//     }
//     //await client.close();
//   }
// mongodbConnection();

// //updating the game.tickets to add the player data
// async function addPlayerDataToGame(playerdata){                 
//     try{
//         game.updateOne({"gameID" : gameID}, {$push: {"tickets": playerdata}});
//     }
//     catch(err){
//         console.log(err.stack)
//     }
// }

// //This is the skeleton of the game all the data will be store in the single game object no separate tabel
// async function insertGameDataToMongoDB(gamedata){                       
//     try{
//         game.insertOne(gamedata);
//     }
//     catch(err){
//         console.log(err.stack)
//     }
// }

// //Update the game result in MongoDB
// async function updateresultinDB(){
//     try{
//         game.updateOne({"gameID" : gameID}, {$set: {"slot1": slot1, "slot2": slot2}});
//     }
//     catch(err){
//         console.log(err.stack);
//     }
// }

// //get current game data to render
// async function getcurrentgamedata(){
//     try{
//         const currdata = await game.find({"gameID": gameID});
//         //const data = await currdata.toArray();
//         let data = null;
//         if(await currdata.hasNext()) {
//             const recipe = await currdata.next();
//             data = recipe.tickets;
//           }

//         //let data = JSON.stringify(currdata);
//         console.log(data);
//         return data;
//     }
//     catch(err){
//         console.log(err.stack);
//     }
// }

//connectDB();

//mongodb
// const MongoClient = require('mongodb').MongoClient;
// const uri = 'mongodb://localhost:27017';
// const db = 'slotmachine';
//mongodbop.mongodbConnection();
//game.insertOne({"hello": "world"});
//console.log(game);