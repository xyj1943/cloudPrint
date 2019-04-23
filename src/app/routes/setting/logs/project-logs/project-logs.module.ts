import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

import { CustomFormsModule } from '../../../../components/custom-forms/custom-forms.module';
import { PipeModule } from '../../../../pipe/pipe.module';
import { ProjectLogsComponent } from './project-logs.component';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule,
    CustomFormsModule,
    PipeModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ProjectLogsComponent}])
  ],
  declarations: [ProjectLogsComponent],
  providers: []
})
export class ProjectLogsModule { }
