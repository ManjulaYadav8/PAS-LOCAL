import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { GlobalFlatRates } from '../models/global-flat-rates.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalFlatRatesService {

  globalData: GlobalFlatRates;
  constructor(private firestore: AngularFirestore) { }
  
  getSurfaceGlobalRates(){
    return this.firestore.collection('ShippingrateManagement').doc('GlobalFlatrates')
    .collection('GlobalFlatratesList').snapshotChanges();
  }
  // getAirGlobalRates(){
  //   return this.firestore.collection('ShippingrateManagement').doc('GlobalFlatrates')
  //   .collection('GlobalFlatratesList', ref =>ref.where("mode","==","airmode")).snapshotChanges();
  // }
}
