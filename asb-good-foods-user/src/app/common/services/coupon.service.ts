import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Coupon } from '../models/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  couponData: Coupon;

  // private coupon = new BehaviorSubject<string>("");
  // eventAuthError$ = this.coupon.asObservable();

  constructor(private firestore: AngularFirestore) { }

  addCoupon(formData){
    return this.firestore.collection('CouponManagement').add(formData);
  }
  getCouponList(){
   return this.firestore.collection('CouponManagement').get();
  }
  getCoupon(couponId){
    return this.firestore.collection('CouponManagement').doc(couponId).get();
  }
  editCoupon(formData){
    return this.firestore.collection('CouponManagement').doc(formData.couponId).update(formData);
  }
  deleteCoupon(couponId){
    return this.firestore.collection('CouponManagement').doc(couponId).delete();
  }
  getCouponByType(couponType){
    return this.firestore.collection('CouponManagement').ref.where("couponType", "==", couponType).get();
  }

}
