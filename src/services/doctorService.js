import db from "../models/index";

const getTopDoctorHome = async () => {
    try {
        let users = await db.User.findAll({
            where: { roleId: 'R2' },
            order: [['createdAt', 'DESC']],
            attributes: {
                exclude: ['password']
            },
            // include: [
            //     // { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
            //     // { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
            //     {  attributes: ['valueEn', 'valueVi'] },
            //     {  attributes: ['valueEn', 'valueVi'] }
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

module.exports = {
    getTopDoctorHome
};
