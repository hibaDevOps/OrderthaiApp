import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Order } from 'src/app/Models/order';
import { MyApiService } from './my-api.service';

@Injectable({
    providedIn: 'root'
})
export class OrderService extends MyApiService {
    updateTimer = new Subject<any>();
    clearRecords = new Subject<any>();
    getOrders(noLoader?:boolean): Promise<Order[]> {
        return this.post<Order[]>('orderList', null,noLoader);
    }
    getDetailOrders(noLoader?:boolean): Promise<Order[]> {
        return this.post<Order[]>('orderDetailList', null,noLoader);
    }
    getOrderFromId(id: any): Promise<Order> {
        return this.post<Order>('orderDetails', { orderId: id });
    }
    updateTime(id, time): Promise<any> {
        this.updateTimer.next({ orderId: id, time: time });
        // return this.put('order/time/', { id: id, time: time });
        return Promise.resolve({ time: time });
    }
    updateStatus(id, status, time): Promise<any> {
        return this.post('orderAction', { deliveryTime: time, orderId: id, action: status });
    }

    clearOrder(): Promise<any> {
        return this.post('clearOrder', null);
    }
    getOrderCategories(id): Promise<any> {
        return this.post('orderDetailCategories', { orderId: id },true);
    }
    savePrinterList(list): Promise<any>{
        return this.post('savePrinter', { listOfPrinters: list },true);

    }
}