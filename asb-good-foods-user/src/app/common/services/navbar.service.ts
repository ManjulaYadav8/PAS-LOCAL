import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  constructor(private firestore: AngularFirestore) { }

  getNavbar(){
   return this.firestore.collection('NavbarManagement',ref => ref.where("navbarStatus", "==", "enable")).get();
  }
}
