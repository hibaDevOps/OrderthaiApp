import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Order } from 'src/app/Models/order';
import { Media } from '@ionic-native/media/ngx';
import moment from 'moment';
import { MediaObject } from '@ionic-native/media/ngx';
import { AudioService } from 'src/app/services/AudioService/audio.service';


@Injectable({
    providedIn: 'root'
})
export class TestOrderService {
    private static DATABASE = 'testOrder';
    test: MediaObject;
    orderChangeEvent = new Subject<any>();
    orderClearEvent = new Subject<any>();
    constructor(private storage: Storage, private media: Media,private audio:AudioService) {
        this.createMedia();
        this.audio.preload('tabSwitch', 'assets/audio/Incoming_Mail.wav');

    }
    createMedia() {
        const path = '/android_asset/public/assets/sounds/Incoming_Mail.wav';
        this.test = this.media.create(path);
        this.test.onStatusUpdate.subscribe(status => console.log(status)); // fires when test status changes
        this.test.onSuccess.subscribe(() => console.log('Action is successful'));
        this.test.onError.subscribe(error => console.log('Error!', error));
    }
    async getOrders(): Promise<Order[]> {
        return this.storage.get(TestOrderService.DATABASE).then((response) => {
            response = (response) ? response : '[]';
            return Promise.resolve(JSON.parse(response));
        });
    }
    async addOrders(order: Order) {
        let data: Order[] = JSON.parse(await this.storage.get(TestOrderService.DATABASE));
        if (!data) {
            data = [];
        }
        order.orderTime = moment().utc().format('YYYY-MM-DD HH:mm:ss');
        order.index = Number('29267' + data.length);
        delete order['orderId'];
        data.push(order);
        this.audio.play('tabSwitch');
        setTimeout(() => {
            this.test.setVolume(1.0);
        }, 10);
        this.test.play();
        this.test.getCurrentAmplitude().then(value => console.log('amplitude ', value));
        this.storage.set(TestOrderService.DATABASE, JSON.stringify(data)).then(() => {
            this.orderChangeEvent.next(data);
        });
    }
    async orderDetails(orderId: string) {
        let data: Order[] = await this.getOrders();
        return data.find((order: Order) => order.orderId === orderId);
    }
    clearData() {
        this.storage.remove(TestOrderService.DATABASE).then((response) => {
            this.orderClearEvent.next([]);
        });
    }
    async updateTime(time, index) {
        const data: Order[] = JSON.parse(await this.storage.get(TestOrderService.DATABASE));
        data.map((item) => {
            if (item.index == index) {
                item.orderRemainingTime = time;
            }
            return item;
        });
        // data[index].orderRemainingTime = time;
        this.storage.set(TestOrderService.DATABASE, JSON.stringify(data));
    }

    async getOrderDetailByIndex(index) {
        const data: Order[] = JSON.parse(await this.storage.get(TestOrderService.DATABASE));
        return data.find((item) => item.index == index);
    }
    async updateStatus(status: string, index: number, time?: string) {
        if (['accept', 'reject'].includes(status.toLowerCase())) {
            const data: Order[] = JSON.parse(await this.storage.get(TestOrderService.DATABASE));
            data.map((item) => {
                if (item.index == index) {
                    item.orderStatus = (!status.includes('accept')) ? (!status.includes('reject')) ? 'missed' : '2' : '1';
                    item.orderDeliveryTime = moment().utcOffset('+0800').add(time, 'minutes').format('YYYY-MM-DD HH:mm:ss');
                }
                return item;
            });
            await this.storage.set(TestOrderService.DATABASE, JSON.stringify(data));
            this.orderChangeEvent.next(data);
        }
        if (['completed'].includes(status.toLowerCase())) {
            const data: Order[] = JSON.parse(await this.storage.get(TestOrderService.DATABASE));
            data.map((item) => {
                if (item.index == index) {
                    item.orderStatus = '3';
                    item.orderDeliveryTime = '00:00';
                }
                return item;
            });
            await this.storage.set(TestOrderService.DATABASE, JSON.stringify(data));
            this.orderChangeEvent.next(data);
        }
        return;
    }
}
