import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private auth: AuthService;

  constructor(private inj: Injector) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.indexOf('oauthCallback') > -1 || request.url === 'https://jsonip.com/') {
      return next.handle(request);
    }

    this.auth = this.inj.get(AuthService);

    return this.auth.GetIDToken().pipe(
      switchMap(token => {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(request);
      })
    );
  }
}
