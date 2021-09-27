import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import moment, { min } from 'moment';

@Injectable()
export class UtilService {
    constructor(private toastController: ToastController) {

    }

    /**
     * 
     * @param msg provide message to pass that in the toast
     * @param duration how long you want to show toast
     */
    public async presentToast(msg: string, duration: number = 3000) {
        let toast = await this.toastController.create({ message: msg, duration: duration });
        return toast.present();
    }
    /**
     * 
     * @param msg provide message to pass that in the toast
     * @param duration how long you want to show toast
     */
    public async presentToastPromise(msg: string, duration: number = 3000): Promise<any> {
        let toast = await this.toastController.create({ message: msg, duration: duration });
        toast.present();
        return toast;
    }

    public getTimeForPending(status: string, time: string) {
        // console.log('IST', moment().format('hh:mm:ss a'));
        // console.log('HKT', moment().utcOffset('+0800').format('hh:mm:ss a'));
        // console.log('OrderTime', moment(time, 'yyyy-MM-dd HH:mm:ss').utcOffset('+0800').format('hh:mm:ss a'));
        // console.log('Orderwith 3 min', moment(time, 'yyyy-MM-dd HH:mm:ss').utcOffset('+0800').add('3', 'minutes').format('hh:mm:ss a'));
        // const x = ((moment().utcOffset('+0800')).add('3', 'minutes')).isBefore(moment(time, 'yyyy-MM-dd HH:mm:ss').utcOffset('+0800'));
        // const currentTime = moment().utcOffset('+1030').format('hh:mm:ss a');
        // // const orderTime = moment(time, 'yyyy-MM-dd HH:mm:ss').utcOffset('+0800').format('hh:mm:ss a');
        // let lastTime = moment(time, 'yyyy-MM-dd HH:mm:ss').utcOffset('+0800').add('3', 'minutes').format('hh:mm:ss a');
        // lastTime = (['0','pending'].includes(status.toLowerCase())) ? lastTime : moment(time, 'yyyy-MM-dd HH:mm:ss').utcOffset('+0800').format('hh:mm:ss a');
        // const tst = moment(lastTime, 'hh:mm:ss a').diff(moment(currentTime, 'hh:mm:ss a'), 'seconds');
        // let minutsInString = moment().utcOffset('+1000').startOf('days').add(tst, 'seconds').format('mm:ss');
        // minutsInString = (moment(lastTime, 'hh:mm:ss aa').isSameOrAfter(moment(currentTime, 'hh:mm:ss a'))) ? minutsInString : '00:00';
        // console.log(minutsInString);
        const x = ((moment().utcOffset('+0000'))).isBefore(moment.utc(time, 'yyyy-MM-DD HH:mm:ss').utcOffset('+0800').add('3', 'minutes'));
        let minutsInString = '00:00';
        if (x) {
            const currentTime = moment(moment.utc()).format('hh:mm:ss a');
            // const orderTime = moment(time, 'yyyy-MM-dd HH:mm:ss').utcOffset('+0000').format('hh:mm:ss a');
            let lastTime = moment.utc(time, 'yyyy-MM-DD HH:mm:ss').utcOffset('+0000').add('3', 'minutes').format('hh:mm:ss a');
            lastTime = (['0', 'pending'].includes(status.toLowerCase())) ? lastTime : moment.utc(time, 'yyyy-MM-DD HH:mm:ss').utcOffset('+0000').format('hh:mm:ss a');
            const tst = moment.utc(lastTime, 'hh:mm:ss a').diff(moment.utc(currentTime, 'hh:mm:ss a'), 'seconds');
            minutsInString = moment.utc().utcOffset('+0000').startOf('days').add(tst, 'seconds').format('mm:ss');
            minutsInString = (moment.utc(lastTime, 'hh:mm:ss aa').isSameOrAfter(moment.utc(currentTime, 'hh:mm:ss a'))) ? minutsInString : '00:00';
        }
        return minutsInString;
    }

    public getTimeForPendingReservedOrders(status: string, time: string) {
        var eventTime = moment(new Date(time), "Australia/Sydney");
        var currentTime = moment(new Date(), "Australia/Sydney");
        var duration = moment.duration(moment(eventTime,"YYYY/MM/DD HH:mm:ss","Australia/Sydney").diff(moment(currentTime,"YYYY/MM/DD HH:mm:ss","Australia/Sydney")));
        var hours=((Math.floor(duration.hours()))>0)?((Math.floor(duration.hours()))<10)?"0"+Math.floor(duration.hours()):Math.floor(duration.hours()):"00";
        var minutes=((Math.floor(duration.minutes()))>0)?(Math.floor(duration.minutes()))<10?"0"+Math.floor(duration.minutes()):Math.floor(duration.minutes()):"00";
        var seconds=((Math.floor(duration.seconds()))>0)?(Math.floor(duration.seconds()))<10?"0"+Math.floor(duration.seconds()):Math.floor(duration.seconds()):"00";
        var days=((Math.floor(duration.days()))>0)?(Math.floor(duration.days()))<10?"0"+Math.floor(duration.days()):Math.floor(duration.days()):"00";
        
        if(days == '00'){
            var time=hours+":"+minutes+":"+seconds;
        }else{
            var time = days+" "+hours+":"+minutes+":"+seconds;
        }
        
        return time;
        
    }
    public getTimeForPendingAcceptedOrders(status: string, ordertime: string,deliverytime:string) {        
        var eventTime = moment.utc(deliverytime).utcOffset(10);
        var currentTime = moment(new Date()).utc().utcOffset(10);
        var duration = moment.duration(moment(eventTime,"YYYY/MM/DD HH:mm:ss").diff(moment(currentTime,"YYYY/MM/DD HH:mm:ss")));
        var hours=((Math.floor(duration.hours()))>0)?((Math.floor(duration.hours()))<10)?"0"+Math.floor(duration.hours()):Math.floor(duration.hours()):"00";
        var minutes=((Math.floor(duration.minutes()))>0)?(Math.floor(duration.minutes()))<10?"0"+Math.floor(duration.minutes()):Math.floor(duration.minutes()):"00";
        var seconds=((Math.floor(duration.seconds()))>0)?(Math.floor(duration.seconds()))<10?"0"+Math.floor(duration.seconds()):Math.floor(duration.seconds()):"00";
        var days=((Math.floor(duration.days()))>0)?(Math.floor(duration.days()))<10?"0"+Math.floor(duration.days()):Math.floor(duration.days()):"00";
        
        if(days == '00'){
            var time=hours+":"+minutes+":"+seconds;
        }else{
            var time = days+" "+hours+":"+minutes+":"+seconds;
        }
        return time;
        
    }

    public getTimeForTestAcceptedOrders(status: string, ordertime: string,deliverytime:string) {        
        var eventTime = moment(deliverytime);
        var currentTime = moment(new Date()).utc().utcOffset(10);
        var duration = moment.duration(moment(eventTime,"YYYY/MM/DD HH:mm:ss").diff(moment(currentTime,"YYYY/MM/DD HH:mm:ss")));
        var hours=((Math.floor(duration.hours()))>0)?((Math.floor(duration.hours()))<10)?"0"+Math.floor(duration.hours()):Math.floor(duration.hours()):"00";
        var minutes=((Math.floor(duration.minutes()))>0)?(Math.floor(duration.minutes()))<10?"0"+Math.floor(duration.minutes()):Math.floor(duration.minutes()):"00";
        var seconds=((Math.floor(duration.seconds()))>0)?(Math.floor(duration.seconds()))<10?"0"+Math.floor(duration.seconds()):Math.floor(duration.seconds()):"00";
        var days=((Math.floor(duration.days()))>0)?(Math.floor(duration.days()))<10?"0"+Math.floor(duration.days()):Math.floor(duration.days()):"00";
        
        if(days == '00'){
            var time=hours+":"+minutes+":"+seconds;
        }else{
            var time = days+" "+hours+":"+minutes+":"+seconds;
        }
        return time;
        
    }

    
}