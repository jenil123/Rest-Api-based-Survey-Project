const express=require('express')
const mongoose=require('mongoose')
const Token=require('./models/tokens')
const Question=require('./models/questions')
const jwt=require('jsonwebtoken')
const moment=require('moment')
const prompt=require('prompt')
const readline = require('readline');
const bodyparser=require('body-parser')
const cookieParser = require("cookie-parser")
const path=require('path')
const Answers=require('./models/answers')
const User=require('./models/users')


const jwtKey = "my_secret_key"

//connecting to mongoDB Atlas

MONGO_URI='mongodb+srv://jenil:jenil@cluster0.uhlyr.mongodb.net/Toodle?retryWrites=true&w=majority'

mongoose.connect(MONGO_URI,{useNewUrlParser:true},{useUnifiedTopology: true})
.then(()=>{
    console.log("connected to the database")
})
.catch(err=> console.log(err))





const app=express()
app.use(bodyparser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyparser.json())
app.use(cookieParser())

//routes
app.use('/survey',require('./routes/survey'))

app.set('view engine','ejs')
app.set('jwtTokenSecret', 'YOUR_SECRET_STRING')


var token1;

//Downloading and resizing a image 

app.get('/image',async (req,res)=>{
    console.log(req.cookies.token)
    const token1 = req.cookies.token

    //verifying the token
    if (!token1) {
		return res.status(401).send("Token not found").end()
    }
    const data=await Token.findOne({token:token1})
    console.log(data)
    var payload
	try {
        console.log("here")
        jwt.verify(token1, jwtKey)
        
	} catch (e) {
		if (e instanceof jwt.JsonWebTokenError) {
			// if the error thrown is because the JWT is unauthorized, return a 401 error
			return res.status(401).send("Token not authorized").end()
		}
		// otherwise, return a bad request error
		return res.status(400).send("Some error occured").end()
	}
    res.render('image')
})
const Jimp = require("jimp")
app.post('/image',(req,res)=>{
    const imgURL=req.body.image
    Jimp.read(imgURL, function(err,img){
        if (err) throw err;
        img.resize(50, 50).getBase64( Jimp.AUTO , function(e,img64){
            if(e)throw e
            res.send('<img src="'+img64+'">')
        });
      });
})



//Login to localhost:8000 by passing username and password in the body of request
app.get('/login',(req,res)=>{
    res.render('login',{
        msg:""
    });
})

app.post('/login',async (req,res)=>{
    const name1=req.body.lname;
    console.log(name1)
    const pass=req.body.pass;
    const Name=await User.findOne({name:name1})
    if(!Name)
    {
        var user={
            name:name1,
            password:pass,
        }
        await User.create(user)
    }
    else{
        if(Name.password!=pass)
        {
            res.render("login",{
                msg:"Password is not correct"
            })
        }
    }

    const data=await Token.findOne({name:name1})
    console.log(data)
    const token1 = jwt.sign({ name:name1 }, jwtKey, {
		algorithm: "HS256",
		expiresIn: "7d",
	})

    
    if(!data)
    {
        
        var data1={
            token:token1,
            name:name1,
        }
        await Token.create(data1)
    }
    else{
        Token.findOneAndUpdate({name:name1},{$set:{token:token1}},{new: true},(err,doc)=>{
            if(err)
            {
                console.log(err)
            }
        });
    }
    console.log(data)
    res.cookie("token", token1, { maxAge: 5000 * 1000 })
    res.send("Login Successfully")
    res.end()
})




app.listen(8000,()=>{
    console.log("Server is running at port 8000")
})