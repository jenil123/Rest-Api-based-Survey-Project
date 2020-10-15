const mongoose=require('mongoose')

const questionSchema=new mongoose.Schema({
     name:
     {
         type:String,
        required:true,
        trim:true
     },
     surveyNo:{
          type:Number,
          default:0,
          required:true,
     },
     questions: [String],

})

module.exports=mongoose.model('Questions',questionSchema)