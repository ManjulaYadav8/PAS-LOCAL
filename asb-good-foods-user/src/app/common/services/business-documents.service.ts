import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BusinessDocumentsService {

  constructor(private firestore: AngularFirestore) { }

  getAboutData(){
    return this.firestore.collection('ManageBusinessStandards', ref => ref.where("bussinesStandardType","==","about")).get();
  }
  getPrivacyPolicy(){
   return this.firestore.collection('ManageBusinessStandards', ref => ref.where("bussinesStandardType","==","privacypolicy")).get();
  }
  getTermsandConditions(){
    return this.firestore.collection('ManageBusinessStandards', ref => ref.where("bussinesStandardType","==","terms&conditons")).get();
  }
  getDisclaimer(){
    return this.firestore.collection('ManageBusinessStandards', ref => ref.where("bussinesStandardType","==","disclaimer")).get();
  }
  getShippingandReturn(){
    return this.firestore.collection('ManageBusinessStandards', ref => ref.where("bussinesStandardType","==","cancellation&return")).get();
  }
}
