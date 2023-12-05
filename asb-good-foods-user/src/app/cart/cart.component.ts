import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Cart } from '../common/models/cart.model';
import { SubCategory } from '../common/models/sub-category.model';
import { CartService } from '../common/services/cart.service';
import { HsnSacCodeService } from '../common/services/hsn-sac-code.service';
import { SubCategoryService } from '../common/services/sub-category.service';
import { MetaTagService } from '../common/services/meta-tag.service';
import { AnalyticsService } from '../common/services/analytics.service';
import { OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { Product } from '../common/models/product.model';
import { Category } from '../common/models/category.model';
import { CategoryService } from '../common/services/category.service';
import { ProductService } from '../common/services/product.service';
import { take } from 'rxjs/operators';
import { AlertMessageService } from '../common/services/alert-message.service';
import { AlertMessage } from '../common/models/alert-message.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cartItemsList: Cart[];
  variousTax = {
    "federalTaxAmt" : 0.00,
    "stateTaxAmt" : 0.00,
    "salesTaxAmt" : 0.00,
    "vat" : 0.00,
  };
  federalTaxAmtArray = [];
  stateTaxAmtArray = [];
  salesTaxAmtArray = [];
  vatArray = [];
  cartListProducts = [];
  localSubCategoryList: SubCategory[];
  userUid;
  increaseQty;
  decreaseQty;
  inputQty;
  subCategoryId;
  categoryId;
  deletingproduct;
  selectedProduct;
  subTotal = 0;
  productsIncart;
  updateProductList;
  cartList = [];
  couponList = [];
  couponAmt = 0;
  taxAmount = 0;
  businessDiscount = 0;
  hsnSacCodeList = [];
  productList: Product[];
  selectedProductList : any[] = [];
  categoryList: Category[];
  userProfile = null;
  companyConfig = null;
  productCartList;
  alertMessages: AlertMessage[];
  wishlistDocId;
  wishItems: Cart[];
  carouselFeaturedSlide: SlidesOutputData;
  featuredOptions: OwlOptions = {
    loop: true,
    margin: 20,
    stagePadding : 10,
    autoplay: true,
    mouseDrag: true,
    autoplaySpeed: 1000,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    autoplayHoverPause:true,
    navText: ['', ''],
    responsive: {
      0: {
        items: 2
      },
      400: {
        items: 2
      },
      740: {
        items: 4
      },
      940: {
        items: 4
      }
    },
    nav: false,
  }
  // private refreshSubscription: Subscription
  constructor(private cartService: CartService, private firestore: AngularFirestore,
    private dialog: MatDialog, private hsnSacCodeService: HsnSacCodeService,private categoryService: CategoryService,
    private metaTagService : MetaTagService, private analyticsService : AnalyticsService,private productService: ProductService,
    private router: Router, private subCategoryService: SubCategoryService, private toastr: ToastrService,
    private alertMsgService: AlertMessageService) { }

  ngOnInit() {  
    this.metaTagService.setTitleMetaTag(this.router.url);
    this.getLocalCache();
    this.getCartItemsList();
    // this.getProductList();
    this.getCategoryList();
    this.getAlertMessages();
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
  getLocalCache() {
    this.userUid = JSON.parse(localStorage.getItem('userid'));
    this.userProfile = JSON.parse(localStorage.getItem('userProfile'));
    this.companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  }
  getCartItemsList() {
    this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').snapshotChanges().subscribe(cart => {
      this.cartItemsList = cart.map(list => {
        return {
          CartDocId: list.payload.doc.id,
          ...list.payload.doc.data()
        } as Cart;
      });
      this.cartListProducts = this.cartItemsList.map(item => item.productdocId)
      this.cartService.cartLength.next(this.cartItemsList.length);
      // console.log(this.cartItemsList);
      // this.setViewCartList(this.cartItemsList);
      this.switchTaxationStandard(this.cartItemsList);
      this.getselectedUserCartData(this.cartItemsList);
      this.getRelatedProducts(this.cartItemsList);
      this.getWishList();
      // this.getCartProducts()
    })
  }
  getWishList(){
    if(this.userUid){
    this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').get().subscribe(wishlist =>{
    this.wishItems = wishlist.docs.map(list =>{
      return{
        CartDocId: list.id,
                  ...list.data()
      }as Cart;
    })
    })
  }
  }
  getRelatedProducts(cartItems){
    var cartProducts = cartItems.map(cart => cart.productdocId);
    var productIds = [];
    this.selectedProductList = [];
    cartItems.map(cart => {
      if(cart.associatedProductIds){
        cart.associatedProductIds.map(product => {
          if(!productIds.includes(product) && !cartProducts.includes(product)){
            productIds.push(product);
              this.firestore.collection('ProductManagement').doc('Product').collection('ProductList')
                  .ref.where('productdocId',"==",product).get().then(res => {
                    if(!res.empty && res.docs){
                      if(!this.selectedProductList.map(item => item.productdocId).includes(product)){
                        this.selectedProductList.push(res.docs[0].data());
                      }
                    }
              })
           }
         })
       }
     })
  }
  getselectedUserCartData(cartItemsList) {
    for (var i = 0; i < cartItemsList.length; i++) {
      if (cartItemsList[i].currentStock < cartItemsList[i].quantity) {
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'reduce_Cart_Quantity').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
        this.firestore.collection('Cart').doc(this.userUid).collection('Cart').doc(`${this.cartItemsList[i].CartDocId}`).update({ quantity: this.cartItemsList[i].currentStock });
      }
    }
    this.getSubTotal();
  }
  getSubTotal() {
    //// console.log(this.cartItemsList);
    if (this.cartItemsList) {
      this.subTotal = 0;
      for (var i = 0; i < this.cartItemsList.length; i++) {
        if (this.cartItemsList[i].currentStock > 0) {
          this.subTotal += this.cartItemsList[i].productPrice * this.cartItemsList[i].quantity;
          this.subTotal = parseFloat(this.subTotal.toFixed(2));
        }
      }
      this.getCartCouponList(this.subTotal);
      // this.getCartProducts();
      this.addBusinessDiscount(this.subTotal);
    }
  }
  // getCartProducts() {
  //   // this.productCartList = [];
  //   for (var i = 0; i < this.cartItemsList.length; i++) {
  //     this.firestore.collection('ProductManagement').doc('Product').collection('ProductList').doc(this.cartItemsList[i].productdocId).get().subscribe(cart => {
  //       this.productsIncart = cart.data();
  //       // this.updateCurrentStock(this.productsIncart);

  //       this.productCartList = Object.assign({},this.productsIncart);
  //       console.log(this.productCartList);
  //     })
  //   }
  // }
  // updateCurrentStock(product) {
  //   this.updateProductList = product;
  //  // console.log(product.productdocId);
  // }
  // getMoreProducts(product) {
  //   // // console.log(product);
  //   // // console.log(this.categoryId);
  //   this.topFunction();
  //   this.subCategoryService.subcategory().subscribe(subCategory => {
  //     this.localSubCategoryList = subCategory.map(list => {
  //       return {
  //         subcategoryDocId: list.payload.doc.id,
  //         ...list.payload.doc.data() as {}
  //       } as SubCategory;
  //     })
  //     this.getSeparateMoreProducts(product, this.localSubCategoryList)
  //   })

  // }
  // getSeparateMoreProducts(product, localSubCategoryList){

  //   for (var i = 0; i < localSubCategoryList.length; i++) {
  //     if (localSubCategoryList[i].subcategoryId == +product.subcategoryId) {
  //       this.categoryId = localSubCategoryList[i].categoryId;
  //       this.router.navigate([`/products/${this.categoryId}`, product.productId])
  //     }
  //   }
  // }
  // getSubCategory() {
  //   this.subCategoryService.subcategory().subscribe(subCategory => {
  //     this.localSubCategoryList = subCategory.map(list => {
  //       return {
  //         subcategoryDocId: list.payload.doc.id,
  //         ...list.payload.doc.data() as {}
  //       } as SubCategory;
  //     })
  //     // console.log(this.localSubCategoryList);
  //   this.getSeparateSubcategory(this.localSubCategoryList)
  //   })
  // }
  // getSeparateSubcategory(localSubCategoryList){
  //   for (var i = 0; i < localSubCategoryList.length; i++) {
  //     if (localSubCategoryList[i].subcategoryId == this.subCategoryId) {
  //       this.categoryId = localSubCategoryList[i].categoryId;
  //       //// console.log(this.localSubCategoryList[i].categoryId)
  //     }
  //   }
  // }
  cartDel(product) {
    this.selectedProduct = product;
    this.deletingproduct = product.CartDocId;
    this.wishlistDocId = product.wishDocId;
  }
  cartDelete(product) {

    if(product){
      var analyticsData = {
        "source" : "delete",
        "category-name" : product.categoryName,
        "quantity" : product.quantity,
        "current-stock" : product.currentStock,
        "initial-stock" : product.initialStock,
        "product_name" : product.productName,
        "product-price" : product.productPrice,
        "product-doc-id" : product.productdocId,
      }
      this.analyticsService.setEcommerceEvent('e-commerce','remove-from-cart',analyticsData);
    }
    this.cartItemsList.splice(this.cartItemsList.indexOf(product), 1);
    this.cartService.cartLength.next(this.cartItemsList.length - 1);
    this.switchTaxationStandard(this.cartItemsList, this.hsnSacCodeList);
    let selectedItem = this.wishItems.find(item => item.productdocId == this.selectedProduct.productdocId)
    // console.log(selectedItem);          
    if(selectedItem != undefined){
      this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(this.selectedProduct.productdocId).
      update({addedCart:false, wishlist: true});
    }
      // if(this.selectedProduct.wishlist == true){
      //   this.selectedProduct['addedCart']=false;
      //   this.selectedProduct['wishlist'] = true;
      //   this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(this.deletingproduct).set(this.selectedProduct);
      // }
    // if(selectedItem != undefined){
   
    //   console.log(selectedItem);
    // }
    this.firestore.doc(`Cart/${this.userUid}/Cart/` + this.deletingproduct).delete().then(res => {
      this.couponList = [];
      this.cartService.editCartCoupon([]);
    });
    //   for(var j=0; j<this.wishItems.length; j++){
    //     console.log(this.selectedProduct.productdocId);
    //     console.log(this.wishItems[j].productdocId)
    //     if(this.selectedProduct.productdocId == this.wishItems[j].productdocId){
    //     //  this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(this.wishItems[j].wishDocId).update({addedCart:true, wishlist: false});
    //     // this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(this.cartItemsList[j].CartDocId).update({wishDocId:this.wishItems[j].wishDocId});
    //     this.selectedProduct['addedCart']=false;
    //     this.selectedProduct['wishlist'] = true;
    //     this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(this.wishItems[j].productdocId).update(this.selectedProduct);

    //   }
    // }
    // this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(cartItems[i].CartDocId).update({wishDocId: wishItems[i].wishDocId});
    // if(this.wishlistDocId != undefined){
    //   this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(this.wishlistDocId).update({addedCart:false, wishlist: true});
    // }
    this.router.navigate(['/cart']);
  }
  dateConverter(inputDate){
    if(inputDate == null || inputDate == undefined){
      return null;
    }else{
      let presentTime = new Date(inputDate).toLocaleTimeString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`});
      var cartCoupon = {
        "couponDiscount": this.couponAmt,
        "businessDiscount": this.businessDiscount,
         "coupons": this.couponList, 
         "tax": this.taxAmount , 
         "variousTax" : this.variousTax}
      let hour = presentTime.split(":")[0];
      let timeType = presentTime.split(" ")[1];
      let preorderHour = this.companyConfig.preOrderTime.split(":")[0];
      if(timeType === 'PM'){
      let remainTime = +hour + 12;
        if(+hour > remainTime){
          // console.log(remainTime);
          this.cartItemsList.map(item => {
            this.firestore.collection('Cart').doc(this.userUid).collection('Cart').doc(item.CartDocId).update(item);
          })
          this.firestore.collection('Cart').doc(this.userUid).update(cartCoupon);
          if (this.cartItemsList.length != 0) {
            localStorage.setItem('cart',JSON.stringify(this.cartItemsList));
            localStorage.setItem('cartCoupon',JSON.stringify(cartCoupon));
            this.router.navigate(['/checkout']);
            this.topFunction();
          } 
        }else{
          
          // for(var i=0; i<this.alertMessages.length; i++){
            var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'pre_Order_Time').pop();
            var alertMsg = productAlert.alertMsgType;
            this.toastr[alertMsg](productAlert.alertMsgText+ " " + this.companyConfig.preOrderTime,productAlert.alertMsgHeading); 
          this.cartItemsList.map(item => {
            this.firestore.collection('Cart').doc(this.userUid).collection('Cart').doc(item.CartDocId).update(item);
          })
          this.firestore.collection('Cart').doc(this.userUid).update(cartCoupon);
          if (this.cartItemsList.length != 0) {
            localStorage.setItem('cart',JSON.stringify(this.cartItemsList));
            localStorage.setItem('cartCoupon',JSON.stringify(cartCoupon));
            this.router.navigate(['/checkout']);
            this.topFunction();
          }
        }
      }else {
        if(+hour < preorderHour){
          // console.log(preorderHour);
          this.cartItemsList.map(item => {
            this.firestore.collection('Cart').doc(this.userUid).collection('Cart').doc(item.CartDocId).update(item);
          })
          this.firestore.collection('Cart').doc(this.userUid).update(cartCoupon);
          if (this.cartItemsList.length != 0) {
            localStorage.setItem('cart',JSON.stringify(this.cartItemsList));
            localStorage.setItem('cartCoupon',JSON.stringify(cartCoupon));
            this.router.navigate(['/checkout']);
            this.topFunction();
          }
        }
        else{
          var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'pre_Order_Time').pop();
          var alertMsg = productAlert.alertMsgType;
          this.toastr[alertMsg](productAlert.alertMsgText+ " " + this.companyConfig.preOrderTime,productAlert.alertMsgHeading); 
          this.cartItemsList.map(item => {
            this.firestore.collection('Cart').doc(this.userUid).collection('Cart').doc(item.CartDocId).update(item);
          })
          this.firestore.collection('Cart').doc(this.userUid).update(cartCoupon);
          localStorage.setItem('cartCoupon',JSON.stringify(cartCoupon));
          if (this.cartItemsList.length != 0) {
            localStorage.setItem('cart',JSON.stringify(this.cartItemsList));
            this.router.navigate(['/checkout']);
            this.topFunction();
          } 
        }
      }
    }
  //  this.wishItems.map((item, index) =>{
  //   if(this.cartListProducts.find(list => list.productdocId === item.productdocId)){
  //     this.wishItems[index]['addedCart'] = true;
  //     console.log(this.wishItems[index]);
  //   }else{
  //     this.wishItems[index]['addedCart'] = false;
  //     console.log(this.wishItems[index]);
  //   }
  // })
}
  checkOut() {
    this.dateConverter(new Date());

  }

  decrease(qty, cartDoc, index) {
    if (qty > 1) {
      if(this.cartItemsList[index]){
        var analyticsData = {
          "source" : "decrease",
          "category-name" : this.cartItemsList[index]["categoryName"],
          "quantity" : this.cartItemsList[index]["quantity"] - 1,
          "current-stock" : this.cartItemsList[index]["currentStock"],
          "initial-stock" : this.cartItemsList[index]["initialStock"],
          "product_name" : this.cartItemsList[index]["productName"],
          "product-price" : this.cartItemsList[index]["productPrice"],
          "product-doc-id" : this.cartItemsList[index]["productdocId"],
        }
        this.analyticsService.setEcommerceEvent('e-commerce','remove-from-cart',analyticsData);
      }
      this.decreaseQty = 1;
      this.decreaseQty = qty - 1;
      this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(cartDoc).update({ quantity: this.decreaseQty });
      var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'quantity_Updated').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
    }else{
      this.decreaseQty = 1;
    }
    this.getProductCost();
    this.cartItemsList[index].quantity = this.decreaseQty;
    this.switchTaxationStandard(this.cartItemsList, this.hsnSacCodeList)
  }
  setViewCartList(cart){
    if(cart && cart.length){
      var cartList = cart.map(product => {
        return {
          "category-name" : product.categoryName,
          "quantity" : product.quantity,
          "current-stock" : product.currentStock,
          "initial-stock" : product.initialStock,
          "product_name" : product.productName,
          "product-price" : product.productPrice,
          "product-doc-id" : product.productdocId,
        }
      })
      this.analyticsService.setEcommerceEvent('e-commerce','view-cart',cartList);
    }
  }
  increase(product, index) {
    if(product){
      var analyticsData = {
        "source" : "increase",
        "category-name" : product.categoryName,
        "quantity" : product.quantity + 1,
        "current-stock" : product.currentStock,
        "initial-stock" : product.initialStock,
        "product_name" : product.productName,
        "product-price" : product.productPrice,
        "product-doc-id" : product.productdocId,
      }
      this.analyticsService.setEcommerceEvent('e-commerce','add-to-cart',analyticsData);
    }
    // console.log(product  +"+"+index);
    this.allowedMaxQtyCheck(product.quantity, index);
    if (this.cartItemsList[index].coupons == undefined) {
      this.cartItemsList[index].coupons = [];
    }
    // console.log(currentStock);
    this.firestore.collection('ProductManagement').doc('Product').collection('ProductList').doc(product.productdocId).get().subscribe(cart => {
      this.productsIncart = cart.data();
      this.increaseQty = 1;
      this.increaseQty = product.quantity + 1;

      if (this.increaseQty <= this.productsIncart.currentStock) {
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(product.CartDocId).update({ quantity: this.increaseQty, coupons: this.cartItemsList[index].coupons });
        this.cartItemsList[index].quantity = this.increaseQty;
        this.switchTaxationStandard(this.cartItemsList, this.hsnSacCodeList)
        this.getProductCost();
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'quantity_Updated').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
      } else {
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'reduce_Cart_Quantity').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
         }
    })
  }
  blurEvent(product, event: any, index) {

    // console.log(product);
    this.inputQty = event.target.value;
    this.allowedMaxQtyCheck(this.inputQty, index);
    if (this.cartItemsList[index].coupons == undefined) {
      this.cartItemsList[index].coupons = [];
    }
    this.firestore.collection('ProductManagement').doc('Product').collection('ProductList').doc(product.productdocId).get().subscribe(cart => {
      this.productsIncart = cart.data();
      if (this.inputQty <= this.productsIncart.currentStock) {
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(product.CartDocId).update({ quantity: this.inputQty, coupons: this.cartItemsList[index].coupons });
        this.getProductCost();
        this.cartItemsList[index].quantity = this.inputQty;
        this.switchTaxationStandard(this.cartItemsList, this.hsnSacCodeList)
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'quantity_Updated').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
      } else {
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'reduce_Cart_Quantity').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
      }
    })
    // console.log(currentStock);
    //  this.increaseQty = 1;
    //  this.increaseQty = this.inputQty + 1;



  }
  // deleteAllProducts(){
  //  // console.log(this.cartItemsList);
  //   for(var i=0; i<this.cartItemsList.length; i++){
  //     this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(this.cartItemsList[i].CartDocId).delete();
  //   }
  // }
  getProductCost() {
    if (this.cartItemsList) {
      this.subTotal = 0;
      for (var i = 0; i < this.cartItemsList.length; i++) {
        if (this.cartItemsList[i].currentStock > 0) {
          this.subTotal += this.cartItemsList[i].productPrice * this.cartItemsList[i].quantity;
          this.subTotal = parseFloat(this.subTotal.toFixed(2));
        }
      }
      this.addBusinessDiscount(this.subTotal);
      //// console.log(this.subTotal );
    }
  }
  continueShopping() {
    this.router.navigate(['/products']);
  }
  // cartSelection(){
  //   this.router.navigate(['/cart']);
  // }
  @HostListener("window:scroll", []) onWindowScroll() {
    this.scrollFunction();
  }
  // When the user scrolls down 20px from the top of the document, show the button
  scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      document.getElementById("myBtn").style.display = "block";
    } else {
      document.getElementById("myBtn").style.display = "none";
    }
  }

  // When the user clicks on the button, scroll to the top of the document
  topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

  }

  addCartCoupon(coupon, operation) {
    if (operation === 'ADD') {
      this.couponList.push(coupon);
    }
    if (operation === 'REMOVE') {
      const index = this.couponList.indexOf(coupon);
      this.couponList.splice(index, 1);
      if (coupon.couponType === "PRODUCT") {

        this.cartItemsList.map((item, i) => {
          this.cartItemsList[i].coupons.map((item, index) => {
            if (item.couponId === coupon.couponId) {
              this.cartItemsList[i].coupons.splice(index, 1);
            }
          })
        })

      }
    }
    this.cartService.editCartCoupon(this.couponList).then(res => {
      this.getCouponAmount(this.couponList, this.subTotal);
      this.addBusinessDiscount(this.subTotal);
    }).catch(err => {
    });

  }

  getCartCouponList(subTotal) {
    this.cartService.getCartCouponList().subscribe(res => {
      if (res.exists && res.data()["coupons"]) {
        this.couponList = res.data()["coupons"];
        this.getCouponAmount(res.data()["coupons"], subTotal);
      }
    })
  }

  getCouponAmount(coupons, subTotal) {
    this.couponAmt = 0;
    if (coupons.length) {
      var amount = coupons.map(coupon => {
        if (coupon.couponType === "PRODUCT" && coupon.hasOwnProperty('productId') && coupon.productId.length) {
          coupon.productId.map(productId => {
            var product = this.cartItemsList.filter(cart => cart.productdocId === productId)[0];
            if (this.cartItemsList.length) {
              var index = this.cartItemsList.indexOf(product);
              this.cartItemsList[index] = Object.assign(this.cartItemsList[index], { "coupons": [coupon] });
              if (coupon.couponUomType === "PERCENTAGE") {
                var productPrice = product.productPrice;
                var quantity = product.quantity;
                return parseFloat((((productPrice * quantity) * coupon.couponValue / 100)).toFixed(2));
              }
            }
          })
        }
        if (coupon.couponUomType === "FLAT RATE") {
          return parseFloat((coupon.couponValue).toFixed(2));
        }
        if (coupon.couponUomType === "PERCENTAGE") {
          return parseFloat(((subTotal * coupon.couponValue / 100)).toFixed(2));
        }
      })
      var sum = amount.reduce((a, b) => a + b, 0)
      sum = parseFloat(sum.toFixed(2));
      this.couponAmt = sum;
    } else {
      this.couponAmt = 0
    }

  }
  allowedMaxQtyCheck(qty, index) {
    if (this.cartItemsList[index].hasOwnProperty('coupons') && this.cartItemsList[index].coupons.length) {
      this.cartItemsList[index]["coupons"].map((coupon, i) => {
        if (qty + 1 > coupon["maxQtyAllowed"]) {
          this.cartItemsList[index].coupons.splice(i, 1);
          this.couponList.splice(i, 1);
        }
      });
      this.cartService.editCartCoupon(this.couponList);
    }
  }
  // Tax 
  getHsnSacCodeList() {
    this.hsnSacCodeService.getHsnSacCodeList().subscribe(item => {
      this.hsnSacCodeList = item.docs.map(list => {
        return {
          hsnSacCodeId: list.id,
          ...list.data()
        }
      });
      this.calculateTaxAmount(this.cartItemsList, this.hsnSacCodeList)
    });
  }
  calculateTaxAmount(cartItem, hsnCodeList) {
    if (cartItem && cartItem.length) {
      var amount = cartItem.map((cart, index) => {
        if (cart.hsnSacCode && hsnCodeList && hsnCodeList.length) {
          var hsn = hsnCodeList.filter(item => item.hsnSacCode === cart.hsnSacCode)[0];
          if ((hsn !== undefined && (hsn.igstRatePer == 0 || hsn.igstRatePer == null))) {
            if (hsn.cgstRatePer == null) {
              hsn.cgstRatePer = 0;
            }
            if (hsn.sgstRatePer == null) {
              hsn.cgstRatePer = 0;
            }
            var cgst = parseFloat((cart.quantity * cart.productPrice * ((hsn.cgstRatePer + hsn.sgstRatePer) / 100)).toFixed(2));
            this.cartItemsList[index]["tax"] = cgst;
            return cgst;
          }
          else {
            var igst = parseFloat((cart.quantity * cart.productPrice * ((hsn.igstRatePer) / 100)).toFixed(2))
            this.cartItemsList[index]["tax"] = igst;
            return igst;
          }
        } else {
          this.cartItemsList[index]["tax"] = 0;
        }
      })
      var amount = amount.map(item => item === undefined ? 0 : item);
      var sum = amount.reduce((a, b) => a + b, 0)
      sum = parseFloat(sum.toFixed(2));
      this.taxAmount = sum;
    } else {
      this.taxAmount = 0;
    }
  }

  addBusinessDiscount(subTotal) {
    this.businessDiscount = 0;
    this.businessDiscount = JSON.parse(localStorage.getItem('userProfile'))["businessDiscountRate"];
    if (subTotal && this.businessDiscount) {
      this.businessDiscount = parseFloat(((subTotal * this.businessDiscount / 100)).toFixed(2));
    } else {
      this.businessDiscount = 0;
    }
  }
  calculateUsdTaxAmount(cartItem) {
    this.federalTaxAmtArray = [];
    this.stateTaxAmtArray = [];
    this.salesTaxAmtArray = [];
    this.vatArray = [];
    if (cartItem && cartItem.length) {
      var amount = cartItem.map((cart, index) => {
        if (this.companyConfig.taxationStandard) {
          this.companyConfig.taxationStandard.stateTaxRate == null ?
            this.companyConfig.taxationStandard.stateTaxRate = 0 : this.companyConfig.taxationStandard.stateTaxRate;
          this.companyConfig.taxationStandard.federalTaxRate == null ?
            this.companyConfig.taxationStandard.federalTaxRate = 0 : this.companyConfig.taxationStandard.federalTaxRate;
          this.companyConfig.taxationStandard.salesTaxRate == null ?
            this.companyConfig.taxationStandard.salesTaxRate = 0 : this.companyConfig.taxationStandard.salesTaxRate;
          this.companyConfig.taxationStandard.vat == null ?
            this.companyConfig.taxationStandard.vat = 0 : this.companyConfig.taxationStandard.vat;
            
            this.federalTaxAmtArray.push(parseFloat((cart.quantity * cart.productPrice * (this.companyConfig.taxationStandard.federalTaxRate / 100)).toFixed(2)));
            this.stateTaxAmtArray.push(parseFloat((cart.quantity * cart.productPrice * (this.companyConfig.taxationStandard.stateTaxRate / 100)).toFixed(2)));
            this.salesTaxAmtArray.push(parseFloat((cart.quantity * cart.productPrice * (this.companyConfig.taxationStandard.salesTaxRate / 100)).toFixed(2)));
            this.vatArray.push(parseFloat((cart.quantity * cart.productPrice * (this.companyConfig.taxationStandard.vat / 100)).toFixed(2)));

          var tax = parseFloat((cart.quantity * cart.productPrice * ((this.companyConfig.taxationStandard.stateTaxRate +
            this.companyConfig.taxationStandard.federalTaxRate +
            this.companyConfig.taxationStandard.salesTaxRate +
            this.companyConfig.taxationStandard.vat) / 100)).toFixed(2));
          this.cartItemsList[index]["tax"] = tax;
          return tax;
        }
        else {
          this.cartItemsList[index]["tax"] = 0;
          return 0;
        }
      })
      var amount = amount.map(item => item === undefined ? 0 : item);
      var sum = amount.reduce((a, b) => a + b, 0)
      sum = parseFloat(sum.toFixed(2));
      this.taxAmount = sum;

      var federalTaxAmt = this.federalTaxAmtArray.reduce((a, b) => a + b, 0)
      this.variousTax.federalTaxAmt = parseFloat(federalTaxAmt.toFixed(2));

      var stateTaxAmt = this.stateTaxAmtArray.reduce((a, b) => a + b, 0)
      this.variousTax.stateTaxAmt = parseFloat(stateTaxAmt.toFixed(2));

      var salesTaxAmt = this.salesTaxAmtArray.reduce((a, b) => a + b, 0)
      this.variousTax.salesTaxAmt = parseFloat(salesTaxAmt.toFixed(2));

      var vat = this.vatArray.reduce((a, b) => a + b, 0)
      this.variousTax.vat = parseFloat(vat.toFixed(2));

      // this.getVariousTax();
    } else {
      this.taxAmount = 0;
    }
  }
  // getVariousTax(){
  //   if (this.companyConfig.taxationStandard) {
  //     this.companyConfig.taxationStandard.stateTaxRate == null ?
  //           this.companyConfig.taxationStandard.stateTaxRate = 0 : this.companyConfig.taxationStandard.stateTaxRate;
  //         this.companyConfig.taxationStandard.federalTaxRate == null ?
  //           this.companyConfig.taxationStandard.federalTaxRate = 0 : this.companyConfig.taxationStandard.federalTaxRate;
  //         this.companyConfig.taxationStandard.salesTaxRate == null ?
  //           this.companyConfig.taxationStandard.salesTaxRate = 0 : this.companyConfig.taxationStandard.salesTaxRate;
  //         this.companyConfig.taxationStandard.vat == null ?
  //           this.companyConfig.taxationStandard.vat = 0 : this.companyConfig.taxationStandard.vat;

  //          this.variousTax.federalTaxAmt = parseFloat(((this.subTotal * this.companyConfig.taxationStandard.federalTaxRate) / 100 ).toFixed(2));
  //          this.variousTax.stateTaxAmt = parseFloat(((this.subTotal * this.companyConfig.taxationStandard.stateTaxRate) / 100 ).toFixed(2));
  //          this.variousTax.salesTaxAmt = parseFloat(((this.subTotal * this.companyConfig.taxationStandard.salesTaxRate) / 100 ).toFixed(2));
  //          this.variousTax.vat = parseFloat(((this.subTotal * this.companyConfig.taxationStandard.vat) / 100 ).toFixed(2));

  //   }
  // }
  switchTaxationStandard(cartItem?, hsn?) {
    var country = this.companyConfig.country;
    if (country.toString().toUpperCase() === "INDIA") {
      if (cartItem && cartItem.length && this.hsnSacCodeList.length) {
        this.calculateTaxAmount(cartItem, hsn);
      } else {
        this.getHsnSacCodeList();
      }
    } else {
      if (cartItem && cartItem.length) {
        this.calculateUsdTaxAmount(cartItem);
      }
    }
  }
  getFeaturedData(data: SlidesOutputData){
    this.carouselFeaturedSlide = data;
   }
  // getProductList(){
  //   this.productService.activeProducts().subscribe(product =>{
  //     this.productList = product.docs.map(list =>{
  //       return{
  //         productdocId : list.id, 
  //                      ...list.data()
  //       }as Product;
  //     })
  //   })
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
  productOverview(product,categoryList) {
    if(product){
     this.analyticsService.setLogEvent('views','product',product.productdocId,'other-delicacies');
    }
    // console.log(product);
    for(var i=0; i<categoryList.length; i++){
      if(categoryList[i].categoryId == +product.categoryId){
        this.router.navigate([`/products/${categoryList[i].deptId}/${product.categoryId}/` + product.productId]);
        this.topFunction();
      }
    }
  }
  addToCart(product) {
    if(product){
      var analyticsData = {
        "source" : "other-delicacies",
        "category-name" : product.categoryName,
        "quantity" : product.quantity + 1,
        "current-stock" : product.currentStock,
        "initial-stock" : product.initialStock,
        "product_name" : product.productName,
        "product-price" : product.productPrice,
        "product-doc-id" : product.productdocId,
      }
      this.analyticsService.setEcommerceEvent('e-commerce','add-to-cart',analyticsData);
    }
    if (product.currentStock > 0) {
      const obj = this.cartItemsList.find(o => o.productdocId === product.productdocId);
      if (this.userUid && obj == undefined) {
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').add(product)
          .then(docRef => {
            this.cartService.cartLength.next(this.cartItemsList.length + 1);
            let cartDocId = docRef.id;
            this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(cartDocId).update({ "CartDocId": cartDocId });
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
          });
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Added').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
          // }
      } else if (this.userUid && obj != undefined) {
         this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${obj.CartDocId}`).update({'quantity': (obj.quantity) + 1})
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'quantity_Updated').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
        // }
      }
      else {
        localStorage.setItem('cartItems',JSON.stringify(product));
          var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'purchase_Login').pop();
          var alertMsg = productAlert.alertMsgType;
          this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
        this.router.navigate(['/login']);
        this.topFunction();
      }
    } else {
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Not_Available').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
    }
    // console.log(product.quantity)
  }
}

