import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Banner } from '../models/banner.model';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  bannerData: Banner;
  constructor(private firestore: AngularFirestore) { }

  getBannerList(){
   return this.firestore.collection('BannerManagement').snapshotChanges();
  }
  getPopupBanner(){
    return this.firestore.collection('BannerManagement',ref=> ref.where("bannerType", "==", 'popup').where("popupStatus","==","enable")).get();
  }
}
