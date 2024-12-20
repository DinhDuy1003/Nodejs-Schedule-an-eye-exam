import doctorService from "../services/doctorService"

let getTopDoctorHome = async (req,res) =>{
    let limit = req.query.limit;
    if(!limit) limit = 10 ;
    try {
        let response =await doctorService.getTopDoctorHome(+limit);
        
         return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message :'Error from server...'
        })
    }
}

let getAllDoctors = async (req,res) =>{
    try {
        let doctors= await doctorService.getAllDoctors();

        return res.status(200).json(doctors);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message :'Error from server...'
        })
    }
}
 
let postinforDoctor= async (req,res) =>{
    try {
        let response= await doctorService.saveDetaiInforDoctor(req.body);
        return res.status(200).json(response);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message :'Error from server...'
        })
    }
}
let getDetailDoctorById = async( req,res) =>{
    try {
        let infor= await doctorService.getDetailDoctorById(req.query.id);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message :'Error from server...'
        })
    }
}
let bulkCreateSchedule = async (req, res) =>{
    try {
        let infor= await doctorService.bulkCreateSchedule(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message :'Error from server...'
        })
    }
}

let getScheduleDyDate =async (req,res) =>{
    try {
        let infor = await doctorService.getScheduleDyDate(req.query.doctorId , req.query.date)
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message :'Error from server...'
        })
    }
}
let getExraInforDoctorByid =async (req, res)=>{
    try{
        let infor =await doctorService.getExraInforDoctorByid(req.query.doctorId);
        return res.status(200).json(infor)
    }catch(e){
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message :'Error from server...'
        }) 
    }
}

let getProfileDoctorByid =async (req, res)=>{
    try{
        let infor =await doctorService.getProfileDoctorByid(req.query.doctorId);
        return res.status(200).json(infor)
    }catch(e){
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message :'Error from server...'
        }) 
    }
}


let getListPatientForDoctor =async (req, res)=>{
    try{
        let infor =await doctorService.getListPatientForDoctor(req.query.doctorId,req.query.date);
        return res.status(200).json(infor)
    }catch(e){
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message :'Error from server...'
        }) 
    }
}


let sendRemedy =async (req, res)=>{
    try{
        let infor =await doctorService.sendRemedy(req.body);
        return res.status(200).json(infor)
    }catch(e){
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            message :'Error from server...'
        }) 
    }
}


module.exports = {
     getTopDoctorHome:getTopDoctorHome,
     getAllDoctors:getAllDoctors,
     postinforDoctor:postinforDoctor,
     getDetailDoctorById:getDetailDoctorById,
     bulkCreateSchedule:bulkCreateSchedule,
     getScheduleDyDate:getScheduleDyDate,
     getExraInforDoctorByid:getExraInforDoctorByid,
     getProfileDoctorByid:getProfileDoctorByid,
     getListPatientForDoctor:getListPatientForDoctor,
     sendRemedy:sendRemedy

}