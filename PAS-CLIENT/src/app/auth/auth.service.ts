import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isLoggedIn() {


    const apiSecret = localStorage.getItem('api_secret');
    const apiKey = localStorage.getItem('api_key');
    console.log(apiSecret);
    console.log(apiKey);
    
    

   
const token=`token ${apiKey}:${apiSecret}`
    if ((apiKey != null && apiSecret != null)||(apiKey != undefined && apiSecret != undefined) ) {
      // const payload = atob(token.split('')[1]);
      // console.log(payload);
      
      // // decode payload of token

      // const parsedPayload = JSON.parse(payload);
      // // convert payload into an Object


      // return parsedPayload.exp > Date.now() / 1000; // check if token is expired
      return true
    }


    else {
      return false
    }



  }
}
