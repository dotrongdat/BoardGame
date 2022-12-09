import Panel from "../../models/panel";
import statusCode from 'http-status-codes';

const create = async (req,res) =>{
    try {
        let {payload,user} = req;
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: 'Error'
        })
    }
}

export {
    create
}