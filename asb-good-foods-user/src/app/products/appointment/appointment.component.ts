import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import csc from 'country-state-city';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { startWith, map, take } from 'rxjs/operators';
import { AlertMessage } from 'src/app/common/models/alert-message.model';
import { Appointment } from 'src/app/common/models/appointment.model';
import { AlertMessageService } from 'src/app/common/services/alert-message.service';
import { AnalyticsService } from 'src/app/common/services/analytics.service';
import { AppointmentService } from 'src/app/common/services/appointment.service';
import { CompanyService } from 'src/app/common/services/company.service';
import { HolidayListComponent } from 'src/app/default/holiday-list/holiday-list.component';
import { CategoryService } from 'src/app/common/services/category.service';
import { SubCategoryService } from 'src/app/common/services/sub-category.service';
import { ProductService } from 'src/app/common/services/product.service';
import { Category } from 'src/app/common/models/category.model';
import { SubCategory } from 'src/app/common/models/sub-category.model';
import { Product } from 'src/app/common/models/product.model';
declare var $ : any;

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnInit {

  myControlState = new FormControl(null,[Validators.required,Validators.minLength(1)]);
  filteredOptionsState: Observable<string[]>;
  stateAutoComplete; 
  optionsState: any[] = [''];
  selectedState; 
  eventList: Appointment[];
  myControlCity = new FormControl(null,[Validators.required,Validators.minLength(1)]);
  filteredOptionsCity: Observable<string[]>;
  cityAutoComplete; 
  optionsCity: any[] = [''];
  selectedCity; 
  states;
  cities;
  mobNumberPattern = "^[0-9]{6,12}$";
  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
  pinPattern = "[0-9]{6}$";
  estimateDate;
  orderConfig;
  advancebookingDate;
  eventId;
  timeZone;
  filteredDate ;
  userUid;
  alertMessages: AlertMessage[];
  categoryList: Category[];
  subcategoryList: SubCategory[];
  productList: Product[];
disableDate =[];
startingText;
endText;
startingSubText;
endSubText;
holidayList = null;
holidates = [];
holidays = [];
holimonths = [];
holidatesModal = [];
holiRangeModal = [];
holidaysModal = [];
holiMonthsModal = [];
days : String[] = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
months : String[] = ["January","February","March","April","May","June","July","August","September","October","November","December"];
companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
currentYear;
dataLoading = true;
isSunday = false;
selectedIndex;
selectedsubIndex;
  constructor(public appointmentService: AppointmentService, private firestore: AngularFirestore,private dialog: MatDialog,
    private router: Router, private toastr: ToastrService, private companyService: CompanyService,
    private analyticsService : AnalyticsService, private alertMsgService: AlertMessageService,
    private categoryService: CategoryService, private subcategoryService: SubCategoryService,
    private productService: ProductService) { }

  ngOnInit() {
    this.getLocalCache();
    this.getUseruid();
   this.appointmentResetform();
   this.getHolidayList();
   this.getOrderConfig();
   this.advancebookingDate = this.orderConfig.advanceBooking;
   this.getDateSelection();
   this.getEventList();
  //  this.getCategoryList();
  //  this.getSubcategoryList();
  //  this.getProductList();
  //  this.changeColor(4);
   $('[data-toggle="popover"]').popover({
    sanitizeFn: function (content) {return content;}
  });
  $('.popover-dismiss').popover({
    trigger: 'focus'
  })
   this.getAlertMessages();
  }
  changeColor(i) {
    this.selectedIndex = i;
  }
  changesubcatColor(i) {
    this.selectedsubIndex = i;
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
     if(alertMsg[i].alertMsgCategory == 'Information' && alertMsg[i].alertMsgName == 'advance_Booking_Info'){
      this.startingText = alertMsg[i].alertMsgText;
      this.endText = alertMsg[i].alertMsgHeading;
     }
     if(alertMsg[i].alertMsgCategory =='Information' && alertMsg[i].alertMsgName == 'event_Subheading_Info'){
      this.startingSubText = alertMsg[i].alertMsgText;
      this.endSubText = alertMsg[i].alertMsgHeading;
     }
   }
  }
 appointmentResetform(appointmentForm?: NgForm) {
    if (appointmentForm != null)
    appointmentForm.resetForm();
    this.appointmentService.appointmentData = {
  eventType:'',
   eventName:'',
   eventDate:null,
   eventTime:null,
   noOfSlots:null,
   location:'',
   items:[],
   addressLine1:'',
   addressLine2:'',
   city:'',
   email:'',
   fullName:'',
   mobile:null,
   pincode:null,
   state:'',
   eventId:'',
   appointmentDocId:'',
   userUid:''
    }
  }
  getDateSelection(){
    var presentDate = new Date();
    var day = parseInt(presentDate.toLocaleString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split("/")[1]);
    var month = parseInt(presentDate.toLocaleString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split("/")[0]);
    var year = parseInt(presentDate.toLocaleString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split(",")[0].split("/").pop());
    var estimateday = day;
    var estimatemonth = month;
    if(+month == 1 || +month == 3 || +month == 5 || +month == 7 || +month == 8 || +month == 10 || +month == 12 ){
      if(+day == 31){
      estimateday = this.advancebookingDate;
      estimatemonth = +month+1;
      }
    }else if (+month == 2){
      if(((+year % 4) == 0) && (+day == 29)){
      estimateday = 1;
      estimatemonth = +month+1;
      }else if(+day == 28){
      estimateday = 1;
      estimatemonth = +month+1;
      }
    }else{
      if(+day == 30){
      estimateday = 1;
      estimatemonth = +month+1;
      }
    }
    var selectedDate = ""+estimatemonth+"/"+estimateday+"/"+year+"";
    this.disableDate = [ ]
    for(var i=0; i<this.advancebookingDate; i++){
      if(+estimatemonth == 1 || +estimatemonth == 3 || +estimatemonth == 5 || +estimatemonth == 7 || +estimatemonth == 8 || +estimatemonth == 10 || +estimatemonth == 12 ){
        if(+estimateday+i == 32){
        estimateday = 0;
        estimatemonth = +estimatemonth+1;
        }
      }else if (+estimatemonth == 2){
        if(((+year % 4) == 0) && (+estimateday+i == 29)){
        estimateday = 0;
        estimatemonth = +estimatemonth+1;
        }else if(+estimateday == 28){
        estimateday = 0;
        estimatemonth = +estimatemonth+1;
        }
      }else{
        if(+estimateday+i == 31){
        estimateday = 0;
        estimatemonth = +estimatemonth+1;
        }
      }
      if(estimatemonth === month){
        this.disableDate.push(new Date(""+estimatemonth+"/"+(+estimateday+i)+"/"+year+""));
      }else{
        if(estimateday == 1){
          this.disableDate.push(new Date(""+estimatemonth+"/"+1+"/"+year+""));
          // this.futureOrderDates.push(year+"-"+estimatemonth+"-"+1);
        }
        estimateday = +estimateday +1;
        this.disableDate.push(new Date(""+estimatemonth+"/"+estimateday+"/"+year+""));
        // this.futureOrderDates.push(year+"-"+estimatemonth+"-"+estimateday);
    }
    //  this.disableDate.push(new Date(""+estimatemonth+"/"+(estimateday+i)+"/"+year+""))
    }
     this.filteredDate = new Date(selectedDate);
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
  const time=d.getTime();
  return ((!this.disableDate.find(x=>x.getTime()>=time))
        && (!this.holidates.find(date => date === customDate))
        && (!this.holidays.find(day => day === d.getDay()))
        && (!(d.getDay() === 0 && this.isSunday))
        && (!(this.holimonths.find(month => month === (d.getMonth())) && d.getFullYear() === this.currentYear )));
}
  getEventList(){
    this.firestore.collection("AppointmentManagements").snapshotChanges().subscribe(event =>{
    this.eventList = event.map(list =>{
      return{
        appointmentDocId: list.payload.doc.id,
                   ...list.payload.doc.data() as {}
      }as Appointment
    })
    this.eventId = this.orderConfig.eventPrefix+(this.eventList.length + this.orderConfig.eventSuffix);
    })
    }
    getUseruid() {
      this.userUid = JSON.parse(localStorage.getItem('userid'));
    }
  getLocalCache() {
    this.companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
    var timeZone = JSON.parse(localStorage.getItem('companyConfig')).timeZone;
    var separatezone = timeZone.split("/")[1]
    this.timeZone = separatezone.replace("_", " ");
    this.states = csc.getStatesOfCountry(this.companyConfig.isoCode);
    this.stateAutoComplete = this.states.map(state => state.name);
    this.optionsState = this.stateAutoComplete;
    this.filteredOptionsState = this.myControlState.valueChanges
        .pipe(
          startWith(''),
          map(value => this.filterState(value))
        );
    // shipping
    // this.shippingStateAutoComplete = this.states.map(state => state.name);
    // this.optionsShippingState = this.shippingStateAutoComplete;
    // this.filteredOptionsShippingState = this.myControlShippingState.valueChanges
    //     .pipe(
    //       startWith(''),
    //       map(value => this.filterShippingState(value))
    //     );
  }
  filterState(value: string): string[] {
    const filterValueState = value.toLowerCase(); 
    return this.optionsState.filter(state => state.toLowerCase().includes(filterValueState));
  }
  getOrderConfig(){
    this.orderConfig = JSON.parse(localStorage.getItem('orderConfig'));
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
  changeState(state){
    var currState = this.states.filter(st => st.name.toLowerCase() === state.toLowerCase())[0];
    this.cities = csc.getCitiesOfState(this.companyConfig.isoCode,currState["isoCode"]);
    this.cityAutoComplete = this.cities.map(city => city.name);
    this.optionsCity = this.cityAutoComplete;
    this.filteredOptionsCity = this.myControlCity.valueChanges
        .pipe(
          startWith(''),
          map(value => this.filterCity(value))
        );
  }
  filterCity(value: string): string[] {
    const filterValueCity = value.toLowerCase(); 
    return this.optionsCity.filter(city => city.toLowerCase().includes(filterValueCity));
  }
  changeCity(city){
    var currCity = city;
  }
  selectDate(date){

this.estimateDate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
// console.log(this.advancebooking);
// console.log(this.estimateDate);
// this.dateConverter(date)
  }
//   dateConverter(inputDate){
//     let estimateday;
//     let estimatemonth;
//     let estimateYear;
//      if(inputDate == null || inputDate == undefined){
//     return null;
//   }else{
//     let presentDate = new Date(inputDate).toLocaleDateString('en-US', {timeZone: `${this.companyConfig.timeZone}`});
//     let month = presentDate.split('/')[0];
//     let day = presentDate.split('/')[1] ;
//     let year = presentDate.split('/')[2];
//     estimateday = +day+1;
//     estimatemonth = month;
//     estimateYear = year;
//     if(+month == 1 || +month == 3 || +month == 5 || +month == 7 || +month == 8 || +month == 10 || +month == 12 ){
//       if(+day == 31){
//         estimateday = 1;
//         estimatemonth = +month+1;
//       }
//     }else if (+month == 2){
//       if(((+year % 4) == 0) && (+day == 29)){
//        estimateday = 1;
//        estimatemonth = +month + 1;
//       }else if(+day == 28){
//        estimateday = 1;
//        estimatemonth = +month + 1;
//       }
//     }else{
//       if(+day == 30){
//        estimateday = 1;
//        estimatemonth = +month+1;
//       }
//     }
//     this.estimateDate = estimateYear+"-"+estimatemonth+"-"+estimateday;
//     console.log(this.estimateDate);
//   }
//  }
  appointmentSubmit(appointmentForm?: NgForm){
   let data = Object.assign({}, appointmentForm.value);
   data.eventDate = this.estimateDate;
   data.eventId = this.eventId;
   data.userUid = this.userUid
  //  console.log(data);
  // if(this.userUid == undefined){
    this.firestore.collection("AppointmentManagements").add(data).then(docId =>{
      let docRef= docId.id;
      this.firestore.collection("AppointmentManagements").doc(docRef).update({appointmentDocId: docRef}).then(res => {
        var analyticsData = {
          "event-id" : data.eventId,
          "event-doc-id" : docRef,
          "event-date" : data.eventDate,
          "event-time" : data.eventTime,
          "event-type" : data.eventType,
          "contact-name" : data.fullName,
          "contact-mobile" : data.mobile,
          "contact-email" : data.email,
          "no-of-slots" : data.noOfSlots,
        }
        this.analyticsService.setEcommerceEvent('e-commerce','event-booking',analyticsData)
      })
    })
  var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'event_Booked').pop();
      var alertMsg = productAlert.alertMsgType;
      this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading + " " + this.eventId); 
   this.appointmentResetform();
   this.router.navigate(['/profile']);
  // let currentUrl = this.router.url;
  // this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
  //     this.router.navigate([currentUrl]);
  // });
   this.topFunction();
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
  getCategoryList(){
    this.categoryService.getAppointmentCategory().subscribe(item =>{
      this.categoryList = item.docs.map(list =>{
        return{
          categoryDocId: list.id,
                       ...list.data()
        }as Category
      })
      this.categoryList.sort(function(a,b){
        return a.categoryId - b.categoryId
      })
    })
  }
  categorySelect(category){
    console.log(category);
  }
  getSubcategoryList(){
    this.subcategoryService.subcategory().subscribe(item =>{
      this.subcategoryList = item.docs.map(list =>{
        return{
          subcategoryDocId:list.id,
                          ...list.data()
        }as SubCategory
      })
      this.subcategoryList.sort(function(a,b){
        return a.subcategoryId - b.subcategoryId
      })
    })
  }
  selectedSubcategory(subcategory){
    console.log(subcategory)
  }
  getProductList(){
    this.productService.getAppointmentProducts().subscribe(item =>{
      this.productList = item.docs.map(list =>{
        return{
          productdocId: list.id,
                      ...list.data()
        }as Product
      })
      console.log(this.productList);
    })
  }
}
