import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import autoTable, { UserOptions } from 'jspdf-autotable';
import { AngularFireStorage } from '@angular/fire/storage';
import { debounceTime, finalize, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Cart } from '../common/models/cart.model';
import { Order } from '../common/models/order.model';
import { CartService } from '../common/services/cart.service';
import { CompanyService } from '../common/services/company.service';
import { OrderService } from '../common/services/order.service';
import { IcustomWindow, WindowRefService } from '../common/services/window-ref.service';
import { NgForm } from '@angular/forms';
import { AnalyticsService } from '../common/services/analytics.service';
import { AlertMessageService } from '../common/services/alert-message.service';
import { AlertMessage } from '../common/models/alert-message.model';
import { HolidayListComponent } from '../default/holiday-list/holiday-list.component';
import { MatDialog, MatDialogConfig } from '@angular/material';
declare let window: any;
interface jsPDFWithPlugin extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css']
})
export class OrderSummaryComponent implements OnInit, AfterViewInit {

  orderData : any = null;
  userUid;
  userList;
  orderItems;
  subTotal = 0;
  shippingCost = 0;
  totalCost = 0;
  cartItems: Cart[];
  orderItemsList: Order[];
  companyList;
  userData;
  productDocId = [];
  productsIncart;
  productCartList = [];
  couponList = [];
  couponDiscount = 0;
  businessDiscount = 0;
  variousTax = {
    "federalTaxAmt" : 0.00,
    "stateTaxAmt" : 0.00,
    "salesTaxAmt" : 0.00,
    "vat" : 0.00,
  };
  pdfTax = [];
  discountArray = [];
  discountObj = {};
  companyInfo = [];
  pilledRating = [];
  unpilledRating = [];
  tax =0;
  checkOutData;
  orderplaced;
  pdfurl: any;
  date = new Date();
  afterpaycheckoutData;
  afterpaycartItems;
  private _window: IcustomWindow;
  public rzp: any;
  public options: any;
  updateproductStock;
  razorpay_order_id;
  reqDeliveryDate = null;
  preOrderDeliveryDaysBefore;
  globalNonPreOrderDeliveryDays;
  estimatedDays = [];
  paymentModeToggle = ['Cash On Delivery','PayPal'];
  selectedPaymentMode = null;
  preOrderStatus = false;
  public userProfile = JSON.parse(localStorage.getItem('userProfile'));
  public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  holidayList = null;
  holidates = [];
  holidays = [];
  holimonths = [];
  holidatesModal = [];
  holiRangeModal = [];
  holidaysModal = [];
  holiMonthsModal = [];
  wishItems: Cart[];
  days : String[] = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  months : String[] = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  currentYear;
  dataLoading = true;
  isSunday = false;
  @ViewChild('paypalRef') paypalElementRef : ElementRef; 

  filePath = Date.now().toString();
  regionDate = this.date.toLocaleString('en-US', {timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split("/")[1];
  regionMonth = this.date.toLocaleString('en-US', {timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split("/")[0];
  regionMonthStr = this.date.toLocaleString('en-US', {month: 'short' , timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split("/")[0];
  regionYear = this.date.toLocaleString('en-US', {timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split(",")[0].split("/").pop();
  estimateDate;
  imageData = 'assets/logo.jpg';
  specialreqitem;
  specialreq = false;
  orderConfig;
  payerInfo = null;
  alertMessages: AlertMessage[];
  startingText;
  endText;
  deliveryTime;
  constructor(private firestore: AngularFirestore, private router: Router, public cartService: CartService, private toastr: ToastrService,
    private companyService: CompanyService,private zone: NgZone, private winRef: WindowRefService,private dialog: MatDialog,
    public service: OrderService, private storage: AngularFireStorage, private analyticsService : AnalyticsService,
    private alertMsgService:AlertMessageService) { 
      this._window = this.winRef.nativeWindow;
    }
  ngOnInit() {
    this.cartResetForm();
    this.getCartItemsList();
    this.userUid = JSON.parse(localStorage.getItem('userid'));
    this.getHolidayList();
    //// console.log(this.userUid);
    this.getUserData();
    this.getCheckOutAddress();
    this.getOrderItems();
    this.getCompanyInfo();
    this.getOrderConfig();
    this.getCartCouponList();
    this.getAlertMessages();
    this.getWishList();
    // this.getProductList();
    // console.log(this.userProfile);
  //  this.dateConverter(new Date());
  }
  ngAfterViewInit(){  
    this.paidThroughPayPal();
  }
  getAlertMessages(){
    this.alertMsgService.getAlertMessage().subscribe(msg =>{
      this.alertMessages = msg.docs.map(list =>{
        return{
          alertMsgDocId : list.id,
                         ...list.data()
        }as AlertMessage
      })
      this.separateAlertMsg(this.alertMessages);
    });
  }
  separateAlertMsg(alertMsg){
   for(var i=0; i<alertMsg.length; i++){
     if(alertMsg[i].alertMsgCategory == 'Information' && alertMsg[i].alertMsgName == 'estimated_Delivery_Info'){
      this.startingText = alertMsg[i].alertMsgText;
      this.endText = alertMsg[i].alertMsgHeading;
     }
   }
  }
  dateConverter(inputDate, cartItems){
   let estimateday;
   let estimatemonth;
   let estimateYear;
    if(inputDate == null || inputDate == undefined){
   return null;
 }else{
  //  let presentTime = new Date(inputDate).toLocaleDateString('en-US', {timeZone: `${this.companyConfig.timeZone}`});
  //  let month = presentTime.split('/')[0];
  //  let day = presentTime.split('/')[1] ;
  //  let year = presentTime.split('/')[2];
  // let month = 8;
  // let day = 31 ;
  // let year = 2021;
   let mysqlDate = new Date(inputDate).toLocaleTimeString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`});
   let hour = mysqlDate.split(":")[0];
   let timeType = mysqlDate.split(" ")[1];
   let preorderHour = this.companyConfig.preOrderTime.split(":")[0];
   if(timeType === 'PM'){
    let remainTime = +hour + 12;
      if(+hour > remainTime){
        this.preOrderDeliveryDaysBefore = 1
  //  this.estimateDate = estimateYear+"-"+estimatemonth+"-"+estimateday;
 }else{
   this.preOrderDeliveryDaysBefore = 2;
  estimateday = estimateday + 1;
  // this.estimateDate = estimateYear+"-"+estimatemonth+"-"+estimateday;
 }
}else{
  if(+hour < preorderHour){
    this.preOrderDeliveryDaysBefore = 1;
    // this.estimateDate = estimateYear+"-"+estimatemonth+"-"+estimateday;
  }else{
    this.preOrderDeliveryDaysBefore = 2;
    estimateday = estimateday + 1;
    // this.estimateDate = estimateYear+"-"+estimatemonth+"-"+estimateday;
    // console.log(this.estimateDate)
  }
}
 }
 var maxDays;
 this.estimatedDays = [];
 for (var i = 0; i < cartItems.length; i++) {
   if(cartItems[i].preOrder === 'yes'){
    this.preOrderStatus = true;
    this.estimatedDays.push(this.preOrderDeliveryDaysBefore)
   }else{
    if(cartItems[i].nonPreOrderDays){
      this.estimatedDays.push(cartItems[i].nonPreOrderDays)
    }else{
      this.estimatedDays.push(this.globalNonPreOrderDeliveryDays);
    }
   }
 }
 maxDays = Math.max(...this.estimatedDays);
   let presentDate = new Date().toLocaleDateString('en-US', {timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`});
    let month = presentDate.split('/')[0];
    let day = presentDate.split('/')[1] ;
    let year = presentDate.split('/')[2];
    estimateday = +day+maxDays;
    estimatemonth = month;
    estimateYear = year;
    if(+month == 1 || +month == 3 || +month == 5 || +month == 7 || +month == 8 || +month == 10 || +month == 12 ){
      if(+estimateday == 32 || +estimateday>31){
        estimateday = estimateday - 31;
        estimatemonth = +month+1;
      }
    }else if (+month == 2){
      if(((+year % 4) == 0) && (+day == 29)){
        estimateday = estimateday - 29;
       estimatemonth = +month + 1;
      }else if(+day == 28){
        estimateday = estimateday - 28;
       estimatemonth = +month + 1;
      }
    }else{
      if(+estimateday == 30){
        estimateday = estimateday - 30;
       estimatemonth = +month+1;
      }
    }
    this.estimateDate = estimateYear+"-"+estimatemonth+"-"+estimateday;
}
chooseDeliveryDate(date){
  this.reqDeliveryDate = new Date(date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate());
}
getHolidayList() {
  this.currentYear =parseInt(new Date().toLocaleDateString('en-US', {timeZone: `${this.companyConfig.timeZone}`}).split("/").pop());
  this.holidayList = null;
  this.holidates = [];
  this.holidays = [];
  this.holimonths = [];
  this.holidatesModal = [];
  this.holiRangeModal = [];
  this.holidaysModal = [];
  this.holiMonthsModal = [];
  this.firestore.collection('ConfigInfo').doc('holiday').get().subscribe(list => {
      if(list.exists && list.data()){
        this.holidayList = list.data();
        if(list.data()["Dates"] != undefined || list.data()["Dates"] != null){
          list.data()["Dates"].map(dates => {
            if((dates["holidays"]  != undefined || dates["holidays"] != null) && dates["holidays"].length){
              this.holidates.push(dates["holidays"][0]);
              this.holidatesModal.push({
                "when" : dates["holidays"],
                "why" : dates["holidayName"],
              })
            }
          })
        }
        if(list.data()["Date Range"] != undefined || list.data()["Date Range"] != null){
          list.data()["Date Range"].map(dates => {
            if((dates["holidays"]  != undefined || dates["holidays"] != null) && dates["holidays"].length){
              dates["holidays"].map(date => {
                this.holidates.push(date);
              })
              this.holiRangeModal.push({
                "when" : dates["holidays"],
                "why" : dates["holidayName"],
              })
            }
          })
        }
        if(list.data()["Days Of Week"] != undefined || list.data()["Days Of Week"] != null){
          list.data()["Days Of Week"].map(dates => {
            if((dates["holidays"]  != undefined || dates["holidays"] != null) && dates["holidays"].length){
              this.holidays.push(this.days.indexOf(dates["holidays"]));
              this.holidaysModal.push({
                "when" : dates["holidays"],
                "why" : dates["holidayName"],
              })
            }
          })
        }
        if(list.data()["Months Of Year"] != undefined || list.data()["Months Of Year"] != null){
          list.data()["Months Of Year"].map(dates => {
            if((dates["holidays"]  != undefined || dates["holidays"] != null) && dates["holidays"].length){
              this.holimonths.push(this.months.indexOf(dates["holidays"]));
              this.holiMonthsModal.push({
                "when" : dates["holidays"],
                "why" : dates["holidayName"],
              })
            }
          })
        }
      }
      this.isSunday = this.holidays.includes(0)  ? true : false; 
      this.dataLoading = false; 
    });

}

disabledFilterDates = (d: Date): boolean => {
  var customDate = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
  return ((d >= new Date(this.estimateDate))
        && (!this.holidates.find(date => date === customDate))
        && (!this.holidays.find(day => day === d.getDay()))
        && (!(d.getDay() === 0 && this.isSunday))
        && (!(this.holimonths.find(month => month === (d.getMonth())) && d.getFullYear() === this.currentYear )));
}
checkAvailabilityDate(estimatedDeliveryDate){
  if(estimatedDeliveryDate != undefined &&
     estimatedDeliveryDate != null ){
      var counter = 0;
      while(!this.disabledFilterDates(new Date(estimatedDeliveryDate))){
        counter++;
        var checkDate = new Date(estimatedDeliveryDate);
        var nextEstimatedDate = new Date(checkDate.setDate(checkDate.getDate() + 1));
        estimatedDeliveryDate = (nextEstimatedDate.getFullYear()+"-"+(nextEstimatedDate.getMonth()+1)+"-"+nextEstimatedDate.getDate())
        if(this.disabledFilterDates(new Date(estimatedDeliveryDate)) || counter > 365){
         break;
        }
      }
    }
    return estimatedDeliveryDate;
}
clearDeliveryDate(){
  this.reqDeliveryDate = null;
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
getOrderConfig(){
  this.orderConfig = JSON.parse(localStorage.getItem('orderConfig'));
  this.globalNonPreOrderDeliveryDays = this.orderConfig.nonPreorderDays;
  this.deliveryTime = this.orderConfig.deliveryTime;
  if(!this.orderConfig){
  this.companyService.getOrderConfig().subscribe(order =>{
    this.orderConfig = order.data();
    if(order.data()){
      var orderObject = {"orderPrefix": this.orderConfig["orderPrefix"],
                          "orderSuffix": this.orderConfig["orderSuffix"],
                          "deliveryTime": this.orderConfig["deliveryTime"],
                          "eventPrefix": this.orderConfig["eventPrefix"],
                          "eventSuffix": this.orderConfig["eventSuffix"],
                          "advanceBooking": this.orderConfig["advanceBooking"],
                          "nonPreorderDays":this.orderConfig["nonPreorderDays"]
                         };
     localStorage.setItem('orderConfig',JSON.stringify(orderObject));
    }
  })
 }
}
  getCompanyInfo(){
    this.companyService.getCompanyData().subscribe(shipping =>{
      this.companyList = shipping.data();
      })
  }
  getUserData() {
    this.firestore.collection('User').doc(this.userUid).snapshotChanges().subscribe(user => {
      this.userData = user.payload.data();
      // // console.log(this.userData);
    })
  }
  continueShopping() {
    this.router.navigate(['/products']);
  }
  changePaymentMode(value){
    this.selectedPaymentMode = value;
  }
  getCartCouponList(){
    var cartCoupon = JSON.parse(localStorage.getItem('cartCoupon'));
    // this.cartService.getCartCouponList().subscribe(res => {
      if(cartCoupon){
        this.couponList = cartCoupon["coupons"];
        this.couponDiscount = cartCoupon["couponDiscount"];
        this.tax = cartCoupon["tax"];
        this.businessDiscount = cartCoupon["businessDiscount"];
        if(cartCoupon.hasOwnProperty('variousTax')){
          this.variousTax = cartCoupon["variousTax"];
        }
      }
    // })
  }
  getCartItemsList() {
    this.cartItems = JSON.parse(localStorage.getItem('cart'));
    this.getCartProducts(this.cartItems)
    // this.cartService.getCartItems().subscribe(cart => {
    //   this.cartItems = cart.map(list => {
    //     return {
    //       CartDocId: list.payload.doc.id,
    //       ...list.payload.doc.data()
    //     } as Cart;
    //   })
    //   console.log(this.cartItems)
      
    // })
  }
  getWishList(){
    if(this.userUid){
      this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Wishlist',ref=>ref.where("addedCart","==", true)).get().subscribe(wishlist =>{
    this.wishItems = wishlist.docs.map(list =>{
      return{
        CartDocId: list.id,
                  ...list.data()
      }as Cart;
    })
  })
    
    
  }
  }
  getCartProducts(cartItems) {
    this.dateConverter(new Date(), cartItems);
        this.subTotal = 0;
    this.productDocId = [];
    // this.productCartList = [];
    //// console.log(this.cartItems);
    for (var i = 0; i < cartItems.length; i++) {
      if(cartItems[i].preOrder === 'yes'){
        this.preOrderStatus = true;
       }
      this.subTotal += +cartItems[i].productPrice *cartItems[i].quantity;
      this.productDocId.push(cartItems[i].productdocId);
      this.firestore.collection('ProductManagement').doc('Product').collection('ProductList').doc(this.productDocId[i]).snapshotChanges().subscribe(cart => {
        this.productsIncart = cart.payload.data();
        // this.productCartList.push(this.productsIncart);
        //// console.log(this.productCartList)
        // console.log("order SUmmary cart")
        this.updateCurrentStock(this.productsIncart);
      })

    }

    //// console.log(this.cartItems);
  }
  updateCurrentStock(product) {
    // console.log(product);
    this.updateproductStock = product;
    //// console.log(this.productDocId[i]);
  
  }
  getCheckOutAddress() {
    this.firestore.collection('CheckOutAddress').doc(`${this.userUid}`).get().subscribe(address => {
      this.checkOutData = address.data()
      // console.log(this.checkOutData);
    })
  }
  getOrderItems() {
    this.service.getOrderItems().subscribe(data => {
      this.orderItemsList = data.map(item => {
        return {
          orderDocId: item.payload.doc.id,
          ...item.payload.doc.data() as {}
        } as Order
      })
      // console.log("order OrderItems"+this.orderItemsList)
      this.orderplaced = this.orderConfig.orderPrefix+(this.orderItemsList.length + this.orderConfig.orderSuffix);
    })
  }
  paidThroughPayPal(){
    window.paypal.Buttons({
        // env: 'sandbox',
        // client: {
        //   production: environment.payPalKey
        // },
        style : {
          layout : 'horizontal',
          size : 'responsive',
          color : 'white',
          shape : 'rect',
          tagline: 'false'
      },
      createOrder : (data,actions) => {
        this.checkOutData["paymentMode"] = "PayPal";
        this.afterpaycheckoutData = this.checkOutData;
        this.afterpaycartItems = this.cartItems;
        this.totalCost = +this.subTotal + +this.checkOutData.shippingCharges + parseFloat(this.tax+"") - parseFloat(this.couponDiscount+"") - parseFloat(this.businessDiscount+"");

        return actions.order.create({
          purchase_units : [
            { description :'Shopping',
              amount : {
                value : this.totalCost,
                currency_code : this.companyConfig.currencyCode
              }
            }
          ]
        })
      },
      onApprove : (data,actions) => {
        return actions.order.capture().then(details => {
           if(details.id){
            this.payerInfo = details;
            this.confirmOrder(this.afterpaycheckoutData);
           }
        })
      },
      onError : error => {
        console.log(error);
      }
    }).render(this.paypalElementRef.nativeElement);
  }
  // initPay(checkoutdata, cartItems): void{
  //   checkoutdata["paymentMode"] = "Razorpay";
  //   this.afterpaycheckoutData = checkoutdata;
  //   this.afterpaycartItems = cartItems;
  //   this.totalCost = +this.subTotal + +this.checkOutData.shippingCharges + parseFloat(this.tax+"") - parseFloat(this.couponDiscount+"") - parseFloat(this.businessDiscount+"");
  //   this.options = {
  //     key: environment.key,
  //     name: 'Online Pos',
  //     description:'Shopping',
  //     amount:this.totalCost * 100,
  //     image:'assets/online.jpg',
  //     prefill:{
  //       name: 'Online Pos',
  //       email:'test@gmail.com'
  //     },
  //     notes:{ },
  //     theme: {
  //       color:'#cdd9ea'
  //     },
  //     handler:this.paymentHandler.bind(this),
  //     order_id:this.razorpay_order_id,
  //     modal:{
  //       ondismiss:(()=>{
  //       })
  //     }
  //   }
  //   this.rzp = new this.winRef.nativeWindow['Razorpay'](this.options);
  //   this.rzp.open();
  // }

  // paymentHandler(res: any){
  //   this.razorpay_order_id = res.razorpay_payment_id;
  //   // console.log(res);
  //   if(res.razorpay_payment_id != null){
  //     this.confirmOrder(this.afterpaycheckoutData)
  //   }
  //   this.zone.run(()=>{
  //   })
  // }
  codCheckOut(){
    this.checkOutData["paymentMode"] = "Cash On Delivery";
    this.confirmOrder(this.checkOutData);

  }
  cartResetForm(cartForm?: NgForm){
 if(cartForm != null)
 cartForm.resetForm();
 this.cartService.cartData = {
  CartDocId:' ',
  productName:' ',
  productdocId:' ',
  subcategoryId:' ',
  productId: null,
  description:' ',
  productPrice: null,
  primaryUrl:' ',
  quantity : null,
  total: null,
  subcategoryName:' ',
  displayAs :' ',
  images :[{
      url:' ',
      display:' ',
      textToDisplay:' ',
      productImageId : null,
  }],
  gst: null,
  shipping: null,
  productWeight : null,
  currentStock: null,
  coupons : null,
  specialRating: null,
  specialText:' ',
  categoryName:'',
  unpilled: null,
    pilled: null,
    nonPreOrderDays:null,
    preOrder:'',
    wishDocId: '',
    wishlist:false
 }
  }

  specialRequest(cart){
    this.specialreqitem = cart;
  }
  starHandler(num){
    this.pilledRating =[];
    this.unpilledRating =[];
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
  updatesplreq(splreq?: NgForm){
    let data = Object.assign({},splreq.value);
    this.specialreq =true;
      this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart')
      .doc(this.specialreqitem.CartDocId).update(data);
      this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart')
      .doc(this.specialreqitem.CartDocId).update({"pilled":this.pilledRating, "unpilled" : this.unpilledRating });
    this.getCartItemsList();
  }
  addPaymentInfo(orderData,detail){
    if(orderData){
      if(orderData.paymentMode === "PayPal"){
        var analyticsData = {
          "payment-id" : detail.id,
          "payer-id" : detail.payer.payer_id,
          "payer-country-code" : detail.payer.address.country_code,
          "payer-email-id" : detail.payer.email_address,
          "payer-first-name" : detail.payer.name.given_name,
          "payer-last-name" : detail.payer.name.surname,
          "order-id" : orderData.orderId,
          "payment-mode" : orderData.paymentMode,
          "subtotal" : orderData.subtotal,
          "tax" : orderData.tax,
          "total" : orderData.total,
        }
        this.analyticsService.setEcommerceEvent('e-commerce','add-payment-info',analyticsData);
      }else{
        var codData = {
          "order-doc-id" : orderData.orderDocId,
          "order-id" : orderData.orderId,
          "payment-mode" : orderData.paymentMode,
          "subtotal" : orderData.subtotal,
          "tax" : orderData.tax,
          "total" : orderData.total,
        }
        this.analyticsService.setEcommerceEvent('e-commerce','add-payment-info',codData);
      }
    }
  }
  addPurchase(checkoutdata,cartItems){
    if(checkoutdata && cartItems){
        var orderItems = cartItems.map(product => {
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
          var analyticsData = {
            "order-doc-id" : checkoutdata.orderDocId,
            "coupon-discount" : checkoutdata.couponDiscount,
            "shipping-charges" : checkoutdata.shippingCharges,
            "coupons" : checkoutdata.coupons,
            "order-req-date" : checkoutdata.orderReqDate,
            "estimated-delivery-date" : checkoutdata.estimatedDeliveryDate,
            "delivery-mode" : checkoutdata.mode,
            "order-id" : checkoutdata.orderId,
            "payment-mode" : checkoutdata.paymentMode,
            "subtotal" : checkoutdata.subtotal,
            "tax" : checkoutdata.tax,
            "total" : checkoutdata.total,
            "order-items" : orderItems
          }    
      return this.analyticsService.setEcommerceEvent('e-commerce','purchase',analyticsData);
    }
  }

  confirmOrder(checkoutdata) {
    // this.getCheckOutAddress();
    // this.getCartItemsList();
    var inclusiveTotal;
    this.estimatedDays = [];
    for (var i = 0; i < this.cartItems.length; i++) {
      // console.log(this.cartItems);
       this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart')
       .doc(this.cartItems[i].CartDocId).update({currentStock:this.updateproductStock.currentStock});
      // console.log("order summary current stock")
      if(this.cartItems[i].preOrder === 'yes'){
       this.preOrderStatus = true;
      }
      if(this.cartItems[i].specialText || this.cartItems[i].pilled){
        this.specialreq = true;
      }
    } 
    this.orderData = checkoutdata;
    if(this.checkOutData.shippingCharges == null){
      this.checkOutData.shippingCharges = 0;
    }
    if(this.companyConfig.taxSetting == 'exclusive'){
      this.totalCost = +this.subTotal + +this.checkOutData.shippingCharges + parseFloat(this.tax+"") - parseFloat(this.couponDiscount+"") - parseFloat(this.businessDiscount+"");
    }else{
    this.totalCost = +this.subTotal + +this.checkOutData.shippingCharges - parseFloat(this.couponDiscount+"") - parseFloat(this.businessDiscount+"");
    }
    this.orderData['orderItems'] = this.cartItems;
    if(this.specialreq){
      this.orderData['specialRequest'] = this.specialreq;
    }
    this.orderData['email'] = this.userData.email;
    this.orderData['mobile'] = this.checkOutData.mobile;
    this.orderData['userId'] = this.userUid;
    this.orderData['orderId'] = this.orderplaced;
    this.orderData['date'] = new Date().toLocaleString('en-US',{timeZone:`${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`});
    this.orderData['total'] = this.totalCost;
    if(this.companyConfig.taxSetting == 'exclusive'){
    this.orderData['subtotal'] = this.subTotal ;
    }else{
      this.orderData['subtotal'] = this.subTotal - this.tax;
    }
    this.orderData['orderStatusName'] = "Open";
    this.orderData['shippingCharges'] = this.checkOutData.shippingCharges;
    // console.log(data);
    
    //// console.log(this.productCartList);
    const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
    var columns = ['Products', 'Quantity', 'Cost'];
    var rows = [];
    for (var k = 0; k < this.cartItems.length; k++) {
      rows.push([
         this.cartItems[k].productName+"\n"+this.getProductVariants(this.cartItems[k]),
         this.cartItems[k].quantity,
        this.companyConfig.currencySymbol +" "+ parseFloat(this.cartItems[k].productPrice+"").toFixed(2)
      ]);
    }
    // console.log(this.cartItems);
    doc.autoTable({
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
          doc.addImage(this.imageData, 'jpg', 10, 10, 70, 70)
        }
      },
      body: [
        [`${this.companyConfig.companyName}`],
        [`${this.companyList.addressLine1}`],
        [`${this.companyList.addressLine2}, ${this.companyList.city}`],
        [`${this.companyList.state} - ${this.companyList.pincode}`],
        [`Mobile :  ${this.companyList.mobile}`],
      ],
      margin: { left: 260, top: 10 },
      theme: 'plain'
    })
    doc.autoTable({
      body: [
        [
          { content: 'Invoice' }
        ],
      ],
      styles: { fontStyle: 'bold', fontSize: 20 },
      theme: 'plain',
      margin: { left: 180 },
    })
    doc.autoTable({
      body: [
        [
          { content: 'To' }
        ],
      ],

      styles: { fontStyle: 'bold', fontSize: 14 },
      theme: 'plain',
    })

    if(this.userProfile.userType === "INDIVIDUAL"){
      if(this.couponDiscount !== 0.00){
        this.discountArray = ['Coupon Discount', `${this.companyConfig.currencySymbol} ${parseFloat(this.couponDiscount+"").toFixed(2)}`]
      }else{
        this.discountArray = []
      }
      
      this.discountObj = {
        "coupons" : this.couponList,
        "couponDiscount" : this.couponDiscount
      }
      this.companyInfo = [];
    }else{
      this.discountArray =  ['Business Discount', `${this.companyConfig.currencySymbol} ${parseFloat(this.businessDiscount+"").toFixed(2)}`]
      this.discountObj = {
        "businessDiscount" : this.businessDiscount
      }
      this.companyInfo = [
        [`Company Name : ${this.userData.companyName}`, '', '', '', '', '', '', '', ''],
        [`Gst : ${this.userData.companyGst}`, '', '', '', '', '', '', '', ''],
        [`Cin : ${this.userData.companyCin}`, '', '', '', '', '', '', '', ''],
        [`Pan : ${this.userData.companyPan}`, '', '', '', '', '', '', '', '']
      ];
    }
if(this.checkOutData.mode == 'Pickup'){
  doc.autoTable({
    body: [
      [`${this.checkOutData.fullName}`, '', '', '', '', '', '', '', `Invoice Number :${this.filePath}`],
      [`Email : ${this.userData.email}`, '', '', '', '', '', '', '', `Invoice Date: ${this.regionDate + "-" + this.regionMonthStr + "-" + this.regionYear}`],
      [`Mobile : ${this.userData.mobile}`, '', '', '', '', '', '', '', `Order Number : ${this.orderplaced}`],
      ['', '', '', '', '', '', '', '', `Order Date: ${this.regionDate + "-" + this.regionMonthStr + "-" + this.regionYear}`],
      ['', '', '', '', '', '', '', '',`Payment Mode : ${this.orderData.paymentMode}`],
      ...this.companyInfo
    ],
    theme: 'plain',

  });
}else{
  doc.autoTable({
    body: [
      [`${this.checkOutData.fullName}`, '', '', '', '', '', '', '', `Invoice Number :${this.filePath}`],
      [`${this.checkOutData.addressLine1}`, '', '', '', '', '', '', '', `Invoice Date: ${this.regionDate + "-" + this.regionMonthStr + "-" + this.regionYear}`],
      [`${this.checkOutData.addressLine2}`, '', '', '', '', '', '', '', `Order Number : ${this.orderplaced}`],
      [`${this.checkOutData.city}- ${this.checkOutData.pincode}`, '', '', '', '', '', '', '', `Order Date: ${this.regionDate + "-" + this.regionMonthStr + "-" + this.regionYear}`],
      [`${this.checkOutData.state}`, '', '', '', '', '', '', '',`Payment Mode : ${this.orderData.paymentMode}`],
      [`Email : ${this.userData.email}`, '', '', '', '', '', '', '', ''],
      [`Mobile : ${this.userData.mobile}`, '', '', '', '', '', '', '', ''],
      ...this.companyInfo
    ],
    theme: 'plain',

  });
}
    autoTable(doc, {
      head: [columns],
      body: rows, didDrawCell: (data) => { data.column.index },
      tableLineColor: 'lightskyblue',
      theme: 'grid',
    });
 
    if(this.companyConfig.country === "INDIA" ){
      this.pdfTax = ['Tax', `${this.companyConfig.currencySymbol} ${parseFloat(this.tax+"").toFixed(2)}`];
    }else{
      if(this.variousTax.federalTaxAmt !== 0.00){
        this.pdfTax.push(['Federal Tax', `${this.companyConfig.currencySymbol} ${parseFloat(this.variousTax.federalTaxAmt+"").toFixed(2)}`]);
      }
      if(this.variousTax.stateTaxAmt !== 0.00){
        this.pdfTax.push(['State Tax', `${this.companyConfig.currencySymbol} ${parseFloat(this.variousTax.stateTaxAmt+"").toFixed(2)}`]);
      }
      if(this.variousTax.salesTaxAmt !== 0.00){
        this.pdfTax.push(['Sales Tax', `${this.companyConfig.currencySymbol} ${parseFloat(this.variousTax.salesTaxAmt+"").toFixed(2)}`]);
      }
      if(this.variousTax.vat !== 0.00){
        this.pdfTax.push(['VAT', `${this.companyConfig.currencySymbol} ${parseFloat(this.variousTax.vat+"").toFixed(2)}`]);
      }
    }

    if(this.companyConfig.taxSetting == 'exclusive'){
      doc.autoTable({
        body: [
          ['Sub Total', `${this.companyConfig.currencySymbol} ${parseFloat(this.subTotal+"").toFixed(2)}`],
          ['Shipping', `${this.companyConfig.currencySymbol} ${parseFloat(this.checkOutData.shippingCharges+"").toFixed(2)}`],
          ...this.discountArray,
          ...this.pdfTax,
          // ['GST', `${this.gstTotal}`],
          // ['Payment Method', `Cash on Delivery`],
          ['Total', `${this.companyConfig.currencySymbol} ${parseFloat(this.totalCost+"").toFixed(2)} `],
        ],
        theme: 'grid',
        styles: { overflow: 'hidden' },
        margin: { left: 214 },
      });
    }else{
      inclusiveTotal = this.subTotal - this.tax;
      doc.autoTable({
     
        body: [
          ['Sub Total', `${this.companyConfig.currencySymbol} ${parseFloat(inclusiveTotal+"").toFixed(2)}`],
          ['Shipping', `${this.companyConfig.currencySymbol} ${parseFloat(this.checkOutData.shippingCharges+"").toFixed(2)}`],
          ...this.discountArray,
          ...this.pdfTax,
          // ['GST', `${this.gstTotal}`],
          // ['Payment Method', `Cash on Delivery`],
          ['Total', `${this.companyConfig.currencySymbol} ${parseFloat(this.totalCost+"").toFixed(2)} `],
        ],
        theme: 'grid',
        styles: { overflow: 'hidden' },
        margin: { left: 214 },
      });
    }
   
    const file = doc.output("blob");
    // delete data.orderDocId;
    const fileRef = this.storage.ref(`Invoice/${this.userUid}/` + this.filePath + '.pdf');
    const task = this.storage.upload(`Invoice/${this.userUid}/` + this.filePath + '.pdf', file);

    this.firestore.collection('User').doc(`${this.userUid}`).update({
      'invoiceNumber': this.filePath,
      'invoiceDate': this.regionDate + "-" + this.regionMonthStr + "-" + this.regionYear, 'orderNumber': this.orderplaced,
      'orderDate': this.regionDate + "-" + this.regionMonthStr + "-" + this.regionYear
    });

    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe((url) => {
          this.pdfurl = url;
          this.orderData['pdf'] = this.pdfurl;
          // console.log(data);
          // Coupon Detail 
          var tax = {
            "tax" : this.tax,
            "variousTax" : this.variousTax
          }
          
  
          var toDate = this.regionDate;
          var toMonth = this.regionMonth;
          var toYear = this.regionYear;
          var today = toYear+"-"+toMonth+"-"+toDate;
         
          // if(this.preOrderStatus == true){
            
           if(this.reqDeliveryDate != null){
             this.reqDeliveryDate = this.reqDeliveryDate.getFullYear()+"-"+(this.reqDeliveryDate.getMonth()+1)+"-"+this.reqDeliveryDate.getDate();
            this.orderData["estimatedDeliveryDate"] = this.reqDeliveryDate;
           }else{
            this.orderData["estimatedDeliveryDate"] = this.estimateDate;
           }
           this.orderData["reqDeliveryDate"] = this.reqDeliveryDate;
           this.orderData["deliveredDate"] = null;
           
           this.orderData["estimatedDeliveryDate"]  = this.checkAvailabilityDate(this.orderData["estimatedDeliveryDate"]);
          this.orderData["orderReqDate"] =  today;
          // console.log(this.estimateDate);

            var orderData = Object.assign(this.orderData,this.discountObj,tax);
         
          this.firestore.collection('Order').add(orderData).then(res => {
            this.orderData["orderDocId"] = res.id;
            this.addPurchase(this.orderData,this.cartItems);
            this.addPaymentInfo(this.orderData,this.payerInfo);
            this.firestore.collection('Cart').doc(`${this.userUid}`).set({ "coupons" : [], "couponDiscount" : null , "tax" : null ,"businessDiscount" : null }).then(res => {
              this.couponList.map(coupon => {
                if(coupon.maxUsageLimit > 0){
                  var currentQty = coupon.maxUsageLimit - 1;
                  this.firestore.collection('CouponManagement').doc(coupon.couponId).update({"maxUsageLimit" : currentQty }).then(res => {
                  })
                }
              })
            }).catch(err => {
            })
          })

          .catch(function (error) {
            console.error("Error adding document: ", error);
          });
        });
      })
    ).subscribe()
      var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'order_Placement').pop();
      var alertMsg = productAlert.alertMsgType;
      this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading+ " " + this.orderplaced);   
      for (var i = 0; i < this.cartItems.length; i++) {
        this.firestore.collection('Cart').doc(this.userUid).collection('Cart').doc(this.cartItems[i].CartDocId).delete();
      }
      for(var i=0; i<this.wishItems.length; i++){
        this.firestore.collection('Cart').doc(this.userUid).collection('Wishlist').doc(this.wishItems[i].productdocId).delete();
      }
      localStorage.removeItem('cart');
      localStorage.removeItem('cartCoupon');
      this.firestore.collection('CheckOutAddress').doc(this.userUid).update({ 'shippingCharges': 0, "mode":null,'displayAddress':null});
      if (this.checkOutData.shippingCharges == undefined) {
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'invalid_Zipcode').pop();
      var alertMsg = productAlert.alertMsgType;
      this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
        this.router.navigate(['/checkout']);
      }
      this.router.navigate(['/profile']);
      this.topFunction();
  }
  getProductVariants(product){
    var attribute = '';
    if(product.productWeight != undefined && product.productWeight != null && product.productWeight != '' &&
       product.productWeightUom != undefined && product.productWeightUom != null && product.productWeightUom != ''){
        attribute = "Weight : "+product.productWeight+" "+product.productWeightUom+"\n";
    }
    if(product.productSize != undefined && product.productSize != null && product.productWeight != '' && 
       product.productSizeUom != undefined && product.productSizeUom != null && product.productSizeUom != ''){
        attribute = attribute+" Size : "+product.productSize+" "+product.productSizeUom+"\n";
    }
    if(product.productColor != undefined && product.productColor != null && product.productColor != ''){
      attribute = attribute+" Color : "+product.productColor+"\n";
    }
    if(product.itemCount != undefined && product.itemCount != null && product.itemCount != ''){
      attribute = attribute+" Count : "+product.itemCount;
    }
    return attribute;
  }
  openHolidayList(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "80%";
    dialogConfig.height = "80%";
    dialogConfig.data = {
      "Dates" : this.holidatesModal,
      "Date Range" : this.holiRangeModal,
      "Days Of Week" : this.holidaysModal,
      "Months Of Year" : this.holiMonthsModal,
    };
    this.dialog.open(HolidayListComponent, dialogConfig);
  }
 
}
