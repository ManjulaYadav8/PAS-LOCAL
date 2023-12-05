import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';
import { AlertMessage } from 'src/app/common/models/alert-message.model';
import { Cart } from 'src/app/common/models/cart.model';
import { Category } from 'src/app/common/models/category.model';
import { Dept } from 'src/app/common/models/dept.model';
import { Product } from 'src/app/common/models/product.model';
import { Review } from 'src/app/common/models/review.model';
import { SubCategory } from 'src/app/common/models/sub-category.model';
import { AlertMessageService } from 'src/app/common/services/alert-message.service';
import { AnalyticsService } from 'src/app/common/services/analytics.service';
import { CartService } from 'src/app/common/services/cart.service';
import { CategoryService } from 'src/app/common/services/category.service';
import { DeptService } from 'src/app/common/services/dept.service';
import { ProductService } from 'src/app/common/services/product.service';
import { SubCategoryService } from 'src/app/common/services/sub-category.service';
import { ReviewCommentsComponent } from '../review-comments/review-comments.component';

@Component({
  selector: 'app-product-overview',
  templateUrl: './product-overview.component.html',
  styleUrls: ['./product-overview.component.css']
})
export class ProductOverviewComponent implements OnInit {
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  userUid;
  deptId = 1;
  categoryId = 1;
  productId;
  avgRating = 0;
  productList: Product[];
  productUrl = [];
  tagNames = [];
  productData;
  productDocId;
  currentstock;
  productName;
  productDesc;
  productPrice
  reviewList: Review[];
  cartItems: Cart[];
  deptList: Dept[];
  categoryList: Category[];
  subcategoryList: SubCategory[];
  separatedCategoryList;
  selectedProductList : any[] = [];
  varientProducts : Product[] = [];
  dataLoading = false;
  starRating = [];
  unfilledStar = [];
  unfilledStarCount
  separatedProducts;
  categoryName;
  activeSlides: SlidesOutputData;
  viewCartStatus = [];
  selectedproductWeight;
  selectedproductSize;
  selectedprimaryUrl;
  defaultImg = false;
  preorderItem;
  preOrderType;
  productStarRatings = 0;
  productUnstarRatings = 0;
  calculateReviews;
  product;
  productStatus;
  alertMessages: AlertMessage[];
  wishItems: Cart[];
  wishListProducts = [];
  selectedwishlist = false;
  // weightType = [];
  // sizeType = [];
  // colorType = [];
  // selectedWeight = null;
  // selectedSize = null;
  // selectedColor = null;
  // selectedWeightUom = null;
  // selectedSizeUom = null;
  customOptions: OwlOptions = {
    loop: true,
    margin: 20,
    autoplay: true,
    autoplaySpeed: 1000,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ["<div class='btn btn-sm btn-success nextSlide'><</div>", "<div class='btn btn-sm btn-success nextSlide'>></div>"],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 3
      },
      940: {
        items: 3
      }
    },
    nav: true
  }
  constructor(private route: ActivatedRoute, private productService: ProductService, private firestore: AngularFirestore ,
    private toastr: ToastrService, private router: Router, private dialog: MatDialog, private deptService: DeptService,
    private analyticsService : AnalyticsService,private cartService: CartService,
    private categoryService: CategoryService, private subcategoryService: SubCategoryService,
    private alertMsgService: AlertMessageService ){ }
  ngOnInit(){
    this.defaultImg = false
    // console.log(this.companyConfig);
    this.route.params.subscribe(params => {
      this.deptId = params.list;
      this.productId = params.collectionId;
      this.categoryId = params['subId'];
      // console.log(this.productId);
    })
    this.productOverview(this.productId);
    // this.getRelatedProducts(this.categoryId);
    this.getUseruid();
    // this.getCategoryList();
    // this.getProductList();
    this.getCartList();
    this.getAlertMessages();
    this.getWishList();
    // this.hidingData();
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
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }
  getUseruid() {
    this.userUid = JSON.parse(localStorage.getItem('userid'));
  }
  getPassedData(data: SlidesOutputData) {
    this.activeSlides = data;
  }
  productOverview(productId){
    this.dataLoading = true;
    this.viewCartStatus = [];
    this.firestore.collection('ProductManagement').doc('Product').collection('ProductList', ref => ref.where("productId","==",+productId))
    .get().subscribe(product => {
        this.product = product.docs.map(list =>{
          return{
            productdocId: list.id,
                         ...list.data()
          }as Product;
        })
        if(this.product[0] && this.product[0]["productdocId"]){
          this.viewCartStatus.push({
            "productdocId" : this.product[0]["productdocId"],
            "status" : false
          })
        }
        if(this.product[0] && this.product[0]["copyProducts"] 
        && this.product[0]["copyProducts"] != undefined && this.product[0]["copyProducts"] != null){
          this.getProductVariants(this.product[0]["copyProducts"])
        }
        this.getSeparateProduct(this.product)
    })
  }
  getSeparateProduct(product){
    this.categoryName = product[0].categoryName;
    this.currentstock = product[0].currentStock;
    //// console.log(this.currentstock);
    this.productDocId = product[0].productdocId;
    this.productData = product[0];
    this.productName = product[0].productName;
    this.productDesc = product[0].description;
    this.productPrice = product[0].productPrice;
    this.selectedproductWeight = product[0].productWeight;
    this.selectedproductSize = product[0].productSize;
    this.preOrderType = product[0].preOrder;
    this.productStarRatings = product[0].ratings;
    this.starRating = [];    
    this.productStatus = product[0].productStatus;
     if(product[0].tagIds != undefined){
      this.tagNames = product[0].tagIds;
     }
    for(var k=0; k<this.productStarRatings; k++){
      this.starRating.push(k);
    }
    this.productUnstarRatings = 5 - this.productStarRatings;
    this.unfilledStar = [];
    for(var l=0; l<this.productUnstarRatings; l++){
      this.unfilledStar.push(k);
    }
    if(product[0].images != undefined){
      this.productUrl = [];
      this.defaultImg = false;
      for (var j = 0; j < product[0].images.length; j++) {
        this.productUrl.push(product[0].images[j]);
      }
    }else{
      this.productUrl = [];
      this.defaultImg = true;
      this.selectedprimaryUrl = product[0].primaryUrl;
    }
    if(product && product[0].associatedProductIds && product[0].associatedProductIds.length){
      this.selectedProductList = [];
      this.getRelatedProducts(product[0].associatedProductIds)
    }
    this.getWishList()
  }
  slideOverview(productId, categoryId,product){
    this.selectedProductList = [];
    if(product.productdocId){
      this.analyticsService.setLogEvent('views','product',product.productdocId,'related-product');
     }
this.productOverview(productId);
 this.topFunction();
this.router.navigate([`/products/${this.deptId}/${categoryId}`, productId]);
  }
  getRelatedProducts(productIds){
    productIds.map(productId => {
        this.firestore.collection('ProductManagement').doc('Product').collection('ProductList')
                      .ref.where('productdocId',"==",productId).get().then(res => {
                        if(!res.empty && res.docs){
                          this.selectedProductList.push(res.docs[0].data())
                        }
        })
      })
  }
  getProductVariants(variantProducts){
    this.varientProducts = [];
    variantProducts.map(product => {
      this.firestore.collection('ProductManagement').doc('Product').collection('ProductList', ref => ref.where("productdocId","==",product))
      .get().subscribe(one => {
        one.docs.map(list =>{
            this.varientProducts.push({
              productdocId: list.id,
                           ...list.data()
            }as Product);
          });
      })
      this.viewCartStatus.push({
        "productdocId" : product,
        "status" : false
      })
    })
    this.dataLoading = false;
  }
  // getPriceVariation(){
  //   this.weightType = [];
  //   this.sizeType =  [];
  //   this.colorType = [];

  //   var priceVariation = this.product[0].priceVariation.filter(item => 
  //     ((this.selectedWeight != null && this.selectedWeightUom != null) ? 
  //     (item["weight"] === this.selectedWeight && item["weightUom"] === this.selectedWeightUom) : true) &&
  //     ((this.selectedSize != null && this.selectedSizeUom != null) ?  
  //     (item["size"] === this.selectedSize && item["sizeUom"] === this.selectedSizeUom) : true) &&
  //     ((this.selectedColor != null) ? item["color"] === this.selectedColor : true));

  //   priceVariation.map(item => {
  //     if(item["weight"] != null && item["weightUom"] != null){
  //       var customWeight = {
  //         "weight" : item["weight"],
  //         "weightUom" : item["weightUom"]
  //       }
  //       if(!this.weightType.some(wt => wt["weight"] === customWeight["weight"] && wt["weightUom"] === customWeight["weightUom"])){
  //         this.weightType.push(customWeight);
  //       }
  //     }
  //     if(item["size"] != null && item["sizeUom"] != null){
  //       var customSize = {
  //         "size" : item["size"],
  //         "sizeUom" : item["sizeUom"]
  //       }
  //       if(!this.sizeType.some(sz => sz["size"] === customSize["size"] && sz["sizeUom"] === customSize["sizeUom"])){
  //         this.sizeType.push(customSize);
  //       }
  //     }
  //     if(item["color"] != null && !this.colorType.includes(item["color"])){
  //       this.colorType.push(item["color"]);
  //     }
  //   })
  //   console.log(this.colorType)
  //   if(this.weightType.length == 1){
  //     this.selectedWeight = this.weightType[0].weight;
  //     this.selectedWeightUom = this.weightType[0].weightUom;
  //   }
  //   if(this.sizeType.length == 1){
  //     this.selectedSize = this.sizeType[0].size;
  //     this.selectedSizeUom = this.sizeType[0].sizeUom;
  //   }
  //   if(this.colorType.length == 1){
  //     this.selectedColor = this.colorType[0].color;
  //   }
  //   if(priceVariation.length > 0 && (priceVariation[0].price != undefined || priceVariation[0].price != null)){
  //     this.productPrice = priceVariation[0].price;
  //   }
  // }
  // onWeightChoose(weightType){
  //   this.selectedWeight = weightType.weight;
  //   this.selectedWeightUom =  weightType.weightUom;
  //   this.getPriceVariation();
  // }
  // onSizeChoose(sizeType){
  //   this.selectedSize = sizeType.size;
  //   this.selectedSizeUom =  sizeType.sizeUom;
  //   this.getPriceVariation();
  // }
  // onColorChoose(color){
  //   this.selectedColor = color;
  //   this.getPriceVariation();
  // }
  // getProductPrice(){
  //   return (this.product[0].priceVariation as []).filter(item => 
  //       ((this.selectedWeight != null && this.selectedWeightUom != null) ? 
  //       (item["weight"] === this.selectedWeight && item["weightUom"] === this.selectedWeightUom) : true) &&
  //       ((this.selectedSize != null && this.selectedSizeUom != null) ?  
  //       (item["size"] === this.selectedSize && item["sizeUom"] === this.selectedSizeUom) : true) &&
  //       ((this.selectedColor != null) ? item["color"] === this.selectedColor : true));
  // }
  getWishList(){
    if(this.userUid){
    this.cartService.wishlist().subscribe(wishlist =>{
    this.wishItems = wishlist.docs.map(list =>{
      return{
        CartDocId: list.id,
                  ...list.data()
      }as Cart;
    })
    this.wishListProducts = this.wishItems.filter(item => item.wishlist == true).map(item => item.productdocId);
    this.selectedwishlist = this.wishListProducts.includes(this.productDocId)
  })
  }
  }
  addtoWishlist(product){
    this.getWishList();
    if(this.userUid){
    if(product){
      var analyticsData = {
        "source" : "product-overview",
        "category-name" : product.categoryName,
        "current-stock" : product.currentStock,
        "initial-stock" : product.initialStock,
        "product_name" : product.productName,
        "product-price" : product.productPrice,
        "product-doc-id" : product.productdocId,
      }
      this.analyticsService.setEcommerceEvent('e-commerce','add-to-wishlist',analyticsData);
    }
    const val = this.wishItems.find(o=> o.productdocId === product.productdocId);
        if (this.userUid && val == undefined) {
          this.selectedwishlist = true;
          product['addedCart'] = false;
          this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(product.productdocId).set(product)
            // .then(docRef => {
            //   let wishDocId = docRef.id;
            //   this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(wishDocId).update({ "wishDocId": wishDocId });
            // })
            // .catch(function (error) {
            //   console.error("Error adding document: ", error);
            // });
          var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'wishlist_Added').pop();
          var alertMsg = productAlert.alertMsgType;
          this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
        }else{
          for(var i=0; i<this.wishItems.length; i++){
            if(this.wishItems[i].productdocId === product.productdocId){
              this.selectedwishlist = false;
              this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(this.wishItems[i].productdocId).delete();
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
            }
          }
         }
      }else{
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'wishlist_Login').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
        this.router.navigate(['/login']);
        this.topFunction();
      }
  }
  getCartList() {
    if(this.userUid){
      this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').get().subscribe(cart => {
        this.cartItems = cart.docs.map(list => {
          return {
            CartDocId: list.id,
            ...list.data()
          } as Cart;
        })
      })
    }
  }
  addToCart(product,choosenDocId) {
    if(this.userUid){
      if(product){
        var analyticsData = {
          "source" : "product-overview",
          "category-name" : product.categoryName,
          "quantity" : product.quantity,
          "current-stock" : product.currentStock,
          "initial-stock" : product.initialStock,
          "product_name" : product.productName,
          "product-price" : product.productPrice,
          "product-doc-id" : product.productdocId,
        }
        this.analyticsService.setEcommerceEvent('e-commerce','add-to-cart',analyticsData);
      }
      if (product.currentStock > 0) {
        
        const obj = this.cartItems.find(o => o.productdocId === product.productdocId);
        if (this.userUid && obj == undefined) {
          this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').add(product)
            .then(docRef => {
              this.cartService.cartLength.next(this.cartItems.length + 1);
              let cartDocId = docRef.id;
              //// console.log( "Add" +this.cartDocId);
              this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(cartDocId).update({ "CartDocId": cartDocId });
            })
            .catch(function (error) {
              console.error("Error adding document: ", error);
            });
            var index = this.viewCartStatus.findIndex(item => item.productdocId === choosenDocId);
            this.viewCartStatus[index]["status"] = true;
              var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Added').pop();
              var alertMsg = productAlert.alertMsgType;
              this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
              let selectedItem = this.wishItems.find(item => item.productdocId === product.productdocId);
              if(selectedItem != undefined){
                this.selectedwishlist = false;
                this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(selectedItem.productdocId).update({addedCart:true, wishlist:false});
              }
     
        } else if (this.userUid && obj != undefined) {
          this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${obj.CartDocId}`).update({ 'quantity': (obj.quantity) + 1 })
          var index = this.viewCartStatus.findIndex(item => item.productdocId === choosenDocId);
          this.viewCartStatus[index]["status"] = true;
          var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'quantity_Updated').pop();
          var alertMsg = productAlert.alertMsgType;
          this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
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
    }
    else {
      var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'purchase_Login').pop();
      var alertMsg = productAlert.alertMsgType;
      this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
      this.router.navigate(['/login']);
      this.topFunction();
    }
  }
  reviewComments(row) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = { data: row };
    this.dialog.open(ReviewCommentsComponent, dialogConfig);
  }
  collectionBack(categoryId) {
    this.topFunction();
    this.router.navigate([`/products/${this.deptId}`, categoryId]);
  }
  // reviewComments(row) {
  //   console.log(row);

  // }
  // {
//   currentstock = 1;
//   productList: Product[];
//   selectedProduct;
//   productId;
//   otherImages = [];
//   activeSlides: SlidesOutputData;
//   selectedImage;
//   productDocId;
//   specificationData;
//   specificationsList;
//   noSpecification = false;
//   firstTableSpecification = [];
//   secondTableSpecification = [];
//   badgeImg;
//   warrantyList:Warranty[];
//   warrantyImg;
//   warrantyYear;
//   mrpPrice;
//   cartItems: Cart[];
//   userUid;
//   viewCartStatus = false
//    customOptions: OwlOptions = {
//     loop: true,
//     margin: 20,
//     autoplay: true,
//     autoplaySpeed: 1000,
//     mouseDrag: true,
//     touchDrag: true,
//     pullDrag: true,
//     dots: false,
//     navSpeed: 700,
//     navText: ["<div class='btn btn-sm   nextSlide'><i class='fa fa-angle-left fa-2x'></i></div>",
//     "<div class='btn btn-sm   nextSlide'><i class='fa fa-angle-right fa-2x'></i></div>"],
//     responsive: {
//       0: {
//         items: 3 
//       },
//       400: {
//         items: 3
//       },
//       740: {
//         items: 3
//       },
//       940: {
//         items: 3
//       }
//     },
//     nav: true
//   }
//   mobcustomOptions: OwlOptions = {
//     loop: true,
//     margin: 20,
//     autoplay: true,
//     autoplaySpeed: 1000,
//     mouseDrag: true,
//     touchDrag: true,
//     pullDrag: true,
//     dots: false,
//     navSpeed: 700,
//     navText: [""],
//     responsive: {
//       0: {
//         items: 3 
//       },
//       400: {
//         items: 3
//       },
//       740: {
//         items: 3
//       },
//       940: {
//         items: 3
//       }
//     },
//     nav: false
//   }
//   constructor(private productService: ProductService, private route: ActivatedRoute, private firestore: AngularFirestore,
//              private router: Router, private warrantyService:WarrantyService, private toastr: ToastrService) { }

//   ngOnInit() {
//    this.route.params.subscribe((params)=>{
//      this.productId = params['productId'];
//    })
//   //  console.log(this.productId.length);
//   this.getUseruid();
//   this.getCartList();
//    if(this.productId.length == 20){
//      this.getOffers();
//    }else{
//     this.getProductList();
//     this.getWarrantyData();
//    }
//   }
//   getUseruid() {
//     this.userUid = JSON.parse(localStorage.getItem('userid'));
//   }
//   @HostListener("window:scroll", []) onWindowScroll() {
//     this.scrollFunction();
//   }
//   // When the user scrolls down 20px from the top of the document, show the button
// scrollFunction() {
//     if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
//         document.getElementById("myBtn").style.display = "block";
//     } else {
//         document.getElementById("myBtn").style.display = "none";
//     }
// }

// // When the user clicks on the button, scroll to the top of the document
// topFunction() {
//     document.body.scrollTop = 0; // For Safari
//     document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
// }
// getWarrantyData(){
//   this.warrantyService.getWarrantyList().subscribe(warranty=>{
//     this.warrantyList = warranty.map(list=>{
//       return{
//         warrantyDocId:list.payload.doc.id,
//                       ...list.payload.doc.data() as {}
//       }as Warranty;
//     })
//   this.separateWarrantyImg(this.warrantyList);
//   })
// }
//   getPassedData(data: SlidesOutputData) {
//     this.activeSlides = data;
//   }
//   getProductList(){
//     this.productService.product().subscribe(product =>{
//       this.productList = product.map(list =>{
//         return{
//           productdocId: list.payload.doc.id,
//             ...list.payload.doc.data() as {}
//         }as Product;
//       })
//       this.ProductsBOCategoryId(this.productList);
//       // console.log(this.productList);
//     })
//   }


// ProductsBOCategoryId(products){
// for(var i=0; i<products.length; i++){
//    if(+products[i].productId == this.productId){
//    this.selectedProduct = products[i];
//    this.selectedImage = this.selectedProduct.primaryUrl;
//    this.productDocId = this.selectedProduct.productdocId;
//     this.warrantyYear = this.selectedProduct.warrantyYear;
//     this.currentstock = this.selectedProduct.currentStock;
//     this.otherImages = [];
//     if(products[i].images != undefined){
//     for(var j=0; j<products[i].images.length; j++){
//         this.otherImages.push(products[i].images[j]);
//     }
//   }
//   } 

// }
// this.mrpPrice = this.selectedProduct.productCost;
// this.getProductSpecification();
// }
// separateWarrantyImg(warrantyList){
// for(var i=0; i<warrantyList.length; i++){
//   if(warrantyList[i].warrantyYear == this.warrantyYear){
//     this.warrantyImg = warrantyList[i].warrantyUrl;
//   }
// }
// }
// getCartList() {
//   this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').snapshotChanges().subscribe(cart => {
//     this.cartItems = cart.map(list => {
//       return {
//         CartDocId: list.payload.doc.id,
//         ...list.payload.doc.data()
//       } as Cart;
//     })
//   })
// }
// selectingImage(url){
// this.selectedImage = url;
// }
// getProductSpecification(){
//   this.firestore.collection('ProductManagement').doc('Product').collection('specifications').doc(this.productDocId).snapshotChanges()
//   .subscribe(category =>{
//     this.specificationData = category.payload.data();
//     this.specificationsList = this.specificationData.specifications;
//       this.separateSpecification(this.specificationsList);
//   })
// }
// separateSpecification(specificationList){
//   // console.log(specificationList)
// if(specificationList != undefined){
// if((specificationList.length)% 2 == 0){
//   let a = (specificationList.length) / 2;
//   // console.log(a);
//   this.firstTableSpecification = [];
//   for(var i=0; i<a; i++){
//     this.firstTableSpecification.push(specificationList[i]);
//   }
//   this.secondTableSpecification = [];
//   for(var j=a; j<specificationList.length; j++){
//     this.secondTableSpecification.push(specificationList[j]);
//   }
// }else{
//   let a = (specificationList.length - 1) / 2;
//   // console.log(a);
//   this.firstTableSpecification = [];
//    a = a+1;
//   for(var i=0; i<a; i++){
//     this.firstTableSpecification.push(specificationList[i]);
//   }
//   // console.log(this.firstTableSpecification)
//   this.secondTableSpecification = [];
//   for(var j=a; j<specificationList.length; j++){
//     this.secondTableSpecification.push(specificationList[j]);
//   }
//   // console.log(this.secondTableSpecification)
// }
// }else{
//   // console.log(this.noSpecification);
//   this.noSpecification = true;
// }
// }
// categorySelecting(categoryId){
//   // console.log(categoryId)
//  this.router.navigate(['/products',categoryId]);
// }
// getOffers(){
//   this.firestore.collection('Offers').doc('Offer').collection('OfferList').doc(this.productId).snapshotChanges().subscribe(offers=>{
//    this.selectedProduct = offers.payload.data();
//    this.selectedImage = this.selectedProduct.primaryUrl;
//    this.productDocId = this.selectedProduct.productdocId;
//    this.otherImages = [];
//    for(var j=0; j<this.selectedProduct.images.length; j++){
//      this.otherImages.push(this.selectedProduct.images[j]);
//    }
//    this.getSpecifications()
//  })
//  } 
//  getSpecifications(){
//    this.firestore.collection('Offers').doc('Specifications').collection('SpecificationList').doc(this.productId).snapshotChanges()
//    .subscribe(category =>{
//      this.specificationData = category.payload.data();
//      this.specificationsList = this.specificationData.specifications;
//      this.separateSpecification(this.specificationsList);
//    })
//  }
// }
viewCart(){
  this.router.navigate(['/cart']);
  this.topFunction();
}
}