import db from "../models/index"
import bcrypt from'bcryptjs';
let handleUserLogin=(email,password)=>{
    return new Promise(async(resolve,reject)=>{   
        try {
            let userData={};
            let isExist=await checkUserEmail(email);
            if(isExist){
                
                let user= await db.User.findOne({
                    attributes:['email','roleId','password'],
                    where:{email:email},
                    raw: true
                });
                if(user){
                    // bcrypt.compareSync("not_bacon",hash);
                   let check=await bcrypt.compareSync(password,user.password);
                
                    if(check){
                        userData.errCode=0;
                        userData.errMessage='ok';
                        delete user.password;
                        userData.user=user;
                    }else{
                        userData.errCode=3;
                        userData.errMessage='Sai Mật Khẩu';
                      
                    }
                }else{
                    userData.errCode=2;
                     userData.errMessage='Không tìm thấy người dùng'
                }
               
            }else{
                userData.errCode=1;
                userData.errMessage='Email của bạn không tồn tại trên hệ thống.'
                 
            }
            resolve(userData); 
        } catch (e) {
            reject(e);
        }
    })
}

let checkUserEmail=(userEmail)=>{
return new Promise(async(resolve,reject)=>{
    try {
        let user= await db.User.findOne({
            attributes:['email','roleId'],
            where:{email:userEmail},
          
        })
        if(user){
            resolve(true)
        }else{
            resolve(false)
        }
    } catch (e) {
       reject(e);
    }
})
}
let getAllUsers=  (usersId)=>{
    return new Promise(async (resolve,reject)=>{
        try {
            let users='';
            if(usersId ==='ALL'){
                users=await db.User.findAll({
                    attributes:{
                        exclude:['password']
                    }
                })
            }
            if(usersId && usersId !=='ALL'){
                users= await db.User.findOne({
                    where:{id:usersId},
                    attributes:{
                        exclude:['password']
                    }
                })
            }
            resolve(users)
        } catch (e) {
            reject(e)
        }
    })
}
module.exports={
    handleUserLogin:handleUserLogin,
    getAllUsers:getAllUsers,
}