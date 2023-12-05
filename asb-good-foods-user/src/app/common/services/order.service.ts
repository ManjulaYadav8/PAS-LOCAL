import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  formData: Order;
  constructor(private firestore: AngularFirestore) {
   }
   getOrderItems(){
     return this.firestore.collection('Order').snapshotChanges();
   }
}
