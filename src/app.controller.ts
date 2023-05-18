import { Controller, Get, NotFoundException, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('email')
  async enviarEmail(){
     return await this.appService.SendEmail()
  }

  @Post('transponder')
  @UseInterceptors(FileInterceptor('file', {
    dest: './uploads',
    limits: {
      fileSize: 1024 * 1024 * 20
    }
  }))
  async transponder(@UploadedFile() file: Express.Multer.File){
   return await this.appService.transposeExcel(file.path)
  }

  
  @Post('converter')
  @UseInterceptors(FileInterceptor('file', {
    dest: './uploads',
    limits: {
      fileSize: 1024 * 1024 * 20
    }
  }))
  async converterExelToJson(@UploadedFile() file: Express.Multer.File){
    console.log(file)
    console.log("Recendo arquivo")
    const fileType = file.originalname.split('.')[1]
    console.log("Tipo do arquivo: ", fileType)
    if(file === undefined) throw new NotFoundException('No file');

    else{

      if(fileType === 'xlsx'){
        const json = await this.appService.convertExcelToJson(file)
        return json
      }else if(fileType === 'csv'){
        
        const json = await this.appService.convertCSVtoJson(file.path)
        return json
      }else{
        throw new NotFoundException('Tipo de arquivo inválido')
      }
      
      
    }
    
  }
}
