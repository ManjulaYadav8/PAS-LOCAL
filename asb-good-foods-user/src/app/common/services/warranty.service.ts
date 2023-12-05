import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WarrantyService {

  constructor(private firestore: AngularFirestore) { }

  getWarrantyList(){
    return this.firestore.collection("WarrantyManagement").snapshotChanges();
  }
}
