import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/helpers/validateform';
import { AuthService } from 'src/app/services/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { UserStoreService } from 'src/app/services/user-store.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  toggleName:string="Show";
  passwordType:string="password";
  loginForm!:FormGroup;

  constructor(private fb:FormBuilder,private auth:AuthService,private router:Router, private toast: NgToastService,private userStore:UserStoreService){
  }

  ngOnInit(): void {
    this.loginForm=this.fb.group({
      username:['',Validators.required],
      password:['',Validators.required]
    });
  }
  togglePassword(){
    if(this.toggleName=="Show")
    {
      this.toggleName="Hide";
      this.passwordType="text";

    }
    else{
      this.toggleName="Show";
      this.passwordType="password";
    }
  }
  onSubmit(){
    if(this.loginForm.valid){
      this.auth.login(this.loginForm.value)
      .subscribe({
        next:(res)=>{
          this.auth.storeToken(res.token);
          const tokenPayload=this.auth.decodeToken();
          this.userStore.setFullNameForStore(tokenPayload.name);
          this.userStore.setRoleForStore(tokenPayload.role);
          this.toast.success({detail:"SUCCESS",summary:res.message,duration:5000,sticky:true});
          this.loginForm.reset();
          this.router.navigate(['/dashboard']);
        },
        error:(err)=>this.toast.error({detail:err?.error.message,duration:5000,sticky:true})
      });
    }
    else{
      ValidateForm.validateAllFormFields(this.loginForm);
      this.toast.error({detail:"ERROR",summary:"Your form is invalid",duration:5000,sticky:true});
    }
  }
  
}
