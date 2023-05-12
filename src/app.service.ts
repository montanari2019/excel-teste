import { Injectable, NotFoundException } from '@nestjs/common';
import * as xlsx from 'xlsx';


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async convertExcelToJson(file: Express.Multer.File):  Promise<any[]> {
    if (!file){
      throw new NotFoundException('No file');
    }else{
      const workBook = xlsx.readFile(file.path)
      const sheet_name_list = workBook.SheetNames
      const json_data = xlsx.utils.sheet_to_json(workBook.Sheets[sheet_name_list[0]])
      return json_data
    }
   }
}
