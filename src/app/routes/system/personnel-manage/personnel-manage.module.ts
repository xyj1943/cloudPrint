import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

import { PersonnelManageComponent } from './personnel-manage.component';
import { CustomFormsModule } from '../../../components/custom-forms/custom-forms.module'
import { PipeModule } from '../../../pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule,
    FormsModule,
    CustomFormsModule,
    PipeModule,
    RouterModule.forChild([{ path: '', component: PersonnelManageComponent }]),
  ],
  declarations: [PersonnelManageComponent],
  providers: []
})
export class PersonnelManageModule { }
