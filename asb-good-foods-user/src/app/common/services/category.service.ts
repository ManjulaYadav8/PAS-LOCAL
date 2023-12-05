  
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  
  categoryData: Category;
  constructor(private firestore: AngularFirestore) { 
  }

  category(){
   return this.firestore.collection('ProductManagement').doc('Category')
   .collection('CategoryList', ref=> ref.where("categoryStatus","==","enable").where("tradeType","==","purchase")).snapshotChanges();
  } 
  getAppointmentCategory(){
    return this.firestore.collection('ProductManagement').doc('Category')
    .collection('CategoryList', ref=> ref.where("categoryStatus","==","enable").where("tradeType","==","appointment")).get();  
  }
  getCategory(categoryId){
    return this.firestore.collection('ProductManagement').doc('Category')
    .collection('CategoryList').doc(categoryId).get();
  }
  getCategoryByDept(dept){
    return this.firestore.collection('ProductManagement').doc('Category').collection('CategoryList').ref.where("deptName","==",dept.deptName).get();
  }
}