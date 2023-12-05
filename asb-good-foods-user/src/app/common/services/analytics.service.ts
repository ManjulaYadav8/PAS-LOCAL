import { Injectable } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

   public userProfile = JSON.parse(localStorage.getItem('userProfile'));
   public userId = JSON.parse(localStorage.getItem('userid'));
   public emailId = JSON.parse(localStorage.getItem('emailId'));
   public companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
   public userInfo = {};

    constructor(public firestore: AngularFirestore,
                private relatimeDb: AngularFireDatabase,
              private angularFireAnalytics : AngularFireAnalytics) { 
              }

   getUserInfo(){
    this.userInfo = {};
    this.userInfo["created-dtm"] = new Date().toLocaleString('en-US', {timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`});
    if(JSON.parse(localStorage.getItem('userid'))){
        this.userInfo["user-id"] = JSON.parse(localStorage.getItem('userid'));
    }
    if(JSON.parse(localStorage.getItem('emailId'))){
        this.userInfo["email-id"] = JSON.parse(localStorage.getItem('emailId'));
    }
    if(JSON.parse(localStorage.getItem('userProfile'))){

        this.userInfo["user-type"] = JSON.parse(localStorage.getItem('userProfile')).userType;
        this.userInfo["user-sub-type"] = JSON.parse(localStorage.getItem('userProfile')).userSubType;

        if(JSON.parse(localStorage.getItem('userProfile')).userType === "BUSINESS"){
          this.userInfo["business-discount-rate"] = JSON.parse(localStorage.getItem('userProfile')).businessDiscountRate;
          this.userInfo["company-name"] = JSON.parse(localStorage.getItem('userProfile')).companyName;
          this.userInfo["company-gst"] = JSON.parse(localStorage.getItem('userProfile')).companyGst;
          this.userInfo["company-pan"] = JSON.parse(localStorage.getItem('userProfile')).companyPan;
          this.userInfo["company-cin"] = JSON.parse(localStorage.getItem('userProfile')).companyCin;
        }
    }
   }
   constructDate(){
    var dateTime = new Date();
    var date = dateTime.toLocaleString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split("/")[1];
    var month = dateTime.toLocaleString('en-US', { month: 'short' ,timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`});
    var year = dateTime.toLocaleString('en-US', { timeZone: `${JSON.parse(localStorage.getItem('companyConfig')).timeZone}`}).split(",")[0].split("/").pop();
    var today = date+"-"+month+"-"+year;
    return today;
   }
   setLogEvent(type,event,id,source){
    this.getUserInfo();
    var data = Object.assign(this.userInfo,{"source" : source});
    return this.relatimeDb.database.ref(this.constructDate()).child(type).child(event).child(id).push(data).then(res => {
      this.setSummaryEvent(type,event).then(res => {
        this.setViewSummaryEvent(type,event,id);
      });
    });
   }
   setAuthEvent(type,event,data){
    this.getUserInfo();
    var data = Object.assign(this.userInfo,data);
    return this.relatimeDb.database.ref(this.constructDate()).child(type).child(event).push(data).then(res => {
      this.setSummaryEvent(type,event);
    });
   }
   setEcommerceEvent(type,event,data){
    this.getUserInfo();
    var data = Object.assign(this.userInfo,data);
    return this.relatimeDb.database.ref(this.constructDate()).child(type).child(event).push(data).then(res => {
      this.setSummaryEvent(type,event);
    });
   }
   setSummaryEvent(type,event){
     return this.relatimeDb.database.ref(this.constructDate()).child('summary').child(type).update({ [event] : firebase.default.database.ServerValue.increment(1)}).then(res => {
      this.relatimeDb.database.ref("till-date").child(type).update({ [event] : firebase.default.database.ServerValue.increment(1)})
     });
   }
   setViewSummaryEvent(type,event,id){
    return this.relatimeDb.database.ref(this.constructDate()).child('summary').child(event).update({ [id] : firebase.default.database.ServerValue.increment(1)}).then(res => {
      this.relatimeDb.database.ref("till-date").child(event).update({ [id] : firebase.default.database.ServerValue.increment(1)})
     });
   }
}
  