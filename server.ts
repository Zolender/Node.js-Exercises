import express from "express";
import fs from "fs"
import { Response, Request } from "express";
import { Item } from "./types/item";
import { randomUUID } from "crypto";


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

app.post("/create", (req: Request, res: Response)=>{
    const newItem = {...req.body, id: randomUUID()}
    if(!isValidItem(newItem)){
        return res.status(404).json({message: "Bad request, try again"})
    }
    fs.readFile("./db.json", "utf8", (err, data)=>{
        if(err){
            console.error(err.message)
            res.status(500).json({message: "Something went wrong on the server side", error: err.message})
            return
        }
        const db = JSON.parse(data)
        db.push(newItem)
        fs.writeFile("./db.json", JSON.stringify(db), (err)=>{
            if(err){
                console.error(err)
                return res.status(500).json({message: `Something went wrong: ${err}`})
            }
            res.status(201).json({message: "Item created successfully"})
        })
    })
})

function isValidItem(obj: Object): boolean{
    return ( obj.hasOwnProperty("id") && obj.hasOwnProperty("name") && obj.hasOwnProperty("description") && obj.hasOwnProperty("price"))
}


app.listen(3000, ()=>{
    console.log("Server is running on port: 3000")
})