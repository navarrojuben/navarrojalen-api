// utils/sendWebstoreOrderEmail.js
const nodemailer = require('nodemailer');

const sendWebstoreOrderEmail = async (order) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can also use Outlook, SMTP config, etc.
    auth: {
      user: process.env.NOTIFY_EMAIL_USER,
      pass: process.env.NOTIFY_EMAIL_PASS,
    },
  });

  const serviceDetails = order.items.map(item => `
    - ${item.title} | ₱${item.price.toFixed(2)} (${item.category})
  `).join('\n');

  const mailOptions = {
    from: `"NJ Webstore" <${process.env.NOTIFY_EMAIL_USER}>`,
    to: process.env.NOTIFY_EMAIL_RECEIVER, // Your email
    subject: `🛒 New Webstore Order: ${order._id}`,
    text: `
A new order has been placed!

🧑 User:  ${order.user?.username} 
🧑 Email: ${order.user?.email}
📝 Note:  ${order.note || '—'}
💳 Payment: ${order.paymentMethod || 'N/A'}
💰 Total: ₱${order.total.toFixed(2)}
📦 Services:
${serviceDetails}

📅 Placed at: ${new Date(order.createdAt).toLocaleString()}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Order email sent successfully');
  } catch (err) {
    console.error('❌ Failed to send order email:', err);
  }
};

module.exports = sendWebstoreOrderEmail;
