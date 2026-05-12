import express from "express";
import fs from "fs"
import { Response, Request } from "express";
import { Item } from "./types/item";


const app = express()
app.use(express.json())
let counter = 1

app.get("/items", (req: Request, res: Response)=>{
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

app.post("/items", (req: Request, res: Response)=>{
    const newItem = {...req.body, id: String(counter++)}
    if(!isValidItem(newItem)){
        return res.status(400).json({message: "Bad request, try again"})
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

function isValidItem(obj: any): boolean{
    return ( typeof obj.name === "string" && typeof obj.description=== "string" && typeof obj.price === "number" )
}

app.delete("/items/:id", (req: Request, res: Response)=>{
    const {id} = req.params
    let db : Item[]
    fs.readFile("./db.json", "utf8", (err, data)=>{
        if(err){
            console.error(err.message)
            return res.status(500).json({message: "Something went wrong on the server side", error: err.message})
        }
        db = JSON.parse(data)
        const item = db.find(obj=> obj.id=== id)
        if(!item){
            return res.status(404).json({message: "Item not found"})
        }
        const newdb = db.filter(item=> item.id !== id)
        fs.writeFile("./db.json", JSON.stringify(newdb), (err)=>{
            if(err){
                return res.status(500).json({message: "something went wrong on the server side", error: err.message})
            }
            res.status(200).json({message: "Item deleted successfully"})
        })
    })
})


app.put("/items/:id",  (req: Request, res: Response)=>{
    const {id} = req.params
    const { newName, newDescription, newPrice } = req.body
    if(newName=== undefined && newDescription=== undefined && newPrice=== undefined){
        return res.status(400).json({message: "Bad request"})
    }
    let db : Item[]
    fs.readFile("./db.json", "utf8", async (err, data)=>{
        if(err){
            console.error(err.message)
            return res.status(500).json({message: "Something went wrong on the server side", error: err.message})
        }
        db = await JSON.parse(data)
        const item = db.find(obj=> obj.id === id)
        if(!item){
            return res.status(404).json({message: "Item not found"})
        }
        const updatedItem = {
            id,
            name: newName?? item.name,
            description : newDescription?? item.description,
            price: newPrice ?? item.price
        }
        
        const newdb = db.map(item=> (item.id === id? updatedItem : item))

        fs.writeFile("./db.json", JSON.stringify(newdb), (err)=>{
            if(err){
                return res.status(500).json({message: "something went wrong on the server side", error: err.message})
            }
            res.status(200).json({message: "Item updated successfully"})
        })

    })
})

app.listen(3000, ()=>{
    console.log("Server is running on port: 3000")
})