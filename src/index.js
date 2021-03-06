import express, { json } from "express";
import { MongoClient } from "mongodb";
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
    const validation = userSchema.validate(req.body);
  
    if (validation.error) {
      res.status(422).send(validation.error);
      return;
    }
    try {
      const participantsCollection = dbChatUol.collection("participants");
  
      if (await participantsCollection.findOne({ name: req.body.name })) {
        res.status(409).send("Ops, esse participante já existe");
  
        return;
      }
      const userData = {
        name: req.body.name,
        lastStatus: Date.now(),
      };
  
      await participantsCollection.insertOne(userData);
      res.sendStatus(201);
    } catch (error) {
      res.sendStatus(500);
    }
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
    const messageFrom = req.headers.user;
    const validation = messageSchema.validate(req.body, { abortEarly: false });
    const participants = await dbChatUol.collection("participants");
    try {
      let authorization = await participants.findOne({ name: messageFrom });
  
      if (!authorization) {
        res.sendStatus(422);
  
        return;
      }
      if (validation.error) {
        res.status(422).send("Erro na validação dos dados");
  
        return;
      }
      const message = {
        ...req.body,
        from: messageFrom,
        time: dayjs().format("HH:mm:ss"),
      };
      await dbChatUol.collection("messages").insertOne(message);
      res.sendStatus(201);
    } catch (error) {
      res.sendStatus(500);
    }
  });


//Status
server.post("/status", async (req, res) => {
    const username = req.headers.user;
  
    try {
      const participantsCollection = dbChatUol.collection("participants");
      const participantsList = await participantsCollection.find({}).toArray();
      if (!participantsList.find((p) => p.name === username)) {
        res.sendStatus(404);
      } else {
        await participantsCollection.updateOne(
          { name: username },
          { $set: { lastStatus: Date.now() } }
        );
        res.sendStatus(200);
      }
    } catch (error) {
      res.sendStatus(500);
    }
  });


//Remove
setInterval(async () => {
    try {
      const participants = dbChatUol.collection("participants");
      const messages = dbChatUol.collection("messages");
      const online = await participants.find({}).toArray();
  
      for (const participant of online) {
        if (Date.now() - participant.lastStatus > 10000) {
          await participants.deleteOne({ name: participant.name });
          await messages.insertOne({
            from: participant.name,
            to: "Todos",
            text: "sai da sala...",
            type: "status",
            time: dayjs().format("HH:mm:ss"),
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, 15000);

// Listen
server.listen(5000, ()=>{
    console.log(chalk.bgGreen("Programa Rodando!"))
});
