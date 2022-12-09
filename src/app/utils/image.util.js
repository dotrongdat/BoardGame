import fs from 'fs';

export const readFile= (path)=>{
    return fs.readFileSync(path);
};
export const writeFileSync=(path,name,data)=>new Promise((resolve,reject)=>{
        fs.writeFile(path+'/'+name,data,(err)=>{
            if(err) reject(err);
            resolve();
        });        
})   
export const writeFile=(path,name,data)=>{
    try {
        fs.writeFileSync(path+'/'+name,data)
    } catch (error) {
        throw new Error(error)
    }        
}
    
//export const deleteFile