import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { ShippingType } from '../models/shipping-type.model';

@Injectable({
  providedIn: 'root'
})
export class ShippingTypeService {

  shippingData: ShippingType;
  constructor(private firestore: AngularFirestore) { }

  getShippingType(){
   return this.firestore.collection("ShippingrateManagement").doc("ShippingType").collection("ShippingTypeRatesList").get();
  }
  
}
