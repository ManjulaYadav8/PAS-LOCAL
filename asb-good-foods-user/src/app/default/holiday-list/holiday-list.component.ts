import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-holiday-list',
  templateUrl: './holiday-list.component.html',
  styleUrls: ['./holiday-list.component.css']
})
export class HolidayListComponent implements OnInit {
  constructor( private firestore: AngularFirestore, @Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<HolidayListComponent>) { }

  ngOnInit() {
  }
  onClose() {
    this.dialogRef.close();
  }
}
