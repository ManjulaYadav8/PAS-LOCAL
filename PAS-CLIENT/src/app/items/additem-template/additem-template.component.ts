import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PasServiceService } from 'src/app/Service/pas-service.service';


@Component({
  selector: 'app-additem-template',
  templateUrl: './additem-template.component.html',
  styleUrls: ['./additem-template.component.css']
})
export class AdditemTemplateComponent implements OnInit {
  itemattributeform: any;
  newitemform: any;

  tableLength: any = [0]
  attributes:any=[]
  attribute_obj:any={};



  constructor(private router: Router, private fb: FormBuilder, private _passervice: PasServiceService, private toastrService: ToastrService, private _deciamlpipe:DecimalPipe) {

    this.itemattributeform = new FormGroup({
      attribute: new FormControl("", [Validators.required]),
      attribute_value: new FormControl("", [Validators.required])
    })

  let pipe=  this._deciamlpipe.transform(22000000000,"2.0-0")


    this.newitemform = new FormGroup({
      item_code: new FormControl("", [Validators.required]),
      item_name: new FormControl("", [Validators.required]),
      item_group: new FormControl("", [Validators.required]),
      hsn_sac: new FormControl("", [Validators.required]),
      valuation_rate: new FormControl("", [Validators.required]),
      opening_stock: new FormControl("", [Validators.required]),
      standard_selling_rate: new FormControl("", [Validators.required]),
      selling_price: new FormControl("", [Validators.required]),
      image: new FormControl("", [Validators.required]),
      // brand: new FormControl("", [Validators.required]),
      // description: new FormControl("", [Validators.required]),
      supplier: new FormControl("", [Validators.required]),
      // supplier_des: new FormControl("", [Validators.required]),
      // warranty_period: new FormControl("", [Validators.required]),
      // barcode: new FormControl("", [Validators.required]),
      //barcode_type: new FormControl("", [Validators.required]),
      // attribute: new FormControl("", [Validators.required]),
      // attribute_value: new FormControl("", [Validators.required]),
      // default_warehouse: new FormControl("", [Validators.required]),
      // default_price_list: new FormControl("", [Validators.required]),



    })
  }

  ngOnInit(): void {
    


    
  }

  attribute(event:any){
    this.attribute_obj["attribute"]=event.target.value;

  }

  attribute_value(event:any){
    this.attribute_obj["attribute_value"]=event.target.value;

  }


  add_row(id: any) {
    this.attribute_obj={};
    console.log(id);


    // let index=this.tableLength.lastIndexOf(this.tableLength);
    this.tableLength.push(id + 1);
    console.log(this.itemattributeform.value);
 


  }
  delete_row(id: any) {

    this.tableLength.forEach((value: any, index: any) => {
      // index.remove();

      if (index == id) {
        console.log(index, "----", id);
        // console.log(index-1);

        // trs[index].remove();
        // value.childNod.removeChild( value );
        this.tableLength.splice(index, 1);



      }


    });

  }

  item_image(event: any) {

// if(event.target!=null && event.target!=undefined){



    if (event.target.files.length > 0) {

      let itemimage =  (event.target as HTMLInputElement).files[0];
      console.log(" itemimage-->", itemimage)
      this.newitemform.patchValue({
        image: itemimage
      })
      // console.log(this.newitemform.get('image').value);

    }
  // }

  }

  saveNewitem() {
    console.log(this.newitemform.value);
    // this.create_newitem( this.newitemform.value);
  }

  // create_newitem(form: any) {
  //   this._passervice.s_createNnewItem(form).subscribe((res:any)=>{
  //     console.log(res)
  //   })
  // }

}
