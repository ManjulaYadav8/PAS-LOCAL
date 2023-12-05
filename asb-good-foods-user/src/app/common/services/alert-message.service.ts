import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertMessage } from '../models/alert-message.model';

@Injectable({
  providedIn: 'root'
})
export class AlertMessageService {

  alertData: AlertMessage;
  constructor(private firestore: AngularFirestore) { }

  getAlertMessage(){
  return this.firestore.collection('AlertManagement').doc('AlertMessage').collection('AlertMessageList').get();
  }
}
