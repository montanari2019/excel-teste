import { Controller, Get, NotFoundException, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('converter')
  @UseInterceptors(FileInterceptor('file', {
    dest: './uploads',
    limits: {
      fileSize: 1024 * 1024 * 10
    }
  }))
  async converterExelToJson(@UploadedFile() file: Express.Multer.File){
    console.log(file)
    console.log("Recendo arquivo")
    if(file === undefined) throw new NotFoundException('No file');

    else{
      const json = await this.appService.convertExcelToJson(file)
      console.log("Arquivo convertido")
      fs.unlink(file.path, err => {
          if (err) {
            console.error(err);
          } else {
            console.log(`${file.filename} deletado com sucesso.`);
          }
        });
      return json
    }
    
  }
}
