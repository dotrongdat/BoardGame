// const generateVerifyCode = (phoneNumber, password) => {
//     const milis = new Date().getTime();

// }
export const generateVerifyCode = ()=>  (new Date().getTime() % 1000000).toString().padStart(6,"0");