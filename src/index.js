import express, { json } from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import chalk from "chalk";
import dayjs from "dayjs";
import joi from "joi";
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


//Schemas
const userSchema=joi.object({
    name: joi.string().required(),
});

const messageSchema=joi.object({
    to: joi.string.required(),
    text: joi.string().required(),
    type: joi.valid("message", "private_message").required(),
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


//Status
server.post("/status", async (req, res)=>{
    const username= req.header.user;

    try{
        const participantsCollection =dbChatUol.collection("participants");
        const participantsList = await participantsCollection.find({}).toArray();
        if(!participantsList.find((p)=> p.name === username)){
            res.sendStatus(404);
        }
        else{
            await participantsCollection.updateOne(
                { name: username},
                { $set: {lastStatus: Date.now() }}
            );
            res.sendStatus(200);
        }
    } catch(e){
        console.log(e);
        res.sendStatus(500);
    }
});


//Remove
//setinterval()...


// Listen
server.listen(5005, ()=>{
    console.log(chalk.bgGreen("Programa Rodando!"))
});
