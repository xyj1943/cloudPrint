import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';

import { Utils, Status } from '../../common/helper/util-helper';

@Injectable()
export class CanAuthProvide implements CanActivate {
  constructor(
    private router: Router,
    private routeInfo: ActivatedRoute
  ) { }

  public async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<any> {
    return this.can();
  }

  can() {
    let keyToken = this.getQueryString('token');
    if (keyToken !== null) {
      return true;
    }
    let abpAuthToken = Utils.getLocalStorage(Status.abpAuthToken);
    if (abpAuthToken) {
      return true;
    }
    else {
      this.router.navigate(['login']);
      return false;
    }
  }

  public getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return (r[2]);
    }
    return null;
  }



}
