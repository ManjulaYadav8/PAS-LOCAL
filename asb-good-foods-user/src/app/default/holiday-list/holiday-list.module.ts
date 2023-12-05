import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HolidayListComponent } from './holiday-list.component';
import { MaterialModule } from 'src/app/common/material/material.module';

@NgModule({
    declarations: [
        HolidayListComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
    ],
    exports: [
        HolidayListComponent
    ]
})
export class HolidayListModule { }
