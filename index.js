const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const productModel = require('./models/product');

const userModel = require('./models/user')


const jwt = require('jsonwebtoken');
const secrectKey='this is a secrectkey'

app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');




mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('DB connection established successfully')
});

const openUrl = ['/', '/test', '/signup', '/login']; //open url's
const LoginuserAllowedUrl = ['/product/get']//role-1(supreadmin).role-2(admin)
const superAdminAccessList = ['/product/create', '/product/update', '/product/delete']//only role-1

app.use((req, res, next) => {
    console.log('requested hitted', req.path);
    if (openUrl.indexOf(req.path) != -1) {

        next();
    } else {
        if(!req.headers || !req.headers.authorization){
            return res.status(403).json({status:false,message:'misssing authorization Token'});
        }
        try{
            let decoded = jwt.verify(req.headers.authorization, secrectKey);
            if(decoded.role && LoginuserAllowedUrl.indexOf(req.path)!=-1){
                next()
            }
            else if(decoded.role==1 &&superAdminAccessList.indexOf(req.path)!=-1){
                next();
            }else {
                return res.status(403).json({status:false,message:"You don't have access for this url"});
            }


        }catch(errr){
            return res.status(403).json({status:false,message:'Invalid  Token'})
        }

    }


});


app.get('/', (req, res) => {
    res.send('Nodejs Traning');
});

app.get('/test', (req, res) => {
    res.render('index.ejs', { name: 'Ram', city: 'Bng' });
});

//signup
app.post('/signup', async (req, res) => {
    try {
        let newUser = new userModel(req.body);
        let newUserResp = await newUser.save();
        res.json({ status: true, message: 'Request proceesed successfully' });
    } catch (err) {
        res.status(500).send({ status: false, err: err })
    }

})





//login 

app.post('/login', async (req, res) => {
    try {

        // req.body=email and password
        let userDeatils = await userModel.findOne(req.body);
        if (!userDeatils && !Object.keys(userDeatils).length) {
            return res.status(403).send({ status: false, message: 'Invalid creditals' });
        };

        let token = jwt.sign({ email: userDeatils.email, role: userDeatils.role }, secrectKey,{ expiresIn: '1h' });//encripting user unique

        res.json({ status: true, message: 'Request proceesed successfully', token: token });

    } catch (err) {
        res.send(500).send({ status: false, err: err })
    }

})


//params mandatory
//query params ?name=ram&age=26

app.get('/product/get', async (req, res) => {
    try {
        let query = {}
        if (req.query && Object.keys(req.query).length) {
            query = req.query;
        }
        let productList = await productModel.find(query);
        res.send(productList)

    } catch (err) {
        res.status(500).send(err)
    }

});

app.post('/product/create', async (req, res) => {
    try {

        let newProduct = new productModel(req.body);
        let productRes = await newProduct.save();
        res.send('Request Process Successfully');

    } catch (err) {
        res.status(500).send(err)
    }

});
app.put('/product/update', async (req, res) => {
    try {
        let updateTes = await productModel.update({ name: req.body.name }, req.body);
        res.send('Request Process Successfully');
    } catch (err) {
        res.status(500).send(err)
    }

});
app.delete('/product/delete/:productName', async (req, res) => {
    try {
        let deleteRes = await productModel.deleteOne({ name: req.params.productName });
        res.send('Request Process Successfully');

    } catch (err) {
        res.status(500).send(err)
    }

});


app.listen(8080, function (err) {
    if (err) console.log(err);
    else console.log('server running on the port: ', 8080)
})