import {validExtensionFile} from '../../constants/image.constant.js';
export const fileFilter={
    filter:(req,file,cb)=>{
        const ext=path.extname(file.originalname);
        return cb(null,validExtensionFile.includes(ext));
    }
}