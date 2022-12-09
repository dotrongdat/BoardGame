//import fs, { read } from 'fs';
import {readFile,writeFile} from '../../utils/image.util.js';
import {storagePath} from '../../../constants/image.constant.js';

const get =async (req, res) => {
    let path = req.params.path
    path = storagePath.concat(path);
    try {
        const data= readFile(path);
        res.set('Content-Type', 'image/png')
        res.set('Content-Type', 'image/jpg')
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send();
    }
    // fs.readFile(path, (err, data) => {
    //     if (err) res.status(400).send();
    //     else{
    //         // <img src="data:image/png;base64,<%= image %>" />
    //     res.set('Content-Type', 'image/png')
    //     res.set('Content-Type', 'image/jpg')
    //     res.status(200).send(data)
    //     //res.send('<img src="data:image/png;base64,'+data.toString('base64')+'"/>')
    //     }        
    // })
}

export default {
    get
}