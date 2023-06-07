import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  private fullNews$=new BehaviorSubject<string>("");
  private role$=new BehaviorSubject<string>("");
  constructor() {
  }
  public getRoleFromStore(){
    return this.role$.asObservable();
  }
  public setRoleForStore(role:string){
    this.role$.next(role);
  }
  public getFullNameFromStore(){
    return this.fullNews$.asObservable();
  }
  public setFullNameForStore(name:string){
    this.fullNews$.next(name);
  }
}