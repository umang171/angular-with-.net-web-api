import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NgToastService } from 'ng-angular-popup';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private auth:AuthService,private toast:NgToastService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const myToken=this.auth.getToken();
    if(myToken){
      request=request.clone({
        setHeaders:{Authorization:`Bearer ${myToken}`}
      })
    }
    return next.handle(request).pipe(
      catchError((err)=>{
        if(err instanceof HttpErrorResponse){
          if(err.status===401){
            this.toast.warning({detail:"Waring",summary:"token is not generated",duration:3000});
          }
        }
        return throwError(()=>new Error("Some other error occured"));
      })
    );
  }
}