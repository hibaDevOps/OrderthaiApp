import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Printer } from '../../Models/printer';
import { MyApiService } from './my-api.service';

@Injectable({
    providedIn: 'root'
})
export class PrinterAPIService extends MyApiService {
    updateTimer = new Subject<any>();
    clearRecords = new Subject<any>();
   
    savePrinterList(list,noLoader?:boolean): Promise<any>{
        return this.post('savePrinter', { printer: list },noLoader);

    }
    getPrinterFromId(id: any): Promise<any> {
        return this.post<any>('getPrinters', { restaurant_id: id });
    }
    updatePrinter(printerObj,noLoader?:boolean):Promise<any>{
        return this.post('updatePrinter', { printer: printerObj },noLoader);
    }
}