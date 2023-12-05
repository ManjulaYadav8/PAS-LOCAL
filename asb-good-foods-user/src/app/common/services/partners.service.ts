import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Partners } from '../models/partners.model';

@Injectable({
  providedIn: 'root'
})
export class PartnersService {
  
  partnerData: Partners;
  constructor(private firestore: AngularFirestore) { }

  getPartnerData(){
    return this.firestore.collection('PartnerManagement').snapshotChanges();
  }
}
