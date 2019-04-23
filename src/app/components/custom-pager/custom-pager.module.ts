import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

import { CustomPagerComponent } from './custom-pager.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule
  ],
  declarations: [CustomPagerComponent],
  exports:[CustomPagerComponent],
  providers: []
})
export class CustomPagerModule { }
