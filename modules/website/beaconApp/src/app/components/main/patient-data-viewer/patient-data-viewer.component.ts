import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { MatSort, Sort } from "@angular/material/sort";
import { compare } from "../utils/compare";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-patient-data-viewer",
  templateUrl: "./patient-data-viewer.component.html",
  styleUrl: "./patient-data-viewer.component.scss",
})
export class PatientDataViewerComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) patientStatus: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  protected displayedColumns: string[] = [
    "attribute",
    "occurrences",
    "percentage",
    "logOddsRatio",
  ];
  protected dataSource: MatTableDataSource<any>;
  constructor() {
    this.dataSource = new MatTableDataSource(this.patientStatus);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource.data = structuredClone(changes.patientStatus.currentValue);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
