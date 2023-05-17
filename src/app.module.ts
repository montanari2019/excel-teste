import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from "@nestjs/schedule"
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host:'smtp.gmail.com',
        ignoreTLS: true,
        port: 465,
        secure: true,
        auth: {
          user: 'ikaro.montanari31@gmail.com',
          pass: '#Mm992023'
        }
      }
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
