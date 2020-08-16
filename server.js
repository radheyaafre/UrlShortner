const express = require('express');
const mongoose =  require('mongoose');
const ShortUrl = require('./models/shortUrl')
const mongoSanitize = require('express-mongo-sanitize');
const dotenv= require('dotenv');
const app = express();

dotenv.config({path: 'config.env'});
app.use(express.urlencoded({extended: false}));

app.use(mongoSanitize());

const db=process.env.DATABASE.replace('<password>',process.env.DATBASE_PASSWORD);
mongoose.connect(db,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then(()=>{
    console.log('DB connection Success!');
});


app.set('view engine', 'ejs');


app.get('/',async(req,res)=>{
    const shortUrls= await ShortUrl.find()
    res.render('index', {shortUrls: shortUrls});
});

app.post('/shortUrls', async(req, res)=>{
    await ShortUrl.create({
        full: req.body.fullUrl
    });
    res.redirect('/');
})

app.get('/:shortUrl', async(req, res) =>{
   const url = await ShortUrl.findOne({short:req.params.shortUrl});
   if(!url) return res.sendStatus(404);
   url.clicks++;
   url.save();
   res.redirect(url.full);
})

const port=process.env.PORT || 5000;
const server = app.listen(port,()=> {
    console.log('App running on port'+port);
});

// when in application there is a unhandled promice exception occures follo obj gets emmited
// we are subscribig to it as follow
process.on('unhandledRejection', err => {
    console.log('err', err.name, err.message,err.stack);
    console.log('Unhandled Rejections..!');
    server.close(() =>{
        process.exit(1); //shutDown the process (APP)
    });    
});