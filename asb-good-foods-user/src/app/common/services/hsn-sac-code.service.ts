import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HsnSacCode } from '../models/hsn-sac-code.model';


@Injectable({
  providedIn: 'root'
})
export class HsnSacCodeService {

  hsnSacCodeData: HsnSacCode;

  constructor(private firestore: AngularFirestore) { }

  addHsnSacCode(formData){
    return this.firestore.collection('ProductManagement').doc('HsnSacCode').collection('HsnSacCodeList').add(formData);
  }
  getHsnSacCodeList(){
   return this.firestore.collection('ProductManagement').doc('HsnSacCode').collection('HsnSacCodeList').get();
  }
  getHsnSacCode(hsnCodeId){
    return this.firestore.collection('ProductManagement').doc('HsnSacCode').collection('HsnSacCodeList').doc(hsnCodeId).get();
  }
  editHsnSacCode(formData){
    return this.firestore.collection('ProductManagement').doc('HsnSacCode').collection('HsnSacCodeList').doc(formData.hsnSacCodeId).update(formData);
  }
  deleteHsnSacCode(hsnCodeId){
    return this.firestore.collection('ProductManagement').doc('HsnSacCode').collection('HsnSacCodeList').doc(hsnCodeId).delete();
  }
}
