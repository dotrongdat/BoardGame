import nodemailer from 'nodemailer';
const HOST = process.env.MAIL_HOST;
const PORT = process.env.MAIL_PORT;
const USERNAME = process.env.MAILTRAP_USERNAME;
const PASSWORD = process.env.MAILTRAP_PASSWORD;
const EMAIL = process.env.EMAIL;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    // host: HOST,
    // port: PORT,
    auth: {
        user: USERNAME,
        pass: PASSWORD
    }
});

export const sendMail = ({to, subject, html}) => new Promise((resolve,reject)=>{
                                                    transporter.sendMail({from: EMAIL,to, subject, html},(err,info)=>{
                                                    if(err)  reject(err);
                                                    resolve(info);
                                                })
                                            }) 
