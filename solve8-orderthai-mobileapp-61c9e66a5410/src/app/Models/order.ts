export class Order {
    name: string = "Food Client";
    address: string = "123 Test Street, Brisbane QLD 4000, AUSTRALIA";
    mobile: string = "0400 123 456";
    email: string = "test-order@orderthai.com.au";
    orderId: string = "OCT0123";
    orderStatus: string = '0';
    orderTime: string = "12:00 AM";
    orderRemainingTime: string = "";
    orderDeliveryTime: string = "";
    paymentMethod: string = "Online";
    deliveryNote: string = "Please when you reach at door step";
    order: Dish[] = [new Dish()];
    orderProduct: Dish[] = [new Dish()];
    lat: any = -27.7091963;
    lng: any = 153.2201116;
    index?: any;
    orderMethod: any = 'test';
    noOfPerson:any='';
    firstName: any = "Food";
    lastName: any = "Client";
    telephone: any = "0400 123 456";
    streetName: any = "";
    reserveTime:any="";
    resrveDate:any="";
    tax: any = "0.00";
    taxPaymentOption:any="0.00";
    clientName:any="Food Client";
    taxName: any = "GST";
    taxType:any="";
    orderLater:any="";
    deliveryFee:any="0.000";
    createdAt:any="";

}
export class Dish {
    id: string = "";
    price: any = "150.0";
    productName: string = "Pad Thai with Chicken";
    quantity: string = "1";
    tax: string = "15.0";
    orderProductChoices: orderProductChoice[] = [];
    instructions:any="";
}
export class AddOns {
    name: string = 'Extra Chess';
    status: string = "Add";
}
export class orderProductChoice {
    id: string = "";
    orderProductId: string ="";
    groupName: string = "";
    groupOptionName: string = "";
    optionPrice: any;
    optionQty: any;

}