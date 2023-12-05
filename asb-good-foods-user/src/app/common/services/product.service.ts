import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  productData: Product;
  constructor(private firestore: AngularFirestore) { }

  product() {
    return this.firestore.collection('ProductManagement').doc('Product')
    .collection('ProductList').get();
  }
  activeProducts(){
    return this.firestore.collection('ProductManagement').doc('Product')
    .collection('ProductList',ref => ref.where("mode", "==","feature")).get();
  }
  offers() {
    return this.firestore.collection('Offers').doc('Offer').collection('OfferList').snapshotChanges();
  }
  getProduct(productId){
    return this.firestore.collection('ProductManagement').doc('Product').collection('ProductList').doc(productId).get();
  }
  getFeaturedProducts(){
    return this.firestore.collection('ProductManagement').doc('Product')
    .collection('ProductList',ref => ref.where("mode", "==","feature")).snapshotChanges();
  }
  getUpcomingProducts(){
    return this.firestore.collection('ProductManagement').doc('Product')
    .collection('ProductList',ref => ref.where("productStatus", "==","upcoming")).snapshotChanges(); 
  }
  getTodaysSplProducts(){
    return this.firestore.collection('ProductManagement').doc('Product')
    .collection('ProductList',ref => ref.where("mode", "==","today")).snapshotChanges();
  }
  getRecipeOfMonthProducts(){
    return this.firestore.collection('ProductManagement').doc('Product')
    .collection('ProductList',ref => ref.where("mode", "==","recipe")).snapshotChanges();
  }
  getProductByCategory(categoryId){
    return this.firestore.collection('ProductManagement').doc('Product')
    .collection('ProductList',ref => ref.where("categoryId", "==",categoryId).where("productStatus","==","active")).get();
  }
  getActiveProducts(){
    return this.firestore.collection('ProductManagement').doc('Product')
    .collection('ProductList',ref => ref.where("productStatus", "==","active")).get();
  }
  getAppointmentProducts(){
    return this.firestore.collection('ProductManagement').doc('Product')
    .collection('ProductList',ref => ref.where("productStatus", "==","active").where("tradeType","==","appointment")).get();
  }
}