import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Cart } from '../models/cart.model';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
 userid;
 cartData: Cart;

 public cartLength = new BehaviorSubject<number>(0);
 public cartLengthObs = this.cartLength.asObservable();
 
  constructor(private firestore: AngularFirestore) {
    
      this.userid = JSON.parse(localStorage.getItem('userid'));
    }

  getCartItems(){
    //// console.log(this.userid);
    return this.firestore.collection('Cart').doc(`${this.userid}`).collection('Cart').snapshotChanges();
  }
  getCartLength(){
    //// console.log(this.userid);
    return this.firestore.collection('Cart').doc(`${this.userid}`).collection('Cart').snapshotChanges();
  }
  getCart(){
    return this.firestore.collection('Cart').doc(`${this.userid}`).collection('Cart').get();
  }
  getCartCouponList(){
    return this.firestore.collection('Cart').doc(`${this.userid}`).get();
  }  
  getCartCoupons(){
    return this.firestore.collection('Cart').doc(`${this.userid}`).snapshotChanges();
  }  
  editCartCoupon(coupons){
    return this.firestore.collection('Cart').doc(`${this.userid}`).set({ "coupons" : coupons });
  }  
  wishlist(){
    return this.firestore.collection('Cart').doc(`${this.userid}`).collection('Wishlist').get();
  }
}