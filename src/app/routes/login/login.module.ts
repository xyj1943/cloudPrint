import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    RouterModule.forChild([{ path: '', component: LoginComponent }]),
  ],
  declarations: [LoginComponent]
})
export class LoginModule { }
