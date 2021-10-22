import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MatSort, Sort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabsModule } from  '@angular/material/tabs';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

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

  inputText: string = "";
  R2Ratio: number = 0;
  R3Ratio: number = 0;
  filteredMutations: Observable<Mutation[]>;

  noDataMessage: string;

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
Structurals: StructuralInfo[] = [
  {protein: "L5F", score: "0", grantham: "  22", structural:  ""},
  {protein: "H49Y", score: "1", grantham: "  83", structural:  ""},
  {protein: "S50L", score: "2", grantham: " 145", structural:  ""},
  {protein: "L54W", score: "1", grantham: "  61", structural:  "sb"},
  {protein: "L54S", score: "2", grantham: " 145", structural:  "sb"},
  {protein: "F55Y", score: "0", grantham: "  22", structural:  ""},
  {protein: "S71F", score: "3", grantham: " 155", structural:  ""},
  {protein: "D80Y", score: "4", grantham: " 160", structural:  "SB"},
  {protein: "S98F", score: "3", grantham: " 155", structural:  ""},
  {protein: "D111N", score: "0", grantham: "  23", structural:  ""},
  {protein: "N148S", score: "0", grantham: "  46", structural:  "glyc"},
  {protein: "N149H", score: "3", grantham: "  68", structural:  "GLYC"},
  {protein: "K150E", score: "1", grantham: "  56", structural:  "glyc"},
  {protein: "K150Q", score: "1", grantham: "  53", structural:  "glyc"},
  {protein: "K150R", score: "0", grantham: "  26", structural:  "glyc"},
  {protein: "K150T", score: "1", grantham: "  78", structural:  "glyc"},
  {protein: "F157L", score: "0", grantham: "  22", structural:  "sb"},
  {protein: "A222V", score: "1", grantham: "  64", structural:  ""},
  {protein: "Q239K", score: "1", grantham: "  53", structural:  ""},
  {protein: "L293I", score: "0", grantham: "   5", structural:  ""},
  {protein: "D294V", score: "3", grantham: " 152", structural:  ""},
  {protein: "D294E", score: "0", grantham: "  45", structural:  ""},
  {protein: "T323I", score: "3", grantham: "  89", structural:  "GLYC, sb"},
  {protein: "F338L", score: "0", grantham: "  22", structural:  "rbd, DSi"},
  {protein: "V341I", score: "1", grantham: "  29", structural:  "sb, rbd, S309, DSi"},
  {protein: "A344S", score: "2", grantham: "  99", structural:  "glyc, rbd, S309, DSi"},
  {protein: "R346S", score: "6", grantham: " 110", structural:  "rbd, RG10987, LY-CoV016, S309, DSt"},
  {protein: "R346K", score: "4", grantham: "  26", structural:  "rbd, RG10987, LY-CoV016, S309, DSt"},
  {protein: "A348V", score: "2", grantham: "  64", structural:  "rbd, DSt"},
  {protein: "N354D", score: "2", grantham: "  23", structural:  "sb, rbd, S309, DSt"},
  {protein: "D364Y", score: "4", grantham: " 160", structural:  "rbd, CR3022, DSi"},
  {protein: "V367F", score: "3", grantham: "  50", structural:  "rbd, CR3022, DSt"},
  {protein: "Q414P", score: "3", grantham: "  76", structural:  "rbd, EP2, DSt"},
  {protein: "Q414E", score: "2", grantham: "  29", structural:  "rbd, EP2, DSt"},
  {protein: "Y423F", score: "2", grantham: "  22", structural:  "sb, rbd, EP2, DSt"},
  {protein: "Y423S", score: "4", grantham: " 144", structural:  "sb, rbd, EP2, DSt"},
  {protein: "I434K", score: "3", grantham: " 102", structural:  "rbd, EP5, DSi"},
  {protein: "S438F", score: "4", grantham: " 155", structural:  "hs, rbd, EP5, DSi"},
  {protein: "N439K", score: "6", grantham: "  94", structural:  "HS, RBD, EP5, RG10987, DSi"},
  {protein: "N440K", score: "6", grantham: "  94", structural:  "hs, rbd, EP5, RG10987, LY-CoV016, S309, DSt"},
  {protein: "K444N", score: "4", grantham: "  94", structural:  "rbd, EP5, RG10987, LY-CoV016, DSi"},
  {protein: "K444Q", score: "4", grantham: "  53", structural:  "rbd, EP5, RG10987, LY-CoV016, DSi"},
  {protein: "K444R", score: "3", grantham: "  26", structural:  "rbd, EP5, RG10987, LY-CoV016, DSi"},
  {protein: "G446V", score: "8", grantham: " 109", structural:  "RBD, EP5, EP6, RG10987, LY-CoV016, DSi"},
  {protein: "G446S", score: "7", grantham: "  56", structural:  "RBD, EP5, EP6, RG10987, LY-CoV016, DSi"},
  {protein: "G446C", score: "9", grantham: " 159", structural:  "RBD, EP5, EP6, RG10987, LY-CoV016, DSi"},
  {protein: "G446A", score: "7", grantham: "  60", structural:  "RBD, EP5, EP6, RG10987, LY-CoV016, DSi"},
  {protein: "G446R", score: "8", grantham: " 125", structural:  "RBD, EP5, EP6, RG10987, LY-CoV016, DSi"},
  {protein: "G446D", score: "7", grantham: "  94", structural:  "RBD, EP5, EP6, RG10987, LY-CoV016, DSi"},
  {protein: "Y449F", score: "6", grantham: "  22", structural:  "RBD, EP5, EP6, RG10987, LY-CoV016, DSi"},
  {protein: "Y449H", score: "7", grantham: "  83", structural:  "RBD, EP5, EP6, RG10987, LY-CoV016, DSi"},
  {protein: "Y449C", score: "9", grantham: " 194", structural:  "RBD, EP5, EP6, RG10987, LY-CoV016, DSi"},
  {protein: "Y449D", score: "9", grantham: " 160", structural:  "RBD, EP5, EP6, RG10987, LY-CoV016, DSi"},
  {protein: "L452R", score: "7", grantham: " 102", structural:  "hs, RBD, EP6, LY-CoV016, DSt"},
  {protein: "Y453F", score: "7", grantham: "  22", structural:  "HS, RBD, EP6, RG10933, LY-CoV016, DSt"},
  {protein: "L455V", score: "6", grantham: "  32", structural:  "RBD, EP6, RG10933, LY-CoV016, DSt"},
  {protein: "L455M", score: "6", grantham: "  15", structural:  "RBD, EP6, RG10933, LY-CoV016, DSt"},
  {protein: "L455F", score: "6", grantham: "  22", structural:  "RBD, EP6, RG10933, LY-CoV016, DSt"},
  {protein: "K458N", score: "5", grantham: "  94", structural:  "SB, rbd, EP6, LY-CoV016, DSt"},
  {protein: "D467V", score: "4", grantham: " 152", structural:  "SB, rbd, DSi"},
  {protein: "I468T", score: "1", grantham: "  89", structural:  "sb, rbd, DSi"},
  {protein: "I468F", score: "0", grantham: "  21", structural:  "sb, rbd, DSi"},
  {protein: "I472V", score: "2", grantham: "  29", structural:  "sb, RBD, DSi"},
  {protein: "A475V", score: "6", grantham: "  64", structural:  "RBD, EP8, RG10933, LY-CoV016, DSi"},
  {protein: "G476S", score: "6", grantham: "  56", structural:  "RBD, EP8, RG10933, LY-CoV016, DSi"},
  {protein: "S477N", score: "6", grantham: "  46", structural:  "RBD, EP8, RG10933, LY-CoV016, DSt"},
  {protein: "T478I", score: "6", grantham: "  89", structural:  "RBD, EP8, RG10933, DSt"},
  {protein: "N481T", score: "3", grantham: "  65", structural:  "rbd, EP8, DSt"},
  {protein: "V483I", score: "4", grantham: "  29", structural:  "RBD, EP8, DSt"},
  {protein: "V483A", score: "5", grantham: "  64", structural:  "RBD, EP8, DSt"},
  {protein: "E484K", score: "7", grantham: "  56", structural:  "RBD, EP8, RG10933, LY-CoV016, DSt"},
  {protein: "E484D", score: "6", grantham: "  45", structural:  "RBD, EP8, RG10933, LY-CoV016, DSt"},
  {protein: "F486V", score: "6", grantham: "  50", structural:  "RBD, EP8, RG10933, LY-CoV016, DSi"},
  {protein: "F486Y", score: "5", grantham: "  22", structural:  "RBD, EP8, RG10933, LY-CoV016, DSi"},
  {protein: "F486L", score: "5", grantham: "  22", structural:  "RBD, EP8, RG10933, LY-CoV016, DSi"},
  {protein: "Y489H", score: "6", grantham: "  83", structural:  "RBD, EP8, RG10933, LY-CoV016, DSi"},
  {protein: "Y489F", score: "5", grantham: "  22", structural:  "RBD, EP8, RG10933, LY-CoV016, DSi"},
  {protein: "Y489N", score: "7", grantham: " 143", structural:  "RBD, EP8, RG10933, LY-CoV016, DSi"},
  {protein: "F490L", score: "5", grantham: "  22", structural:  "RBD, EP8, RG10933, DSt"},
  {protein: "P491R", score: "5", grantham: " 103", structural:  "RBD, EP8, DSi"},
  {protein: "Q493L", score: "9", grantham: " 113", structural:  "HS, RBD, EP8, RG10933, LY-CoV016, Dst"},
  {protein: "Q493E", score: "7", grantham: "  29", structural:  "HS, RBD, EP8, RG10933, LY-CoV016, Dst"},
  {protein: "Q493K", score: "8", grantham: "  53", structural:  "HS, RBD, EP8, RG10933, LY-CoV016, Dst"},
  {protein: "Q493R", score: "7", grantham: "  43", structural:  "HS, RBD, EP8, RG10933, LY-CoV016, Dst"},
  {protein: "Q493H", score: "7", grantham: "  24", structural:  "HS, RBD, EP8, RG10933, LY-CoV016, Dst"},
  {protein: "Q493P", score: "8", grantham: "  76", structural:  "HS, RBD, EP8, RG10933, LY-CoV016, Dst"},
  {protein: "S494P", score: "7", grantham: "  74", structural:  "hs, RBD, EP8, RG10933, LY-CoV016, Dst"},
  {protein: "G496S", score: "3", grantham: "  56", structural:  "RBD, DSi"},
  {protein: "G496R", score: "4", grantham: " 125", structural:  "RBD, DSi"},
  {protein: "G496V", score: "4", grantham: " 109", structural:  "RBD, DSi"},
  {protein: "G496C", score: "5", grantham: " 159", structural:  "RBD, DSi"},
  {protein: "G496A", score: "3", grantham: "  60", structural:  "RBD, DSi"},
  {protein: "Q498K", score: "6", grantham: "  53", structural:  "RBD, RG10933, RG10987, DSt"},
  {protein: "Q498P", score: "6", grantham: "  76", structural:  "RBD, RG10933, RG10987, DSt"},
  {protein: "Q498H", score: "5", grantham: "  24", structural:  "RBD, RG10933, RG10987, DSt"},
  {protein: "Q498L", score: "7", grantham: " 113", structural:  "RBD, RG10933, RG10987, DSt"},
  {protein: "Q498E", score: "5", grantham: "  29", structural:  "RBD, RG10933, RG10987, DSt"},
  {protein: "Q498R", score: "5", grantham: "  43", structural:  "RBD, RG10933, RG10987, DSt"},
  {protein: "T500P", score: "4", grantham: "  38", structural:  "hs, RBD, RG10987, LY-CoV016, DSi"},
  {protein: "T500S", score: "5", grantham: "  58", structural:  "hs, RBD, RG10987, LY-CoV016, DSi"},
  {protein: "T500I", score: "5", grantham: "  89", structural:  "hs, RBD, RG10987, LY-CoV016, DSi"},
  {protein: "T500A", score: "5", grantham: "  58", structural:  "hs, RBD, RG10987, LY-CoV016, DSi"},
  {protein: "T500N", score: "5", grantham: "  65", structural:  "hs, RBD, RG10987, LY-CoV016, DSi"},
  {protein: "N501D", score: "5", grantham: "  23", structural:  "HS, RBD, LY-CoV016, DSt"},
  {protein: "N501S", score: "5", grantham: "  46", structural:  "HS, RBD, LY-CoV016, DSt"},
  {protein: "N501T", score: "6", grantham: "  65", structural:  "HS, RBD, LY-CoV016, DSt"},
  {protein: "N501Y", score: "7", grantham: " 143", structural:  "HS, RBD, LY-CoV016, DSt"},
  {protein: "N501H", score: "6", grantham: "  68", structural:  "HS, RBD, LY-CoV016, DSt"},
  {protein: "N501K", score: "6", grantham: "  94", structural:  "HS, RBD, LY-CoV016, DSt"},
  {protein: "G502R", score: "5", grantham: " 125", structural:  "hs, RBD, LY-CoV016, DSi"},
  {protein: "G502S", score: "4", grantham: "  56", structural:  "hs, RBD, LY-CoV016, DSi"},
  {protein: "G502C", score: "6", grantham: " 159", structural:  "hs, RBD, LY-CoV016, DSi"},
  {protein: "G502A", score: "4", grantham: "  60", structural:  "hs, RBD, LY-CoV016, DSi"},
  {protein: "G502D", score: "4", grantham: "  94", structural:  "hs, RBD, LY-CoV016, DSi"},
  {protein: "Y505D", score: "7", grantham: " 160", structural:  "RBD, LY-CoV016, DSt"},
  {protein: "Y505F", score: "4", grantham: "  22", structural:  "RBD, LY-CoV016, DSt"},
  {protein: "Y505S", score: "6", grantham: " 144", structural:  "RBD, LY-CoV016, DSt"},
  {protein: "Y505H", score: "5", grantham: "  83", structural:  "RBD, LY-CoV016, DSt"},
  {protein: "R509K", score: "2", grantham: "  26", structural:  "SB, rbd, S309, DSi"},
  {protein: "V510L", score: "0", grantham: "  32", structural:  "sb, rbd, DSi"},
  {protein: "H519Q", score: "3", grantham: "  24", structural:  "S1S2, rbd, CR3022, DSt"},
  {protein: "H519P", score: "4", grantham: "  77", structural:  "S1S2, rbd, CR3022, DSt"},
  {protein: "A520S", score: "2", grantham: "  99", structural:  "rbd, DSt"},
  {protein: "P521S", score: "2", grantham: "  74", structural:  "rbd, DSt"},
  {protein: "K529E", score: "1", grantham: "  56", structural:  "sb, rbd"},
  {protein: "E583D", score: "1", grantham: "  45", structural:  "SB"},
  {protein: "D614G", score: "4", grantham: "  94", structural:  "SB, S1S2, HS"},
  {protein: "V615L", score: "1", grantham: "  32", structural:  "glyc, sb, S1S2, hs"},
  {protein: "Q675R", score: "1", grantham: "  43", structural:  "S1S2"},
  {protein: "Q675H", score: "1", grantham: "  24", structural:  "S1S2"},
  {protein: "S680F", score: "5", grantham: " 155", structural:  "HS, FR"},
  {protein: "S680P", score: "3", grantham: "  74", structural:  "HS, FR"},
  {protein: "P681S", score: "4", grantham: "  74", structural:  "S1S2, HS, FR"},
  {protein: "P681H", score: "4", grantham: "  77", structural:  "S1S2, HS, FR"},
  {protein: "P681L", score: "4", grantham: "  98", structural:  "S1S2, HS, FR"},
  {protein: "R682Q", score: "3", grantham: "  43", structural:  "S1S2, HS, FR"},
  {protein: "R682W", score: "5", grantham: " 101", structural:  "S1S2, HS, FR"},
  {protein: "R683P", score: "5", grantham: " 103", structural:  "S1S2, HS, FR"},
  {protein: "R683Q", score: "3", grantham: "  43", structural:  "S1S2, HS, FR"},
  {protein: "A684V", score: "4", grantham: "  64", structural:  "S1S2, HS, FR"},
  {protein: "A684S", score: "4", grantham: "  99", structural:  "S1S2, HS, FR"},
  {protein: "A684G", score: "4", grantham: "  60", structural:  "S1S2, HS, FR"},
  {protein: "A684T", score: "4", grantham: "  58", structural:  "S1S2, HS, FR"},
  {protein: "S686G", score: "2", grantham: "  56", structural:  "S1S2"},
  {protein: "V687I", score: "1", grantham: "  29", structural:  "S1S2"},
  {protein: "A688V", score: "2", grantham: "  64", structural:  "S1S2"},
  {protein: "A688S", score: "2", grantham: "  99", structural:  "S1S2"},
  {protein: "S689I", score: "3", grantham: " 142", structural:  "S1S2"},
  {protein: "T719A", score: "1", grantham: "  58", structural:  ""},
  {protein: "A771V", score: "1", grantham: "  64", structural:  ""},
  {protein: "P793A", score: "0", grantham: "  27", structural:  ""},
  {protein: "P793L", score: "1", grantham: "  98", structural:  ""},
  {protein: "P793R", score: "2", grantham: " 103", structural:  ""},
  {protein: "P793T", score: "0", grantham: "  38", structural:  ""},
  {protein: "P793Q", score: "1", grantham: "  76", structural:  ""},
  {protein: "I794T", score: "1", grantham: "  89", structural:  ""},
  {protein: "I794V", score: "0", grantham: "  29", structural:  ""},
  {protein: "I794F", score: "0", grantham: "  21", structural:  ""},
  {protein: "I794N", score: "2", grantham: " 149", structural:  ""},
  {protein: "I794L", score: "0", grantham: "   5", structural:  ""},
  {protein: "A831V", score: "1", grantham: "  64", structural:  ""},
  {protein: "G832D", score: "1", grantham: "  94", structural:  ""},
  {protein: "D839Y", score: "4", grantham: " 160", structural:  "S1S2"},
  {protein: "A930V", score: "1", grantham: "  64", structural:  ""},
  {protein: "D936Y", score: "3", grantham: " 160", structural:  ""},
  {protein: "S943T", score: "2", grantham: "  58", structural:  "S1S2"},
  {protein: "M1237I", score: "0", grantham: "  10", structural:  ""},
  {protein: "T1238I", score: "1", grantham: "  89", structural:  ""},
  {protein: "C1250F", score: "4", grantham: " 205", structural:  ""},
  {protein: "P1263L", score: "1", grantham: "  98", structural:  ""},
]
graph;
display = false;
StructuralToShow: StructuralInfo;

@ViewChild(MatSort) sort: MatSort;

constructor(private http: HttpClient) {
}

applyFilters() {
  console.log(this.R2Ratio, this.R3Ratio)
}

search(searches){
  if(searches == 'D614G'){
    this.inputText = "A23403G";
    this.selectedMutation = { nucleotide: "A23403G", protein: "D614G", name: "Spike"};
    this.updateHeatmap()
  }
  if(searches == 'UKV'){

    this.inputText = "A23063T&C23271A&C23604A&C23709T&T24506G&G24914C&C3267T&C5388A&T6954C&C27972T&G28048T&A28111G&G28280C&A28281T&T28282A&C28977T&ATACATG21764A&TTTA21990T&GTCTGGTTTT11287G";
    this.selectedMutation = { nucleotide: "B.1.1.7", protein: "NA", name: "Signature"};
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
  this.StructuralToShow = this.Structurals.find(y => y.protein == this.selectedMutation.protein)
  if (this.StructuralToShow == null) {
    this.hasInfo = false;
  } else {
    this.hasInfo = true;
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
  if (this.useLogVersion) {
    fileToGet = 'assets/data/'.concat(forFileName).concat('.txt')
  } else {
    fileToGet = 'assets/data/'.concat(forFileName).concat('_capped.txt')
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
    [1, '#001f3f']
  ];
  let data = JSON.parse(this.dataToShow)
  let h = data.y.length
  if (h == 0) { // no data before filtering
    this.display = false;
    this.noDataMessage = "A heatmap could not be generated as no countries have significant spread of this mutant at this time."
  } else {
    let numCountries = data.y.length
    let newY = []
    let newZ = []
    for (let i = 0; i < numCountries; i++) {
      if (this.CountriesToInclude.includes(data.y[i])) { // if country in list (R2)
        newZ.push(data.z[i])
        newY.push(data.y[i])
      } else if (Math.max.apply(Math, data.z[i].filter(v => ! isNaN(v))) >= this.R3Ratio) { // if R3 is ok
        newZ.push(data.z[i])
        newY.push(data.y[i])
      }
    }
    data.y = newY
    data.z = newZ
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
        }
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
