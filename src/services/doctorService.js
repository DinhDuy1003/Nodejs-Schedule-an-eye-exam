
import { where } from "sequelize";
import db from "../models/index";
require('dotenv').config();
import _ from 'lodash';
import emailService from '../services/emailService'
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = async () => {
    try {
        let users = await db.User.findAll({
            where: { roleId: 'R2' },
            order: [['createdAt', 'DESC']],
            attributes: {
                exclude: ['password']
            },
            // include: [
            //     { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
            //     { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
            //     // {  attributes: ['valueEn', 'valueVi'] },
            //     // {  attributes: ['valueEn', 'valueVi'] }
            // ],
            raw: true,
            nest: true
        });

        if (users.length === 0) {
            return {
                errCode: 404,
                message: 'Không tìm thấy bác sĩ phù hợp.'
            };
        }

        return {
            errCode: 0,
            data: users
        };
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        return {
            errCode: 500,
            message: 'Đã xảy ra lỗi khi xử lý yêu cầu.'
        };
    }
};

let getAllDoctors = () =>{
    return new Promise(async(resolve, reject)=>{
        try {
            let doctor = await db.User.findAll({
                where:{roleId:'R2'},
                attributes: {
                    exclude: ['password','image']
                },
                
            })
            
            resolve({
                errCode:0,
                data:doctor
            })
        } catch (e) {
            reject(e)
        }
    })
}
let checkRquiredFields = (inputData)=>{
    let arrFields=[
        'doctorId','contentHTML','contentMardown','action',
        'selectedPrice','selectedPayment','selectProvince','nameClinic',
        'addressClinic','note','specialtyId'
    ]
    let isValid = true;
    let element = '';
    for(let i=0; i<arrFields.length ; i++){
        if(!inputData[arrFields[i]]){
            isValid= false;
            element= arrFields[i]
            break;
        }
    }

    return{
        isValid:isValid,
        element:element
    }
}
let saveDetaiInforDoctor =(inputdata) =>{
    return new Promise(async(resolve, reject)=>{
        try {
                let checkObj = checkRquiredFields(inputdata);
                if(checkObj.isValid === false){
                resolve({
                    errCode:1,
                    errMessage:`Missing parameter: ${checkObj.element}`
                })
            }
            else{
                if(inputdata.action === 'CREATE'){
                    await db.Markdown.create({
                        contentHTML:inputdata.contentHTML,
                        contentMardown:inputdata.contentMardown,
                        description:inputdata.description,
                        doctorId:inputdata.doctorId,
                    })
                }else if (inputdata.action ==='EDIT'){
                    let doctorMarkdown = await db.Markdown.findOne({
                        where:{doctorId :inputdata.doctorId},
                        raw: false
                    })
                    if(doctorMarkdown){
                        doctorMarkdown.contentHTML=inputdata.contentHTML,
                        doctorMarkdown.contentMardown=inputdata.contentMardown,
                        doctorMarkdown.description=inputdata.description,
                        doctorMarkdown.updateAt =new Date(),
                        await doctorMarkdown.save()
                    }
                }

                ////////// doctor infor
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where:{
                        doctorId: inputdata.doctorId,
                    },
                    raw:false
                })
                if(doctorInfor){
                    doctorInfor.doctorId =inputdata.doctorId;
                    doctorInfor.priceId =inputdata.selectedPrice;
                    doctorInfor.provinceId =inputdata.selectProvince;
                    doctorInfor.paymentId =inputdata.selectedPayment;
                    doctorInfor.nameClinic =inputdata.nameClinic;
                    doctorInfor.addressClinic =inputdata.addressClinic;
                    doctorInfor.note =inputdata.note;
                    doctorInfor.specialtyId=inputdata.specialtyId;
                    doctorInfor.clinicId=inputdata.clinicId;

                    await doctorInfor.save()
                }else{
                    await db.Doctor_Infor.create({
                        doctorId :inputdata.doctorId,
                        priceId :inputdata.selectedPrice,
                        provinceId :inputdata.selectProvince,
                        paymentId :inputdata.selectedPayment,
                        nameClinic :inputdata.nameClinic,
                        addressClinic :inputdata.addressClinic,
                        note :inputdata.note,
                        specialtyId:inputdata.specialtyId,
                        clinicId:inputdata.clinicId,
                    })
                }
              
                resolve({
                    errCode:0,
                    errMessage:'save infor doctor succeed'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
let getDetailDoctorById = (inputId) =>{
    return new Promise  (async(resolve, reject)=>{
        try {
            if(!inputId){
                resolve({
                    errCode:1,
                    errMessage:'Missing required parameter'
                })
            }else{
                let data= await db.User.findOne({
                    where:{
                        id:inputId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                    {   model:db.Markdown , 
                        attributes:['description','contentHTML','contentMardown']
                    },
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },

                    {model :db.Doctor_Infor, attributes:{exclude:['id','doctorId']},
                    include:[
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                        ]               
                    },
                    ],
                    raw: false,
                    nest: true
                })
                resolve({
                    errCode:0,
                    data:data
                })
                if(data && data.image){
                    data.image = new Buffer (data.image , 'base64').toString('binary');
                }
                if(!data) data = {};
            }
        } catch (e) {
           reject(e);
        }
    })
}
let bulkCreateSchedule =  (data) =>{
    return new Promise(async(resolve,reject)=>{
        try {
            if(!data.arrSchedule || !data.doctorId || !data.formatedDate){
                resolve({
                    errCode:1,
                    errMessage:'Missing required param !'
                })
            }else{
                let schedule = data.arrSchedule;
                if(schedule && schedule .length >0){
                    schedule = schedule.map(item =>{
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }
                
                let existing = await db.Schedule.findAll(
                    {
                        where :{ doctorId :data.doctorId,  date: data.formatedDate},
                        attributes :['timeType','date','doctorId','maxNumber'],
                        raw :true
                    }
                );

                // if(existing && existing.length > 0){
                //     existing = existing.map(item =>{
                //         item.date= new Date(item.date).getTime();
                //         return item;
                //     })
                // }

                let toCreate = _.differenceWith(schedule, existing,(a,b)=>{
                    return a.timeType === b.timeType && +a.date === +b.date;
                });
                if(toCreate && toCreate.length > 0){
                   await db.Schedule.bulkCreate(toCreate);
                }
            
                resolve({
                    errCode:0,
                    errMessage:'ok'
                })
            }
        } catch (e) {
            reject(e);
        }

    })
}


let getScheduleDyDate= (doctorId,date) =>{
    return new Promise (async (resolve ,reject)=>{
    try {
        if (!doctorId || !date){
            resolve({
                errCode :1,
                errMessage:'Missing required param !'
            })
        }
        else{
            let dataSchedule= await db.Schedule.findAll({
                where:{
                    doctorId:doctorId,
                    date:date
                },
                include:[
                    {model: db.Allcode , as:'timeTypeData' , attributes: ['valueEn','valueVi']},

                    {model: db.User , as:'doctorData' , attributes: ['firstName','lastName']},
                ],
                raw: false,
                nest: true
            })
            if(!dataSchedule) dataSchedule =[];
            resolve({
                errCode:0,
                data:dataSchedule
            })
        }
    } catch (error) {
       reject(e);
    }
    })
}
let getExraInforDoctorByid= (idInput) =>{
    return new Promise (async (resolve ,reject)=>{
    try {
        if (!idInput){
            resolve({
                errCode :1,
                errMessage:'Missing required param !'
            })
        }
        else{
            let data= await db.Doctor_Infor.findOne({
                where:{
                    doctorId:idInput,
                },
                attributes:{
                    exclude:['id','doctorId']
                },
                include:[
                    {model: db.Allcode , as:'priceTypeData' , attributes: ['valueEn','valueVi']},
                    {model: db.Allcode , as:'provinceTypeData' , attributes: ['valueEn','valueVi']},
                    {model: db.Allcode , as:'paymentTypeData' , attributes: ['valueEn','valueVi']},


                ],
                raw: false,
                nest: true
            })
            if(!data) data ={};
            resolve({
                errCode:0,
                data:data
            })
        }
    } catch (error) {
       reject(e);
    }
    })
}
let getProfileDoctorByid = (inputId) =>{
    return new Promise  (async(resolve, reject)=>{
        try {
            if(!inputId){
                resolve({
                    errCode:1,
                    errMessage:'Missing required parameter'
                })
            }else{
                let data= await db.User.findOne({
                    where:{
                        id:inputId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                    {   model:db.Markdown , 
                        attributes:['description','contentHTML','contentMardown']
                    },
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },

                    {model :db.Doctor_Infor, 
                    attributes:{exclude:['id','doctorId']},
                    include:[
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi'] },
                        ]               
                    },
                    ],
                    raw: false,
                    nest: true
                })
              
                if(data && data.image){
                    data.image = new Buffer (data.image , 'base64').toString('binary');
                }
                if(!data) data = {};
                resolve({
                    errCode:0,
                    data:data
                })
            }
        } catch (e) {
           reject(e);
        }
    })
}

let getListPatientForDoctor= (doctorId,date) =>{
    return new Promise (async (resolve ,reject)=>{
    try {
        if (!doctorId	 || !date){
            resolve({
                errCode :1,
                errMessage:'Missing required parameters !'
            })
        }
        else{
            let data= await db.Booking.findAll({
                where:{
                    statusId:'S2',
                    doctorId:doctorId,
                    date:date
                },
                include:[
                    {
                        model: db.User , as:'patientData' ,
                         attributes: ['email','firstName','address','gender'],
                        //  include:[
                        //     {model: db.Allcode , as:'genderData' ,
                        //         attributes: ['valueEN','valueVI']
                        //     },
                        //  ]
                    },
                    {model: db.Allcode , as:'timeTypeDataPatient' ,
                        attributes: ['valueEN','valueVI']
                    },
                ],
                raw: false,
                nest: true
            })
            resolve({
                errCode:0,
                data:data
            })
        }
    } catch (error) {
       reject(e);
    }
    })
}


let sendRemedy= (data) =>{
    return new Promise (async (resolve ,reject)=>{
    try {
        if (!data.email	 ||!data.doctorId ||!data.patientId ||!data.timeType
            ||!data.imgBase64){
            resolve({
                errCode :1,
                errMessage:'Missing required parameters !'
            })
        }
        else{
            let appoinment = await db.Booking.findOne({
                where:{
                    doctorId: data.doctorId,
                    patientId :data.patientId,
                    timeType :data.timeType,
                    statusId:'S2'
                },
                raw: false,
            })
            if(appoinment){
                appoinment.statusId='S3';
                await appoinment.save()
            }
         
            await emailService.sendAttachment(data);

            resolve({
                errCode:0,
                errMessage:'ok'
            })
        }
    } catch (e) {
       reject(e);
    }
    })
}

module.exports = {
    getTopDoctorHome:getTopDoctorHome,
    getAllDoctors:getAllDoctors,
    saveDetaiInforDoctor:saveDetaiInforDoctor,
    getDetailDoctorById:getDetailDoctorById,
    bulkCreateSchedule:bulkCreateSchedule,
    getScheduleDyDate:getScheduleDyDate,
    getExraInforDoctorByid:getExraInforDoctorByid,
    getProfileDoctorByid:getProfileDoctorByid,
    getListPatientForDoctor:getListPatientForDoctor,
    sendRemedy:sendRemedy
};
