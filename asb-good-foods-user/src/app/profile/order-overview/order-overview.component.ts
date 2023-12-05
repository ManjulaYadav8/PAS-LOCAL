import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, take } from 'rxjs/operators';
import { AlertMessage } from 'src/app/common/models/alert-message.model';
import { Cart } from 'src/app/common/models/cart.model';
import { Review } from 'src/app/common/models/review.model';
import { AlertMessageService } from 'src/app/common/services/alert-message.service';
import { AnalyticsService } from 'src/app/common/services/analytics.service';
import { ReviewService } from 'src/app/common/services/review.service';
declare var jQuery: any;

@Component({
  selector: 'app-order-overview',
  templateUrl: './order-overview.component.html',
  styleUrls: ['./order-overview.component.css']
})
export class OrderOverviewComponent implements OnInit {

  activatedRoute;
  order;
  viewData;
  reviewId;
  rating =0;
  productRatingValue;
  pilledRating =[];
  unpilledRating = [];
  starValue;
  productId;
  userId;
  imgSrc: string ;
  selectedImage: any = null;
  imageUrl;
  userList;
  userName;
  date = new Date();
  selectedImgName;
  reviewList: Review[];
  reviewMatList;
  reviewCount
  reOrdering;
  type = null;
  deliveryMode;
  cartItemsList: Cart[];
  ratings = [5,4,3,2,1];
  alertMessages: AlertMessage[];
  public userUid = JSON.parse(localStorage.getItem('userid'));
  public userProfile = JSON.parse(localStorage.getItem('userProfile'));
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  regionMonth = parseInt(this.date.toLocaleString('en-US', { timeZone: `${this.companyConfig.timeZone}`}).split("/")[0]);
  regionDate = parseInt(this.date.toLocaleString('en-US', { timeZone: `${this.companyConfig.timeZone}`}).split("/")[1]);
  regionYear = parseInt(this.date.toLocaleString('en-US', { timeZone: `${this.companyConfig.timeZone}`}).split(",")[0].split("/").pop());

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore, public reviewService: ReviewService,
    private storage: AngularFireStorage, private toastr: ToastrService,private router: Router,
    private analyticsService : AnalyticsService,private alertMsgService: AlertMessageService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(res => {
      this.type = res.type;
      this.route.params.subscribe((params)=>{
      this.activatedRoute = params['docId'];
      if(res.type && res.type == "Order"){
        this.getSelectedOrder();
      }else{
        this.getSelectedEvent();
      }
      })
    })  
    this.resetForm();
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
  resetForm(reviewForm?: NgForm) {
    if (reviewForm != null)
    reviewForm.resetForm();
    this.reviewService.reviewData = {
   ratings: null,
   description: '',
   date: null,
   userId:'',
   reviewDocId:'',
   reviewStatus:'',
   imageStatus:'',
   imageUrl:'',
   nameStatus:'',
   title:'',
   productId:'',
   productImg:'',
   userName:'',
   reviewId:null,
   pilled:[],
   unpilled:[]
    }
  }
   getSelectedOrder(){
    this.firestore.collection('Order').doc(this.activatedRoute).get().subscribe(order =>{
      this.order = { "orderDocId": order.id,
                     ...order.data() as {} };
    })
   }
   getSelectedEvent(){
      this.firestore.collection("AppointmentManagements").doc(this.activatedRoute).get().subscribe(event=>{
        this.viewData = event.data()
      })
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
    document.body.scrollTop = 100; // For Safari
    document.documentElement.scrollTop = 100; // For Chrome, Firefox, IE and Opera
  }
  review(product, userId){
    this.productId = product.productdocId;
    this.userId = userId;
    this.imageUrl = product.primaryUrl;
    this.productRatingValue = product.ratings;
    // console.log(this.productId);
    // console.log(userId);
      this.firestore.collection('User').doc(userId).snapshotChanges().subscribe(order => {
        this.userList = order.payload.data();
        this.getUserName(this.userList)
      })
  }
  getUserName(userName){
    this.userName = userName.name;
  }
  starHandler(num){
    this.starValue = num;
    if(this.productRatingValue == 0){
      this.rating = Math.round(this.starValue);
    }else{
    this.rating = Math.round((this.productRatingValue + this.starValue)/2);
    }
    // console.log(this.rating);
  // // console.log(num);
  let unpilled = 5-num;
  for(var i=0; i<num; i++){
    //// console.log(i);
    this.pilledRating.push(i);
  }
  for(var i=0; i< unpilled; i++){
    //// console.log(i);
    this.unpilledRating.push(i);
  }
  }
  // getAllReviewListGroup(){
  //   this.firestore.collectionGroup('ReviewComments').snapshotChanges().subscribe(review =>{
  //     this.reviewList = review.map(list =>{
  //       return{
  //         reviewDocId: list.payload.doc.id,
  //                    ...list.payload.doc.data() as {}
  //       }as Review;
  //     })
  //     // console.log(this.reviewList);
  //     this.reviewMatList = new MatTableDataSource(this.reviewList);
  //     this.reviewCount = this.reviewMatList.filteredData.length;
  //   })
  // }
shareReview(reviewForm: NgForm){
 // console.log(this.rating);
//  console.log(this.userName);
 let data = Object.assign({}, reviewForm.value);
 data['date'] = this.regionYear + "-" + this.regionMonth + "-" + this.regionDate;
 data['ratings'] = this.starValue;
 data['userId'] = this.userId;
 data['pilled'] = this.pilledRating;
 data['unpilled'] = this.unpilledRating;
 data['reviewStatus'] = 'disable';
 data['imageStatus'] = 'disable';
 data['nameStatus'] = 'disable';
 data['productId']= this.productId;
 data['productImg']=this.imageUrl;
 data['userName']=this.userName;
 data['reviewId']= this.reviewCount+1;
//  this.firestore.collection('ProductManagement').doc('Product').collection('ProductList').doc(`${this.productId}`).update({ratings: this.rating});

  //  this.firestore.collection('Review').doc(`${this.productId}`).collection('ReviewComments').doc(`${this.userId}`).update({ratings: this.starValue});
  //  this.firestore.collection('Review').doc(`${this.productId}`).collection('ReviewComments').doc(`${this.userId}`).update({userId: this.userId});
  //  this.firestore.collection('Review').doc(`${this.productId}`).collection('ReviewComments').doc(`${this.userId}`).update({pilled: this.pilledRating});
  //  this.firestore.collection('Review').doc(`${this.productId}`).collection('ReviewComments').doc(`${this.userId}`).update({unpilled: this.unpilledRating});
  if(this.selectedImage != null){
    var filePath = `Review/${this.selectedImage.name.split('.').slice(0,-1).join('.')}_${new Date().getTime()}`;
    const fileRef = this.storage.ref(filePath);
    this.storage.upload(filePath,this.selectedImage).snapshotChanges().pipe(
      finalize(()=>{
        fileRef.getDownloadURL().subscribe((url)=>{
          data['imageUrl'] = url;
          // localStorage.setItem('userProfile',JSON.stringify(url));
          this.firestore.collection('Review').doc(`${this.productId}`).collection('ReviewComments').doc(`${this.userId}`).set(data);
        })
      })
    ).subscribe()
  }  else{
    this.firestore.collection('Review').doc(`${this.productId}`).collection('ReviewComments').doc(`${this.userId}`).set(data);
  }  
  this.resetForm();
}

  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = e.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
      this.selectedImgName = this.selectedImage.name;
    }
  }
  reorder(reorder){
    //  console.log(reorder);
     this.reOrdering = reorder;
    //  console.log(this.reOrdering);
     this.getCartItemsList();
    }
    getCartItemsList() {
      this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').snapshotChanges().subscribe(cart => {
        this.cartItemsList = cart.map(list => {
          return {
            CartDocId: list.payload.doc.id,
            ...list.payload.doc.data()
          } as Cart;
        });
        // console.log(this.cartItemsList);
      })
    }
    cartUpdate(){
      // console.log(this.cartItemsList);
      if(this.reOrdering){
        this.reOrdering.map(product => {
          if(product){
            var analyticsData = {
              "source" : "reorder",
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
        })
      }
      for(var i=0; i<this.reOrdering.length; i++){
        const obj = this.cartItemsList.find(o => o.productdocId === this.reOrdering[i].productdocId);
        this.reOrdering[i].orderStatus = "Open";
        if (this.userUid && obj == undefined) {
        this.firestore.collection('Cart').doc(this.userUid).collection('Cart').add(this.reOrdering[i])
        .then(docRef => {
          let cartDocId = docRef.id;
          //// console.log( "Add" +this.cartDocId);
          this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${cartDocId}`).update({ "CartDocId": cartDocId });
      
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
        });
        if(i === 0){
          // this.toastr.success("Products Added Successfully","Cart");
          var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Added').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading);
        }
        
      }else{
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${obj.CartDocId}`).update({ 'quantity': +obj.quantity + 1 })
        if(i === 0){
          var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'quantity_Updated').pop();
          var alertMsg = productAlert.alertMsgType;
          this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
        }
        
      }
       }
       
    }
    cancelOrder(order){
      this.firestore.collection('Order').doc(order.orderDocId).update({"orderStatusName" : "Cancelled" }).then(res => {
        // this.toastr.success(`Order ${order.orderId} Cancelled Successfully.`);
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'order_Cancelled').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText+" "+ this.order.orderId,productAlert.alertMsgHeading); 
      }).catch(res => {
      })
    }
}
