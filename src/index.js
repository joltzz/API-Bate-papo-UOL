import express, { json } from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import chalk from "chalk";
import dayjs from "dayjs";
import Joi from "joi";
import dotenv from "dotenv";


//Configs
dotenv.config();
const server=express();
server.use(cors());
server.use(json());

//MongoClient
const mongoClient = new MongoClient(process.env.MONGO_URI);
let dbChatUol;
mongoClient.connect(() => {
  dbChatUol = mongoClient.db("chatuol");
});


// Participants
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


// Messages
server.get("/messages", async (req, res) => {
    const username = req.headers.user;
    const limit = parseInt(req.query.limit);
    try {
        const chatCollection = dbChatUol.collection("messages");
        const filterChat = await chatCollection
        .find({
            $or: [
                { type: "message" },
                { $and: [{ type: "private_message" }, { to: username }] },
                { $and: [{ type: "private_message" }, { from: username }] },
            ],
        })
        .toArray();
        if (!limit) {
            res.send(filterChat);
        } else {
            res.send(filterChat.slice(-limit));
        }
    } catch (error) {
        res.sendStatus(500);
    }
});

server.post("/messages", async (req, res) => {
    //
});


// Listen
server.listen(5005, ()=>{
    console.log(chalk.bgGreen("Programa Rodando!"))
});
