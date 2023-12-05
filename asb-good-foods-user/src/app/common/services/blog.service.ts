import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private firestore: AngularFirestore) { } 

  getBlog(){
    return this.firestore.collection('Blog', ref => ref.where("blogStatus","==","active")).snapshotChanges();
  }

}
