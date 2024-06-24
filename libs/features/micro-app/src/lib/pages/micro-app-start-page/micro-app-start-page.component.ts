import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MicroAppTypes, MicroAppSectionTypes, MicroAppConfig, MicroAppStatusTypes } from '@app/model/convs-mgr/micro-app/base';

import { MicroAppStatusService } from '../../services/micro-app-status.service';
import { MicroAppManagementService } from '@app/libs/state/convs-mgr/micro-app';

@Component({
  selector: 'app-micro-app-start-page',
  templateUrl: './micro-app-start-page.component.html',
  styleUrls: ['./micro-app-start-page.component.scss']
})
export class MicroAppStartPageComponent implements OnInit {
  //The microApp being launched
  appType: MicroAppTypes;
  appId: string;
  endUserId: string;
  config: MicroAppConfig;

  isInitializing = true;

  appSection: MicroAppSectionTypes

  constructor( private _microAppStatusServ: MicroAppStatusService,
    private _microAppService: MicroAppManagementService,
    private _router: Router,
    private _route: ActivatedRoute
  ){}

  ngOnInit(){
    this.initData();

    this._microAppService.initMicroApp(this.appId, this.endUserId, this.config)
      .subscribe((result)=> {
        if(result) {
          this.isInitializing = false;
          if(result.success) {
            // Set the current status so that the main section can resume
            localStorage.setItem('status', JSON.stringify(result.status));
          } else {
            // Something has gone wrong
            console.log(result.message);
          }
        }
    })
  }

  /**
  * Checks the data in the query params and renders the micro app depending on available data
  */
  initData(){
    this.config = this.getConfigs();
    this.appType = this.config.type;
    this.endUserId = this._route.snapshot.queryParams['endUserId'];
    this.appId = this._route.snapshot.queryParams['appId'];
  }

  getConfigs() {
    return {
      type: this._route.snapshot.queryParams['type'],
      orgId: this._route.snapshot.queryParams['orgId'],
      progressUrl: this._route.snapshot.queryParams['progressUrl'],
      callBackUrl: this._route.snapshot.queryParams['callBackUrl']
    } as MicroAppConfig;
  }

  /**
   * Function called when a user clicks the start button
   * Sets the microApp status to started and the section types to main section
   * Redirects the user to the main section route
  */
  handleStart(){
    const mainSection = MicroAppSectionTypes.Main
    const appStarted = MicroAppStatusTypes.Started
    this._microAppStatusServ.setMicroAppSections(mainSection)
    this._microAppStatusServ.setMicroAppStatus(appStarted)
    this._router.navigate(['main'])
  }
}
