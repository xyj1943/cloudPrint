import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

import { CustomFormsModule } from '../../../../components/custom-forms/custom-forms.module';
import { PipeModule } from '../../../../pipe/pipe.module';
import { SystemLogsComponent } from './system-logs.component';
import { CustomPagerModule } from '@app/components/custom-pager/custom-pager.module';



@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule,
    FormsModule,
    CustomFormsModule,
    CustomPagerModule,
    PipeModule,
    RouterModule.forChild([{ path: '', component: SystemLogsComponent}])
  ],
  declarations: [SystemLogsComponent],
  providers: []
})
export class SystemLogsModule { }
