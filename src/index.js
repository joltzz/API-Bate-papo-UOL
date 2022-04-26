import express, { json } from "express";
import cors from "cors";
import chalk from "chalk";
// import dayjs from "dayjs";
// import Joi from "joi";
// import dotenv from "dotenv";


const app=express();

app.use(express());
app.use(cors());
app.use(json());

app.get("/", (req, res)=>{
    res.send("Teste ok!")
})

app.post("/", (req, res)=>{

})

app.listen(5005, ()=>{
    console.log(chalk.bgGreen("Programa Rodando!"))
})
