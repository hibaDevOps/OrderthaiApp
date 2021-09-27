import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    loadingList: any[] = [];

    constructor(public loadingController: LoadingController) {

    }


    async show(): Promise<any> {
        await this.hide();
        const loading = await this.loadingController.create({
            message: '',
            spinner: 'bubbles',
            translucent: true
        });
        this.loadingList.push(loading);
        return loading.present();
    }

    async hide() {
        for (const item of this.loadingList) {
            await item.dismiss();
        }
        this.loadingList = [];
    }
}
