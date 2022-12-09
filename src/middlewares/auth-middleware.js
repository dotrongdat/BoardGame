import User from '../app/models/user.js';
import jwt from '../app/utils/jwt.util.js';
import statusCode from 'http-status-codes';
import _ from 'lodash';

const getUser = async (_id) =>{
    try {
        const user = await User.findById(_id).lean();
        delete user['password'];
        return user;
    } catch (error) {
        throw new Error(error);
    }    
}

export default (rolesAllow = []) => {
    return async (req, res, next) => {
        try {
            const {token} = req.headers;
            if (token) {
                try {
                    const decode = jwt.verify(token);
                    const user = await getUser(decode._id);                    
                    if (_.isEmpty(rolesAllow) || rolesAllow.includes(user.role)) {
                        req.payload = {};
                        req.user = user;
                        next();
                    } else return res.status(statusCode.FORBIDDEN).send();
                } catch (e) {
                    switch (e.name) {
                        case jwt.JsonWebTokenError.name:
                            return res.status(statusCode.UNAUTHORIZED).send();
                        case jwt.TokenExpiredError.name: {
                            return res.status(statusCode.UNAUTHORIZED).json({message: 'access-token expired'});
                        }
                        default:
                            return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
                    }
                }
            } else {
                return res.status(statusCode.UNAUTHORIZED).send();
            }
        } catch (error) {
            return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
        }

    }
}