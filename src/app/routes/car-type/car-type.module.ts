import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

import { CarTypeComponent } from './car-type.component';
import { CustomFormsModule } from '../../components/custom-forms/custom-forms.module';
import { CustomPagerModule } from '../../components/custom-pager/custom-pager.module';
import { ImgTextListModule } from '../../components/imgtext-list/imgtext-list.module';
import { ZzjFileUploaderModule } from '@zzj/nag-file-uploader';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    CustomFormsModule,
    CustomPagerModule,
    ImgTextListModule,
    ZzjFileUploaderModule,
    RouterModule.forChild([{ path: '', component: CarTypeComponent }])
  ],
  declarations: [CarTypeComponent],
  providers: []
})
export class CarTypeModule { }
