import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Banner } from '../common/models/banner.model';
import { Dealers } from '../common/models/dealers.model';
import { BannerService } from '../common/services/banner.service';
import { DealersService } from '../common/services/dealers.service';

@Component({
  selector: 'app-dealer',
  templateUrl: './dealer.component.html',
  styleUrls: ['./dealer.component.css']
})
export class DealerComponent implements OnInit {
  dealersList: Dealers[];
  bannerList: Banner[];
  dealerMatList : MatTableDataSource<any>;
  dealerCount = 0;
  branchImage: string = " ";
  activeDealers=[];
  displayedColumns : String[] = ['dummy','state','city','address','personName','contactNumber']
  constructor(private dealerService: DealersService, private dialog: MatDialog,
    private firestore: AngularFirestore,private bannerService: BannerService) { }
    
    @ViewChild(MatSort,{static:true}) sort: MatSort;
    @ViewChild(MatPaginator,{static:true}) paginator: MatPaginator;
  ngOnInit() {
    this.getDealersData();
    this.getBannerList();
  }
  getDealersData(){
    this.dealerService.getDealersList().subscribe(dealers =>{
     this.dealersList = dealers.map(list =>{
       return{
        dealerDocId: list.payload.doc.id,
                   ...list.payload.doc.data()as {}
       }as Dealers             
     })
   this.getActiveDealers(this.dealersList);
    })
  }
  getActiveDealers(dealerList){
    this.activeDealers = [];
    for(var i=0; i<dealerList.length; i++){
      if(dealerList[i].dealerStatus == 'active'){
       this.activeDealers.push(dealerList[i]);
      }
    }
    // console.log(this.activeDealers);
    this.activeDealers.sort((a, b) => a.state < b.state ? -1 : (a.state > b.state ? 1 : 0))
    this.dealerMatList = new MatTableDataSource(this.activeDealers);
    this.dealerMatList.paginator = this.paginator;
    this.dealerMatList.sort = this.sort;
  }
  getBannerList(){
    this.bannerService.getBannerList().subscribe(banner =>{
     this.bannerList = banner.map(list =>{
       return{
         bannerDocId:list.payload.doc.id,
                    ...list.payload.doc.data() as {}
       }as Banner
     })
    //  console.log(this.bannerList)
    this.getAbout(this.bannerList);
    })
  }
  getAbout(bannerList){
    for(var i=0; i<bannerList.length; i++){
      if(bannerList[i].bannerType == 'branches'){
        this.branchImage = bannerList[i].bannerImage;
      }
    }
  }
}
