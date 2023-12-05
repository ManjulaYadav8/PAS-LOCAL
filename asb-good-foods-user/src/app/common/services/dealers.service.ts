import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Dealers } from '../models/dealers.model';

@Injectable({
  providedIn: 'root'
})
export class DealersService {

  dealersData: Dealers;
  constructor(private firestore: AngularFirestore) { }

  getDealersList(){
   return this.firestore.collection('Dealersdata').snapshotChanges();
  }
}
