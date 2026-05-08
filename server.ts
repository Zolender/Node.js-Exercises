import express from "express";
import fs from "fs"
import { Response, Request } from "express";

const app = express()

app.use(express.json())

app.get("/", async (req: Request, res: Response)=>{
    fs.readFile("./db.json", "utf8", (err, data)=>{
        if(err){
            console.error(err.message)
            res.status(500).json({message: "Something went wrong on the server side", error: err.message})
            return
        }
        const db = JSON.parse(data)
        console.log("Data displaying")
        res.status(200).json(db)
    })
})



app.listen(3000, ()=>{
    console.log("Server is running on port: 3000")
})