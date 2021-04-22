import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfigService } from '../../app.config.service';
import { Beacon, Dataset } from './search.interfaces';
import { MatTableDataSource } from '@angular/material';
import {MatSort, Sort} from '@angular/material/sort';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  profileText: string = "";
  copyText: string = "";
  loading: boolean = false;
  splittedText= [];
  splitText= [];
  textDict = {};
  queryData = {};
  start = [];
  refBases = [];
  altBases = [];
  refName = [];
  warning: string = '';
  hits = new MatTableDataSource<Dataset>();
  filteredArray=[];
  subcombination:string[] = [];
  pageOfItems: Array<any>;



  constructor( private route: ActivatedRoute, private http: HttpClient, private router: Router, private appConfigService: AppConfigService,) {
    this.route.params.subscribe( params => this.profileText = params.profile);
    if(this.profileText){
      this.profileSearch()
    }
  }

  ngOnInit() {
  }

  rootUrl: string = this.appConfigService.apiBaseUrl;
  login: boolean = this.appConfigService.login;
  url: string ='';
  onChangePage(pageOfItems: Array<any>) {
          // update current page of items
          this.pageOfItems = pageOfItems;
  }
  compare(a: number | string , b: number | string , isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  querySearch(text){
    if(this.login){
      this.router.navigate(['main', text]);
    }else{
      this.router.navigate(['query', text]);
    }
  }

  refresh(){
    var location = window.location;
    if(location.toString().split("/").pop() === "search" ){
      window.location.reload();
    }else{
        this.router.navigate(['search']);
    }
  }
  share(){
    var location = window.location;
    console.log(location.toString().split("/").pop())
    if(location.toString().split("/").pop() === "search"){
      this.copyText = window.location + "/"+this.profileText;
      navigator.clipboard.writeText(this.copyText).then().catch(e => console.error(e));
    }else{
      navigator.clipboard.writeText(location.toString()).then().catch(e => console.error(e));
    }

  }
  sortData(sort: Sort) {
    console.log(sort);
    const data = this.subcombination.slice();
    if (!sort.active || sort.direction === '') {
      this.subcombination = data;
      return;
    }

    this.subcombination = data.sort((a: any, b: any) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'query_combination': return this.compare(a.query_combination, b.query_combination, isAsc);
        case 'removed_combination': return this.compare(a.removed_combination, b.removed_combination, isAsc);
        case 'sample_count': return this.compare(a.sample_count, b.sample_count, isAsc);
        default: return 0;
      }
    });

  }

  profileSearch(){
    this.start = [];
    this.refBases = [];
    this.altBases = [];
    this.refName = [];
    this.loading = true;


    try {
      let text = this.profileText.replace(/\&/g, ':');
      this.splittedText = text.split(':');
      console.log(this.splittedText);
      if(this.splittedText.length == 1){
        var regex = /([a-z]+)(\d+)([a-z]+)/gi;
        var match = regex.exec(this.profileText);

        this.start.push((parseInt(match[2])-1).toString());
        this.refBases.push((match[1].trim()).toUpperCase());
        this.altBases.push((match[3].trim()).toUpperCase());
        this.refName.push("1");
      }else{

        for(var i = 0; i < this.splittedText.length; i++){
          var regex = /([a-z]+)(\d+)([a-z]+)/gi;
          var match = regex.exec(this.splittedText[i]);

          this.start.push((parseInt(match[2])-1).toString());
          this.refBases.push((match[1].trim()).toUpperCase());
          this.altBases.push((match[3].trim()).toUpperCase());
          this.refName.push("1");
        }
      }

    }
    catch(err) {
      this.warning = "Incorrect search formatting - Please enter valid position.";
      this.loading = false;
      return;
    }

    this.queryData = {
      "assemblyId": "hCoV-19",
      "includeDatasetResponses": "ALL",
      "referenceName": this.refName,
      "start": this.start,
      "referenceBases": this.refBases,
      "alternateBases": this.altBases,
      "sampleFields":["SampleCollectionDate"],
      "similar": 1,
    };


    this.url = this.rootUrl+ "/query";
    console.log(this.queryData);
    this.getData(this.url,this.queryData);

  }
  getData(url, qData){
    this.http.post(url, qData)
      .subscribe((response: Beacon) => {
        if(response.hasOwnProperty('s3Response')){
          console.log(response);
          var newUrl = response.s3Response.presignedUrl;
          console.log(newUrl);
          this.http.get(newUrl)
          .subscribe((response: Beacon) => {
            console.log(response);
            if( response.hasOwnProperty('exists')  && response.exists == true){
              this.warning = null;
              this.hits = response.datasetAlleleResponses;
              this.filteredArray = response.datasetAlleleResponses.filter(function(itm){
                return itm.datasetId == 'gisaid';
              });
              this.subcombination = this.filteredArray[0].info.subcombinations;
              this.fixSubcombination(this.subcombination, this.profileText);
              this.loading = false;
            }else{
              console.log(response);
              this.warning = null;
              this.hits = response.datasetAlleleResponses;
              this.filteredArray = response.datasetAlleleResponses.filter(function(itm){
                return itm.datasetId == 'gisaid';
              });
              if(this.filteredArray.length == 0){
                this.warning = " No Gisaid data in the database. Contact administrator."
                this.loading = false;
              }else{
                this.subcombination = this.filteredArray[0].info.subcombinations;
                this.fixSubcombination(this.subcombination, this.profileText);
                this.loading = false;
              }

            }
          },
          error => {
            console.log(error);
            this.warning = error.error.error.errorMessage;
            this.hits = new MatTableDataSource<Dataset>();
            this.loading = false;
          }
        );

        }else if( response.hasOwnProperty('exists')  && response.exists == true){
          this.warning = null;
          console.log(response.datasetAlleleResponses);
          this.hits = response.datasetAlleleResponses;
          this.filteredArray = response.datasetAlleleResponses.filter(function(itm){
            return itm.datasetId == 'gisaid';
          });
          if(this.filteredArray.length == 0){
            this.warning = " No Gisaid data in the database. Contact administrator."
            this.loading = false;
          }else{
            console.log(this.filteredArray);
            this.subcombination = this.filteredArray[0].info.subcombinations;
            console.log(this.subcombination);
            this.fixSubcombination(this.subcombination, this.profileText);
            this.loading = false;
          }

        }else{
          console.log(response);
          this.warning = null;
          this.hits = response.datasetAlleleResponses;
          this.filteredArray = response.datasetAlleleResponses.filter(function(itm){
            return itm.datasetId == 'gisaid';
          });
          this.subcombination = this.filteredArray[0].info.subcombinations;
          console.log(this.subcombination);
          this.fixSubcombination(this.subcombination, this.profileText);
          this.loading = false;

        }

      },
      error => {
        console.log(error);
        this.hits = new MatTableDataSource<Dataset>();
        if(error.statusText == "Unknown Error"){
          this.warning = "Query request timed out. Please contact administrator to run your query."
        }else{
          this.warning = error.error.error.errorMessage;
        }
        this.loading = false;
      }
    );
  }
  fixSubcombination(subc,text){
    text = text.replace(/\:/g, '&');
    this.splitText = text.split("&");

    for ( var i in this.splitText){
      this.textDict[i]  = this.splitText[i].trim();

    }
    console.log(this.textDict);

    for(var i in subc){
      let qc = subc[i]["query_combination"];
      let qcSplit = qc.split("&");
      subc[i]["query_combination"] = qcSplit.map(item =>{ return this.textDict[item]}).join(" & ");

      let rc = subc[i]["removed_combination"];
      let rcSplit = rc.split("&");
      subc[i]["removed_combination"] = rcSplit.map(item =>{ return this.textDict[item]}).join(" & ");
    }




  }


}
