import express, { response } from "express";
import { MongoClient } from 'mongodb';
import { ObjectId } from "mongodb";
import cors from "cors";
import bcrypt from "bcrypt"
import  Jwt  from "jsonwebtoken";

const app=express();
app.use(cors({
     origin:"*" //global access  
    origin:"http://localhost:3000" 
 }
));
const auth=(req,res,next)=>{
    try{
        const token=req.header("backend-token") //keyname
        Jwt.verify(token,"stud");
        next()
    }
    catch(error){
        response.status(401).send({message:error.message})
    }
};
const url="mongodb+srv://Arjun_A:arjunmongodb73@arjundb.22khglw.mongodb.net/?retryWrites=true&w=majority&appName=ArjunDB";
const client=new MongoClient(url);
await client.connect();
console.log("database connected succesfully")

app.use(express.json())
app.get("/",function(req,res){
    res.send("hello world")
})
app.post("/post",async function(req,res){
    const getpostman=req.body;
    const sendMethod=await client.db("CRUCD").collection("data").insertOne(getpostman)
    res.status(201).send(sendMethod)
   // console.log(getpostman)
})
app.post("/postmany",async function(req,res){
    const getmany=req.body;
    const sendMethod=await client.db("CRUCD").collection("data").insertMany(getmany)
    res.status(2010).send(sendMethod)
})
app.get("/get",auth,async function(req,res){
    const getMethod=await client.db("CRUCD").collection("data").find({}).toArray();
    res.status(200).send(getMethod)
})
app.get("/getone/:id",async function(req,res){
    const {id}=req.params
    const getMethod=await client.db("CRUCD").collection("data").findOne({_id:new ObjectId(id)});
    res.status(200).send(getMethod)
})
app.put("/update/:id",async function(req,res){
    const {id}=req.params
    const getpostman=req.body
    const updatemethod=client.db("CRUCD").collection("data").updateOne({_id:new ObjectId(id)},{$set:getpostman})
    res.status(201).send(updatemethod)
})
app.delete("/delete/:id",async function(req,res){   
    const {id}=req.params;
    const deletemethod=await client.db("CRUCD").collection("data").deleteOne({_id:new ObjectId(id)})
    res.status(200).send(deletemethod)
})
app.post("/register",async function(req,res){
    const {username,email,password}=req.body;
    const userfind=await client.db("CRUCD").collection("private").findOne({email:email})
    if(userfind!=null){
        res.status(400).send("Existing user")
    }
    else{
    const salt=await bcrypt.genSalt(10);
    const hashedpassword=await bcrypt.hash(password,salt);
    const registermethod=await client.db("CRUCD").collection("private").insertOne({username:username,email:email,password:hashedpassword});
    console.log(hashedpassword)
    res.status(201).send(registermethod)
    }

});
app.post("/login",async function(req,res){
    const {email,password}=req.body;
    const userfind=await client.db("CRUCD").collection("private").findOne({email:email});

    console.log(email,password)
   // console.log(userfind);
   if(userfind){
        const mongodbpassword=userfind.password;
        const passwordcheck=await bcrypt.compare(password,mongodbpassword);
        if(passwordcheck){
           const token=Jwt.sign({id:userfind._id},"stud") //jwt token student
           res.status(200).send({token:token})
        }
        else{
            res.status(400).send({message:"Invalid Email-id"})
        }
    }
   else{
    res.status(400).send({message:"Invalid Email-id"})
   }

});

app.listen(5000,()=>{
    console.log("server connected succesfully")
})
//201-creation 200-ok 400-bad request
