import { json } from "body-parser";
import userService from "../services/userService";

let handleLogin= async (req,res)=>{

    let email= req.body.email;
    let password= req.body.password;
    if(!email||!password){
        return res.status(500).json({
            errCode:1,
            message:'Thiếu Thông Tin'
        })
    }
    let userData= await userService.handleUserLogin(email,password);

    return res.status(200).json({
        errCode:userData.errCode,
        message:userData.errMessage,
        user:userData.user ? userData.user:{}
        
    })

}
let handleGetAllUsers=async(req,res)=>{
    let id=req.query.id;
    if(!id){
        return res.status(200),json({
            errCode:1,
            errMessage:'Thiếu Tham Số',
            users:[]
        })
    }
    let users =await userService.getAllUsers(id)
    return res.status(200).json({
        errCode:0,
        errMessage:'OK',
        users
    })
}
let handleCreateNewUser=async(req,res)=>{
    let message=await userService.createNewUser(req.body);
    return res.status(200).json(message);
}

let handleDeleteUser =async(req,res)=>{
    if(!req.body.id){
        return res.status(200).json({
            errCode:1,
            errMessage:"Thiếu Tham Số "
        })
    }
    let message=await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
}

let handleEditUser=async (req,res)=>{
    let data =req.body;
    let message=await userService.updateUserData(data);
    return res.status(200).json(message)
}

let getAllCode= async(req, res)=>{
    try {
        let data =await userService.getAllCodeService(req.query.type);
        console.log(data);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode:-1,
            errMessage:"Lỗi Server"
        })
    }
}


module.exports={
    handleLogin:handleLogin,
    handleGetAllUsers:handleGetAllUsers,
    handleCreateNewUser:handleCreateNewUser,
    handleDeleteUser:handleDeleteUser,
    handleEditUser:handleEditUser,
    getAllCode:getAllCode,
}