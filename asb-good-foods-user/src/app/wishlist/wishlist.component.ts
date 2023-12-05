import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertMessage } from 'src/app/common/models/alert-message.model';
import { Cart } from 'src/app/common/models/cart.model';
import { AlertMessageService } from 'src/app/common/services/alert-message.service';
import { AnalyticsService } from 'src/app/common/services/analytics.service';
import { CartService } from 'src/app/common/services/cart.service';
import { Category } from '../common/models/category.model';
import { CategoryService } from '../common/services/category.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {

  wishItems: Cart[];
  alertMessages: AlertMessage[];
  cartItems:Cart[];
  choosenProductIds = [];
  viewCart = false;
  deletingproduct;
  categoryList: Category[];
  public userUid = JSON.parse(localStorage.getItem('userid'));
  companyConfig;
  constructor(private firestore: AngularFirestore, private alertMsgService: AlertMessageService,
    private analyticsService : AnalyticsService,private cartService: CartService,
    private toastr: ToastrService, private router: Router, private categoryService: CategoryService) { }

  ngOnInit() {
    this.getWishList();
    this.getAlertMessages();
    this.getCartList();
    this.getCategoryList();
    this.companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  }
  @HostListener("window:scroll", []) onWindowScroll() {
    this.scrollFunction();
  }
  scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      document.getElementById("myBtn").style.display = "block";
    } else {
      document.getElementById("myBtn").style.display = "none";
    }
  }
  topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0; 
  
  }
  getWishList(){
    this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist',ref=>ref.where("addedCart","==", false)).get().subscribe(wishlist =>{
    this.wishItems = wishlist.docs.map(list =>{
      return{
        CartDocId: list.id,
                  ...list.data()
      }as Cart;
    })
    })
  }
  continueShopping() {
    this.router.navigate(['/products']);
  }
  getAlertMessages(){
    this.alertMsgService.getAlertMessage().subscribe(msg =>{
      this.alertMessages = msg.docs.map(list =>{
        return{
          alertMsgDocId : list.id,
                         ...list.data()
        }as AlertMessage
      })
    });
  }
  getCartList() {
    if(this.userUid){
      this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').snapshotChanges().subscribe(cart => {
        this.cartItems = cart.map(list => {
          return {
            CartDocId: list.payload.doc.id,
            ...list.payload.doc.data()
          } as Cart;
        })
      // console.log(this.cartItems)
      })
    }
  } 
  // addToCart(product) {
  //   this.getWishList();
  //   if(this.userUid){
  //     if(product){
  //       var analyticsData = {
  //         "source" : "home",
  //         "category-name" : product.categoryName,
  //         "quantity" : product.quantity,
  //         "current-stock" : product.currentStock,
  //         "initial-stock" : product.initialStock,
  //         "product_name" : product.productName,
  //         "product-price" : product.productPrice,
  //         "product-doc-id" : product.productdocId,
  //       }
  //       this.analyticsService.setEcommerceEvent('e-commerce','add-to-cart',analyticsData);
  //     }
  //     this.choosenProductIds.push(product.productdocId);
  //     if (product.currentStock > 0) {
  //       const obj = this.cartItems.find(o => o.productdocId === product.productdocId);
  //       if (this.userUid && obj == undefined) {
  //         this.viewCart = true;
  //         this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').add(product)
  //           .then(docRef => {
  //             this.cartService.cartLength.next(this.cartItems.length + 1);
  //             let cartDocId = docRef.id;
  //             this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(cartDocId).update({ "CartDocId": cartDocId });
  //           })
  //           .catch(function (error) {
  //             console.error("Error adding document: ", error);
  //           });
  //         var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Added').pop();
  //         var alertMsg = productAlert.alertMsgType;
  //         this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
  //         this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(product.productdocId).update({addedCart:true});
  //       } else if (this.userUid && obj != undefined) {
  //         this.viewCart = true;
  //         this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${obj.CartDocId}`).update({'quantity': (obj.quantity) + 1})
  //         var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'quantity_Updated').pop();
  //         var alertMsg = productAlert.alertMsgType;
  //         this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
  //       }
  //       else {
  //         localStorage.setItem('cartItems',JSON.stringify(product));
  //         var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'purchase_Login').pop();
  //         var alertMsg = productAlert.alertMsgType;
  //         this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
  //         this.router.navigate(['/login']);
  //         this.topFunction();
  //       }
  //     } else {
  //       var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Not_Available').pop();
  //         var alertMsg = productAlert.alertMsgType;
  //         this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
  //     }
  //   }else {
  //       var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'purchase_Login').pop();
  //       var alertMsg = productAlert.alertMsgType;
  //       this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
  //       this.router.navigate(['/login']);
  //       this.topFunction();
  //   }
  //   // console.log(product.quantity)
  // }
  getCategoryList(){
   this.categoryService.category().subscribe(category =>{
    this.categoryList = category.map(list =>{
      return{
        categoryDocId: list.payload.doc.id,
                      ...list.payload.doc.data()
      }as Category
    })
   })
  }
  productOverview(product){
   for(var i=0; i<this.categoryList.length; i++){
    if(product.categoryId == this.categoryList[i].categoryId){
      this.router.navigate([`/products/${this.categoryList[i].deptId}/${product.categoryId}`, product.productId]);
      this.topFunction();
    }
  }
  }
  cartDel(cartProdDel: string) {
    this.deletingproduct = cartProdDel;
  }
  wishlistDelete(product) {

    if(product){
      var analyticsData = {
        "source" : "delete",
        "category-name" : product.categoryName,
        "current-stock" : product.currentStock,
        "initial-stock" : product.initialStock,
        "product_name" : product.productName,
        "product-price" : product.productPrice,
        "product-doc-id" : product.productdocId,
      }
      this.analyticsService.setEcommerceEvent('e-commerce','remove-from-wishlist',analyticsData);
    }
    // this.wishItems.splice(this.wishItems.indexOf(product), 1);
    // this.firestore.doc(`Cart/${this.userUid}/Wishlist/` + this.deletingproduct).delete().then(res => {
    // });
    // let currentUrl = this.router.url;
    // this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
    //     this.router.navigate([currentUrl]);
    // })
    this.wishItems.splice(this.wishItems.indexOf(product), 1);
    this.firestore.doc(`Cart/${this.userUid}/Wishlist/` + this.deletingproduct).delete()  ;   
    this.router.navigate(['/wishlist']);
    this.topFunction();
  }
}
