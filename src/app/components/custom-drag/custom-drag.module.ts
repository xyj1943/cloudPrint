import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { CustomDragComponent } from './custom-drag.component';
import { PipeModule } from '../../pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    PipeModule
  ],
  declarations: [CustomDragComponent],
  exports:[CustomDragComponent],
  providers: []
})
export class CustomDragModule { }
