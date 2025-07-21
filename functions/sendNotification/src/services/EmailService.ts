
import sgMail from '@sendgrid/mail';
import config from '../config/config';

export class EmailService {
    constructor(sgapikey: string) {
        sgMail.setApiKey(sgapikey);
    }

    async send() {
        // Get email details from the event object or use defaults/environment variables
        const toEmail: string = config.tomailid; // Recipient email address
        const fromEmail: string = config.frommailid; // Verified Sender email address
        const subject: string = 'Notification: Sentiment Analysis';
        //const textBody: string = 'This is the plain text content.';
        const htmlBody: string = '<html>' +
            '<body style="font-family: sans-serif; text-align: center; margin: 20px;">' +
            '<h2 style="color: #4CAF50;">Analysis Complete!</h2>' +
            '<p>Hi, Sentiment analysis has been successfully processed. Go ahead and check the portal for the results</p>' +
            '<p>Thank you, SentimentScope Team.</p>' +
            '</body>' +
            '</html>';

        if (!fromEmail || !toEmail) {
            console.error("Missing required information: API Key, From Email, or To Email.");
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing SendGrid API Key, sender email, or recipient email.' }),
            };
        }

        const msg: sgMail.MailDataRequired = {
            to: toEmail,
            from: fromEmail, // Use your verified sender email here
            subject: subject,
            html: htmlBody
        };

        try {
            await sgMail.send(msg);
            console.log('Email sent successfully using @sendgrid/mail');
        } catch (error: any) { // Catching as 'any' for now, you can refine error type if needed
            console.error('Error sending email:', error.response ? error.response.body : error);
            return {
                statusCode: error.code || 500,
                body: JSON.stringify({ message: 'Failed to send email', error: error.message }),
            };
        }
    }
}
