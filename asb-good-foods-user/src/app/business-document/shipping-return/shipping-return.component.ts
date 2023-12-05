import { Component, OnInit } from '@angular/core';
import { BusinessDocuments } from 'src/app/common/models/business-documents.model';
import { BusinessDocumentsService } from 'src/app/common/services/business-documents.service';

@Component({
  selector: 'app-shipping-return',
  templateUrl: './shipping-return.component.html',
  styleUrls: ['./shipping-return.component.css']
})
export class ShippingReturnComponent implements OnInit {
  
  businessDoc : BusinessDocuments[];
  businessData;
  documentHeading
  constructor(private businessDocService: BusinessDocumentsService) { }

  ngOnInit() {
    this.getbusinessDocuments();
  }
  getbusinessDocuments(){
    this.businessDocService.getShippingandReturn().subscribe(business =>{
     this.businessDoc = business.docs.map(list =>{
       return{
         businessDocId: list.id,
                      ...list.data() as {}
       }as BusinessDocuments
     })
     this.businessData = this.businessDoc[0].businessData;
     this.documentHeading = this.businessDoc[0].businessDocHeading;
    })
  }

}
