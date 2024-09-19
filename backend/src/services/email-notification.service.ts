import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailNotificationService {
  private emailQueue: string[] = [];
  private isProcessing = false;

  async informStructureDeletion(userEmail: string): Promise<void> {
    const secondsToWait = Math.trunc(Math.random() * 7) + 1;
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log(userEmail, 'informed!');
        resolve();
      }, secondsToWait * 1000);
    });
  }

  async queueEmail(userEmail: string): Promise<void> {
    this.emailQueue.push(userEmail);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;
    while (this.emailQueue.length > 0) {
      const batch = this.emailQueue.splice(0, 3);
      await Promise.all(batch.map(email => this.informStructureDeletion(email)));
    }
    this.isProcessing = false;
  }

  async sendEmailNotification(to: string, subject: string, body: string): Promise<void> {
    // Implementation of sending email
    console.log('Sending email to', to, 'with subject', subject, 'and body', body);
  }
}