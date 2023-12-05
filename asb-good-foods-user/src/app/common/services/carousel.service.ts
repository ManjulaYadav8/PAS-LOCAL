import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CarouselService {

  constructor(private firestore: AngularFirestore) { }

  getCarousel(){
    return this.firestore.collection('CarouselManagement', ref => ref.where("carouselType","!=","about")).snapshotChanges();
    }
    getAboutCarousel(){
      return this.firestore.collection('CarouselManagement', ref => ref.where("carouselType","==","about")).snapshotChanges();
    }
}
