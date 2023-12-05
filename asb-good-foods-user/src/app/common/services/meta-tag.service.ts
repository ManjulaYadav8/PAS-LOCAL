import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { AngularFirestore } from '@angular/fire/firestore';
import { MetaTag } from '../models/meta-tag.model';
import { Navbar } from '../models/navbar.model';

@Injectable({
  providedIn: 'root'
})
export class MetaTagService {

  metaTagData: MetaTag;
  navbarList : Navbar[];
  metaTagList : MetaTag[];

  constructor(private firestore: AngularFirestore,
    private metaTagService : MetaTagService,private title: Title, private meta: Meta,) { }

  getMetaTagList(navbarId){
   return this.firestore.collection('NavbarManagement').doc(navbarId).collection('MetaTag').get();
  }

  setTitleMetaTag(url){
    var navbarName = url.split("/")[1];
    var navbar = JSON.parse(localStorage.getItem('navbarList'));
    if(navbar){
      var currNav = navbar.filter(nav => nav.navbarName === navbarName)[0];
      if(currNav && currNav.title){
        this.title.setTitle(currNav.title);
      }
      else if(navbarName === "cart" || navbarName === "profile"){
        this.title.setTitle(navbarName.toString().charAt(0).toUpperCase() + navbarName.toString().slice(1));
      }
      if(currNav && currNav.metaTag && currNav.metaTag.length){
        currNav.metaTag.map(metatag => {
          this.meta.updateTag(
            {
              name:metatag.metaTagName,
              content:metatag.metaTagContent
           });
        })
      }
    }else{
      this.firestore.collection('NavbarManagement').ref.where("navbarName","==",navbarName).get().then(res => {
        this.navbarList = res.docs.map(nav => {
          return {
            navbarDocId: nav.id,
                        ...nav.data() as {}
          }as Navbar;
        })
        if(this.navbarList && this.navbarList.length){
          if(this.navbarList[0].title){
            this.title.setTitle(this.navbarList[0].title);
          }
          this.getMetaTagList(this.navbarList[0].navbarDocId).subscribe(res => {
            if(res){
              this.metaTagList = res.docs.map(tag => {
                if(tag.exists){
                  return {
                    metaTagId : tag.id,
                    ...tag.data()
                  } as MetaTag
                }
              })
              if(this.metaTagList && this.metaTagList.length){
                this.metaTagList.map(metatag => {
                  this.meta.updateTag(
                    {
                      name:metatag.metaTagName,
                      content:metatag.metaTagContent
                   });
                })
              }
            }
          })
         }
      })
    }
  }
}
