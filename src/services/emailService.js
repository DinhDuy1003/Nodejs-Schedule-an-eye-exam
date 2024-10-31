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
        from: '"MedBooking." <dangdinhduy3939@gmail.com>', // sender address
        to: dataSend.reciverEmail, // list of receivers
        subject: "Thông Tin Đặt Lịch Khám Bệnh ✔", // Subject lin
        html: getBodyHTMLEmail(dataSend), // html body
      });
      
}

let getBodyHTMLEmail = (dataSend)=>{
  let result=''
  if(dataSend.language === 'vi'){
    result =`
    <h3> Xin Chào ${dataSend.patientName}!</h3>
    <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên MedBooking</p>
    <p>Thông tin đặt lịch khám bệnh:<p/>
    <div><b>Thời gian:  ${dataSend.time} :</b></div>
    <div><b>Bác Sĩ:  ${dataSend.doctorName} </b></div>

    <p>Nếu các thông tin trên là đúng sự thật , vui lòng Click vào đường
     link bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh<p/>
     <div>  
        <a href = ${dataSend.redirectLink} target="_blank">Click here</a>
     </div>
     <div>  
     Xin chân thành cảm ơn
    </div>
    `
  }
  if(dataSend.language === 'en'){
    result =`
    <h3> Hello ${dataSend.patientName}!</h3>
    <p>You received this email because you booked an online medical appointment on Duy</p>
    <p>Information for scheduling medical examination:<p/>
    <div><b>Time: ${dataSend.time} </b></div>
    <div><b>Doctor: ${dataSend.doctorName} </b></div>

    <p>If the above information is true, please click on the link
    link below to confirm and complete the medical appointment booking procedure<p/>
    <div>
    <a href = ${dataSend.redirectLink} target="_blank">Click here</a>
    </div>
    <div>
    Sincerely thank!
    </div>
    `
  }
  return result;

}



let getBodyHTMLEmailRemedy = (dataSend)=>{
  let result=''
  if(dataSend.language === 'vi'){
    result =`
    <h3> Xin Chào ${dataSend.patientName}!</h3>
    <p>Bạn nhận được email này vi đã đặt lịch khám bệnh online trên Duy</p>
    <p>Thông tin đơn thuộc/hóa đơn được gửi trong file đính kèm.<p/>
    <div>Xin chân thành càm ơn!</div>

    `
  }
  if(dataSend.language === 'en'){
    result =`
    <h3> Hello ${dataSend.patientName}!</h3>
    <p>You received this email because you booked an online medical appointment on Duy</p>
    <p>Invoice/order information is sent in the attached file.<p/>
    <div>Thank you very much!</div>
   

    `
  }
  return result;

}
let sendAttachment = async(dataSend) =>{
  return new Promise(async(resolve, reject)=>{
    try {
       let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port:  587,
        secure:false,
        auth:{
          user: process.env.EMAIL_APP,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
       });
       let info = await transporter.sendMail({
        from:'"MedBooking" <6051071021@st.utc2.edu.vn>',
        to:dataSend.email,
        subject:"Kết quả đạt lịch khám bệnh",
        html:getBodyHTMLEmailRemedy(dataSend),
        attachments:[{
          filename:`remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
          content:dataSend.imgBase64.split("base64,")[1],
          encoding:'base64'
        }]
       });
       console.log('check infor email:')
       console.log(info)
       resolve(true)
    } catch (e) {
      reject(e)
    }
  })
}

module.exports ={
    sendSimpleEmail:sendSimpleEmail,
    sendAttachment:sendAttachment
}