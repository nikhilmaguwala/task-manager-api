const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name) => {
    sgMail.send({
        to:email,
        from:'nikhilmaguwala@gmail.com',
        subject:'Thanks for joining',
        text:`Welcome to the Task Manager App , ${name} . Let me know how you get along with the app`
    })
}

const sendCancelationEmail = (email,name) => {
    sgMail.send({
        to:email,
        from:'nikhilmaguwala@gmail.com',
        subject:'Sorry to see you go',
        text:`Good Bye , ${name} . I hope to see you back sometime soon`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}

