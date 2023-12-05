import { Component, OnInit, HostListener } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Cart } from '../common/models/cart.model';
import { DistanceFlatRates } from '../common/models/distance-flat-rates.model';
import { GlobalFlatRates } from '../common/models/global-flat-rates.model';
import { ItemwiseFlatRates } from '../common/models/itemwise-flat-rates.model';
import { CartService } from '../common/services/cart.service';
import { CompanyService } from '../common/services/company.service';
import { DistanceFlatRatesService } from '../common/services/distance-flat-rates.service';
import { GlobalFlatRatesService } from '../common/services/global-flat-rates.service';
import { ItemwiseFlatRatesService } from '../common/services/itemwise-flat-rates.service';
import { OrderService } from '../common/services/order.service';
import csc from 'country-state-city'
import { Observable } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { ShippingType } from '../common/models/shipping-type.model';
import { ShippingTypeService } from '../common/services/shipping-type.service';
import { AnalyticsService } from '../common/services/analytics.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  sameAddress = true;
  defaultAddress = true;
  quick = false;
  normal = true;
  pickup = false;
  displayAddress;
  userUid;
  mobNumberPattern = "^[0-9]{6,12}$";
  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
  pinPattern = "[0-9]{6}$";
  profileData;
  emailId;
  mobileNum;
  addressline1;
  addressline2;
  sstate;
  scity;
  spincode;
  fullname;
  billingList;
  shippingList;
  sourcePincode;
  pincode;
  allPincodeList = [];
  // shippingCharges = 100;
  cartItemsList:Cart[];
  surfaceGlobalList: GlobalFlatRates[];
  surfaceDistanceList: DistanceFlatRates[];
  surfaceItemList: ItemwiseFlatRates[];
  airGlobalList: GlobalFlatRates[];
  airDistanceList: DistanceFlatRates[];
  airItemList: ItemwiseFlatRates[];
  shippingTypeList: ShippingType[];
  updateShippingType = [];
  configList;
  destinationpincode;
  defaultProfileAddress = true;
  companyConfig = null;
  states = [];
  cities : any = null;
  shippingCities : any = null;
  mode = null;
  selectedMode = null;
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

  myControlShippingState = new FormControl(null,[Validators.required,Validators.minLength(1)]);
  filteredOptionsShippingState: Observable<string[]>;
  shippingStateAutoComplete; 
  optionsShippingState: any[] = [''];
  selectedShippingState; 

  myControlShippingCity = new FormControl(null,[Validators.required,Validators.minLength(1)]);
  filteredOptionsShippingCity: Observable<string[]>;
  shippingCityAutoComplete; 
  optionsShippingCity: any[] = [''];
  selectedShippingCity; 
  
  constructor(public service: OrderService, private firestore: AngularFirestore, private router: Router, private analyticsService : AnalyticsService,
    private companyService: CompanyService, private globalService: GlobalFlatRatesService, private distanceService: DistanceFlatRatesService,
    private itemwiseService: ItemwiseFlatRatesService, private cartService: CartService, public shippingTypeService: ShippingTypeService) { }

  ngOnInit() {
    this.getLocalCache();
    this.getShippingTypeList();
    this.getUserProfile();
    this.resetForm();
    this.getCartItemsList();
    this.getBillingInfo();
    this.getShippingInfo();
    this.getConfigList();
    this.getSurfaceGlobalFlatRates();
    this.getSurfaceDistanceFlatRates();
    this.getSurfaceItemwiseFlatRate();
    // this.getAirGlobalFlatRates();
    this.getAirDistanceFlatRates();
    this.getAirItemwiseFlatRate();
  }
  getLocalCache() {
    this.userUid = JSON.parse(localStorage.getItem('userid'));
    this.companyConfig = JSON.parse(localStorage.getItem('companyConfig'));

    this.states = csc.getStatesOfCountry(this.companyConfig.isoCode);
    this.stateAutoComplete = this.states.map(state => state.name);
    this.optionsState = this.stateAutoComplete;
    this.filteredOptionsState = this.myControlState.valueChanges
        .pipe(
          startWith(''),
          map(value => this.filterState(value))
        );
    // shipping
    this.shippingStateAutoComplete = this.states.map(state => state.name);
    this.optionsShippingState = this.shippingStateAutoComplete;
    this.filteredOptionsShippingState = this.myControlShippingState.valueChanges
        .pipe(
          startWith(''),
          map(value => this.filterShippingState(value))
        );
  }

  filterState(value: string): string[] {
    const filterValueState = value.toLowerCase(); 
    return this.optionsState.filter(state => state.toLowerCase().includes(filterValueState));
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
  // Shipping
  filterShippingState(value: string): string[] {
    const filterValueShippingState = value.toLowerCase(); 
    return this.optionsShippingState.filter(state => state.toLowerCase().includes(filterValueShippingState));
  }
  changeShippingState(state){
    var currShippingState = this.states.filter(st => st.name.toLowerCase() === state.toLowerCase())[0];
    this.cities = csc.getCitiesOfState(this.companyConfig.isoCode,currShippingState["isoCode"]);
    this.shippingCityAutoComplete = this.cities.map(city => city.name);
    this.optionsShippingCity = this.shippingCityAutoComplete;
    this.filteredOptionsShippingCity = this.myControlShippingCity.valueChanges
        .pipe(
          startWith(''),
          map(value => this.filterShippingCity(value))
        );
  }
  filterShippingCity(value: string): string[] {
    const filterValueShippingCity = value.toLowerCase(); 
    return this.optionsShippingCity.filter(city => city.toLowerCase().includes(filterValueShippingCity));
  }
  changeShippingCity(city){
    var currShippingCity = city;
  }
  getCartItemsList() {
    this.cartItemsList = JSON.parse(localStorage.getItem('cart'));
    // this.firestore.collection('Cart').doc(`${this.userUid}`).collection('Cart').get().subscribe(cart => {
    //   this.cartItemsList = cart.docs.map(list => {
    //     return {
    //       CartDocId: list.id,
    //       ...list.data()
    //     } as Cart;
    //   });
    // })
  }
  resetForm(form?: NgForm) {
    if (form != null)
      form.resetForm();
    this.service.formData = {
      orderDocId: '',
      fullName: '',
      mobile: null,
      pinCode: null,
      addressLine1: '',
      city: '',
      state: '',
      standard: true,
      addressLine2: '',
      sameAddress: true,
      defaultAddress: true,
      sfullName: '',
      saddressLine2: '',
      smobile: null,
      spinCode: null,
      saddressLine1: '',
      scity: '',
      sstate: '',
      tracked: false,
      date: Date(),
      orderId: null,
      email: '',
      total: null,
      pdf: '',
      quickmode: false,
      normalmode: true,
      pickupmode:false,
      productWeight:null,
      deliveredDate:Date(),
      estimatedDeliveryDate:null,
      orderReqDate:null
    }
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
  getShippingTypeList(){
    this.shippingTypeService.getShippingType().subscribe(shipping =>{
     this.shippingTypeList = shipping.docs.map(list =>{
       return{
         shippingTypeDocId: list.id,
                          ...list.data()
       }as ShippingType;
     })
    })
  }
  shippingTypeMode(shipping){
    this.mode = shipping.shippingTypeName;
    this.displayAddress = shipping.showAddressFields;
    // if(this.mode === "pickup"){
    //   this.defaultAddress = true;
    // }else{
    //   this.defaultAddress = false;
    // }
  }
  // pickupmode(checked){
  //  this.pickup = checked.target.checked;
  //  this.normal = false;
  //  this.quick = false;
  // }
  // quickmode(checked) {
  //   this.quick = checked.target.checked;
  //   this.normal = false;
  //   this.pickup = false;
  // }
  // normalmode(checked) {
  //   this.normal = checked.target.checked;
  // }
  getUserProfile() {
   var profile;
   var checkOutData;
    this.firestore.collection('User').doc(`${this.userUid}`).get().subscribe(user => {
      profile = user.data();
      this.emailId = profile.email;
      this.fullname = profile.name;
      this.mobileNum = profile.mobile;
    })
    this.firestore.collection('User').doc(this.userUid).collection('Addresses').doc('home').get().subscribe(address =>{
        this.profileData = address.data();
        if(this.profileData == undefined){
       this.defaultAddress = false;
        }else{
        this.addressline1 = this.profileData.addressLine1;
        this.addressline2 = this.profileData.addressLine2;
        this.sstate = this.profileData.state;
        this.scity = this.profileData.city;
        this.spincode = this.profileData.pincode;
        }
    })
    this.firestore.collection('CheckOutAddress').doc(this.userUid).get().subscribe(checkOut =>{
       checkOutData = checkOut.data();
       if(checkOutData != undefined){
        this.selectedMode = checkOutData.mode;
        this.mode = this.selectedMode;
        this.displayAddress = checkOutData.displayAddress;
        // if(this.mode === "pickup"){
        //   this.defaultAddress = true;
        // }else{
        //   this.defaultAddress = false;
        // }
      }
    })
  }
  defaultChange(checked) {
    if(this.addressline1 == undefined){
      this.defaultAddress = false;
    }else{
      this.defaultAddress = checked.target.checked;
    }
  }
  defaultprofileChange(checked){
    if(this.fullname == undefined){
      this.defaultProfileAddress = false;
    }else{
      this.defaultProfileAddress = checked.target.checked;
    }
  }
  onChange(checked) {
    this.sameAddress = checked.target.checked;
  }
  getBillingInfo(){
    this.firestore.collection('CompanyInfo').doc('Billing').get().subscribe(billing =>{
      this.billingList = billing.data(); 
    });
  }
  getShippingInfo(){
    this.firestore.collection('CompanyInfo').doc('Shipping').get().subscribe(shipping =>{
    this.shippingList = shipping.data(); 
    })
  }
  getConfigList() {
    this.firestore.collection('ConfigInfo').doc('config').get().subscribe(business =>{
         this.configList = business.data();
    })    
  }
  getSurfaceGlobalFlatRates(){
    this.globalService.getSurfaceGlobalRates().subscribe(global =>{
     this.surfaceGlobalList = global.map(list =>{
       return{
         zoneDocId:list.payload.doc.id,
                  ...list.payload.doc.data()
       }as GlobalFlatRates
      })   
    })
  }
  getSurfaceDistanceFlatRates(){
    this.distanceService.getSurfaceDistanceRates().subscribe(zones =>{
       this.surfaceDistanceList = zones.map(list =>{
         return{
           distanceDocId: list.payload.doc.id,
                       ...list.payload.doc.data()
         }as DistanceFlatRates;
       })
     })
   }
  getSurfaceItemwiseFlatRate(){
    this.itemwiseService.getSurfaceItemRates().subscribe(item =>{
      this.surfaceItemList = item.map(list =>{
        return{
          itemwiseDocId:list.payload.doc.id,
                       ...list.payload.doc.data()
        }as ItemwiseFlatRates
      })
    })
  }
  // getAirGlobalFlatRates(){
  //   this.globalService.getAirGlobalRates().subscribe(global =>{
  //    this.airGlobalList = global.map(list =>{
  //      return{
  //        zoneDocId:list.payload.doc.id,
  //                 ...list.payload.doc.data()
  //      }as GlobalFlatRates
  //     })   
  //   })
  // }
  getAirDistanceFlatRates(){
    this.distanceService.getAirDistanceRates().subscribe(zones =>{
       this.airDistanceList = zones.map(list =>{
         return{
           distanceDocId: list.payload.doc.id,
                       ...list.payload.doc.data()
         }as DistanceFlatRates;
       })
     })
   }
  getAirItemwiseFlatRate(){
    this.itemwiseService.getAirItemRates().subscribe(item =>{
      this.airItemList = item.map(list =>{
        return{
          itemwiseDocId:list.payload.doc.id,
                       ...list.payload.doc.data()
        }as ItemwiseFlatRates
      })
    })
  }
  setBeginCheckout(cart){
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
      this.analyticsService.setEcommerceEvent('e-commerce','begin-checkout',cartList);
    }
  }
  onSubmit(form: NgForm) {
    var address = form.value
    var analyticsData = {
      "address-line-1" : "",
      "address-line-2" : "",
      "city" : "",
      "name" : "",
      "pincode" : "",
      "state" : "",
    }
if(form.value){
  if(this.displayAddress == 'yes'){
  if(address.sameAddress){
     analyticsData = {
      
      "address-line-1" : address.addressLine1,
      "address-line-2" : address.addressLine2,
      "city" : address.city,
      "name" : address.fullName,
      "pincode" : address.pincode,
      "state" : address.state,
    }
  }else{
     analyticsData = {
      "address-line-1" : address.saddressLine1,
      "address-line-2" : address.saddressLine2,
      "city" : address.scity,
      "name" : address.sfullName,
      "pincode" : address.spincode,
      "state" : address.sstate,
    } 
  }
}
  this.analyticsService.setEcommerceEvent('e-commerce','add-shipping-info',analyticsData).then(res => {
    this.setBeginCheckout(this.cartItemsList);
  });

}
   var grandTotal = 0;
   var deliveryThresholdamt = 0;
   var shippingCharges = 0;
    var itemListWeight = 0;
    for(var i=0; i<this.cartItemsList.length; i++){
      itemListWeight += this.cartItemsList[i].productWeight * this.cartItemsList[i].quantity;
      grandTotal += this.cartItemsList[i].productPrice * this.cartItemsList[i].quantity;
    }
    let data = Object.assign({}, form.value);
    let shippingData;
    if(this.displayAddress == 'yes'){
   if(data.sameAddress == false){
      var shipping ={
        "addressLine1" : address.saddressLine1,
        "addressLine2" : address.saddressLine2,
        "city" : address.scity,
        "name" : address.sfullName,
        "pincode" : address.spincode,
        "state" : address.sstate,
      }
      shipping["addresslabel"]='office';
     shippingData = Object.assign({},shipping);
     this.firestore.collection('User').doc(this.userUid).collection('Addresses').doc('office').set(shippingData);
    //  console.log(shippingData);
    }else{
      var billing = {
        "addressLine1" : address.addressLine1,
        "addressLine2" : address.addressLine2,
        "city" : address.city,
        "name" : address.fullName,
        "pincode" : address.pincode,
        "state" : address.state,
      }
      billing["addresslabel"]='home';
      // console.log(billing);
      var billingData = Object.assign({},billing)
      this.firestore.collection('User').doc(this.userUid).collection('Addresses').doc('home').set(billingData);
    }
  }
    data['mode']=this.mode;
    data['displayAddress'] = this.displayAddress;
    if(data.mobile == undefined){
    data['mobile'] = this.mobileNum;
    }
    if(data.email == undefined){
      data['email'] = this.emailId;
    }
    if(data.sameAddress == false){
      this.destinationpincode = data.spincode;
    }else{
      this.destinationpincode = data.pincode;
    }
    if(this.shippingList != undefined){
      data['sourcepincode'] = this.shippingList.pincode;
    }else{
    data['sourcepincode'] = this.billingList.pincode;
    }
    for(var i=0; i< this.shippingTypeList.length; i++){
      if(this.mode == this.shippingTypeList[i].shippingTypeName){
        if(this.configList.shippingSettings == 'global'){
            for(var i=0; i<this.surfaceGlobalList.length; i++){
              if(this.mode == this.surfaceGlobalList[i].mode){
                shippingCharges = this.surfaceGlobalList[i].zoneCost;
                deliveryThresholdamt = this.surfaceGlobalList[i].zoneDeliveryThresholdAmt;
              }
            }
        }else if(this.configList.shippingSettings == 'distance'){
          for(var i=0; i<this.airDistanceList.length; i++){
            for(var j=0; j<this.airDistanceList[i].zonePincode.length; j++){
              if(this.airDistanceList[i].zonePincode[j] == this.destinationpincode){
                shippingCharges = this.airDistanceList[i].distanceCost
              }else if(this.airDistanceList[i].zoneName.toLowerCase() == "default"){
                shippingCharges = this.airDistanceList[i].distanceCost
             }
            }
          }
        }
      }
    }
    if(grandTotal < deliveryThresholdamt){
      data.shippingCharges = shippingCharges;
    }else{
      data.shippingCharges = 0;
    }
    this.firestore.collection('CheckOutAddress').doc(this.userUid).set(data);
    this.router.navigate(['/ordersummary']);
    this.topFunction();
  }
}
