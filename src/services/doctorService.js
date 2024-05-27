
import { where } from "sequelize";
import db from "../models/index";
require('dotenv').config();
import _ from 'lodash';
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
let saveDetaiInforDoctor =(inputdata) =>{
    return new Promise(async(resolve, reject)=>{
        try {
            if(!inputdata.doctorId || !inputdata.contentHTML 
                // || !inputdata.contentMardown || !inputdata.action
                // || !inputdata.selectedPrice ||! inputdata.selectedPayment
                // || !inputdata.selectedProvince
                // || ! inputdata.nameClinic ||! inputdata.addressClinic
                // || !inputdata.note
            
            ){
                resolve({
                    errCode:1,
                    errMessage:'Missing parameter'
                })
            }else{
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
                    doctorInfor.provinceId =inputdata.selectedProvince;
                    doctorInfor.paymentId =inputdata.selectedPayment;
                    doctorInfor.nameClinic =inputdata.nameClinic;
                    doctorInfor.addressClinic =inputdata.addressClinic;
                    doctorInfor.note =inputdata.note;
                    await doctorInfor.save()
                }else{
                    await db.Doctor_Infor.create({
                        doctorId :inputdata.doctorId,
                        priceId :inputdata.selectedPrice,
                        provinceId :inputdata.selectedProvince,
                        paymentId :inputdata.selectedPayment,
                        nameClinic :inputdata.nameClinic,
                        addressClinic :inputdata.addressClinic,
                        note :inputdata.note
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
                    {model:db.Markdown , attributes:['description','contentHTML','contentMardown']},
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
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


module.exports = {
    getTopDoctorHome:getTopDoctorHome,
    getAllDoctors:getAllDoctors,
    saveDetaiInforDoctor:saveDetaiInforDoctor,
    getDetailDoctorById:getDetailDoctorById,
    bulkCreateSchedule:bulkCreateSchedule,
    getScheduleDyDate:getScheduleDyDate,
};
