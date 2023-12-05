export class Coupon {
    couponId : string;
    couponType: string;
    couponUomType : string;
    couponCode: string;
    couponValue: number;
    couponDesc: string;
    couponExpiryDate: Date;
    maxUsageLimit : number;
    maxComboQty : number;
    maxQtyAllowed : number;
    status : boolean;
    createdDtm : Date;
}
