import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class PasServiceService {

  

  constructor(private _http: HttpClient) { }
  Base_url = "http://localhost:5000";
  login_url = `${this.Base_url}/login`;




  login(userdata: any) {
    let body = userdata
    let httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', body: userdata }),
    };
    console.log(this.login_url);
    return this._http.post(this.login_url, body);
  }

  // get_all_item

  s_getAllItems(customparams: any) {
    console.log(customparams);
    let apikey=localStorage.getItem("api_key");
    let apisecret=localStorage.getItem("api_secret");
    let Token=`token ${apikey}:${apisecret}`
    
    let httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', params: customparams,authtoken: Token}),
    };

    return this._http.get(`${this.Base_url}/items/get_all_items`,httpOptions);
  }


//create_new_item
  s_createNnewItem(data:any){

    console.log(data);
    let apikey=localStorage.getItem("api_key");
    let apisecret=localStorage.getItem("api_secret");
    let Token=`token ${apikey}:${apisecret}`
    
    let httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json',authtoken: Token}),
    };

    return this._http.post(`${this.Base_url}/items/create_new_item`,data, httpOptions);


  }


  receipt(){
    let data={
      "docname": "Course Package Receipt",
      "clientId": "00005",
      "authkey": "teu9845liwskjlkiu40kieri65ke6t",
      "opdocname":"Course package",
      "refid":"56",
     "variables": {
          "rece_date": "10/09/2023",
          "receipt": "920653",
          "sishya_name": "Ram",
          "email_id": "ram123@gmail.com",
          "ph_no": "3456789789",
          "pay_trans_id": "7",
          "pay_date": "01/09/2023",
          "pay_time": "10:30 AM",
          "pay_value": "3000",
          "mode_of_payment": "online",
          "cour_pack": "package1",
          "price": "5000",
          "cgst_rate": "5%",
          "cgst": "4%",
          "sgst_rate": "3%",
          "sgst": "2%",
          "start_date": "02/03/2023",
          "end_date": "30/03/2023",
          "total_amt": "50000"
      }
      
  }
  return this._http.post(`${this.Base_url}/receipt`,data);

  }

  document(){
    return this._http.get(`${this.Base_url}/doc`);
  }
}


