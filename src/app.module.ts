import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: process.env.HOST_EMAIL,
        port: Number(process.env.PORT_EMAIL),
        requireTLS: true,
        secure: false,
        auth: {
          user: process.env.LOGIN_EMAIL,
          pass: process.env.PASSWORD_EMAIL,
        },
        tls: {
          ciphers: 'SSLv3',
        },
      },
      
      template: {
        dir: join(__dirname, 'mailer'),
        adapter: new HandlebarsAdapter(),
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
