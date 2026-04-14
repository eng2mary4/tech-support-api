const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// render
app.get("/", (req, res) => {
  res.json({
    message: "Server is running 🚀",
    status: "OK"
  });
});

// إعداد Nodemailer مع Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// التحقق من الاتصال عند تشغيل السيرفر
transporter.verify((error) => {
  if (error) {
    console.log('❌ خطأ في الاتصال:', error.message);
  } else {
    console.log('✅ السيرفر جاهز لإرسال الإيميلات');
  }
});

// المسار الرئيسي لإرسال الإيميل
app.post('/send-email', async (req, res) => {
  const { senderEmail, subject, message } = req.body;

  // التحقق من البيانات
  if (!senderEmail || !subject || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'يرجى ملء جميع الحقول' 
    });
  }

  try {
    // إيميل يوصل لك (أنتِ)
    await transporter.sendMail({
      from: `"الدعم التقني - معهد عشتار" <${process.env.SMTP_USER}>`,
      to: 'it@ishtar.edu.iq',
      replyTo: senderEmail,
      subject: `[Support] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 10px;">
            🛠️ طلب دعم تقني جديد
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold; width: 30%;">📧 إيميل المرسل:</td>
              <td style="padding: 10px;">${senderEmail}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">📌 الموضوع:</td>
              <td style="padding: 10px;">${subject}</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="padding: 10px; font-weight: bold; vertical-align: top;">💬 الرسالة:</td>
              <td style="padding: 10px;">${message}</td>
            </tr>
          </table>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            تم الإرسال من نظام الدعم التقني - معهد عشتار
          </p>
        </div>
      `,
    });

    // رد تلقائي للمستخدم
    await transporter.sendMail({
      from: `"الدعم التقني - معهد عشتار" <${process.env.SMTP_USER}>`,
      to: senderEmail,
      subject: `تم استلام طلبك: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; direction: rtl;">
          <h2 style="color: #1a56db;">✅ تم استلام طلبك بنجاح</h2>
          <p>مرحباً،</p>
          <p>شكراً لتواصلك مع فريق الدعم التقني في معهد عشتار.</p>
          <p>لقد استلمنا طلبك بخصوص: <strong>${subject}</strong></p>
          <p>سنقوم بالرد عليك في أقرب وقت ممكن.</p>
          <hr style="border: 1px solid #e0e0e0;" />
          <p style="color: #666; font-size: 12px;">
            فريق الدعم التقني - معهد عشتار<br/>
            it@ishtar.edu.iq
          </p>
        </div>
      `,
    });

    res.json({ success: true, message: 'تم إرسال الرسالة بنجاح! ✅' });

  } catch (error) {
    console.error('خطأ في الإرسال:', error);
    res.status(500).json({ 
      success: false, 
      message: 'فشل الإرسال، يرجى المحاولة لاحقاً' 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
});