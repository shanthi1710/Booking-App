//=================================================================
const express=require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt=require('bcryptjs');
const bcryptSlt=bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const jwtSecret='fasefrawsdfgfg';
const cookieParser =require('cookie-parser');
const download = require('image-downloader');  
const multer =require('multer');
const fs = require('fs');
//==================================================================
//import files
const User = require('./models/User.js');
 
//==================================================================
const App =express();
App.use(express.json());
App.use(cookieParser());
App.use('/uploads',express.static(__dirname+'/uploads'));
//===================================================================
//frontend connection
App.use(cors({
    credentials:true,
    origin:'http://localhost:5173',
}));
//====================================================================
//database connection
const connectDB = async () =>{
    try{
        const con = await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        })
        console.log(`MongoDB connected :${con.connection.host}`);

    }catch(err){
        console.log(err);
        process.exit(1);
    }
}
connectDB();
//=======================================================================
//routes-Register
App.post('/register',async(req,res)=>{
    const{name,email,password}=req.body;
    try{
        const userDoc=await User.create({
            name,
            email,
            password:bcrypt.hashSync(password,bcryptSlt),
         });
         res.json(userDoc);
    } catch (e){
        res.status(422).json(e);
    }   
})
//=========================================================================
//routes-Login
App.post('/login',async (req,res)=>{
    const{email,password}=req.body;
    const userDoc=await User.findOne({email})
    if(userDoc)
    {
        const passOk=bcrypt.compareSync(password,userDoc.password);
        if(passOk){
            jwt.sign({
                email:userDoc.email,
                id:userDoc._id,
            },jwtSecret,{},(err,token)=>{
                if(err) throw err;
                res.cookie('token',token).json(userDoc);
            });
        }
        else{
            res.status(422).json('pass not ok');
        }
    }else{
        res.json('not found ');

    }
});
//=========================================================================
//routes-Profile
App.get('/profile',(req,res)=>{
    const {token}=req.cookies;
    if(token)
    {
        jwt.verify(token,jwtSecret,{},async(err, userData)=>{
            if(err) throw err;
            const {name,email,_id}=await User.findById(userData.id)
            res.json({name,email,_id});
        });
    }else{
        res.json(null);
    }
})
//=======================================================================
//photos-uploads-by-link 
App.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';

    try {
        await download.image({
            url: link,
            dest: __dirname + '/uploads/' + newName,
        });
        
        res.json('/uploads/' + newName);
    } catch (error) {
        console.error('Error downloading image:', error);
        res.status(500).json({ error: 'Failed to download and save the image' });
    }
});
//=====================================================================================
//photos-uploads-by-file
const photoMiddleware = multer({ dest: 'uploads/' });
App.post('/upload', photoMiddleware.array('photos', 100), (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const { path, originalname } = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('uploads/',''));
    }
    res.json(uploadedFiles);
});


//=======================================================================
//Logout
App.post('/logout',(req,res)=>{
    res.cookie('token','').json(true);
})
//=======================================================================
//server
const port = process.env.PORT ||8000;
App.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})
//=======================================================================