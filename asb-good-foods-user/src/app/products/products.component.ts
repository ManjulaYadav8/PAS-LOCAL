import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';
import { AlertMessage } from '../common/models/alert-message.model';
import { Banner } from '../common/models/banner.model';
import { Cart } from '../common/models/cart.model';
import { Category } from '../common/models/category.model';
import { Dept } from '../common/models/dept.model';
import { Product } from '../common/models/product.model';
import { AlertMessageService } from '../common/services/alert-message.service';
import { AnalyticsService } from '../common/services/analytics.service';
import { BannerService } from '../common/services/banner.service';
import { CartService } from '../common/services/cart.service';
import { CategoryService } from '../common/services/category.service';
import { DeptService } from '../common/services/dept.service';
import { ProductService } from '../common/services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  deptList: Dept[];
  categoryList: Category[];
  bannerList: Banner[];
  productImage;
  productList: Product[];
  product;
  category;
  parentArray = [];
  childArray = [];
  deptId;
  userUid;
  viewCart = false;
  cartItemList: Cart[];
  choosenProductIds = [];
  alertMessages: AlertMessage[];
  carouselFeaturedSlide: SlidesOutputData;
  featuredOptions: OwlOptions = {
    loop: true,
    margin: 20,
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
    nav: false,
  }
  constructor(private deptService: DeptService, private categoryService: CategoryService,private router: Router,
    private bannerService: BannerService, private productService: ProductService , private analyticsService : AnalyticsService,
    private alertMsgService: AlertMessageService, private toastr: ToastrService, private firestore: AngularFirestore,
    private cartService: CartService) { }

  ngOnInit() {
    // this.getDeptList();
    this.getCategoryList();
    this.getAllProducts();
    this.getAlertMessages();
      this.userUid = JSON.parse(localStorage.getItem('userid'));
  }
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
  getFeaturedData(data: SlidesOutputData){
    this.carouselFeaturedSlide = data;
   }
  getCategoryList(){
    this.categoryService.category().subscribe(category =>{
     this.categoryList = category.map(list =>{
       return{
         categoryDocId: list.payload.doc.id,
                      ...list.payload.doc.data()
       }as Category;
     })
     this.categoryList.sort(function(a,b){
       return a.categoryId - b.categoryId;
     })
     this.getSeparatedCategory(this.categoryList);
    })
  }
  getSeparatedCategory(categoryList){
   this.category = categoryList;
  }
  getAllProducts(){
    this.productService.getActiveProducts().subscribe(products => {
      this.productList = products.docs.map(list =>{
        return{
          productdocId: list.id,
                       ...list.data()
        }as Product;
      })
      this.productList.sort(function(a,b){
        return a.priority - b.priority;
      })
      this.getSeparatedProducts(this.productList);
    })
  }
  getSeparatedProducts(productList){
    this.product = productList;
    this.parentArray = [];
    for (var i = 0; i < this.category.length; i++) {
      this.childArray = [];
      for (var j = 0; j < productList.length; j++) {
        if (this.category[i].categoryId == productList[j].categoryId) {
            productList.sort(function (a, b) {
              return a.priority - b.priority;
            })
            this.childArray.push(productList[j]);
        }
      }
      this.childArray.sort(function (a, b) {
        return a.priority - b.priority;
      })
      this.parentArray.push(this.childArray);
    }
  }
 
  productOverview(product) {
   for(var i=0; i<this.categoryList.length; i++){
     if(product.categoryId == this.categoryList[i].categoryId){
       this.deptId = this.categoryList[i].deptId;
     }
   }
    if(product){
      this.analyticsService.setLogEvent('views','product',product.productdocId,'product-list');
    }
    // console.log(product);
    this.router.navigate([`/products/${this.deptId}/${product.categoryId}/` + product.productId]);
    this.topFunction();
  }
  addToCart(product) {
    if(product){
      var analyticsData = {
        "source" : "product-list",
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
    this.choosenProductIds.push(product.productdocId);
    if (product.currentStock > 0) {
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').get().subscribe(cart => {
          this.cartItemList = cart.docs.map(list => {
            return {
              CartDocId: list.id,
              ...list.data()
            } as Cart;
          })
      const obj = this.cartItemList.find(o => o.productdocId === product.productdocId);
      if (this.userUid && obj == undefined) {
        this.viewCart = true;
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').add(product)
          .then(docRef => {
            this.cartService.cartLength.next(this.cartItemList.length + 1);
            let cartDocId = docRef.id;
            this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(cartDocId).update({ "CartDocId": cartDocId });
          })
          .catch(function (error) {
            // console.error("Error adding document: ", error);
          });
        // this.toastr.success('Product added successfully to the cart', ' Cart');
        for(var i=0; i<this.alertMessages.length; i++){
          if(this.alertMessages[i].alertMsgType == 'success' && this.alertMessages[i].alertMsgName == 'product_Added'){
            this.toastr.success(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
          }else if(this.alertMessages[i].alertMsgType == 'warning' && this.alertMessages[i].alertMsgName == 'product_Added'){
            this.toastr.warning(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
          }else if(this.alertMessages[i].alertMsgType == 'error' && this.alertMessages[i].alertMsgName == 'product_Added'){
            this.toastr.error(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
          }
        }
      } else if (this.userUid && obj != undefined) {
        this.viewCart = true;
         this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${obj.CartDocId}`).update({'quantity': (obj.quantity) + 1})
        // this.toastr.success('Quantity is updated', 'This Product');
        for(var i=0; i<this.alertMessages.length; i++){
          if(this.alertMessages[i].alertMsgType == 'success' && this.alertMessages[i].alertMsgName == 'quantity_Updated'){
            this.toastr.success(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
          }else if(this.alertMessages[i].alertMsgType == 'warning' && this.alertMessages[i].alertMsgName == 'quantity_Updated'){
            this.toastr.warning(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
          }else if(this.alertMessages[i].alertMsgType == 'error' && this.alertMessages[i].alertMsgName == 'quantity_Updated'){
            this.toastr.error(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
          }
        }
      }
      else {
        localStorage.setItem('cartItems',JSON.stringify(product));
        // this.toastr.warning("Login to Add to Cart","Please");
        for(var i=0; i<this.alertMessages.length; i++){
          if(this.alertMessages[i].alertMsgType == 'success' && this.alertMessages[i].alertMsgName == 'purchase_Login'){
            this.toastr.success(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
          }else if(this.alertMessages[i].alertMsgType == 'warning' && this.alertMessages[i].alertMsgName == 'purchase_Login'){
            this.toastr.warning(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
          }else if(this.alertMessages[i].alertMsgType == 'error' && this.alertMessages[i].alertMsgName == 'purchase_Login'){
            this.toastr.error(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
          }
        }
        this.router.navigate(['/login']);
        this.topFunction();
        }
     })
    } else {
      // this.toastr.warning("This product is not Available", "Currently");
      for(var i=0; i<this.alertMessages.length; i++){
        if(this.alertMessages[i].alertMsgType == 'success' && this.alertMessages[i].alertMsgName == 'product_Not_Available'){
          this.toastr.success(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
        }else if(this.alertMessages[i].alertMsgType == 'warning' && this.alertMessages[i].alertMsgName == 'product_Not_Available'){
          this.toastr.warning(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
        }else if(this.alertMessages[i].alertMsgType == 'error' && this.alertMessages[i].alertMsgName == 'product_Not_Available'){
          this.toastr.error(this.alertMessages[i].alertMsgText, this.alertMessages[i].alertMsgHeading);
        }
      }
    }
    // console.log(product.quantity)
  }
  // getDeptList(){
  //   this.deptService.dept().subscribe(dept =>{
  //     this.deptList = dept.map(list =>{
  //       return{
  //         deptDocId: list.payload.doc.id,
  //                  ...list.payload.doc.data()
  //       }as Dept;
  //     })
  //     this.deptList.sort(function(a,b){
  //       return a.deptId - b.deptId;
  //     })
  //   })
  // }

  // collectionDeptFun(dept) {
  //   this.categoryService.category().subscribe(category =>{
  //    this.categoryList = category.map(list =>{
  //      return{
  //        categoryDocId: list.payload.doc.id,
  //                     ...list.payload.doc.data()
  //      }as Category;
  //    })
  //    this.getSelectedCategory(this.categoryList, dept)
  //   })

  // }
  // getSelectedCategory(categoryList, dept){
  //   let subcatArray = [];
  //   let deptId = dept.deptId;
  //   let categoryId;
  //   for (var i = 0; i < categoryList.length; i++) {
  //     if (deptId == +categoryList[i].deptId) {
  //       subcatArray.push(categoryList[i].categoryId);
  //     }
  //   }
  //   subcatArray.sort(function (a, b) {
  //     return a - b;
  //   })
  //   // console.log(subcatArray);
  //   categoryId = subcatArray[0];
  //   // console.log(subcategoryId)
  //   // console.log(dept);
  //   // console.log(categoryList);
  //   if(dept.tradeType == 'purchase'){
  //     this.router.navigate([`/products/${deptId}`, categoryId]);
  //   }else{
  //     this.router.navigate(['/products/appointment']);
  //   }
    
  //   this.topFunction();
  // }

  // getBannerList() {
  //   this.bannerService.getBannerList().subscribe(banner => {
  //     this.bannerList = banner.map(list => {
  //       return {
  //         bannerDocId: list.payload.doc.id,
  //         ...list.payload.doc.data() as {}
  //       } as Banner
  //     })
  //     //  console.log(this.bannerList)
  //     this.getAbout(this.bannerList);
  //   })
  // }
  // getAbout(bannerList) {
  //   for (var i = 0; i < bannerList.length; i++) {
  //     if (bannerList[i].bannerType == 'products') {
  //       this.productImage = bannerList[i].bannerImage;
  //     }
  //   }
  // }
}
