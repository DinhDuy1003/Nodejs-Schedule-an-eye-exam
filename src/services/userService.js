import db from "../models/index"
import bcrypt from'bcryptjs';

const salt= bcrypt.genSaltSync(10);

let hashUserPassword  =(password)=>{
    return new Promise(async (resolve ,reject)=>{
        try {
            let hashPassword = await bcrypt.hashSync(password,salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}


let handleUserLogin=(email,password)=>{
    return new Promise(async(resolve,reject)=>{   
        try {
            let userData={};
            let isExist=await checkUserEmail(email);
            if(isExist){
                
                let user= await db.User.findOne({
                    attributes:['id','email','roleId','password','firstName','lastName'],
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
let createNewUser=(data)=>{
    return new Promise(async(resolve,reject)=>{
       try {
        let check = await checkUserEmail(data.email);
        if(check === true){
            resolve({
                errCode:1,
            errMessage:'email của bạn đã được sử dụng, vui lòng thử email khác',
            })
        }
        else{
        let hashPasswordFromBcrypt= await hashUserPassword(data.password);
        await db.User.create({
            email:data.email,
            password:hashPasswordFromBcrypt,
            firstName:data.firstName,
            lastName:data.lastName,
            address: data.address,
            phonenumber:data.phonenumber,
            gender:data.gender,
            roleId:data.roleId,
            positionId:data.positionId,
            image: data.avatar
        })
        resolve({
            errCode:0,
            message:'ok'
        })

        }
       } catch (e) {
        reject(e);
       }
    })
}

let deleteUser=(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let user = await db.User.findOne({    
            where: {id: userId}
        })
        if(!user){
            resolve({
                errCode:2,
                errMessage:'Người dùng không tồn tại'
            })
        }
        await db.User.destroy({
            where:{id:userId}
        })
        resolve({
            errCode:0,
            message:'Đã Xóa'
        })
    })
}
let updateUserData=(data)=>{
    return new Promise(async(resolve,reject)=>{
         try{
            if(!data.id || !data.roleId || !data.positionId ){
                resolve({
                    errCode:2,
                    errMessage:'Thiếu tham số bắt buộc'
                })
            }
            let user= await db.User.findOne({
                where:{id: data.id},
                raw:false
            })
            if(user){
                user.firstName=data.firstName;
                user.lastName=data.lastName;
                user.address=data.address;
                user.roleId=data.roleId;
                user.positionId=data.positionId;
                user.gender=data.gender;    
                user.phonenumber = data.phonenumber;
                if(data.avatar){
                    user.image = data.avatar;
                }

                await user.save();
                resolve({
                    errCode:0,
                    errMessage:'Cập nhật dữ liệu Người dùng thành công'
                })
            }
            else{
                resolve({
                    errCode:0,
                    errMessage:'Cập nhật dữ liệu Người dùng không thành công'
                })
            }
         }catch(e){
            reject(e);
         }
        
    })
}
let getAllCodeService=(typeInput)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            if(!typeInput){
                resolve({
                    errCode:1,
                    errMessage:'Missing required parameters'
                })
            }else{
                let res ={}
                let allcode= await db.Allcode.findAll({
                    where:{type:typeInput}
                });
                res.errCode=0;
                res.data=allcode;
                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports={
    handleUserLogin:handleUserLogin,
    getAllUsers:getAllUsers,
    deleteUser:deleteUser,
    updateUserData:updateUserData,
    createNewUser:createNewUser,
    getAllCodeService:getAllCodeService,
}