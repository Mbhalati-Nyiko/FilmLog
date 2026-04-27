import { LoaderPage } from './../loader/loader.page';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonHeader, IonToolbar, IonImg, IonInput, IonItem } from "@ionic/angular/standalone";


@Component({
  selector: 'app-login',
  imports: [ IonInput ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor() { }

  @ViewChild('toggle') toggleRef!: ElementRef;
  @ViewChild('loginContainer') loginContainerRef!: ElementRef;

  myImagePath = "assets/logo/FilmLog-Logo.jpg";

  isSignUpMode: boolean = false;

  toggleForm() {
    this.isSignUpMode = !this.isSignUpMode;
  }

  ngOnInit() {
  };

  ngAfterViewInit() {

    
  }
}


