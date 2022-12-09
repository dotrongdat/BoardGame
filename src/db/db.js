import mongoose from 'mongoose'
import {config} from '../../configs/config.js'

let db = {};
export default function getConnection() {
        mongoose.connect(config.sqlurl)
        .then(rs=>{
            db=rs;
            console.log('Connect successfully')
        })
        .catch(err=> console.log(err))
}
export {db};
// const sessionConnection = async () => {
//     //const session = await mongoose.startSession();
//     const db = await mongoose.createConnection(config.sqlurl).asPromise();
//     const session = await db.startSession();
// }