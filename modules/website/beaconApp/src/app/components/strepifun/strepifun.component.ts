import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {MatSort, Sort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabsModule } from  '@angular/material/tabs';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { AppConfigService } from '../../app.config.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Beacon } from './strepifun.interfaces';

export interface TableThing {
  country: string;
  ratio: number;
}

interface StructuralInfo {
  protein: string;
  score: string;
  grantham: string;
  structural: string;
}

interface Mutation {
  protein: string;
  nucleotide: string;
  name: string;
}


@Component({
  selector: 'app-strepifun',
  templateUrl: './strepifun.component.html',
  styleUrls: ['./strepifun.component.css']
})
export class StrepifunComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  constructor(private http: HttpClient, private appConfigService: AppConfigService,  private router: Router, private route: ActivatedRoute) {
  }

  inputText: string = "";
  R2Ratio: number = 0;
  R3Ratio: number = 0;
  filteredMutations: Observable<Mutation[]>;

  noDataMessage: string;
  warning: string = '';
  loading: boolean = false;
  full: boolean = false;


  displayedColumns: string[] = ['country', 'ratio'];
  dataSource = new MatTableDataSource();
  dataToShow;
  first = true;
  CountriesToInclude: string[];
  useLogVersion = true;
  selectedMutation: Mutation;
  hasInfo = false;
  MutationsOld: Mutation[] = [
{ nucleotide: "B.1.1.7", protein: "NA", name: "Signature"},
{ nucleotide: "A23403G", protein: "D614G", name: "Spike"},
]

graph;
display = false;

onChange(){
  if(!this.full){
    this.full = true;

  }
  else{
    this.full = false;

  }

}






refresh(){
  var location = window.location;
  if(location.toString().split("/").pop() === "main" || location.toString().split("/").pop() === "query"){
    window.location.reload();
  }else{
      window.location.reload();
      this.router.navigate(['strepifun']);
  }
}
applyFilters() {
  console.log(this.R2Ratio, this.R3Ratio)
}

search(searches){
  if(searches == 'Alpha'){
    this.selectedMutation = { nucleotide: "Alpha", protein: "D614G", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'Beta'){
    this.selectedMutation = { nucleotide: "Beta", protein: "NA", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'Delta'){
    this.selectedMutation = { nucleotide: "Delta", protein: "D614G", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'Eta'){
    this.selectedMutation = { nucleotide: "Eta", protein: "NA", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'Gamma'){
    this.selectedMutation = { nucleotide: "Gamma", protein: "D614G", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'Iota'){
    this.selectedMutation = { nucleotide: "Iota", protein: "NA", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'Kappa'){
    this.selectedMutation = { nucleotide: "Kappa", protein: "D614G", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'Lambda'){
    this.selectedMutation = { nucleotide: "Lambda", protein: "NA", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'Mu'){
    this.selectedMutation = { nucleotide: "Mu", protein: "D614G", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'Omicron'){
    this.selectedMutation = { nucleotide: "Omicron", protein: "NA", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'Zeta'){
    this.selectedMutation = { nucleotide: "Zeta", protein: "D614G", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'B.1.617.3'){
    this.selectedMutation = { nucleotide: "B.1.617.3", protein: "NA", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'L18F'){
    this.selectedMutation = { nucleotide: "L18F", protein: "L18F", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'K417N'){
    this.selectedMutation = { nucleotide: "K417N", protein: "K417N", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'N501Y'){
    this.selectedMutation = { nucleotide: "N501Y", protein: "N501Y", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'E484K'){
    this.selectedMutation = { nucleotide: "E484K", protein: "E484K", name: "Signature"};
    this.updateHeatmap()
  }
  if(searches == 'P681R'){
    this.selectedMutation = { nucleotide: "P681R", protein: "P681R", name: "Signature"};
    this.updateHeatmap()
  }

}

updateView(event) {
  if (this.first) {
    this.first = false
  }
  this.selectedMutation = event.option.value
  this.updateHeatmap()
}

updateHeatmap() {
  if (this.R2Ratio < 0) {
    this.R2Ratio = 0
  }
  if (this.R3Ratio < 0) {
    this.R3Ratio = 0
  }

  let fileToGet
  let forFileName
  if (this.selectedMutation.name == "Signature") {
    forFileName = this.selectedMutation.nucleotide
  } else {
    forFileName = this.selectedMutation.nucleotide.substring(1)
  }
  console.log(forFileName);
  console.log(this.useLogVersion);
  if (this.full) {
    fileToGet = 'assets/data/'.concat(forFileName).concat('.json')
  } else {
    fileToGet = 'assets/data/'.concat(forFileName).concat('_1year.json')
  }
  let fileR2 = 'assets/data/'.concat(forFileName).concat('_R2.txt')
  this.CountriesToInclude = [];
  this.http.get<any[]>(fileR2).subscribe(example => {
    for (let i = 0; i < example.length; i++) {
      let ratio = example[i]["ratio"]
      let country = example[i]["country"]
      if (ratio >= this.R2Ratio) {
        this.CountriesToInclude.push(country)
      }
    }
    this.dataSource = new MatTableDataSource(example)
    this.dataSource.sort = this.sort;
    const sortState: Sort = {active: 'ratio', direction: 'desc'};
    this.sort.active = sortState.active;
    this.sort.direction = sortState.direction;
    this.sort.sortChange.emit(sortState);
  })
  this.http.get(fileToGet, {responseType: 'text'}).subscribe(example => {
    this.dataToShow = example;

  var colorscaleValue = [
    [0, '#3D9970'],
    [10, '#001f3f']
  ];
  let data = JSON.parse(this.dataToShow)
  let h = data.y.length
  if (h == 0) { // no data before filtering
    this.display = false;
    this.noDataMessage = "A heatmap could not be generated as no countries have significant spread of this mutant at this time."
  } else {
    /*let numCountries = data.y.length
    let newY = []
    let newZ = []
    for (let i = 0; i < numCountries; i++) {
      if (this.CountriesToInclude.includes(data.y[i])) { // if country in list (R2)
        newZ.push(data.z[i])
        newY.push(data.y[i])
      } else if (Math.max.apply(Math, data.z[i].filter(v => ! isNaN(v))) >= this.R3Ratio) { // if R3 is ok
        console.log("hello")
        newZ.push(data.z[i])
        newY.push(data.y[i])
      }
    }
    data.y = newY
    data.z = newZ*/
    console.log(data)
    h = data.y.length
    if (h == 0) {
      this.display = false;
      this.noDataMessage = "A heatmap could not be generated as the filters are too strict."
    } else  {
      var layout = {

        title: this.selectedMutation.nucleotide,
        autosize: true,
        height: h * 20 + 200,
        xaxis: {
          title: {
            text: 'Date'
          },
          ticks: '',
          side: 'bottom'
        },
        yaxis: {
          title: {
            text: 'Countries',
          },
          ticks: '',
          ticksuffix: ' ',
          autosize: true,
          automargin: true,
        },
        zsmooth:"fast",
        connectgaps:true
      };
      this.graph = { data: [data], layout: layout}
      this.display = true;
    }
  }
})
}

ngOnInit() {

  this.selectedMutation = { nucleotide: "B.1.1.7", protein: "NA", name: "Signature"};

}


  displayFn(mutation: Mutation): string {
    return mutation ? mutation.nucleotide + ' (' + mutation.protein + ')' + ' - ' + mutation.name : '';
  }

  neverEmpty() {
    if (!this.R3Ratio) {
      this.R3Ratio = 0;
    }
    if (!this.R2Ratio) {
      this.R2Ratio = 0;
    }
  }

  private _filter(value: string): Mutation[] {
    const filterValue = value.toLowerCase();

    return this.MutationsOld.filter(function(item) {
      if (item.name.toLowerCase().includes(filterValue) || item.protein.toLowerCase().includes(filterValue) || item.nucleotide.toLowerCase().includes(filterValue)) {
          return true;
      }
      return false;
    });
  }

}
