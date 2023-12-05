import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { SubCategory } from '../models/sub-category.model';

@Injectable({
  providedIn: 'root'
})
export class SubCategoryService {
  subcategoryIdSubect = new Subject<any>();
  subcategoryIdObservable : Observable<any> = this.subcategoryIdSubect.asObservable();
 
   subcategoryData: SubCategory;

  constructor(private firestore: AngularFirestore) { }
  subcategory(){
   return this.firestore.collection('ProductManagement').doc('Subcategory')
    .collection('SubcategoryList').get();
  }
}
