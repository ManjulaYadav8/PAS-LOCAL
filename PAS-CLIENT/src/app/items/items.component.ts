import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasServiceService } from '../Service/pas-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  itemList:any;
  itemLength:number=0;
  p:number=1;
  view_product:any;

  constructor(private router: Router, private fb: FormBuilder, private _passervice: PasServiceService, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.getAllItems()
  }

  getAllItems(){
   let params=`?fields=%5B"item_name","item_group","description","image","item_code","stock_uom"%5D&filters=[["disabled","=",0]]&limit_page_length=Infinity`
    // let params='?fields=%5B"item_name","item_group","advance_discount","item_tax_template","credit_discount","direct_discount","parent_group","description","selling_price","image","item_code","item_tax","stock_uom","supplier_location","supplier_location_name","supplier","supplier_desc","supplier_icon"%5D&filters=[["disabled","=",0]]&limit_page_length=Infinity';
    this._passervice.s_getAllItems(params).subscribe((res:any)=>{
      console.log(res["data"]);
      this.itemList=res.data
      this.itemLength=res.data.length
    })
  }

  viewProduct(prod:any){
    console.log(prod);
    this.view_product=prod
    
  }
  addcart(item:any){
    console.log("cart Item--->", item);
    
  }

}
