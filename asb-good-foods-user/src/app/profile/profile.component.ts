import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, take } from 'rxjs/operators';
import { Cart } from '../common/models/cart.model';
import { Order } from '../common/models/order.model';
import { Profile } from '../common/models/profile.model';
import { CompanyService } from '../common/services/company.service';
import { LoginService } from '../common/services/login.service';
import { ProfileService } from '../common/services/profile.service';
import { FormControl, NgForm, Validators } from '@angular/forms';
import csc from 'country-state-city'
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators'
import { MetaTagService } from '../common/services/meta-tag.service';
import { AnalyticsService } from '../common/services/analytics.service';
import { Appointment } from '../common/models/appointment.model';
import { AlertMessageService } from '../common/services/alert-message.service';
import { AlertMessage } from '../common/models/alert-message.model';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userUid;
  userList;
  orderItems: Order[];
  orderItemsData = [];
  orderDocId = [];
  orderItemsDataList: Order[];
  cartDocId = [];
  allSelectingValue = [{name:'Profile'},{name:'Address'},{name:'Orders'},{name:'Events'}]
  config;
  selectedVal = 'Orders';
  mobselectedVal;
  selectedIndex = 2;
  imgSrc: string = "/assets/avatar.png";
  selectedImage= null;
  businessPanFile = null;
  supportingDocFile = null;
  editProfile;
  orderId = 0;
  eventId =0;
  editAddressData;
  addressDocId;
  addressList: Profile[];
  eventList: Appointment[];
  mobNumberPattern = "^[0-9]{6,12}$";
  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
  pincodePattern = "[0-9]{6}$";
  reOrdering;
  sortVariable="Order Id";
  searchString = "";
  productMatList : MatTableDataSource<any>;
  editAddressLine1;
  editAddressLine2;
  editCity;
  editState;
  editPincode;
  cartItemsList: Cart[];
  formFilesUrl = [];
  primaryUser : any = {};
  companyConfig = null;
  states = [];
  cities : any = null;

  myControlState = new FormControl(null,[Validators.required,Validators.minLength(1)]);
  filteredOptionsState: Observable<string[]>;
  stateAutoComplete; 
  optionsState: any[] = [''];
  selectedState; 

  myControlCity = new FormControl(null,[Validators.required,Validators.minLength(1)]);
  filteredOptionsCity: Observable<string[]>;
  cityAutoComplete; 
  optionsCity: any[] = [''];
  selectedCity; 
  alertMessages: AlertMessage[];

  userTypeToggle = ["INDIVIDUAL","BUSINESS"]
  selectedUserType = this.userTypeToggle[0];

  @ViewChild('fileUploader') fileUploader: ElementRef;
  @ViewChild('businessPanUpload') businessPanUpload: ElementRef;
  @ViewChild('supportingDocUpload') supportingDocUpload: ElementRef;

  constructor(private firestore: AngularFirestore, public profileService: ProfileService,
    private router: Router, private loginService: LoginService, private storage: AngularFireStorage,
    private metaTagService : MetaTagService,private analyticsService : AnalyticsService,
    private companyService: CompanyService, private toastr: ToastrService, private alertMsgService: AlertMessageService) { }

  ngOnInit() {
    this.metaTagService.setTitleMetaTag(this.router.url);
    this.getLocalCache();
    this.getUserItems();
    this.getOrderItems();
    this.getAllAddress();
    this.getEventList();
    this.config = {
      id: 'custom',
      itemsPerPage: 2,
      currentPage: 1,
      totalItems: 4
    };
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
  resetForm(profileForm?: NgForm) {
    if (profileForm != null)
    profileForm.resetForm();
    this.profileService.profileData = {
      email: '',
      mobile:null,
      date: Date(),
      userDocId:'',
      orderItems:null,
      fullName: '',
      addressLine2: '',
      pincode: null,
      addressLine1: '',
      city: '',
      state: '',
      sameAddress: false,
      sfullName: '',
      saddressLine2: '',
      smobile: null,
      spinCode: null,
      saddressLine1: '',
      scity: '',
      sstate: '',
      profileUrl: '',
      addresslabel: '',
      userType : null,
      userCompanyName: null,
      companyGst : null,
      companyCin : null,
      companyPan : null,
      businessPanUrl : null,
      supportingDocUrl : null,
    }
  }
  logout(){
    this.analyticsService.setAuthEvent('auth','logout',{}).then(res => {
                                                  localStorage.removeItem('email');
                                                  localStorage.removeItem('userid');  
                                                  localStorage.removeItem('emailId'); 
                                                  localStorage.removeItem('userProfile'); 
                                                  localStorage.removeItem('orderConfig');
                                                  localStorage.removeItem('webUserType');
                                                  localStorage.removeItem('cart');
                                                  localStorage.removeItem('cartCoupon');
                                                  this.loginService.logout(); 
                                                 })

  }
  getAllAddress(){
    this.firestore.doc('User/' + this.userUid).collection('Addresses').snapshotChanges().subscribe(user =>{
      this.addressList = user.map(list =>{
        return{
          userDocId: list.payload.doc.id,
                    ...list.payload.doc.data()
        }as Profile
      })
    })
  }
  continueShopping() {
    this.router.navigate(['/products']);
  }
  selectedValue(value, i){
    this.topFunction();
    // console.log(value)
    this.selectedIndex = i;
    this.selectedVal = value;
    // console.log(this.selectedVal);
  }
  selectedmobValue(value){
    // console.log(value);
    this.mobselectedVal = value;
  }
  getOrderItems() {
    this.firestore.collection('Order', ref => ref.where('userId', '==', this.userUid)).snapshotChanges().subscribe(data => {
      this.orderItems = data.map(item => {
        return {
          orderItemDocId: item.payload.doc.id,
          ...item.payload.doc.data() as {}
        } as Order;
      })
      // console.log(this.orderItems)
      this.orderItems.sort((a, b) => Number(new Date(b.date).getTime()) - Number(new Date(a.date).getTime()));
      this.getSeparateOrderItems(this.orderItems)
    })
  }
  getSeparateOrderItems(orderItems) {
    this.orderItemsData = orderItems;
    
    this.config = {
      id: 'custom',
      itemsPerPage: 2,
      currentPage: 1,
      totalItems: this.orderItemsData.length
    };
    this.orderId = this.orderItemsData.length;
    // console.log(this.orderId)
  }
  // getOrderItemsList() {
  //   for (var i = 0; i < this.orderDocId.length; i++) {
  //     this.firestore.collection('Order').doc(this.orderDocId[i]).collection('OrderItems').snapshotChanges().subscribe(order => {
  //       this.orderItemsDataList = order.map(list => {
  //         return {
  //           orderDocId: list.payload.doc.id,
  //           ...list.payload.doc.data() as {}
  //         } as Order;
  //       })
  //       for (var j = 0; j < this.orderItemsDataList.length; j++) {
  //         this.orderItemsData.push(this.orderItemsDataList[j]);
          
  //       }
  //     })
  //   }
  // }
  viewOrderDetails(order){
   this.router.navigate(['/profile',order.orderItemDocId],{queryParams : {'type' : 'Order'}});
  }
  viewEventDetails(event){
    this.router.navigate(['/profile',event.appointmentDocId],{queryParams : {'type' : 'Event'}});
  }
  getUserItems() {
    this.firestore.collection('User').doc(`${this.userUid}`).snapshotChanges().subscribe(order => {
      this.userList = order.payload.data();
      this.selectedUserType = order.payload.data()["userType"];
      this.editProfile = this.userList.profileUrl;
    })
  }

  showPreview(event: any,fileType) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.editProfile = e.target.result;
      reader.readAsDataURL(event.target.files[0]);
      if(fileType === "PROFILE"){
        this.selectedImage = event.target.files[0];
      }
      if(fileType === "BUSINESS PAN"){
        this.businessPanFile = event.target.files[0];
      }
      if(fileType === "SUPPORTING DOC"){
        this.supportingDocFile = event.target.files[0];
      }
    }
  }
  clearFiles(){
    this.selectedImage= null;
    this.businessPanFile = null;
    this.supportingDocFile = null;
    if(this.fileUploader){
      this.fileUploader.nativeElement.value = null;
    }
    if(this.businessPanUpload){
      this.businessPanUpload.nativeElement.value = null;
    }
    if(this.supportingDocUpload){
      this.supportingDocUpload.nativeElement.value = null;
    }
  }
  genericfileUploader(file,filePath,formName){
     filePath = filePath+"."+file.name.split('.').pop();
      const fileRef = this.storage.ref(filePath);
      this.storage.upload(filePath,file).snapshotChanges().pipe(
        finalize(()=>{
          fileRef.getDownloadURL().subscribe((url)=>{
            this.firestore.doc('User/' + this.userUid).update({ [formName] : url});
          })
        })
      ).subscribe()
      
  }
   profileSubmit(profileForm) {
      profileForm = {...profileForm,"userType" : this.selectedUserType };

      if(this.selectedImage != null){
        var filePath = `Profile/${this.userUid}/PROFILE`;
        this.genericfileUploader(this.selectedImage,filePath,'profileUrl')
      } 
      // BUSINESS PAN
      if(this.selectedUserType ==="BUSINESS" && this.businessPanFile != null){
        var filePath = `Profile/${this.userUid}/DOCS/BUSINESS-PAN`;
        this.genericfileUploader(this.businessPanFile,filePath,'businessPanUrl')
      } 
      // SUPPORTING DOC
      if(this.selectedUserType ==="BUSINESS" && this.supportingDocFile != null){
        var filePath = `Profile/${this.userUid}/DOCS/SUPPORTING-DOCS`;
        this.genericfileUploader(this.supportingDocFile,filePath,'supportingDocUrl')
      } 
      // PRIMARY USER CHECK
      if(this.selectedUserType ==="BUSINESS" && profileForm.companyGst && !this.userList.hasOwnProperty('businessApproval')){
        this.checkPrimaryUser(profileForm);
      }
      this.firestore.doc('User/' + this.userUid).update(profileForm).then(res => {
          this.resetForm();
      });
  }
  checkPrimaryUser(formData){
    this.firestore.collection('User').ref.where("companyGst","==", formData.companyGst)
                  .where("userSubType","==","PRIMARY")
                  .where("businessApproval","==", true)
                  .where("status","==","active")
                  .get().then(res => {
                    res.docs.map((doc,index) => {
                     if(index === 0){
                       this.primaryUser = {
                         userId : doc.id,
                         ...doc.data() as {}
                       } 
                       if(this.primaryUser){
                         this.firestore.collection('User').doc(this.primaryUser.userId)
                             .update({ "delegatedUsers" : [...this.primaryUser.delegatedUsers,this.userUid] }).then(res => {
                                this.firestore.doc('User/' + this.userUid)
                                    .update(Object.assign(formData,{ "businessApproval" : true , 
                                                                     "userSubType" : "DELEGATED" , 
                                                                     "primaryUserId" : this.primaryUser.userId }));
                        })
                       }
                     }
                    })
                  }).catch(err => {});
                                  
  }
  addressSubmit(addressForm: NgForm) {
    // this.firestore.doc('User/' + this.userUid).update({"sameAddress" : false})
    let data = Object.assign({}, addressForm.value);
    data['addresslabel'] = this.editAddressData.addresslabel;
    this.firestore.doc('User/' + this.userUid).collection('Addresses').doc(data.addresslabel).update(data).then(res =>{
      this.resetForm();
    })
  }
  addAddressSubmit(addaddressForm: NgForm){
    let data = Object.assign({}, addaddressForm.value);
    // console.log(data);
    this.firestore.doc('User/' + this.userUid).collection('Addresses').doc(data.addresslabel).set(data).then(res =>{
      this.resetForm();
    });
    // .then(docId =>{
      // let addressDocId = docId.id;
      // this.firestore.doc('User/' + this.userUid).collection('Addresses').doc(addressDocId).update({userDocId:addressDocId});
    // })
  }
  editAddress(address){
    this.editAddressData = address;
    this.editAddressLine1 = address.addressLine1;
    this.editAddressLine2 = address.addressLine2;
    this.editCity = address.city;
    this.editState = address.state;
    this.editPincode = address.pincode;
  //  console.log(address);
  }
  deleteAddress(address){
    this.addressDocId = address.userDocId;
  }
  cartDelete(){
    this.firestore.doc('User/' + this.userUid).collection('Addresses').doc(this.addressDocId).delete();
  }
  reorder(reorder){
  //  console.log(reorder);
   this.reOrdering = reorder;
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
        // console.log( "Add" +this.cartDocId);
        this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${cartDocId}`).update({ "CartDocId": cartDocId });
    
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
      if(i === 0){
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'product_Added').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
      }
      
    }else{
      this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').doc(`${obj.CartDocId}`).update({ 'quantity': (obj.quantity) + 1 })
      if(i === 0){
        var productAlert = this.alertMessages.filter(item => item.alertMsgName == 'quantity_Updated').pop();
        var alertMsg = productAlert.alertMsgType;
        this.toastr[alertMsg](productAlert.alertMsgText,productAlert.alertMsgHeading); 
      }
      
    }
     }
     
  }
  orderIdselect(finalData) {
    this.sortVariable = "Order Id";
    finalData.sort((a, b) => Number(b.orderId) - Number(a.orderId));
  }

  date(finalData) {
    this.sortVariable = "Date";
    finalData.sort((a, b) => Number(new Date(b.date).getTime()) - Number(new Date(a.date).getTime()));
  }
  hightolow(finalData){
   this.sortVariable = "High To Low";
   finalData.sort((a, b) => Number(b.total) - Number(a.total));
  }
  lowtohigh(finalData){
    this.sortVariable = "Low To High";
    finalData.sort((a, b) => Number(a.total) - Number(b.total));
  }
  changeUserType(value){
    this.selectedUserType = value;
  }
   getLocalCache() {
    this.userUid = JSON.parse(localStorage.getItem('userid'));
    this.companyConfig = JSON.parse(localStorage.getItem('companyConfig'));

    this.states = csc.getStatesOfCountry(this.companyConfig.isoCode);
    // console.log(this.states);
    this.stateAutoComplete = this.states.map(state => state.name);
    this.optionsState = this.stateAutoComplete;
    this.filteredOptionsState = this.myControlState.valueChanges
        .pipe(
          startWith(''),
          map(value => this.filterState(value))
        );
  }

  filterState(value: string): string[] {
    if(value){
      const filterValueState = value.toLowerCase(); 
      return this.optionsState.filter(state => state.toLowerCase().includes(filterValueState));
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
  getEventList(){
    this.firestore.collection("AppointmentManagements", ref => ref.where("userUid","==",this.userUid)).get().subscribe(event=>{
      this.eventList = event.docs.map(list =>{
        return{
          appointmentDocId: list.id,
                          ...list.data() as {}
        }as Appointment
      })
      this.eventList.sort((a,b) => Number(new Date(b.eventDate).getTime()) - Number(new Date(a.eventDate).getTime()))
      this.eventId = this.eventList.length;
    })
  }
}
