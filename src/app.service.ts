import { Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { Cron } from '@nestjs/schedule';
import { type } from 'os';

@Injectable()
export class AppService {
  constructor(private readonly mailerService: MailerService) {}

  getHello() {
    return { message: 'Olá' };
  }

  SendEmail() {
    console.log('Testando email');
    const atualDate = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'America/Porto_Velho',
    }).format(new Date());
    this.mailerService
      .sendMail({
        to: 'ikaro.bruno@sicoobcredisul.com',
        from: 'ikaro.montanari31@gmail.com',
        subject: `Teste Schedule ${atualDate}`,
        html: '<h1>Olá teste de mensagem</h1>',
      })
      .catch((error) => {
        console.log(`Falha ao enviar email: ${error.message}`);
      });
  }

  // @Cron('10 * * * * * ')
  // RunTask(){
  //   var counter = 1
  //   counter += 1
  //   console.log("Testando uma task Automática: ", counter)
  //   // this.SendEmail()
  // }

  async transposeExcel(filePath: string): Promise<any[]> {
    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const transposedData: any[] = jsonData[0].map((col, i) =>
      jsonData.map((row) => row[i]),
    );

    const headerData: string[] =  transposedData[0]
    const headerDataConverter = headerData.map((index)=>{
      if(index !== undefined){
        return String(index).toLocaleLowerCase()

      }
    })
    // console.log("Resultado:", headerDataConverter.length)
    // console.log("Resultado:", headerDataConverter)

    var newJsonObject: any[] = []


    for (let i = 1; i < transposedData.length; i++) {
      var objectArray: {[key:string]:string} = {}

      for (let j = 0; j < headerDataConverter.length; j++){
        const key = headerDataConverter[j];
        const value = transposedData[i][j]
        objectArray[key] = value
      }

      newJsonObject.push(objectArray)
    }


    const converterData = newJsonObject.map((index)=>{
      return {...index, data: new Date(this.formatValue(index.data)) }
    })

    this.deteleFile(filePath)
    return converterData


  }

  formatValue(valor: number) {

    console.log("Valor", valor)

    if(typeof valor === 'number'){
      const data = new Date(1900, 0, Number(valor));
      if(!isNaN(data.getTime())){
        return data.getTime()

      }

    }else if(typeof valor === 'string'){
      const data = new Date(valor)
      return data
      // console.log(data);
            
    }
  }

  async convertExcelToJson(file: Express.Multer.File): Promise<any[]> {
    if (!file) {
      throw new NotFoundException('No file');
    } else {
      const workBook = xlsx.readFile(file.path);
      const sheet_name_list = workBook.SheetNames;
      const json_data = xlsx.utils.sheet_to_json(
        workBook.Sheets[sheet_name_list[0]],
      );

      this.deteleFile(file.path);
      return json_data;
    }
  }

  async convertCSVtoJson(filePath: string): Promise<any[]> {
    const data = await fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/);
    const headers = lines.shift().split(',');
    const result = [];

    for (const line of lines) {
      if (!line) continue;
      const obj = {};
      const curentLine = line.split(',');

      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = curentLine[i];
      }

      result.push(obj);
    }
    this.deteleFile(filePath);
    return result;
  }

  async deteleFile(filePath: string) {
    console.log('Arquivo convertido');
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`${filePath} deletado com sucesso.`);
      }
    });
  }
}
