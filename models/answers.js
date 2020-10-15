const mongoose=require('mongoose')

const answerSchema=new mongoose.Schema({
     Givername:
     {
        type:String,
        
        trim:true
     },
     surveyNo:{
        type:Number,
        default:0,
        required:true,
   },
     takerName:{
        type:String,
        
     },
     answer: [String],

})

module.exports=mongoose.model('Answers',answerSchema)