import { Injectable, NotFoundException } from '@nestjs/common';
import * as xlsx from 'xlsx';
import * as fs from 'fs';


@Injectable()
export class AppService {
  getHello() {
    return {message: "Olá"}
  }

  async convertExcelToJson(file: Express.Multer.File):  Promise<any[]> {
    if (!file){
      throw new NotFoundException('No file');
    }else{
      const workBook = xlsx.readFile(file.path)
      const sheet_name_list = workBook.SheetNames
      const json_data = xlsx.utils.sheet_to_json(workBook.Sheets[sheet_name_list[0]])
      this.deteleFile(file.path)
      return json_data
    }

    
   }

   async convertCSVtoJson(filePath: string): Promise<any[]> {
    
    const data = await fs.readFileSync(filePath, 'utf8')
    const lines = data.split(/\r?\n/)
    const headers = lines.shift().split(',')
    const result = []

    for (const line of lines){
      if(!line) continue
      const obj = {}
      const curentLine = line.split(',')

      for (let i = 0; i < headers.length; i++){
              obj[headers[i]] = curentLine[i]
            }

      result.push(obj)
    }
    this.deteleFile(filePath)
    return result
   }

   async deteleFile(filePath: string){
    console.log("Arquivo convertido")
      fs.unlink(filePath, err => {
          if (err) {
            console.error(err);
          } else {
            console.log(`${filePath} deletado com sucesso.`);
          }
        });
   }
}
