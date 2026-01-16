/**
 * Email Service using Nodemailer
 */
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        // Verify connection config
        await transporter.verify();

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Fintech Support" <${process.env.SMTP_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('YOUR EMAIL CONFIGURATION FAILED. PLEASE CHECK .ENV');
        console.error('Error details:', error);
        return false;
    }
};

export const sendWelcomeEmail = async (email, { companyName, adminEmail, password, loginUrl }) => {
    const subject = `Welcome to Your New Workspace - ${companyName}`;
    const text = `
    Welcome to ${companyName}!
    
    Your workspace has been successfully created.
    
    Here are your admin credentials:
    Login URL: ${loginUrl}
    Email: ${adminEmail}
    Password: ${password}
    
    Please change your password after logging in.
    
    Best regards,
    The Team
    `;

    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333333; text-align: center;">Welcome to ${companyName}!</h2>
            <p style="color: #666666; font-size: 16px;">We are excited to have you on board. Your workspace has been successfully created.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0;">
                <h3 style="color: #333333; margin-top: 0;">Admin Credentials</h3>
                <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #4F46E5;">${loginUrl}</a></p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${adminEmail}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> <code style="background-color: #e0e0e0; padding: 2px 5px; border-radius: 4px;">${password}</code></p>
            </div>
            
            <p style="color: #666666; font-size: 14px;">For security reasons, please <strong>change your password</strong> immediately after logging in.</p>
            
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
            <p style="color: #999999; font-size: 12px; text-align: center;"> Best regards,<br>The Team</p>
        </div>
    </div>
    `;

    return sendEmail({
        to: email,
        subject,
        text,
        html
    });
};
