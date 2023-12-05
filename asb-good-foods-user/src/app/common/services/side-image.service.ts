import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { SideImage } from '../models/side-image.model';

@Injectable({
  providedIn: 'root'
})
export class SideImageService {

  sideImgData: SideImage;
  constructor(private firestore: AngularFirestore) { }

  getSideImg(){
  return this.firestore.collection('ManageSide').snapshotChanges();
  }
}