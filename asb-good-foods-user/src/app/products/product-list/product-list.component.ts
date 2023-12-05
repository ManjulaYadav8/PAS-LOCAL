import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { MatAccordion, MatAutocompleteSelectedEvent } from '@angular/material';
import {MatChipInputEvent} from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { SlidesOutputData, OwlOptions } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AlertMessage } from 'src/app/common/models/alert-message.model';
import { Cart } from 'src/app/common/models/cart.model';
import { Category } from 'src/app/common/models/category.model';
import { Dept } from 'src/app/common/models/dept.model';
import { Product } from 'src/app/common/models/product.model';
import { SubCategory } from 'src/app/common/models/sub-category.model';
import { Tags } from 'src/app/common/models/tags.model';
import { AlertMessageService } from 'src/app/common/services/alert-message.service';
import { AnalyticsService } from 'src/app/common/services/analytics.service';
import { CartService } from 'src/app/common/services/cart.service';
import { CategoryService } from 'src/app/common/services/category.service';
import { DeptService } from 'src/app/common/services/dept.service';
import { LoginService } from 'src/app/common/services/login.service';
import { MetaTagService } from 'src/app/common/services/meta-tag.service';
import { ProductService } from 'src/app/common/services/product.service';
import { SubCategoryService } from 'src/app/common/services/sub-category.service';
import { TagsService } from 'src/app/common/services/tags.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  dataLoading = false;
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  categoryList: Category[];
  deptList : Dept[];
  activeDept = "Daily Menu";
  subcategoryList: SubCategory[];
  productList: Product[];
  dept = {};
  deptId = null;
  selectedCategoryList;
  selectedCategoryName;
  selectedCategoryId;
  selectedIndex;
  selectedsubIndex;
  config;
  deptName;
  sortVariable = "Popularity";
  finalData = [];
  selectedSubcat = [];
  selectedSubcategory = [];
  separatedSubcat;
  selectedProduct;
  categoryId = null;
  categoryName;
  selectedItemList = [];
  subcategoryId;
  activeSlides: SlidesOutputData;
  carouselFeaturedSlide: SlidesOutputData;
  selectedItems = [];
  subcategoryName;
  orderData;
  productData;
  noOfSlots: number = 1;
  cartItems = [];
  cartItemList: Cart[];
  viewCart = false;
  orderperDay;
  choosenProductIds = [];
  wishListProducts = [];
  tagsList: Tags[];
  wishItems: Cart[];
  preorderItem;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedTags = [];
  allTagsList ;
  tagCtrl = new FormControl();
  filteredTags: Observable<string[]>;
  addOnBlur = true;
  taggedProduct = [];
  selectedFInalData = [];
  localTagItems;
  // allTags =[];
  

  // calendarOptions: CalendarOptions = {
  //   initialView: 'dayGridMonth',
  //   events: [
  //     { title: 'event 1', date: '2021-05-30' },
  //     { title: 'event 2', date: '2021-05-28' }
  //   ]
  // };

  // handleDateClick(arg) {
  //   alert('date click! ' + arg.dateStr)
  // }
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
    navText: ["<div class='btn btn-sm btn-success nextSlide'><</div>", "<div class='btn btn-sm btn-success nextSlide'>></div>"],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 2
      },
      940: {
        items: 2
      }
    },
    nav: true,
  }
  date;
  month;
  year;
  todaysDate;
  userUid;
  type;
  alertMessages : AlertMessage[]; 
  @ViewChild('accordion', { static: true }) Accordion: MatAccordion;
  @ViewChild('tagInput',{static:true}) tagInput: ElementRef<HTMLInputElement>;
  constructor(private subcategoryService: SubCategoryService, private productService: ProductService,
    private deptService: DeptService,private metaTagService : MetaTagService,private loginService: LoginService,
    private analyticsService : AnalyticsService, private relatimeDb: AngularFireDatabase,
    private route: ActivatedRoute, private router: Router, private categoryService: CategoryService,
    private toastr: ToastrService, private firestore: AngularFirestore,private cartService : CartService,
    private alertMsgService: AlertMessageService, private tagsService: TagsService) {    }

  ngOnInit() {
    this.route.queryParams.subscribe(res => {
      this.type = res.tag;
    });
    this.config = {
      id: 'custom',
      itemsPerPage: 2,
      currentPage: 1,
      totalItems: 2
    };
    this.loginService.checkGuestUser().then(res => {
      this.getCompanyConfig();
      this.metaTagService.setTitleMetaTag(this.router.url);
      this.getUseruid();
      if(JSON.parse(localStorage.getItem('companyConfig'))){
        this.date = parseInt(new Date().toLocaleString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split("/")[1]);
        this.month = parseInt(new Date().toLocaleString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split("/")[0]);
        this.year = parseInt(new Date().toLocaleString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split(",")[0].split("/").pop());
        this.todaysDate = this.date + "-" + this.month + "-" + this.year;
      }
      this.route.params.subscribe((params) => {
        if(params && params.list && params.subId){
          this.deptId = parseInt(params['list']);
          this.categoryId = parseInt(params['subId']);
        }else{
          this.deptId = 1;
          this.categoryId = 1;
        }
      })
      this.getDeptList();
      this.getSubcategoryList();
      this.changeColor(this.categoryId);
      this.getAlertMessages();
      this.getWishList();
      this.getTagList();
      this.selectedFInalData = [];
    });
    
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
  closeAllPanels() {
    this.Accordion.closeAll();
  }
  openAllPanels() {
    this.Accordion.openAll();
  }
  changeColor(i) {
    this.selectedIndex = i;
  }
  changesubcatColor(i) {
    this.selectedsubIndex = i;
  }
  getPassedData(data: SlidesOutputData) {
    this.activeSlides = data;
  }
  getDeptList() {
    this.deptService.dept().subscribe(dept => {
      this.deptList = dept.map(list => {
        return {
          deptDocId: list.payload.doc.id,
          ...list.payload.doc.data()
        } as Dept;
      })
      this.dept = this.deptList.filter(dept => dept.deptName  === this.activeDept)[0];
      if(this.deptId == null){
        this.deptId = this.dept["deptId"];
      }
      this.getCategoryByDept(this.dept);
    })
  }
  getCategoryByDept(dept) {
    this.categoryService.getCategoryByDept(dept).then(category => {
      this.categoryList = category.docs.map(list => {
        return {
          categoryDocId: list.id,
          ...list.data()
        } as Category;
      })

      this.getSelectedCategory(this.categoryList,dept);
      this.getSelectedcategoryList(this.categoryList)
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

      this.allTagsList = this.tagsList.map(list => list.tagName);
      localStorage.setItem('tagList',JSON.stringify(this.tagsList));
      if(this.type != undefined){
       this.selectedTags.push(this.tagsList.find(item => item.tagName === this.type));
      }else{
        this.selectedTags = this.tagsList;
      }
    
      this.filteredTags = this.tagCtrl.valueChanges.pipe(
        startWith(null),
        map((tag: string | null) => tag ? this._filter(tag) : this.selectedTags.slice()));
    })
    this.localTagItems = JSON.parse(localStorage.getItem('tagList'));
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.selectedTags.push(value);
    }
  }
  remove(tag: string): void {
    this.localTagItems = JSON.parse(localStorage.getItem('tagList'));
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
    this.getTagedProduct()
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedTags.push(event.option.value);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
    this.getTagedProduct();
  }
  // remove(tag, i): void {
  //   const index = this.allTags.indexOf(tag);
  //   if (i >= 0) {
  //     this.allTags.splice(i, 1);
  //   }
  //  this.getTagedProduct()
  // }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTagsList.filter(tag => tag.toLowerCase().includes(filterValue));    
  }

  getIntoDept(dept){
    // firebase.default.analytics().logEvent('view_item',dept);
    // this.angularFireAnalytics.logEvent('view_item',dept).then(res => {
    //       console.log(res)
    // });
    this.activeDept = dept.deptName;
    this.getCategoryByDept(dept);
  }
  getSelectedCategory(categoryList, dept){
    let subcatArray = [];
    let deptId = dept.deptId;
    let categoryId;
    for (var i = 0; i < categoryList.length; i++) {
      if (deptId == +categoryList[i].deptId) {
        subcatArray.push(categoryList[i].categoryId);
      }
    }
    subcatArray.sort(function (a, b) {
      return a - b;
    })
    if(this.categoryId == null){
      categoryId = subcatArray[0];
      this.categoryId = categoryId;
    }
    if(dept.tradeType == 'purchase'){
      // this.router.navigate([`/products/${this.deptId}`, this.categoryId]);
    }else{
      if(this.userUid){
        this.router.navigate(['/products/appointment']);
      } else{
      var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'event_Login').pop();
      var alertMsg = productAlert.alertMsgType;
      this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
        this.router.navigate(['/login']);
      } 
    } 
    this.topFunction();
  }
  getSelectedcategoryList(categoryList) {
    if(categoryList.length){
      this.selectedSubcat = categoryList;
      if(this.categoryId == null){
        this.categoryId = this.selectedSubcat[0].categoryId;
      }
      this.deptName = categoryList[0].deptName;
      this.categoryName = categoryList[0].categoryName;
      this.selectedSubcat.sort(function (a, b) {
        return a.categoryId - b.categoryId;
      })
      let obj = this.selectedSubcat.find(x => x.categoryId == this.categoryId);
      let index = this.selectedSubcat.indexOf(obj);
      this.selectedIndex = index;
      this.getProductList(this.categoryId);
    }
  }
  getSubcategoryList() {
    this.subcategoryService.subcategory().subscribe(subcat => {
      this.subcategoryList = subcat.docs.map(list => {
        return {
          subcategoryDocId: list.id,
          ...list.data()
        } as SubCategory
      })
      this.subcategoryList.sort(function (a, b) {
        return a.subcategoryId - b.subcategoryId;
      })
      // console.log(this.subcategoryList)
      // this.selectedSubcategoryList(this.subcategoryList);
    })
  }
  selectedSubcategoryList(subcategoryList) {
    this.separatedSubcat = subcategoryList;
    this.selectedSubcategory = [];
    if(subcategoryList.length != undefined){
      for (var i = 0; i < subcategoryList.length; i++) {
        for (var j = 0; j < subcategoryList[i].category.length; j++) {
          if (this.categoryId == +subcategoryList[i].category[j].categoryId) {
            this.selectedSubcategory.push(subcategoryList[i])
          }
        }
      }
    }
   
  }
  getProductList(cartegoryId) {
    this.dataLoading = true;
    this.productService.getProductByCategory(cartegoryId).subscribe(product => {
      this.productList = product.docs.map(list => {
        return {
          productdocId: list.id,
          ...list.data()
        } as Product;
      })

      // var copyProducts =this.productList.filter(item => item.copyProducts != undefined || item.copyProducts != null)
      //                                   .map(product => product.copyProducts);
      // var copyProductIds = [...new Set([].concat(...copyProducts))];
      // var filteredProducts = this.productList.filter(product => !copyProductIds.includes(product));      
      var copyProducts =  this.productList.filter(item => item.inheritType != undefined  && item.inheritType === "Parent");
      this.selectedProducts(copyProducts);

    })
  }
  getTagedProduct(){

  //   this.taggedProduct = [];
  //  this.allTags.map(item => {
  //    this.finalData.map(product =>{
  //      if(product.tagIds != undefined && product.tagIds != null && product.tagIds.length > 0){
  //        if(product.tagIds.includes(item.tagDocId) && !this.taggedProduct.includes(product)){
  //          this.taggedProduct.push(product);
  //        }
  //      }
  //    })
  //  });
  //  if(this.taggedProduct.length > 0){
  //   this.finalData = this.taggedProduct;
  //  }
  // this.finalData = [];
  this.taggedProduct = [];
  var untaggedProducts = [];
  if(this.selectedTags.length > 0){
    for(var j=0; j<this.finalData.length; j++){
      if(this.finalData[j].tagIds != undefined){
        for(var k=0; k<this.finalData[j].tagIds.length; k++){
          for(var l=0; l<this.selectedTags.length; l++){
           if(this.selectedTags[l].tagName === this.finalData[j].tagIds[k]){
             if(!this.taggedProduct.includes(this.finalData[j])){
              this.taggedProduct.push(this.finalData[j]);
             }
           }else{
             untaggedProducts.push(this.finalData[j]);
           }
          }
      }
      }else{
        this.selectedTags = [];
        untaggedProducts.push(this.finalData[j]);
      }
  }
}
this.selectedFInalData = [];
  if(this.selectedTags.length === 0){
    this.selectedTags = this.localTagItems;
   this.selectedFInalData = this.finalData;
  }else{
    this.selectedFInalData = this.taggedProduct;
  }
  }
  selectedProducts(productList) {
    this.dataLoading = false;
    this.finalData = productList;
    
    this.finalData.map((item, index) =>{
      if(this.wishListProducts.includes(item.productdocId)){
        this.finalData[index]['wishlist'] = true;

      }else{
        this.finalData[index]['wishlist'] = false;
      }
    } 
    )
    this.finalData.sort(function (a, b) {
      return a.priority - b.priority;
    })
    this.sortVariable = "Popularity";
    this.finalData.sort((a, b) => Number(b.ratings) - Number(a.ratings));
    this.getTagedProduct();
  }
  highToLow() {
    this.sortVariable = "High to Low";
    this.finalData.sort((a, b) => Number(b.productPrice) - Number(a.productPrice));
  }
  lowToHigh() {
    this.sortVariable = "Low to High";
    this.finalData.sort((a, b) => Number(a.productPrice) - Number(b.productPrice));
  }
  popularity() {
    this.sortVariable = "Popularity";
    this.finalData.sort((a, b) => Number(b.ratings) - Number(a.ratings));
  }
  categorySelect(category) {
    this.dataLoading = true;
    if(category){
      this.analyticsService.setLogEvent('views','category',category.categoryDocId,'product-list');
    }
    this.finalData = [];
    this.categoryName = category.categoryName;
    this.selectedCategoryId = category.categoryId;
    this.getProductList(this.selectedCategoryId);
    document.body.scrollTop = 320; // For Safari
    document.documentElement.scrollTop = 320; // For Chrome, Firefox, IE and Opera
    this.router.navigate([`/products/${this.deptId}/` + this.selectedCategoryId]);
  }
  productOverview(product) {
    if(product){
      this.analyticsService.setLogEvent('views','product',product.productdocId,'product-list');
    }
    // console.log(product);
    this.router.navigate([`/products/${this.deptId}/${product.categoryId}/` + product.productId]);
    this.topFunction();
  }
  // selectedSubcatList(subcategoryId, subcategoryName) {
  //   this.subcategoryId = subcategoryId;
  //   this.subcategoryName = subcategoryName;
  //   console.log(subcategoryName);
  //   if (this.noOfSlots <= 1) {
  //     this.toastr.warning("Slots", "Please select number of");
  //   } else {
  //     this.getAvailability();
  //     this.getAvailabilityProducts();
  //   }
  // }
  // getAvailability() {
  //   this.firestore.collection('AppointmentManagement').doc(this.todaysDate).collection(this.subcategoryName).doc("orders").snapshotChanges()
  //     .subscribe(orders => {
  //       this.orderData = orders.payload.data();
  //       this.getSelectedSubOrders(this.orderData.subcategory);
  //     });
  // }
  // getAvailabilityProducts() {
  //   this.firestore.collection('AppointmentManagement').doc(this.todaysDate).collection(this.subcategoryName).doc("products").snapshotChanges()
  //     .subscribe(products => {
  //       this.productData = products.payload.data();
  //       console.log(this.productData);
  //       setTimeout(() => {
  //         this.getSelectedProductList(this.productData.product);
  //       }, 50)
  //     })
  // }
  getSelectedSubOrders(orderData) {
    this.orderperDay = orderData;
  }
  // getSelectedProductList(productData) {
  //   let selectedSubItems = [];
  //   for (var i = 0; i < this.selectedProduct.length; i++) {
  //     if (this.subcategoryId == +this.selectedProduct[i].subcategoryId) {
  //       selectedSubItems.push({ ...this.selectedProduct[i], "isChecked": false });
  //     }
  //   }
  //   for (var i = 0; i < this.orderperDay.length; i++) {
  //     if ((this.categoryName == this.orderperDay[i].categoryName) && (this.subcategoryName == this.orderperDay[i].subcategoryName)) {
  //       if (this.orderperDay[i].orders >= 1) {
  //         this.selectedItemList = [];
  //         for (var k = 0; k < productData.length; k++) {
  //           for (var j = 0; j < selectedSubItems.length; j++) {
  //             if ((this.noOfSlots <= productData[k].slots) && (productData[k].productId == selectedSubItems[j].productId)) {
  //               this.selectedItemList.push(selectedSubItems[j]);
  //             }
  //           }
  //         }
  //       } else {
  //         this.toastr.warning("Events are Booked", "All");
  //         this.selectedItemList = [];
  //       }
  //       console.log(this.orderperDay[i].orders);
  //     }
  //   }
  // }
  // onChange(item, checked, index) {
  //   this.selectedItemList[index] = Object.assign(item, { "isChecked": checked });
  // }
  // decrease() {
  //   this.noOfSlots--
  // }
  // increase() {
  //   this.noOfSlots++;
  // }
  // blurEvent(event: any) {
  //   this.noOfSlots = event.target.value;
  // }
  getUseruid() {
    this.userUid = JSON.parse(localStorage.getItem('userid'));
  }
  // addtoCart() {
  //   let cartData;
  //   for (var i = 0; i < this.selectedItemList.length; i++) {
  //     if (this.selectedItemList[i].isChecked == true) {
  //       this.cartItems.push(this.selectedItemList[i]);
  //     }
  //   }
  //   // console.log(this.cartItems);
  //   // console.log(this.categoryName);
  //   // console.log(this.subcategoryName);
  //   cartData = Object.assign({}, { "categoryName": this.categoryName },
  //     { "subcategoryName": this.subcategoryName }, { "slots": this.noOfSlots });
  //   if (this.userUid) {
  //     this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Appointment').doc(this.categoryName + "-" + this.subcategoryName).
  //       set(cartData)
  //     for (var i = 0; i < this.cartItems.length; i++) {
  //       this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Appointment').doc(this.categoryName + "-" + this.subcategoryName)
  //         .update({
  //           cartItems: firebase.default.firestore.FieldValue.arrayUnion(this.cartItems[i])
  //         })
  //     }
  //   } else {
  //     this.router.navigate(['/login']);
  //   }
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
    // this.getProductList(this.categoryId);
    })
  }
  }
  addtoWishlist(product, index){
    if(this.userUid){
    this.getWishList();
    if(product){
      var analyticsData = {
        "source" : "product-list",
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
          product['addedCart'] = false;
          this.finalData[index]['wishlist'] = true;
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
              this.finalData[index]['wishlist'] = false;
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
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Added').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
        let selectedItem = this.wishItems.find(item => item.productdocId === product.productdocId);
        if(selectedItem != undefined){
          this.finalData[index]['wishlist'] = false;
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
     })
    } else {
      var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Not_Available').pop();
      var alertMsg = productAlert.alertMsgType;
      this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
    }
    // console.log(product.quantity)
  }
  getCompanyConfig(){
    if(!JSON.parse(localStorage.getItem('companyConfig'))){
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
          this.date = parseInt(new Date().toLocaleString('en-US', { timeZone: `${this.companyConfig.timeZone}`}).split("/")[1]);
          this.month = parseInt(new Date().toLocaleString('en-US', { timeZone: `${this.companyConfig.timeZone}`}).split("/")[0]);
          this.year = parseInt(new Date().toLocaleString('en-US', { timeZone: `${this.companyConfig.timeZone}`}).split(",")[0].split("/").pop());
          this.todaysDate = this.date + "-" + this.month + "-" + this.year;
        }
      })      
      }      
     }      
  // getProductReport(productName,date){ //productName: "Red Chutney"      
  //  this.relatimeDb.database.ref('Metadata').child('Product').child('Product')
  //                           .child('ProductList').orderByChild('productName')
  //                           .equalTo(productName).get().then(res => {
  //     var product = res.val();
  //     var productId = Object.keys(product)[0];
  //     this.relatimeDb.database.ref(date).child('views').child('product').child(productId).get().then(res => {
  //       var report = Object.values(res.val());
  //       console.log(report);
  //     })
  //   })
  // }
}
