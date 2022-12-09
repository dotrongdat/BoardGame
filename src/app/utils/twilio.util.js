import 'dotenv/config';
import twilio from "twilio";
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
//const messagingServiceSid = process.env.MESSAGE_SID;
const phoneFrom = process.env.TWILIO_PHONE_NUMBER;
const phoneTo = process.env.RECEIVE_PHONE_NUMBER;


const client = twilio(accountSid,authToken);
export const sendOTP = async ({phone,otp})=> await client.messages.create({from: phoneFrom, to: phoneTo || phone,body: `Mã OTP của bạn là: ${otp}`})