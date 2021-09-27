//    {
//     "userId":"1",
//     "ownerId":"",
//     "deviceId":"",
//     "accessToken":"accessToken",
//     "deviceType":"android"
//    }
class GenericRequest {
    userId: string;
    ownerId: string;
    deviceId: string;
    accessToken: string;
    deviceType: number;
    constructor() {
        this.userId = 'User1';
        this.ownerId = 'school1';
        this.deviceId = 'device id';
        this.accessToken = 'token';
        this.deviceType = 1;
    }
}
