import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import ValidateForm from 'src/app/helpers/validateform';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  toggleName:string="Show";
  passwordType:string="password";
  signUpForm!:FormGroup;
  constructor(private fb:FormBuilder,private auth:AuthService,private router:Router, private toast: NgToastService){}
  ngOnInit(): void {
    this.signUpForm=this.fb.group({
      firstName:['',Validators.required],
      lastName:['',Validators.required],
      email:['',Validators.required],
      username:['',Validators.required],
      password:['',Validators.required]
    })
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
    if(this.signUpForm.valid){
      this.auth.signUp(this.signUpForm.value)
      .subscribe({
        next:(res)=>{
          this.toast.success({detail:res.message,duration:5000});
          this.signUpForm.reset();
          this.router.navigate(['/login']);
        },
        error:(err)=>this.toast.error({detail:err?.error.message,duration:5000})
      })
    }
    else{
      ValidateForm.validateAllFormFields(this.signUpForm);
      this.toast.error({detail:"Your form is invalid",duration:5000})
    }
  }
}
