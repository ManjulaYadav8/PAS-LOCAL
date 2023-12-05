import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Tags } from '../models/tags.model';

@Injectable({
  providedIn: 'root'
})
export class TagsService {

  tagData: Tags;
  constructor(private firestore: AngularFirestore) { }

  tagList(){
   return this.firestore.collection('TagManagement',ref => ref.where("tagStatus","==","enable")).get();
  }
}
