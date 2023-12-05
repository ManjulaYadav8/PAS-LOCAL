import { Component, HostListener, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';
import { Blog } from '../common/models/blog.model';
import { Carousel } from '../common/models/carousel.model';
import { Cart } from '../common/models/cart.model';
import { Category } from '../common/models/category.model';
import { Dept } from '../common/models/dept.model';
import { Product } from '../common/models/product.model';
import { Testimonials } from '../common/models/testimonials.model';
import { BlogService } from '../common/services/blog.service';
import { CarouselService } from '../common/services/carousel.service';
import { CartService } from '../common/services/cart.service';
import { CategoryService } from '../common/services/category.service';
import { DeptService } from '../common/services/dept.service';
import { ProductService } from '../common/services/product.service';
import { TestimonialsService } from '../common/services/testimonials.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { SideImageService } from '../common/services/side-image.service';
import { SideImage } from '../common/models/side-image.model';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { MetaTagService } from '../common/services/meta-tag.service';
import { AnalyticsService } from '../common/services/analytics.service';
import { CompanyService } from '../common/services/company.service';
import { LoginService } from '../common/services/login.service';
import { AlertMessageService } from '../common/services/alert-message.service';
import { AlertMessage } from '../common/models/alert-message.model';
import { SubCategoryService } from '../common/services/sub-category.service';
import { SubCategory } from '../common/models/sub-category.model';
import { TagsService } from '../common/services/tags.service';
import { Tags } from '../common/models/tags.model';
import { BannerService } from '../common/services/banner.service';
import { Banner } from '../common/models/banner.model';
declare var $ : any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  choosenProductIds = [];
  userProfile = null;
  companyConfig = null;
  carouselList: Carousel[];
  blogList: Blog[];
  testimonialList: Testimonials[];
  featuredProducts: Product[];
  ProductList: Product[];
  todaysSplList: Product[];
  upcomingProducts: Product[];
  cartItems: Cart[];
  wishItems: Cart[];
  categoryList: Category[];
  isMobile: boolean = false;
  orderConfig = null;
  sideImage: SideImage[];
  orderConfigLocal;
  blogSide;
  latestBlog;
  viewCart = false;
  preorderItem;
  deptId = 1;
  categoryId = 1;
  alertMessages: AlertMessage[];
  subCategoryList : SubCategory[];
  tagsList: Tags[];
  wishListProducts = [];
  carouseltestimonialSlide: SlidesOutputData;
  carouselFeaturedSlide: SlidesOutputData;
  bannerList: Banner[];
  testimonialOptions: OwlOptions = {
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
        items: 2
      },
      940: {
        items: 2
      }
    },
    nav: false,
  }
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
public userUid = JSON.parse(localStorage.getItem('userid'));
constructor(private carouselService: CarouselService, private blogService: BlogService, private testimonialService: TestimonialsService,
           private productService: ProductService, private router: Router, private firestore: AngularFirestore,
           private metaTagService : MetaTagService, private analyticsService : AnalyticsService,private companyService: CompanyService,
           private toastr: ToastrService, private categoryService: CategoryService,breakpointObserver: BreakpointObserver,
           private sideService: SideImageService,private loginService: LoginService,private cartService: CartService,
           private alertMsgService: AlertMessageService, private subcategoryService: SubCategoryService,
           private tagsService: TagsService, private bannerService: BannerService){
            breakpointObserver.observe([
              Breakpoints.Handset
            ]).subscribe(result => {
              this.isMobile = result.matches;
            });
}
ngOnInit(){
this.loginService.checkGuestUser().then(res => {
  this.metaTagService.setTitleMetaTag(this.router.url);
  this.getBusinessDiscount();
  this.getCompanyConfig();
  this.getOrderConfig();
  this.getCarouselList();
  this.getBlogList();
  this.getTestimonials();
  this.getFeaturedProducts();
  this.getUpcomingProducts();
  this.getCategoryList();
  this.getSubcategoryList();
  this.getCartList();
  this.getWishList();
  this.getSideList();
  this.getAlertMessages();
  this.getTagList();
  this.getBannerList();
})

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
getSubcategoryList(){
  this.subcategoryService.subcategory().subscribe(subcategory =>{
    this.subCategoryList = subcategory.docs.map(list =>{
      return{
        subcategoryDocId:list.id,
                        ...list.data()
      }as SubCategory
    })
  })
}
getTagList(){
  this.tagsService.tagList().subscribe(tags => {
    this.tagsList = tags.docs.map(item => {
      return {
        tagDocId: item.id,
        ...item.data() as {}
      } as Tags;
    })
  })
}
navigateCuisineRoute(cuisine){
  this.router.navigate(['/products/1','1'],{queryParams : {'tag' : cuisine.tagName}});
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
getTestimonialData(data: SlidesOutputData){
  this.carouseltestimonialSlide = data;
 }
 getFeaturedData(data: SlidesOutputData){
  this.carouselFeaturedSlide = data;
 }
getCarouselList(){
this.carouselService.getCarousel().subscribe(carousel =>{
  this.carouselList = carousel.map(list =>{
    return{
      carouselDocId: list.payload.doc.id,
                   ...list.payload.doc.data() as {}
    }as Carousel
  })
  this.carouselList.sort(function(a,b){
    return a.carouselId - b.carouselId
  })
})
}
getBlogList(){
  this.blogService.getBlog().subscribe(blog =>{
    this.blogList = blog.map(list =>{
      return{
        blogDocId : list.payload.doc.id,
               ...list.payload.doc.data() as {}
      }as Blog
    })
    this.getlatestBlog(this.blogList)
  })
}
getlatestBlog(blogList) {
  let blogLength = blogList.length
  for (var i = 0; i < blogList.length; i++) {
    if (blogLength == this.blogList[i].blogId) {
      this.latestBlog = blogList[i];
    }
  }
}
getTestimonials(){
  this.testimonialService.getTestimonialData().subscribe(testimonial =>{
    this.testimonialList = testimonial.map(list =>{
      return{
        testimonialDocId : list.payload.doc.id,
                          ...list.payload.doc.data() as {}
      }as Testimonials;
    })
  })
}
getFeaturedProducts(){
  this.productService.getFeaturedProducts().subscribe(featured =>{
    this.featuredProducts = featured.map(list =>{
      return{
        productdocId: list.payload.doc.id,
                    ...list.payload.doc.data() as {}
      }as Product;
    }).filter(item => item.inheritType != undefined  && item.inheritType === "Parent");
    this.featuredProducts.map((item, index) =>{
      if(this.wishListProducts.includes(item.productdocId)){
        this.featuredProducts[index]['wishlist'] = true;

      }else{
        this.featuredProducts[index]['wishlist'] = false;
      }
    } 
    )
  })
}
getUpcomingProducts(){
  this.productService.getUpcomingProducts().subscribe(upcoming =>{
   this.upcomingProducts = upcoming.map(list => {
     return{
       productdocId: list.payload.doc.id,
                  ...list.payload.doc.data() as {}
     }as Product
   }).filter(item => item.inheritType != undefined  && item.inheritType === "Parent");
  })
}
selectedfeaturedCategory(recipe){
 for(var i=0; i<this.categoryList.length; i++){
   if(recipe.categoryId == this.categoryList[i].categoryId){
     this.router.navigate([`/products/${this.categoryList[i].deptId}/${recipe.categoryId}`, recipe.productId]);
     this.topFunction();
   }
 }
 
//  console.log(recipe);
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
getWishList(){
  if(this.userUid){
  this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').get().subscribe(wishlist =>{
  this.wishItems = wishlist.docs.map(list =>{
    return{
      CartDocId: list.id,
                ...list.data()
    }as Cart;
  })
  this.wishListProducts = this.wishItems.filter(item => item.wishlist == true).map(item => item.productdocId);
  this.getFeaturedProducts();
  })
}
}
addtoWishlist(product, index){
  this.getWishList();
  if(this.userUid){
    if(product){
      var analyticsData = {
        "source" : "home",
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
        this.featuredProducts[index]['wishlist'] = true;
        product['addedCart'] = false;
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(product.productdocId).set(product)
          // .then(docRef => {
          //   let wishDocId = docRef.id;
          //   this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(wishDocId).update({ "wishDocId": wishDocId});
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
            this.featuredProducts[index]['wishlist'] = false;
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
addToCart(product, index) {
  if(this.userUid){
    if(product){
      var analyticsData = {
        "source" : "home",
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
      const obj = this.cartItems.find(o => o.productdocId === product.productdocId);
      if (this.userUid && obj == undefined) {
        this.viewCart = true;
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').add(product)
          .then(docRef => {
            this.cartService.cartLength.next(this.cartItems.length + 1);
            let cartDocId = docRef.id;
            this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(cartDocId).update({ "CartDocId": cartDocId });
          })
          .catch(function (error) {
            console.error("Error adding document: ", error);
          });
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Added').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
        let selectedItem = this.wishItems.find(item => item.productdocId === product.productdocId);
        if(selectedItem != undefined){
          this.featuredProducts[index]['wishlist'] = false;
          this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist').doc(selectedItem.productdocId).update({addedCart:true, wishlist:false});
        }
      } else if (this.userUid && obj != undefined) {
        this.viewCart = true;
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${obj.CartDocId}`).update({'quantity': (obj.quantity) + 1})
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
  }else {
      var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'purchase_Login').pop();
      var alertMsg = productAlert.alertMsgType;
      this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
      this.router.navigate(['/login']);
      this.topFunction();
  }
  // console.log(product.quantity)
}
getCategoryList(){
  this.categoryService.category().subscribe(category =>{
    this.categoryList = category.map(list =>{
      return{
        categoryDocId: list.payload.doc.id,
                      ...list.payload.doc.data() as {}
      }as Category;
    })
  })
}
getBusinessDiscount(){
  this.userProfile = JSON.parse(localStorage.getItem('userProfile'));
  if(!this.userProfile && this.userUid){
      this.firestore.collection('User').doc(this.userUid).get().subscribe(res => {
      var userProfile = {
       "userId" : res.id,
       ...res.data() as {}
      }

      if(userProfile["userType"] === "BUSINESS" && 
         userProfile["userSubType"] === "PRIMARY" && 
         userProfile.hasOwnProperty('businessDiscountRate')){
         
           var businessInd = { "businessDiscountRate" : Number(userProfile["businessDiscountRate"]),
                               "userType" : userProfile["userType"], 
                               "userSubType" : userProfile["userSubType"],
                               "companyName" : userProfile["companyName"],
                               "companyGst" : userProfile["companyGst"],
                               "companyCin" : userProfile["companyCin"],
                               "companyPan" : userProfile["companyPan"]};

           localStorage.setItem('userProfile',JSON.stringify(businessInd));

      }else if(userProfile["userType"] === "BUSINESS" && userProfile["userSubType"] === "DELEGATED"){
        if(userProfile.hasOwnProperty('primaryUserId')){
         this.firestore.collection('User').doc(userProfile["primaryUserId"]).get().subscribe(res => {
           var primaryUserProfie = {
             "userId" : res.id,
             ...res.data() as {}
            }
            if(primaryUserProfie.hasOwnProperty('businessDiscountRate')){
              
             var businessDel = { "businessDiscountRate" : Number(primaryUserProfie["businessDiscountRate"]),
                               "userType" : userProfile["userType"],
                               "userSubType" : userProfile["userSubType"],
                               "companyName" : userProfile["companyName"],
                               "companyGst" : userProfile["companyGst"],
                               "companyCin" : userProfile["companyCin"],
                               "companyPan" : userProfile["companyPan"] };
                
                localStorage.setItem('userProfile',JSON.stringify(businessDel));
            }
         })
        }
     }else{
       var  individual = { "businessDiscountRate" : Number(0),
                            "userType" : userProfile["userType"],
                            "userSubType" : userProfile["userSubType"] };

            localStorage.setItem('userProfile',JSON.stringify(individual));
     }
   })
 }
}
   getCompanyConfig(){
    this.companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
    // console.log(this.companyConfig);
    if(!this.companyConfig){
      this.firestore.collection('ConfigInfo').doc('config').get().subscribe(res => {
        var companyConfig = res.data();
        if(res.data()){

          var  configObject = { "companyName" : companyConfig["companyName"],
                              "country" : companyConfig["country"],
                              "isoCode" : companyConfig["isoCode"],
                              "phoneCode" : companyConfig["phoneCode"],
                              "currencyCode" : companyConfig["currencyCode"],
                              "currencySymbol" : companyConfig["currencySymbol"],   
                              "taxationStandard" : companyConfig["taxationStandard"],
                              "preOrderTime" : companyConfig["orderTimeSetting"],
                              "timeZone" : companyConfig["timeZone"],
                              "taxSetting" : companyConfig["taxSetting"],
                               "locationmap" : companyConfig["locationmap"],
                               "paypal" : companyConfig["paypal"]};
          localStorage.setItem('companyConfig',JSON.stringify(configObject));
          this.companyConfig = configObject;
        }
      })
      }
    
     }
     getOrderConfig(){
       this.orderConfigLocal = JSON.parse(localStorage.getItem('orderConfig'));
       if(!this.orderConfigLocal){
       this.companyService.getOrderConfig().subscribe(order =>{
         this.orderConfig = order.data();
         if(order.data()){
           var orderObject = {"orderPrefix": this.orderConfig["orderPrefix"],
                               "orderSuffix": this.orderConfig["orderSuffix"],
                               "eventPrefix": this.orderConfig["eventPrefix"],
                               "deliveryTime": this.orderConfig["deliveryTime"],
                               "eventSuffix": this.orderConfig["eventSuffix"],
                               "advanceBooking": this.orderConfig["advanceBooking"],
                               "nonPreorderDays":this.orderConfig["nonPreorderDays"]
                              };
          localStorage.setItem('orderConfig',JSON.stringify(orderObject));
         }
       })
      }
     }
   navigateRoute(category){
    if(category){
      this.analyticsService.setLogEvent('views','category',category.categoryDocId,'home');
    }
    this.topFunction();
    this.router.navigate([`/products/${category.deptId}`, category.categoryId])
  }
  getSideList() {
    this.sideService.getSideImg().subscribe(side => {
      this.sideImage = side.map(list => {
        return {
          sideImgDocId: list.payload.doc.id,
          ...list.payload.doc.data() as {}
        } as SideImage;
      })
      // console.log(this.sideList);
      this.getseparateside(this.sideImage);
    })
  }

  getseparateside(sideList) {
    for (var i = 0; i < sideList.length; i++) {
      if (sideList[i].sideType == 'blog') {
        this.blogSide = sideList[i].sideimgUrl;
      }      
    }
  }
  blogView(blogId){
    this.topFunction();
   this.router.navigate(['/blog',blogId])
  }
  selectAllProducts(){
    // this.router.navigate(['/products']);
    this.router.navigate([`/products/${this.deptId}`, this.categoryId])
    this.topFunction();
  }

  getBannerList(){
    this.bannerService.getPopupBanner().subscribe(banner =>{
     this.bannerList = banner.docs.map(list =>{
       return{
         bannerDocId:list.id,
                    ...list.data() as {}
       }as Banner
     })
     if(this.bannerList.length != 0){
     this.getPopupDetails(this.bannerList)
     }
    })
  }
  getPopupDetails(bannerList){
    // if(bannerList != undefined || bannerList.length != 0){
   var bannerFrom = (new Date(bannerList[0].bannerFrom).getTime())/60000;
   var bannerTo = (new Date(bannerList[0].bannerTo).getTime())/60000;
    var currentTime = (new Date().getTime())/60000;
    var ShowPopupfrom = (bannerFrom-currentTime);
    var HidePopupfrom = (bannerTo-currentTime);
    if(ShowPopupfrom <= 0 && HidePopupfrom >= -1440){
      $('#largeModal').modal('show');
    }
  }
  productNavigation(banner){
    this.analyticsService.setLogEvent('views','ad',banner.bannerDocId,'popup').then(res =>
      {
       this.router.navigate([banner.bannerNavigation])
      })
    // this.router.navigate([banner.bannerNavigation]);
  }
}
