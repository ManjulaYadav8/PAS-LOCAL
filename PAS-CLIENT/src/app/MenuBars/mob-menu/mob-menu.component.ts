import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mob-menu',
  templateUrl: './mob-menu.component.html',
  styleUrls: ['./mob-menu.component.css']
})
export class MobMenuComponent implements OnInit {

  constructor() { }
  todayDate:any=new Date()

  ngOnInit(): void {
  }

}
