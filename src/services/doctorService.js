import db from "../models/index";

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
            if(!inputdata.doctorId || !inputdata.contentHTML || !inputdata.contentMardown){
                resolve({
                    errCode:1,
                    errMessage:'Missing parameter'
                })
            }else{
                await db.Markdown.create({
                    contentHTML:inputdata.contentHTML,
                    contentMardown:inputdata.contentMardown,
                    description:inputdata.description,
                    doctorId:inputdata.doctorId,
                })
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
module.exports = {
    getTopDoctorHome:getTopDoctorHome,
    getAllDoctors:getAllDoctors,
    saveDetaiInforDoctor:saveDetaiInforDoctor,
};
