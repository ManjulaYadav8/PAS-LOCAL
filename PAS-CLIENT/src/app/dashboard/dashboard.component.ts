import { Component, OnInit } from '@angular/core';
import { PasServiceService } from '../Service/pas-service.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  p1:any=1;
  searchString:any=""

  recentordersData:any;
  recentordersDatalength:number=0;
  isRecentOrderTxn:boolean=true;
  noRecentOrderTxnData:boolean=false;


  constructor(private _passervice: PasServiceService) { }

  ngOnInit(): void {
    this. getAllItems();
  }

  getAllItems(){
    let params=`?fields=%5B"item_name","item_group","description","image","item_code","stock_uom"%5D&filters=[["disabled","=",0]]&limit_page_length=Infinity`
     // let params='?fields=%5B"item_name","item_group","advance_discount","item_tax_template","credit_discount","direct_discount","parent_group","description","selling_price","image","item_code","item_tax","stock_uom","supplier_location","supplier_location_name","supplier","supplier_desc","supplier_icon"%5D&filters=[["disabled","=",0]]&limit_page_length=Infinity';
     this._passervice.s_getAllItems(params).subscribe((res:any)=>{
       console.log(res["data"]);
       this.recentordersData=res.data
       this.recentordersDatalength=res["data"].length
       if ( res['data'] != 'No record found' && res['data'].length > 0) {

       
        this.recentordersData = res['data'];

        // for (let i = 0; i < this.recentordersData.length; i++) {

         


        //   // let date = this.recentordersData[i]['creation'].slice(0, 10);
        //   // let time = this.recentordersData[i]['creation'].slice(11, 19);
        //   // console.log(date);
        //   // console.log(time);


        //   // this.recentordersData[i]['Date'] = date;
        //   // this.recentordersData[i]['Time'] = time;

        // }
        // console.log(this.weeklyFastagTransactionData);
        this.recentordersDatalength = this.recentordersData.length;
        this.isRecentOrderTxn = false;

      }
      else {
        this.isRecentOrderTxn = false;
        this.noRecentOrderTxnData = true;
      }
     })
   }
 

}
