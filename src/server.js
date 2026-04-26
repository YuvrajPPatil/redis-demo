import express from "express";
import axios from "axios";
import { createClient } from "redis";

const app=express();

//client
const redis=createClient({
    url:"redis://localhost:6379",
});

redis.on("error",(err)=>console.error("Redis Error",err));

await redis.connect();

//todos for caching

app.get("/todo",async(req,res)=>{

     const cacheKey = "todos";
    try{
        const cached=await redis.get(cacheKey);
        if(cached){
            console.log(`Cached Hit`);
            return res.json(JSON.parse(cached));
        }

         console.log(`Cached Miss`);
         const result=await axios.get("https://jsonplaceholder.typicode.com/todos");

         await redis.setEx(cacheKey,60,JSON.stringify(result.data));

        return res.status(200).json({
            message:"success",
            data: result.data
        });
    }catch(error)
    {
        console.log(error);
        return res.status(500).json({ error: "API failed" });
    }
    
});
app.listen(3000,()=>{
    console.log(`server running on port 3000`);
});