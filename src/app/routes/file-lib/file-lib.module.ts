import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

import { PipeModule } from '../../pipe/pipe.module';
import { FileLibComponent } from './file-lib.component';
import { TreeEditModule } from '../../components/tree-edit/tree-edit.module';
import { CustomPagerModule } from '../../components/custom-pager/custom-pager.module';
import { CustomFormsModule } from '../../components/custom-forms/custom-forms.module';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    TreeEditModule,
    CustomPagerModule,
    CustomFormsModule,
    PipeModule,
    QRCodeModule,
    RouterModule.forChild([{ path: '', component: FileLibComponent }])
  ],
  declarations: [FileLibComponent],
  providers: []
})
export class FileLibModule { }
