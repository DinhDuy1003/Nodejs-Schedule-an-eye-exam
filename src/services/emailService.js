require('dotenv').config();
import nodemailer from 'nodemailer'
let sendSimpleEmail = async (dataSend) =>{

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: process.env.EMAIL_APP,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });

      let info = await transporter.sendMail({
        from: '"Duy 👻" <dangdinhduy3939@gmail.com>', // sender address
        to: dataSend.reciverEmail, // list of receivers
        subject: "Thông Tin Đặt Lịch Khám Bệnh ✔", // Subject lin
        html: `
        <h3> Xin Chào ${dataSend.patientName}!</h3>
        <p>Bạn nhận được email này vi đã đặt lịch khám bệnh online trên Duy</p>
        <p>Thông tin đặt lịch khám bệnh:<p/>
        <div><b>Thời gian ${dataSend.time} :</b></div>
        <div><b>Bác Sĩ ${dataSend.doctorName} :</b></div>

        <p>Nếu các thông tin trên là đúng sự thật , vui lòng Click vào đường
         link bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh<p/>
         <div>  
            <a href= ${dataSend.redirectLink} target="_blank">Click here</a>
         </div>
         <div>  
         Xin chân thành cảm ơn
        </div>
        `, // html body
      });
}



module.exports ={
    sendSimpleEmail:sendSimpleEmail
}