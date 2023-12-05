import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { ItemwiseFlatRates } from '../models/itemwise-flat-rates.model';

@Injectable({
  providedIn: 'root'
})
export class ItemwiseFlatRatesService {

  itemwiseData: ItemwiseFlatRates;

  constructor(private firestore: AngularFirestore) { }
  
  getSurfaceItemRates(){
    return this.firestore.collection('ShippingrateManagement').doc('Itemwiserates')
    .collection('ItemwiseratesList', ref =>ref.where("mode","==","surfacemode")).snapshotChanges();
  }
  getAirItemRates(){
    return this.firestore.collection('ShippingrateManagement').doc('Itemwiserates')
    .collection('ItemwiseratesList',ref =>ref.where("mode","==","airmode")).snapshotChanges();
  }

}
