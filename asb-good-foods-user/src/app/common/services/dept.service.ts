import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeptService {

  constructor(private firestore: AngularFirestore) { }

  dept(){
   return this.firestore.collection('ProductManagement').doc('Dept')
   .collection('DeptList', ref => ref.where("deptStatus","==","enable")).snapshotChanges();
  }
}
