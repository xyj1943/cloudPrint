import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { CustomFormsComponent } from './custom-forms.component';
// import { FileUploaderModule } from '../file-uploader/file-uploader.module';
import { ZzjFileUploaderModule } from '@zzj/nag-file-uploader';

import { FlowInjectionToken } from '@flowjs/ngx-flow';
import Flow from '@flowjs/flow.js';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    ZzjFileUploaderModule,
    // FileUploaderModule,
    // RouterModule.forChild([{ path: '', component: CustomFormsComponent }]),
  ],
  declarations: [CustomFormsComponent],
  exports:[CustomFormsComponent],
  providers: [
    {
      provide: FlowInjectionToken,
      useValue: Flow
    }
  ]
})
export class CustomFormsModule { }
