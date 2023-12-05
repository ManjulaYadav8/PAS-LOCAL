import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Profile } from 'src/app/common/models/profile.model';
import { ProfileService } from 'src/app/common/services/profile.service';
import { FormControl, NgForm, Validators } from '@angular/forms';
import csc from 'country-state-city'
import { Observable } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators'

@Component({
  selector: 'app-mobaddress',
  templateUrl: './mobaddress.component.html',
  styleUrls: ['./mobaddress.component.css']
})
export class MobaddressComponent implements OnInit {

  userUid;
  userList;
  editProfile;
  latitude = 51.678418;
  longitude = 7.809007;
  locationChosen = false;
  addressList: Profile[];
  editAddressData;
  addressDocId;
  mobNumberPattern = "^[0-9]{6,12}$";
  emailpattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
  pincodePattern = "[0-9]{6}$";
  editAddressLine1;
  editAddressLine2;
  editCity;
  editState;
  editPincode;
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
  constructor(private firestore: AngularFirestore, public profileService: ProfileService) { }

  ngOnInit() {
    this.getLocalCache();
    this.getAllAddress();
    this.resetForm();
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
    document.body.scrollTop = 10; // For Safari
    document.documentElement.scrollTop = 10; // For Chrome, Firefox, IE and Opera

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
  addressSubmit(addressForm: NgForm) {
    // this.firestore.doc('User/' + this.userUid).update({"sameAddress" : false})
    let data = Object.assign({}, addressForm.value);
    // console.log(data);
    data['addresslabel'] = this.editAddressData.addresslabel;
    this.firestore.doc('User/' + this.userUid).collection('Addresses').doc(data.addresslabel).update(data).then(res => {
      this.resetForm();
    })
  }
  addAddressSubmit(addaddressForm: NgForm){
    let data = Object.assign({}, addaddressForm.value);
    // console.log(data);
    // this.firestore.doc('User/' + this.userUid).collection('Addresses').doc(data.addresslabel).set(data)
    this.firestore.doc('User/' + this.userUid).collection('Addresses').doc(data.addresslabel).set(data).then(res => {
      this.resetForm();
    });
  }
  editAddress(address){
    this.editAddressData = address;
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
  // onChoseLocation(event){
  // console.log(event);
  // this.latitude = event.coords.lat;
  // this.longitude = event.coords.lng;
  // this.locationChosen = true;
  // }
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
}
