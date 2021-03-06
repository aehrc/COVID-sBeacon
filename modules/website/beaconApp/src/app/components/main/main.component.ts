import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material';
import {MatSort, Sort} from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
//import { JwPaginationComponent } from 'jw-angular-pagination';
//import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Beacon, Dataset } from './main.interfaces';
import { AppConfigService } from '../../app.config.service';
import * as d3 from 'd3';
import d3Tip from "d3-tip";
import * as topoJson from 'topojson-client';
import { DownloadService } from './main.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class MainComponent implements AfterViewInit {
  inputText: string = "";
  hits = new MatTableDataSource<Dataset>();
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  //@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(private http: HttpClient, private appConfigService: AppConfigService, private downloadService:DownloadService, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe( params => this.inputText = params.input);
    if(this.inputText){
      this.query();
    }
  }
  ngOnInit() {
    this.hits.sort = this.sort;
    //this.hits.paginator = this.paginator;
  }
  ngAfterViewInit() {
    //this.hits.sort = this.sort;
  }

  loading: boolean = false;
  iupac: boolean = false;
  iupac_input: string = "False";
  copyText: string = "";
  sMin: any = null;
  sMax: any = null;
  eMin: any = null;
  eMax: any = null;
  sPos= [];
  splittedText= [];
  visualIndex: number;
  ref = "";
  alt = "";
  referenceName = [];
  start = [];
  refBases = [];
  altBases = [];
  refName = [];
  varType:string = null;
  isVisible:boolean = true;
  stateVisilble:boolean = false;
  rootUrl: string = this.appConfigService.apiBaseUrl;
  login: boolean = this.appConfigService.login;
  url: string ='';
  expandedElement: Beacon | null;
  warning: string = '';
  alertMessage: string = '';
  displayedColumns: string[] = ['expand','name', 'updateDateTime', 'variantCount', 'callCount', 'sampleCount', 'totalSamples', 'frequency', 'accessions'];
  innerDisplayedColumns: string[] = ['pos', 'ref', 'alt', 'SIFT_score', 'subSampleCount', 'subFrequency'];
  sampleData:{ code: string, value: any, breakup: any}[] = [];
  dateData:{ date: string, value: any, breakup: any, location: string}[] = [];
  hashState={};
  states=[];
  filteredArray=[];
  accessionDetails=[];
  updateDateTime;
  ids: string[] =["SampleCollectionDate","Location"];
  //queryData = new HttpParams()
  //.set('assemblyId','hCoV-19')
  //.set('includeDatasetResponses','ALL');
  queryData = {};
  vis: number = 0;
  pageOfItems: Array<any>;
  statePageOfItems: Array<any>;

  onChange(){
    if(!this.iupac){
      this.iupac = true;
      this.iupac_input = "True"
    }
    else{
      this.iupac = false;
      this.iupac_input = "False"
    }

  }
  download(){
    this.downloadService.downloadFile(this.accessionDetails, this.updateDateTime, this.inputText);
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  similaritySearch(){
    this.router.navigate(['search', this.inputText]);
  }
  share(){
    var location = window.location;
    if(location.toString().split("/").pop() === "main" || location.toString().split("/").pop() === "query"){
      this.copyText = window.location + "/"+this.inputText;
      navigator.clipboard.writeText(this.copyText).then().catch(e => console.error(e));
    }else{
      navigator.clipboard.writeText(location.toString()).then().catch(e => console.error(e));
    }
  }
  sortData(sort: Sort, element) {
    console.log(element);
    let index;
    for (let i =0; i<3; i++){
      if(element.datasetId === this.hits[i].datasetId){
        index = i;
        const data = this.hits[i].info.variants.slice();
        if (!sort.active || sort.direction === '') {
          this.pageOfItems = data;
          return;
        }
        this.hits[i].info.variants = data.sort((a, b) => {
          const isAsc = sort.direction === 'asc';
          switch (sort.active) {
            case 'position': return this.compare(a.pos, b.pos, isAsc);
            case 'ref': return this.compare(a.ref, b.ref, isAsc);
            case 'alt': return this.compare(a.alt, b.alt, isAsc);
            case 'SIFT_score': return this.compare(a.SIFT_score, b.SIFT_score, isAsc);
            case 'sampleCount': return this.compare(a.sampleCount, b.sampleCount, isAsc);
            case 'frequency': return this.compare(a.frequency, b.frequency, isAsc);
            default: return 0;
          }
        });
        continue;
      }
    }
    //let index = localHits.findIndex(x => x.datasetId === element.datasetId);

  }

  stateSortData(sort: Sort) {
    const data = this.states.slice();
    if (!sort.active || sort.direction === '') {
      this.states = data;
      return;
    }

    this.states = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'regions': return this.compare(a.regions, b.regions, isAsc);
        case 'count': return this.compare(a.count, b.count, isAsc);
        case 'frequency': return this.compare(a.frequency, b.frequency, isAsc);
        default: return 0;
      }
    });
  }
  onChangePage(pageOfItems: Array<any>) {

        // update current page of items
        this.pageOfItems = pageOfItems;
  }
  onChangeStatePage(statePageOfItems: Array<any>) {
        // update current page of items
        this.statePageOfItems = statePageOfItems;
  }

  refreshGraph(){
    this.graphDataGenerator(this.hits,this.visualIndex);
  }
  ShowHide(){
    this.isVisible = !this.isVisible;
  }
  refresh(){
    var location = window.location;
    if(location.toString().split("/").pop() === "main" || location.toString().split("/").pop() === "query"){
      window.location.reload();
    }else{
      if(this.login){
        this.router.navigate(['main']);
      }else{
        this.router.navigate(['query']);
      }
    }
  }
  stateHistogram(state){
    this.graphDataGenerator(this.hits,this.visualIndex,null,state=state);
    this.vis =1;
  }
  visual(){
    //this.graphDataGenerator(this.hits, this.visualIndex);
    this.generateMap(this.sampleData,"choropleth",[' 0', ' 1% - 5%', ' 6% - 10%', '11% - 25%', '26% - 50%', '51% - 75%', '> 76%'],[1, 6, 11, 26, 51, 76]);
    this.generateHistogram(this.dateData);
    this.vis =1;
  }
  statesData(searchTerm, id){
    console.log(searchTerm);
    console.log(id);
    this.hashState={};
    this.states = [];
    if(searchTerm == "USA"){
      searchTerm = "United States";
    }
    if(searchTerm == "Ivory Coast"){
      searchTerm = "CotedIvoire";
    }
    var condition = new RegExp(searchTerm);
    let stateCounts = this.hits[0].info.sampleCounts.State;
    let filtered = Object.keys(stateCounts).reduce(function(r , e){ if(String(e).match(condition)){r[e] = stateCounts[e]} return r;},  {})
    console.log(filtered);
    for (let stateKey in filtered){
        if(filtered[String(stateKey)][0] !== 0){
          let frequency = ((filtered[String(stateKey)][0]/filtered[String(stateKey)][1])*100).toFixed(2);
          this.states.push({"regions": String(stateKey), "count": filtered[String(stateKey)][0], "frequency": frequency} )
        }
    }

    this.states.sort((a,b) => (a.regions > b.regions) ? 1 : -1);

  }
  search(searches){
    if(searches == 'D614G'){
      this.sMin = this.sMax = this.eMin = this.eMax  = null;
      this.isVisible = true;
      this.inputText = "A23403G";
      this.iupac = false;
      this.iupac_input = "False"
      this.query();
    }
    if(searches == 'Y453F'){
      this.sMin = this.sMax = this.eMin = this.eMax  = null;
      this.isVisible = true;
      this.inputText = "A22920T";
      this.iupac = false;
      this.iupac_input = "False"
      this.query();
    }
    if(searches == 'spike'){
      this.inputText = null;
      this.isVisible = false;
      this.sMin = this.eMin = 21563;
      this.sMax = this.eMax = 25384;
      this.ref = this.alt = "N";
      this.iupac = true;
      this.iupac_input = "True"
      this.query();
    }
    if(searches == 'ORF6'){
      this.inputText = null;
      this.isVisible = false;
      this.sMin = this.eMin = 27202;
      this.sMax = this.eMax = 27387;
      this.ref = this.alt = "N";
      this.iupac = true;
      this.iupac_input = "True"
      this.query();
    }
  }

  query() {
      this.start = [];
      this.refBases = [];
      this.altBases = [];
      this.refName = [];
      this.loading = true;

      //this.queryData = new HttpParams()
      //.set('assemblyId','hCoV-19')
      //.set('includeDatasetResponses','ALL');
      if( this.sMin  || this.sMax  || this.eMin || this.eMax ){
        this.inputText= null;
        //this.ref = this.ref.split("").map(function(x){ return x.toUpperCase(); })

          if(this.varType != null ){
            this.alt = null;
            this.queryData = {"assemblyId": "hCoV-19","includeDatasetResponses":"HIT", "referenceName": "1", "referenceBases": this.ref.toUpperCase(), "startMin":(this.sMin-1).toString(), "startMax": (this.sMax-1).toString(), "endMin": (this.eMin-1).toString(), "endMax": (this.eMax-1).toString(), "variantType": this.varType.toUpperCase(), "IUPAC": this.iupac_input,"sampleFields":["SampleCollectionDate","Location", "State", "Location_SampleCollectionDate", "State_SampleCollectionDate", "ID" ]};
              //this.queryData = this.queryData.append('referenceName','1').append("referenceBases",this.ref.join(', ')).append('startMin',(this.sMin-1).toString()).append('startMax',(this.sMax-1).toString()).append('endMin',(this.eMin-1).toString()).append('endMax',(this.eMax-1).toString()).append('variantType',this.varType.toUpperCase()).append("sampleFields", "SampleCollectionDate").append("sampleFields", "Location").append("sampleFields", "State").append("sampleFields", "Location_SampleCollectionDate").append("sampleFields", "State_SampleCollectionDate").append("sampleFields", "ID").append("IUPAC", this.iupac_input);
            //this.queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":this.ref.toUpperCase(), "startMin":this.sMin-1,"startMax":this.sMax-1,"endMin":this.eMin-1,"endMax":this.eMax-1,"variantType":this.varType.toUpperCase(),"sampleFields":["SampleCollectionDate","Location"]};
          }
          if(this.alt != null ){
            //this.alt = this.alt.split("").map(function(x){ return x.toUpperCase(); })
            this.varType = null;
            this.queryData = {"assemblyId": "hCoV-19","includeDatasetResponses":"HIT", "referenceName": "1", "referenceBases": this.ref.toUpperCase(), "alternateBases": this.alt.toUpperCase(), "startMin":(this.sMin-1).toString(), "startMax": (this.sMax-1).toString(), "endMin": (this.eMin-1).toString(), "endMax": (this.eMax-1).toString(), "IUPAC": this.iupac_input,"sampleFields":["SampleCollectionDate","Location", "State", "Location_SampleCollectionDate", "State_SampleCollectionDate", "ID" ]};
            //this.queryData = this.queryData.append('referenceName','1').append('referenceBases',this.ref.join(', ')).append('alternateBases',this.alt.join(', ')).append('startMin',(this.sMin-1).toString()).append('startMax',(this.sMax-1).toString()).append('endMin',(this.eMin-1).toString()).append('endMax',(this.eMax-1).toString()).append("sampleFields", "SampleCollectionDate").append("sampleFields", "Location").append("sampleFields", "State").append("sampleFields", "Location_SampleCollectionDate").append("sampleFields", "State_SampleCollectionDate").append("sampleFields", "ID").append("IUPAC", this.iupac_input);
            //this.queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":this.ref.toUpperCase(),"alternateBases":this.alt.toUpperCase(), "startMin":this.sMin-1,"startMax":this.sMax-1,"endMin":this.eMin-1,"endMax":this.eMax-1,"sampleFields":["SampleCollectionDate","Location"]};
          }
      }else if( this.inputText != null){

        try {
          let text = this.inputText.replace(/\&/g, ':');
          this.splittedText = text.split(':');
          console.log(this.splittedText);
          //console.log(this.inputText.split(':').length);
          if(this.splittedText.length == 1){
            var regex = /([a-z]+)(\d+)([a-z]+)/gi;
            var match = regex.exec(this.inputText);
            //console.log(match);
            //this.sPos = [(parseInt(match[2])-1).toString()];
            //this.ref = [(match[1].trim()).toUpperCase()];
            //this.alt = [(match[3].trim()).toUpperCase()];
            //this.referenceName.push("1");
            this.start.push((parseInt(match[2])-1).toString());
            this.refBases.push((match[1].trim()).toUpperCase());
            this.altBases.push((match[3].trim()).toUpperCase());
            this.refName.push("1");
            //this.queryData = this.queryData.append('start',(parseInt(match[2])-1).toString());
            //this.queryData = this.queryData.append('referenceBases',(match[1].trim()).toUpperCase());
            //this.queryData = this.queryData.append('alternateBases',(match[3].trim()).toUpperCase());
            //this.queryData = this.queryData.append('referenceName',"1");
          }else{

            for(var i = 0; i < this.splittedText.length; i++){
              var regex = /([a-z]+)(\d+)([a-z]+)/gi;
              var match = regex.exec(this.splittedText[i]);
              //console.log(match);
              //this.sPos.push((parseInt(match[2])-1).toString());
              //this.ref.push((match[1].trim()).toUpperCase());
              //this.alt.push((match[3].trim()).toUpperCase());
              //this.referenceName.push("1");
              this.start.push((parseInt(match[2])-1).toString());
              this.refBases.push((match[1].trim()).toUpperCase());
              this.altBases.push((match[3].trim()).toUpperCase());
              this.refName.push("1");
              //this.queryData = this.queryData.append('start',(parseInt(match[2])-1).toString());
              //this.queryData = this.queryData.append('referenceBases',(match[1].trim()).toUpperCase());
              //this.queryData = this.queryData.append('alternateBases',(match[3].trim()).toUpperCase());
              //this.queryData = this.queryData.append('referenceName',"1");
            }
          }

        }
        catch(err) {
          this.warning = "Incorrect search formatting - Please enter valid position.";
          this.loading = false;
          return;
        }

        //console.log(this.alt);
        this.queryData = {"assemblyId": "hCoV-19","includeDatasetResponses":"HIT", "referenceName": this.refName, "start": this.start, "referenceBases": this.refBases, "alternateBases": this.altBases,  "IUPAC": this.iupac_input,"sampleFields":["SampleCollectionDate","Location", "State", "Location_SampleCollectionDate", "State_SampleCollectionDate", "ID" ]};
        //this.queryData = this.queryData.append("sampleFields", "SampleCollectionDate").append("sampleFields", "Location").append("sampleFields", "State").append("sampleFields", "Location_SampleCollectionDate").append("sampleFields", "State_SampleCollectionDate").append("sampleFields", "ID").append("IUPAC", this.iupac_input);
        //this.queryData = {"assemblyId": "hCoV-19","referenceName": "1","includeDatasetResponses":"HIT","referenceBases":this.ref.toUpperCase(),"alternateBases":this.alt.toUpperCase(), "start":this.sPos-1,"variantType":this.varType,"sampleFields":["SampleCollectionDate","Location"]};
      }

      this.url = this.rootUrl+ "/query";
      console.log(this.queryData);
      this.getData(this.url,this.queryData);
  }

  getData(url, qData){
    this.http.post(url, qData)
      .subscribe((response: Beacon) => {
        //console.log(response);

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

              //console.log(this.hits);
              this.loading = false;
              const maxDatasetId: any = response.datasetAlleleResponses.sort((a, b) => b.callCount - a.callCount)[0];
              this.visualIndex = maxDatasetId.info.name;
              this.graphDataGenerator(this.hits, this.visualIndex);
              this.statesData("Australia","AUS");
              this.filteredArray = response.datasetAlleleResponses.filter(function(itm){
                return itm.datasetId == 'gisaid';
              });
              console.log(this.filteredArray.length);
              if(this.filteredArray.length == 0){
                this.displayedColumns = ['expand','name', 'updateDateTime', 'variantCount', 'callCount', 'sampleCount', 'totalSamples', 'frequency'];
              }

            }else{
              console.log(response);
              this.warning = "No Hits to display";
              this.hits = new MatTableDataSource<Dataset>();
              this.loading = false;
              //const maxDatasetId: any = response.datasetAlleleResponses.sort((a, b) => b.callCount - a.callCount)[0];
              this.visualIndex = 0;
              this.accessionDetails = [];
            }


          },
          error => {
            console.log(error);
            if(error.statusText == "Unknown Error"){
              this.warning = "Query request timed out. Please contact administrator to run your query."
            }else{
              this.warning = error.error.error.errorMessage;
            }
            this.hits = new MatTableDataSource<Dataset>([]);
            this.loading = false;
          }
        );


        }else if( response.hasOwnProperty('exists')  && response.exists == true){
          this.warning = null;
          console.log(response.datasetAlleleResponses);
          this.hits = response.datasetAlleleResponses;
          this.loading = false;
          const maxDatasetId: any = response.datasetAlleleResponses.sort((a, b) => b.callCount - a.callCount)[0];
          this.visualIndex = maxDatasetId.info.name;
          console.log(this.visualIndex);
          this.graphDataGenerator(this.hits, this.visualIndex);
          this.statesData("Australia","AUS");
          this.filteredArray = response.datasetAlleleResponses.filter(function(itm){
            return itm.datasetId == 'gisaid';
          });
          console.log(this.filteredArray);
          if(this.filteredArray.length == 0){
            this.displayedColumns = ['expand','name', 'updateDateTime', 'variantCount', 'callCount', 'sampleCount', 'totalSamples', 'frequency'];
          }

        }else{
          console.log(response);
          this.warning = "No Hits to display";
          this.hits = new MatTableDataSource<Dataset>([]);
          this.loading = false;
          //const maxDatasetId: any = response.datasetAlleleResponses.sort((a, b) => b.callCount - a.callCount)[0];
          this.visualIndex = 0;
          this.accessionDetails =[];
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

  };
  graphDataGenerator(hits, visIndex,location=null,state=null){
    //console.log(visIndex);
    let index = hits.findIndex(x => x.info.name === visIndex);
    //let gisaidIndex = hits.findIndex(x => x.info.name === "GISAID data");
    //console.log(gisaidIndex);
    if(hits[index].info.sampleCounts.hasOwnProperty("ID")){
      this.accessionDetails = hits[index].info.sampleCounts.ID;
      this.updateDateTime = hits[index].info.updateDateTime;
      //console.log(this.accessionDetails);
    }
    let locationDetails = hits[index].info.sampleCounts.Location;
    let locationDateCounts = hits[index].info.sampleCounts.Location_SampleCollectionDate;
    let stateDateCounts = hits[index].info.sampleCounts.State_SampleCollectionDate;
    let dateCounts = hits[index].info.sampleCounts.SampleCollectionDate;
    let hashLoc = {} ;
    let hashDate = {};
    if(location == null && state == null){

      this.sampleData = [];
      for (let key in locationDetails) {
            this.sampleData.push({"code": String(key), "value": ((locationDetails[String(key)][0]/locationDetails[String(key)][1])*100).toFixed(2), "breakup": String(locationDetails[String(key)][0]+"/"+locationDetails[String(key)][1]) });
      }
      this.dateData =[];
      for (let key in dateCounts) {
            this.dateData.push({date: String(key), value: ((dateCounts[String(key)][0]/dateCounts[String(key)][1])*100).toFixed(2), breakup : String((dateCounts[String(key)][0]+"/"+dateCounts[String(key)][1])), location : "all"});
      }
      //console.log(this.dateData);
      this.generateMap(this.sampleData,"choropleth",[' 0', ' 1% - 5%', ' 6% - 10%', '11% - 25%', '26% - 50%', '51% - 75%', '> 76%'],[1, 6, 11, 26, 51, 76])
      this.generateHistogram(this.dateData);
    }else if(state != null){
      //console.log(state);
      //Update Histogram when a region row is clicked

      var stateDateValues = stateDateCounts[state];
      //console.log(stateDateValues);
      //for(var i = 0; i < stateDateValues.length; i++) {
      //for(let key in stateDateValues ){
        //let key = Object.keys(stateDateValues[i]);
      //  var val = (typeof hashDate[String(key)] === "undefined") ? String(0+"/"+stateDateValues[String(key)]) : String((hashDate[String(key)]+"/"+stateDateValues[String(key)]));
      //  hashDate[String(key)]=val;
      //}
      //console.log(hashDate);
      this.dateData =[];
      for (let key in stateDateValues) {
            this.dateData.push({"date": String(key), "value": ((stateDateValues[String(key)][0]/stateDateValues[String(key)][1])*100).toFixed(2), "breakup" : String((stateDateValues[String(key)][0]+"/"+stateDateValues[String(key)][1])), "location":state});
      }
      d3.selectAll('#choropleth').selectAll("svg").remove();
      this.generateHistogram(this.dateData);

    }else{
      //console.log(location);
      //Update Histogram when location on map is clicked

      var locDateValues = locationDateCounts[location];
      console.log(locDateValues);
      //for(var i = 0; i < locDateValues.length; i++) {
      //for(let key in locDateValues){
        //let key = Object.keys(locDateValues[i]);
      //  var val = (typeof hashDate[String(key)] === "undefined") ? String(0+"/"+locDateValues[String(key)]) : String((hashDate[String(key)]+"/"+locDateValues[String(key)]));
      //  hashDate[String(key)]=val;
      //}
      //console.log(hashDate);
      this.dateData =[];
      for (let key in locDateValues) {
            this.dateData.push({"date": String(key), "value": ((locDateValues[String(key)][0]/locDateValues[String(key)][1])*100).toFixed(2), "breakup" : String((locDateValues[String(key)][0]+"/"+locDateValues[String(key)][1])) , "location":location});
      }
      this.generateMap(this.sampleData,"choropleth",[' 0', ' 1% - 5%', ' 6% - 10%', '11% - 25%', '26% - 50%', '51% - 75%', '> 76%'],[1, 6, 11, 26, 51, 76])
      this.generateHistogram(this.dateData);
    }
    //console.log(this.sampleData);
    var non = this.sampleData.find( o => o.code === "None");
    console.log(non);
    if( typeof non !== 'undefined'){
      var breakValue = non["breakup"].split("/")[0];
      if (breakValue != 0){
        this.alertMessage = breakValue + " samples have inconsistent country name."
      }else{
        this.alertMessage = ''
      }
    }


    //console.log(this.dateData);
    //console.log(this.dateData);
  }

  generateMap(sampleData, divID, labels, domain) {

    //console.log(d3.select('#'+divID));
    d3.select(".legendThreshold").remove();
    d3.select('#'+divID).selectAll("svg").remove();
    let width = 600;
    let height = 400;
    let lowColor = '#ccdef0'
    let highColor = '#225487'//'#477fb6'

    let svg = d3.selectAll('#'+divID)
            .append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom().on("zoom", function () {
                svg.attr("transform", d3.event.transform)
             }));
    //console.log(svg);
    // Map and projection
    let map = svg.append("g")
        .attr("class", "countries");
    //console.log(map);

    let projection = d3.geoMercator()
        .scale(width / 2.7 / Math.PI)
        .translate([width / 2, height/1.6 ])
    let path = d3.geoPath()
        .projection(projection);

    // Data and color scale
    let data = d3.map();

    let tip = d3Tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function(d) {
      let breakup;
      sampleData.forEach(function(n){
        if(d.id == n.code){
          breakup = n.breakup;
        }
      });
      if(d.properties.name == "England"){
        return "United Kingdom : " + d.value+"%";
      }else{
        if(typeof breakup === "undefined"){
          return d.properties.name + ": No data ("+ d.value+"%)";
        }else{
          return d.properties.name + ": " + breakup+" ("+ d.value+"%)";
        }

      }
    })
    svg.call(tip);
    let self = this;


    //Promise.all(promises).then(ready)
    d3.json("assets/geojson/world.geojson")
    .then(function(topo) {
      //console.log(self.hits);
      //console.log(self.visualIndex);
        //console.log(topo.features)
        sampleData.forEach(function(d){data.set(d.code, +d.value);})
        //console.log(data);
        //console.log(d3.max(topo.features, function(d){return data.get(d.id);}));
        let range_low = 0,
            range_high=  d3.max(topo.features, function(d:any){return data.get(d.id);});
            //console.log(range_low);
            //console.log(range_high);
        let color = d3.scaleLinear<string>()
        .range([lowColor, highColor])
        .domain([range_low,Number(range_high)])
        .interpolate(d3.interpolateLab);
        //console.log(color);
        //let self = this;
        //console.log(self.hits);

        // Draw the map  topoJson.feature(topo, countries).features
        map.selectAll("path")
            .data(topo.features)
            .enter().append("path")
                .attr("id", function(d:any){ d.value = data.get(d.id) || 0; return d.value;})
                .attr("d", path)
                .style("fill", function(d:any) {
                  if(typeof data.get(d.id) === "undefined"){
                    return("#f2f4f5"); //#f7f9fa color like
                  }else{
                    return color(d.value)
                  }
                })
                .on("mouseover", tip.show)
                .on("mouseleave", tip.hide)
                .on("mouseout", tip.hide)
                .on('click',function(d:any){Array.prototype.forEach.call(document.querySelectorAll('.d3-tip'), (t) => t.parentNode.removeChild(t)); console.log(d); self.statesData(d.properties.name,d.id); self.graphDataGenerator(self.hits,self.visualIndex,d.id); });

        //title
        map.append("text")
          .attr("x", (width / 2))
          .attr("y", 15)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("fill", "black")
          .style("stroke", "none")
          .text("Geographic distribution of searched variant");

                // add a legend
                var w = 140, h = 150;

                var key = map
                  .append("svg")
                  .attr("width", w)
                  .attr("height", h)
                  .attr("class", "legendThreshold");

                var legend = key.append("defs")
                  .append("svg:linearGradient")
                  .attr("id", "gradient")
                  .attr("x1", "100%")
                  .attr("y1", "0%")
                  .attr("x2", "100%")
                  .attr("y2", "100%")
                  .attr("spreadMethod", "pad");

                legend.append("stop")
                  .attr("offset", "0%")
                  .attr("stop-color", highColor)
                  .attr("stop-opacity", 1);

                legend.append("stop")
                  .attr("offset", "100%")
                  .attr("stop-color", lowColor)
                  .attr("stop-opacity", 1);

                key.append("rect")
                  .attr("width", w - 110)
                  .attr("height", h)
                  .style("fill", "url(#gradient)")
                  .attr("transform", "translate(0,10)");

                var y = d3.scaleLinear()
                  .range([h, 0])
                  .domain([range_low, Number(range_high)]);

                var yAxis = d3.axisRight(y);

                key.append("g")
                  .attr("class", "y axis")
                  .attr("transform", "translate(40,10)")
                  .call(yAxis)

    }).catch(function(error) {
      console.log(error);
    });
  }
  generateHistogram(sampleData){
    //console.log(sampleData.sort(function(a,b){return a.date > b.date;}));
    d3.selectAll('#histogram').selectAll("svg").remove();
    sampleData = sampleData.sort((a,b) => a.date.localeCompare(b.date));
    //console.log(sampleData)
    //console.log(d3.max(sampleData, d => d.value))
    let width = 600;
    let height = 400;
    let margin  = {top: 20, right: 20, bottom: 30, left: 50};
    //var aspect = width / height;

    let svg = d3.selectAll('#histogram')
    .append("svg")
    .attr("width", width - 50 )
    .attr("height", height);


    let x = d3.scaleBand().rangeRound([0, width - 100]).padding(0.1);
    let y = d3.scaleLinear().rangeRound([height-50, 20]);
    let g = svg.append("g")
    .attr("transform", "translate(50,0)");

    x.domain(sampleData.map(d => d.date));
    y.domain([0, 100]);//d3.max(sampleData, d => d.value)
    let tip = d3Tip()
    .attr('class', 'd3-tip')
    .offset([-12, 0])
    .html(function(d) {
      //console.log(d);
      return  d.breakup+" ("+d.value+"%)";
    })
    svg.call(tip);

    g.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", "translate(0,350)")
    .call(d3.axisBottom(x))
    .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-25)" );

    g.append("g")
    .attr("class", "axis axis-y")
    .call(d3.axisLeft(y).ticks(5));

    g.selectAll(".bar")
    .data(sampleData)
    .enter().append("rect")
    .attr("class", "transparentBar")
    .attr("x", d => x(d["date"]))
    .attr("y", 345)
    .attr("width", x.bandwidth())
    .attr("height", 5)
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

    g.selectAll(".bar")
    .data(sampleData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d["date"]))
    .attr("y", d => y(d["value"]))
    .attr("width", x.bandwidth())
    .attr("height", d => height -50 - y(d["value"]))
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);

    //title
    g.append("text")
      .data(sampleData)
      .attr("x", (width / 3))
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(function(d:any){ if(d.location == "all"){return "Frequency over time for searched variant "} else{ return "Frequency over time for "+ d.location} });
  }
}
