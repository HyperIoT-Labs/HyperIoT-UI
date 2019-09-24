import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PageStatus } from './models/pageStatus';
import { HProject, HprojectsService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components/lib/hyt-select-template/hyt-select-template.component';

@Component({
  selector: 'hyt-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectsComponent implements OnInit {
  PageStatus = PageStatus;
  pageStatus: PageStatus = PageStatus.Loading;

  hProjects: HProject[] = [];

  hProjectsFiltered: HProject[] = [...this.hProjects];

  filteringForm: FormGroup;

  sortOptions: SelectOption[] = [
    { value: 'none', label: 'None' },
    { value: 'alfabetic-increasing', label: 'A-Z' },
    { value: 'alfabetic-decreasing', label: 'Z-A' },
    { value: 'date-increasing', label: 'Oldest' },
    { value: 'date-decreasing', label: 'Newest' }
  ];

  constructor(
    private router: Router,
    private hProjectService: HprojectsService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {

    this.filteringForm = this.fb.group({});

    this.hProjectService.cardsView().subscribe(
      res => {
        this.hProjects = res;
        this.pageStatus = (this.hProjects.length !==0)
          ? PageStatus.Standard
          : PageStatus.New

        this.hProjectsFiltered = [...this.hProjects];
        /* Default Sort */
        this.sortBy('date-decreasing');
      },
      err => {
        console.log(err);
        this.pageStatus = PageStatus.Error;
      }
    );

  }

  filter(){
  }

  noProjectsMatches: boolean = false;

  search(value: string) {

    if (value) {
      if (value.split('*').length > 18) {
        this.hProjectsFiltered = [];
        this.noProjectsMatches = true;
      }
      else {
        let reg = new RegExp(value.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.+').replace(/\?/g, '.'), 'i');
        this.hProjectsFiltered =  this.hProjects.filter(el => (el.name.match(reg)));
        this.sortBy(this.filteringForm.value.sort);
        
        if(this.hProjectsFiltered.length == 0)
          this.noProjectsMatches = true;
        else
          this.noProjectsMatches = false;
      }
    }
    else {
      this.hProjectsFiltered = [...this.hProjects];
      this.sortBy(this.filteringForm.value.sort);
    }

  }

  onChangeInputSearch(event) {
    this.search(this.filteringForm.value.textFilter)
  }

  onChangeSelectSort(event) {
    this.sortBy(event.value);
  }

  sortBy(type: string) {
    switch (type) {

      case "none":
          this.hProjectsFiltered.sort(function(a, b){
            if(a.id > b.id) { return -1; }
            if(a.id < b.id) { return 1; }
            return 0;
          });
        break;

      case "alfabetic-increasing":
          this.hProjectsFiltered.sort(function(a, b){
            if(a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) { return -1; }
            if(a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) { return 1; }
            return 0;
          });
        break;

      case "alfabetic-decreasing":
          this.hProjectsFiltered.sort(function(a, b){
            if(a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) { return -1; }
            if(a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) { return 1; }
            return 0;
          });
        break;

      case "date-increasing":
          this.hProjectsFiltered.sort(function(a, b){
            if(a.id < b.id) { return -1; }
            if(a.id > b.id) { return 1; }
            return 0;
          });
        break;

      case "date-decreasing":
          this.hProjectsFiltered.sort(function(a, b){
            if(a.id > b.id) { return -1; }
            if(a.id < b.id) { return 1; }
            return 0;
          });
        break;

      default:
        break;

    }
  }

  addProject() {
    this.router.navigate(['/project-wizard']);
  }
}
