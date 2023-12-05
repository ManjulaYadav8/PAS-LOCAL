import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogRoutingModule } from './blog-routing.module';
import { BlogOverviewComponent } from './blog-overview/blog-overview.component';
import { BlogComponent } from './blog.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    BlogComponent,
    BlogOverviewComponent
  ],
  imports: [
    CommonModule,
    BlogRoutingModule,
    NgxPaginationModule
  ]
})
export class BlogModule { }
