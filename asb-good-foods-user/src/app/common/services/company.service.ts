import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  companyData: Company;
  companyConfig = JSON.parse(localStorage.getItem('companyConfig'));
  constructor(private firestore: AngularFirestore) { }

  getCompanyData(){
   return this.firestore.collection('CompanyInfo').doc('Billing').get();
  }
  getOrderConfig(){
    return this.firestore.collection('ConfigInfo').doc('orderConfig').get();
  }

  getCompanyConfig(){
    return new Promise((resolve,reject) => {
      if(!JSON.parse(localStorage.getItem('companyConfig'))){
        return this.firestore.collection('ConfigInfo').doc('config').get().subscribe(res => {
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
             resolve(this.companyConfig);
           }
         })
      }else{
        resolve(true);
      }
    })
  }
}
