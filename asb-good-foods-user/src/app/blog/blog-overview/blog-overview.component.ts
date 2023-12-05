import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Banner } from 'src/app/common/models/banner.model';
import { Blog } from 'src/app/common/models/blog.model';
import { BannerService } from 'src/app/common/services/banner.service';
import { BlogService } from 'src/app/common/services/blog.service';

@Component({
  selector: 'app-blog-overview',
  templateUrl: './blog-overview.component.html',
  styleUrls: ['./blog-overview.component.css']
})
export class BlogOverviewComponent implements OnInit {

  blogId: any;
  blogImage: Blog[];
  blogUrl;
  blogTitle;
  blogBody;
  blogSide;
  blogSecond;
  blogPublishedDate;
  bannerList: Banner[];
  selectedBanner;
  selectedBannerImg;
  constructor(private route: ActivatedRoute, private blogService: BlogService, private bannerService: BannerService) { }

  ngOnInit() {
    this.route.params.subscribe(params =>{
     this.blogId = params.id;
    //  console.log(this.blogId);
    })
    this.getBlog();
    // this.getBannerList();
  }
  getBannerList(){
    this.bannerService.getBannerList().subscribe(banner =>{
     this.bannerList = banner.map(list =>{
       return{
         bannerDocId: list.payload.doc.id,
                    ...list.payload.doc.data() as {}
       }as Banner;
     })
     this.selectedBanner = this.bannerList.filter(banner => banner.bannerType == "blog")
     this.selectedBannerImg = this.selectedBanner[0].bannerImage;
    //  console.log(this.selectedBannerImg)
    })
  }
  @HostListener("window:scroll", []) onWindowScroll() {
    this.scrollFunction();
  }
  // When the user scrolls down 20px from the top of the document, show the button
scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

}
  getBlog(){
    this.blogService.getBlog().subscribe(blog =>{
     this.blogImage = blog.map(list =>{
       return{
        blogDocId: list.payload.doc.id,
                  ...list.payload.doc.data() as {}
       }as Blog;
    })
    for(var i=0;i<this.blogImage.length; i++){
      if(this.blogImage[i].blogId == this.blogId){
         this.blogUrl = this.blogImage[i].blogUrl;
         this.blogBody = this.blogImage[i].blogBody;
         this.blogTitle = this.blogImage[i].blogTitle;
         this.blogSide = this.blogImage[i].blogSide;
         this.blogSecond = this.blogImage[i].blogSecond;
         this.blogPublishedDate = this.blogImage[i].date;
      }
    }
    })
  }

}
