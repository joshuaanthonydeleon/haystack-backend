import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // In a real application, you would integrate with an email service like SendGrid, AWS SES, etc.
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    console.log(`📧 Email verification for ${email}:`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Token: ${token}`);
    
    // TODO: Replace with actual email sending logic
    // Example with SendGrid:
    // await this.sendGrid.send({
    //   to: email,
    //   from: 'noreply@yourapp.com',
    //   subject: 'Verify your email address',
    //   html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
    // });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    console.log(`📧 Password reset for ${email}:`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token: ${token}`);
    
    // TODO: Replace with actual email sending logic
    // Example with SendGrid:
    // await this.sendGrid.send({
    //   to: email,
    //   from: 'noreply@yourapp.com',
    //   subject: 'Reset your password',
    //   html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    // });
  }
}
