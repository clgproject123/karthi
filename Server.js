import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import AddCustumer from './Models/SignUp.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mobileData from './Models/Mobile.js'
import nodemailer from 'nodemailer'

const PORT = process.env.PORT || 3434

const CONNECTION_URL = `mongodb://collegedata:12345@ac-bg5byzv-shard-00-00.dfyenix.mongodb.net:27017,ac-bg5byzv-shard-00-01.dfyenix.mongodb.net:27017,ac-bg5byzv-shard-00-02.dfyenix.mongodb.net:27017/?ssl=true&replicaSet=atlas-ada2u1-shard-0&authSource=admin&retryWrites=true&w=majority`

const app = express()
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors());

app.get('/',(req,res)=>{
    res.send('this sathish project')
  })

app.post('/signup',async (req,res)=>{
    const {name, email, password} = req.body;
    
    
    const oldUser = await AddCustumer.findOne({email});

    if(oldUser)
    {
        return res.json({success:false,msg:'this email alerdy having 😣'})  
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = new AddCustumer({ name, email, password:hashedPassword})

    const token = jwt.sign({
        email:student.email,
        id:student._id,
        username:student.name,
        },'afgdfgeiksfnierkwefiwojeo',{expiresIn:"1h"})

    try {
        await student.save()
        return res.json({success:true,msg:'register successfully',token})  
    } catch (error) {
        return res.status.json({success:false,msg:'something is error please cheack'})
    }  
})

app.post('/login',async (req,res)=>{
    const {email,password} = req.body;
     
    try {
        
        const oldUser = await AddCustumer.findOne({email})

        if (!oldUser) return res.json({ success:false , msg: "User doesn't exist" });

        const isPasswordCorrect = await bcrypt.compare(password , oldUser.password)

        if(!isPasswordCorrect) return res.json({success:false,msg:"Invalid password"})

        const token = jwt.sign({username:oldUser.name, email:oldUser.email, id:oldUser._id,},`dfgesvesvrsgacrkhsdvjnaijdnvjajnsdfj`,{expiresIn:"1h"})

        if(token) return res.json({success:true,msg:'welcome',token})
 
    } catch (error) {
        return res.status(404).json({success:false,msg:'Somethig went wrong'})
    }
}) 

app.get('/users',(req,res)=>{
    AddCustumer.find({},(error,result)=>{
        if(error)
        {
            return res.send(404).json({success:false,msg:'Something went wrong'}) 
        }
        else
        {
            return res.status(200).json({success:true,result})  
        }
    })
})
           
app.post('/product',async (req,res)=>{
    const {customerName, modelName, rate, image, phoneNumber, adderss, userMail } = req.body;
  
    console.log(userMail);
    const Mobiles = new mobileData({customerName, modelName, rate, image, phoneNumber, adderss})
    try {
        await Mobiles.save()
        ordermail(customerName, modelName, rate, image, phoneNumber, adderss, userMail, 'your order is confirm')
        ordermail(customerName, modelName, rate, image, phoneNumber, adderss, 'sathish29702@gmail.com', 'New Order')
        return res.json({success:true,msg:'Your order added'})

    } catch (error) {
        return res.status(404).json({success:false,msg:'something is error please cheack'})
    }   
})
 
app.get('/order',(req,res)=>{
    mobileData.find({},(error,result)=>{
        if(error)
        {
            return res.send(404).json({success:false,msg:'Somrthing went wrong'}) 
        }
        else
        {
            return res.status(200).json({success:true,result})  
        }
    })  
})

app.delete('/cancleOrder/:id/:userMail',async (req,res)=>{
    const id = req.params.id;
    const email = req.params.userMail
    const findproduct = await mobileData.findById(id)
    ordermail(findproduct.customerName, findproduct.modelName, findproduct.rate, findproduct.image, findproduct.phoneNumber, findproduct.adderss, email, 'your order is canceled')
    ordermail(findproduct.customerName, findproduct.modelName, findproduct.rate, findproduct.image, findproduct.phoneNumber, findproduct.adderss, 'sathish29702@gmail.com', `order is canceled from ${findproduct.customerName}`)
    await mobileData.findByIdAndRemove(id).exec();
    return res.status(200).json({success:true,msg:'your order is canceled'})
})


//karthi

app.post('/absent',(req,res)=>{
    const data = req.body

    const studentName = data.map(person => person.name);
    console.log(studentName);

    const itemsHTML = studentName.map((item) => {
        return `<li>${item}</li>`;
      }).join('');

    let mailTransporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user: 'revanthk486@gmail.com',
            pass: `pipfrtpadikyruhg`
        }
    })  

    let mailDetails = {
                from: ' revanthk486@gmail.com',
                to: 'revanthk486@gmail.com',
                subject: 'Absent list',
                html: 
                `
                <html>
                    <body>
                    <h1>Absent List</h1>
                    <ul>
                        ${itemsHTML}
                    </ul>
                    </body>
                 </html>

                `
                    };

    mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) 
            {
            console.log('Error Occurs');
            } else {
                    console.log(`Email sent successfully`);
                    }
            });

            return res.json({success:true,msg:'Email sent successfully'})
    
})

//karthi


mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));
//mongoDB

function ordermail(customerName, modelName, rate, image, phoneNumber, adderss, userMail, book){
    if(userMail){

        let mailTransporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user: 'revanthk486@gmail.com',
                pass: `pipfrtpadikyruhg`
            }
        })  

        let mailDetails = {
                    from: ' revanthk486@gmail.com',
                    to: userMail,
                    subject: 'Smart mobiles',
                    html: `<h1>${book}</h1>
                           <p>Name:${customerName}</p>
                           <p>Model:${modelName}</p>
                           <p>Rate:${rate}</p>
                           <a href=${image}>image</a>
                           <p>Phone number:${phoneNumber}</p>
                           <P>adders:${adderss}</p>
                          `
                        };

        mailTransporter.sendMail(mailDetails, function(err, data) {
                if(err) 
                {
                console.log('Error Occurs');
                } else {
                        console.log(`Email sent successfully: ${book}`);
                        }
                });
      }

}
       
