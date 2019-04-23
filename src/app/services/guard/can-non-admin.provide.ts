import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// import { Observable } from 'rxjs/Observable';
// import { WebStatusService } from '../web-status/web-status.service';

@Injectable()
export class CanNonAdminProvide implements CanActivate {

  constructor() { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | Promise<boolean> {
    return true;
    // let isNonAdmin: boolean = this.statusSrv.loginUser.isNonAdmin;
    // if (!isNonAdmin) {
    //   this.msgSrv.warning("非职能人员，请使用职能人员账号重新登录");
    //   this.router.navigate(["manage"]);
    // }
    // return this.statusSrv.loginUser.isNonAdmin;
  }
}
