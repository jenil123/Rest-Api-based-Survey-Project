const express=require('express')
const mongoose=require('mongoose')
const Token=require('../models/tokens')
const Question=require('../models/questions')
const jwt=require('jsonwebtoken')
const moment=require('moment')
const prompt=require('prompt')
const readline = require('readline');
const bodyparser=require('body-parser')
const cookieParser = require("cookie-parser")
const path=require('path')
const Answers=require('../models/answers')
const { send } = require('process')
const jwtKey = "my_secret_key"

const router=express.Router()


/*
    create a survey:
    A user can add some set of questions in a survey and all the questions would be added into a MongoDB collection.
    All the questions would have YES/NO by default
*/

router.get('/create',async (req,res)=>{
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
    res.render('question')
})
var name
var questions=[]
router.post('/create',async (req,res)=>{
        const token1=req.cookies.token

        const data=await Token.findOne({'token':token1})
   
        name=data['name'];
        
        var question1=req.body.question
        if(req.body['submit']!='Done')
        questions.push(question1)
        else{
            
            const data1=await Question.findOne({name:name}).sort({surveyNo:-1})
            if(!data1)
            {
                var info={
                    name:name,
                    questions:questions,
                    surveyNo:0
                }
                await Question.create(info)
            }
            else{
                var info={
                    name:name,
                    questions:questions,
                    surveyNo:data1.surveyNo+1
                }
                await Question.create(info)
            }
            questions=[]
        }
        res.redirect('/survey/create')
    
})



//getting name of the survey taker
router.get('/answer',async (req,res)=>{
    const token1 = req.cookies.token

    //verifying the token
    if (!token1) {
		return res.status(401).send("Token not found").end()
    }
    const data=await Token.findOne({token:token1})
    
    var payload
	try {
        
        jwt.verify(token1, jwtKey)
        
	} catch (e) {
		if (e instanceof jwt.JsonWebTokenError) {
			// if the error thrown is because the JWT is unauthorized, return a 401 error
			return res.status(401).send("Token not authorized ").end()
		}
		// otherwise, return a bad request error
		return res.status(400).send("Some error occured").end()
	}
    res.render('survey-taker',{
        msg:""
    })
})


var sname;
var l;
var sno;
router.post('/answer',async (req,res)=>{
    sname=req.body.name
    
    const token1 = req.cookies.token
    if (!token1) {
		return res.status(401).end()
    }
    sno=req.body.surveyNo;
    const q=await Question.find({name:sname,surveyNo:sno})
    console.log(q)
        if(!q)
        {
            res.status(400).send("No such survey").json()
        }
        else{
            const data=await Token.findOne({token:token1})
            var info={
                Givername:data.name,
                surveyNo:sno,
                takerName:sname,
                answer:[]
            }
            await Answers.create(info)
            
            const p=q[0].questions
            res.render('view-survey',{
                p,
            })
        }
})




//store the results of the survey

router.post('/store',async (req,res)=>{
    const token1=req.cookies.token;
    const data=await Token.findOne({token:token1})
    console.log(data)

    const answ=await Answers.findOne({Givername:data.name,answer:[]})
    if(!answ)
    {
        res.send("You have responded all survey of given owner")
        res.end();
    }
    const gname=answ.Givername;
    const tname=answ.takerName
    const sno=answ.surveyNo;
    var l = Object.keys(req.body ).length;
     
        var ans=[]
        for(var i=0;i<l;i++)
        {
            
            ans.push(req.body['answer'+i])
        }
        Answers.findOneAndUpdate({Givername:gname,takerName:tname,surveyNo:sno},{ $set: { answer: ans } },{new: true},(err,doc)=>{
            if(err)
            {
                console.log(err)
            }
        });
        res.send("Thanks for submitting your responses")
        res.end()
})


/*
    A logged user would be able to see the results of all surveys created by me.
    He/She would see
    responder_name: who answered the survey,
    response: what were the responder's answers to the questions
    surveyNo: which survey he/she has answered.
*/

router.get('/result/view',async (req,res)=>
{
    const token1=req.cookies.token;
    const Name=await Token.findOne({token:token1})
    console.log(Name)
    const name=Name.name;
    const Data=await Answers.find({takerName:name});
    console.log(Data)
    const ans=[]
    Data.forEach(data => {
        const msg={
            Responder_name:data.Givername,
            response:data.answer,
            surveyNo:data.surveyNo,
        }
        console.log(msg)
        ans.push(msg)
    })
    if(ans!==[{}])
        res.json(ans)
    
    
})

module.exports=router
