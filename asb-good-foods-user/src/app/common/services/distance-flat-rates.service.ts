import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { DistanceFlatRates } from '../models/distance-flat-rates.model';

@Injectable({
  providedIn: 'root'
})
export class DistanceFlatRatesService {

  distanceData: DistanceFlatRates;
  constructor(private firestore: AngularFirestore) { }
  
  getSurfaceDistanceRates(){
    return this.firestore.collection('ShippingrateManagement').doc('DistanceFlatRates').
    collection('DistanceFlatRatesList', ref =>ref.where("mode","==","surfacemode")).snapshotChanges();
  }
  getAirDistanceRates(){
    return this.firestore.collection('ShippingrateManagement').doc('DistanceFlatRates').
    collection('DistanceFlatRatesList', ref =>ref.where("mode","==","airmode")).snapshotChanges();
  }
}
