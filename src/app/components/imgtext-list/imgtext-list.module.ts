import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { ImgTextListComponent } from './imgtext-list.component';
import { PipeModule } from '../../pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    PipeModule
  ],
  declarations: [ImgTextListComponent],
  exports:[ImgTextListComponent],
  providers: []
})
export class ImgTextListModule { }
