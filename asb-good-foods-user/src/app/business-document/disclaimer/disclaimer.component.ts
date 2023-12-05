import { Component, OnInit } from '@angular/core';
import { BusinessDocuments } from 'src/app/common/models/business-documents.model';
import { BusinessDocumentsService } from 'src/app/common/services/business-documents.service';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.component.html',
  styleUrls: ['./disclaimer.component.css']
})
export class DisclaimerComponent implements OnInit {

  businessDoc : BusinessDocuments[];
  businessData
  constructor(private businessDocService: BusinessDocumentsService) { }

  ngOnInit() {
    this.getbusinessDocuments();
  }
  getbusinessDocuments(){
    this.businessDocService.getDisclaimer().subscribe(business =>{
     this.businessDoc = business.docs.map(list =>{
       return{
         businessDocId: list.id,
                      ...list.data() as {}
       }as BusinessDocuments
     })
     this.businessData = this.businessDoc[0].businessData;
    })
  }

}
