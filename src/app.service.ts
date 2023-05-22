import { Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import { Cron } from '@nestjs/schedule';
import { type } from 'os';

interface Dado {
  [key: string]: any;
}

@Injectable()
export class AppService {
  constructor(private readonly mailerService: MailerService) {}

  getHello() {
    return { message: 'Olá' };
  }

  async SendEmail(arg?:any, email?: string) {
    console.log('Testando email');

    const atualDate = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'America/Porto_Velho',
    }).format(new Date());
   
  
   await this.mailerService
      .sendMail({
        from: "services-noreply@sicoobcredisul.com.br",
        to: email,
        subject: `Teste Schedule ${atualDate}`,
        template: "forms",
        context:{
          payload: arg
        }
      })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(`Falha ao enviar email: ${error.message}`);
        return {message: error}
      });

    return {message: "Email enviado"};
  }


  // @Cron('10 * * * * * ')
  // RunTask(){
  //   var counter = 1
  //   counter += 1
  //   console.log("Testando uma task Automática: ", counter)
  //   const args = {message: "Ramon, não está ruim que não possa ficar pior, sempre se lembre disso <3"}
  //   const email= "ramon.lazaro@sicoobcredisul.com.br"
  //   this.SendEmail(args, email)
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

  convertToTimezone(date: Date): Date {
    date.setDate(date.getDate() - 1)
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const targetDate = new Date(utcDate.toLocaleString('en-US', { timeZone: "America/Porto_Velho" }));
    return targetDate;
  }

  formatValue(valor: number) {

   

    if(typeof valor === 'number'){
      console.log('formatValue is number')
      const data = new Date(1900, 0, Number(valor));
      if(!isNaN(data.getTime())){
        return this.convertToTimezone(new Date(data.getTime()))
      }
      
    }else if(typeof valor === 'string'){
      console.log('formatValue is string')
      const data = this.convertToTimezone(new Date(valor))
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
      const json_data: Dado[]  = xlsx.utils.sheet_to_json(
        workBook.Sheets[sheet_name_list[0]],
      );
      const json_data1 = xlsx.utils.sheet_to_json(workBook.Sheets[sheet_name_list[1]])

      
      
     
      
      const formatarChaves = (dados: Dado[]): Dado[] => {
        return dados.map((obj: Dado) => {
          const novoObj: Dado = {};
          for (let chave in obj) {
            const novaChave = chave.replace(/ /g, "_").toLocaleLowerCase().normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ç/g, "C");;
            novoObj[novaChave] = obj[chave];
          }
          return novoObj;
        });
      };
      
      const dadosFormatados1 = formatarChaves(json_data);
      const newDadosFormatado1 = dadosFormatados1.map((index)=>{
        return {...index, data_movimento: new Date(this.formatValue(index.data_movimento))}
      })


      const dadosFormatados2 = formatarChaves(json_data1);

      const newDadosFormatado2 = dadosFormatados2.map((index)=>{
        return {...index, data_movimento: new Date(this.formatValue(index.data_movimento))}
      })




      
     


      console.log("Chaves do ojeto", Object.keys(json_data[0]))

      this.deteleFile(file.path);
      return [
        {planilha01: newDadosFormatado1},
        {planilha02: newDadosFormatado2},
      ];
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
