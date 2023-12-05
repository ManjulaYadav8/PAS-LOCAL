export class Cart {
    CartDocId?: string;
    productName?: string;
    productdocId?: string;
    subcategoryId?: string;
    productId?:number;
    description?: string;
    productPrice?: number;
    primaryUrl?: string;
    quantity? : number;
    total?: number;
    subcategoryName?: string;
    displayAs? : string;
    images? :[{
        url: string;
        display: string;
        textToDisplay: string;
        productImageId? : number;
    }];
    gst?: number;
    shipping?: number;
    productWeight? : number;
    currentStock?: number;
    coupons? : any[];
    specialRating?: number;
    specialText?: string;
    unpilled?: any[];
    pilled?: any[];
    nonPreOrderDays?:number;
    preOrder?:string;
    categoryName:string;
    wishDocId?: string;
    wishlist:boolean;
}
