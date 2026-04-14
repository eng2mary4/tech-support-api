const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
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

// إعداد Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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
    await resend.emails.send({
      from: 'support@ishtar.edu.iq',
      to: 'it@ishtar.edu.iq',
      reply_to: senderEmail,
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
    await resend.emails.send({
      from: 'support@ishtar.edu.iq',
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