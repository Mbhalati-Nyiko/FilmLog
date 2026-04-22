import { Component, OnInit } from '@angular/core';
import { IonItem, IonSpinner, IonLabel, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-loader',
  imports: [ IonSpinner, IonContent ],
  templateUrl: './loader.page.html',
  styleUrls: ['./loader.page.scss'],
})
export class LoaderPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
