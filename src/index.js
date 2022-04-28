import express, { json } from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import chalk from "chalk";
import dayjs from "dayjs";
import Joi from "joi";
import dotenv from "dotenv";


dotenv.config();
const server=express();
server.use(cors());
server.use(json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let dbChatUol;
mongoClient.connect(() => {
  dbChatUol = mongoClient.db("chatuol");
});


//* Participants
server.get("/participants", async (req, res) => {
    try {
      const participantsCollection = dbChatUol.collection("participants");
      const users = await participantsCollection.find({}).toArray();
  
      res.send(users);
    } catch (error) {
      res.sendStatus(500);
    }
});

server.post("/participants", async (req, res) => {
    //
});


server.listen(5005, ()=>{
    console.log(chalk.bgGreen("Programa Rodando!"))
});
