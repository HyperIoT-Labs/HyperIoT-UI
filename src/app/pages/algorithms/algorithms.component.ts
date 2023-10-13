import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PageStatus } from './models/pageStatus';
import { Algorithm, AlgorithmsService } from 'core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HytModalService, SelectOption } from 'components';
import { AlgorithmService } from 'src/app/services/algorithms/algorithm.service';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'hyt-algorithms',
  templateUrl: './algorithms.component.html',
  styleUrls: ['./algorithms.component.scss']
})
export class AlgorithmsComponent implements OnInit {

  PageStatus = PageStatus;
  pageStatus: PageStatus = PageStatus.Loading;

  algorithms: Algorithm[] = [];

  algorithmsFiltered: Algorithm[] = [...this.algorithms];

  filteringForm: FormGroup;

  sortOptions: SelectOption[] = [
    { value: 'none', label: $localize`:@@HYT_none:None` },
    { value: 'alfabetic-increasing', label: $localize`:@@HYT_a_z:A-Z` },
    { value: 'alfabetic-decreasing', label: $localize`:@@HYT_z_a:Z-A` },
    { value: 'date-increasing', label: $localize`:@@HYT_oldest:Oldest` },
    { value: 'date-decreasing', label:  $localize`:@@HYT_newest:Newest` }
  ];

  deletingInLoading = false;
  displayMessageArea = false;
  typeMessageArea: string;
  messageAreaText: string;

  constructor(
    private router: Router,
    private algorithmsService: AlgorithmsService,
    private fb: FormBuilder,
    private dialog: HytModalService,
    private algorithmService: AlgorithmService
  ) { }

  ngOnInit() {

    this.filteringForm = this.fb.group({});

    if (this.algorithmService.nextAlgorithms.state === 'delete-loading') {
      this.algorithmsInLoading(this.algorithmService.nextAlgorithms.algorithmToDelete);
    }

    this.algorithmService.subAlgorithms.subscribe({
      next: (v) => {
        switch (v.state) {
          case 'update-success':
            this.updateAlgorithms(v.algorithmList);
            this.sortBy('date-decreasing');
            break;
          case 'update-error':
            this.pageStatus = PageStatus.Error;
            break;
          case 'delete-loading':
            this.algorithmsInLoading(v.algorithmToDelete);
            break;
          case 'delete-success':
            this.updateAlgorithms(v.algorithmList);
            this.sortBy('date-decreasing');
            this.typeMessageArea = $localize`:@@HYT_success:Success`;
            this.messageAreaText = $localize`:@@HYT_algorithm_successfully_deleted:The algorithm was successfully deleted.`;
            this.deletingInLoading = false;
            setTimeout(() => {
              this.hideMessageArea();
            }, 5000);
            break;
          case 'delete-error':
            this.typeMessageArea = $localize`:@@HYT_error:Error`;
            this.messageAreaText = $localize`:@@HYT_error_deleting_algoritmo:An error occurred while deleting the algorithm.`;
            this.deletingInLoading = false;
            setTimeout(() => {
              this.hideMessageArea();
            }, 5000);
            break;
          default:
            break;
        }
      }
    });

    this.algorithmService.updateAlgorithmList();

  }

  ngOnDestroy() {

  }

  filter() {
  }

  search(value: string) {

    if (value) {
      if (value.split('*').length > 18) {
        this.algorithmsFiltered = [];
      } else {
        const reg = new RegExp(value.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.+').replace(/\?/g, '.'), 'i');
        this.algorithmsFiltered = this.algorithms.filter(el => (el.name.match(reg)));
        this.sortBy(this.filteringForm.value.sort);
      }
    } else {
      this.algorithmsFiltered = [...this.algorithms];
      this.sortBy(this.filteringForm.value.sort);
    }

  }

  onChangeInputSearch(event) {
    this.displayMessageArea = false;
    this.search(this.filteringForm.value.textFilter);
  }

  onChangeSelectSort(event) {
    this.displayMessageArea = false;
    this.sortBy(event.value);
  }

  sortBy(type: string) {
    switch (type) {

      case 'none':
        this.algorithmsFiltered.sort((a, b) => {
          if (a.id > b.id) { return -1; }
          if (a.id < b.id) { return 1; }
          return 0;
        });
        break;

      case 'alfabetic-increasing':
        this.algorithmsFiltered.sort((a, b) => {
          if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) { return -1; }
          if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) { return 1; }
          return 0;
        });
        break;

      case 'alfabetic-decreasing':
        this.algorithmsFiltered.sort((a, b) => {
          if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) { return -1; }
          if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) { return 1; }
          return 0;
        });
        break;

      case 'date-increasing':
        this.algorithmsFiltered.sort((a, b) => {
          if (a.id < b.id) { return -1; }
          if (a.id > b.id) { return 1; }
          return 0;
        });
        break;

      case 'date-decreasing':
        this.algorithmsFiltered.sort((a, b) => {
          if (a.id > b.id) { return -1; }
          if (a.id < b.id) { return 1; }
          return 0;
        });
        break;

      default:
        break;

    }
  }

  addAlgorithm() {
    this.router.navigate(['/algorithm-wizard']);
  }

  openDeleteDialog(alg : Algorithm) {

    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: { title: 'Are you sure you want to delete the algorithm?', message: 'This operation cannot be undone.' }
      }
    );

    dialogRef.onClosed.subscribe(
      (result) => {
        if ( result === 'delete') {
          this.algorithmService.deleteAlgorithm(alg.id);
        }
      },
      (err) => {
        console.log('Errore nell\' AFTER CLOSED del DIALOG di MATERIAL \n', err);
      }
    );
  }

  algorithmsInLoading(algorithmId: number) {
    this.displayMessageArea = true;
    this.deletingInLoading = true;
    this.typeMessageArea = $localize`:@@HYT_loading:Loading`;
    const algorithmToDelete = this.algorithmService.nextAlgorithms.algorithmList.find(x => x.id === algorithmId);
    this.messageAreaText = $localize`:@@HYT_deleting_algorithm:Deleting of algorithm "${algorithmToDelete.name}" in loading. It may take a while.`;
  }

  updateAlgorithms(algorithmList: Algorithm[]) {
    this.algorithms = algorithmList;
    this.pageStatus = (this.algorithms.length !== 0)
      ? PageStatus.Standard
      : PageStatus.New;
    this.algorithmsFiltered = [...this.algorithms];
    /* Default Sort */
  }

  refreshComponent() {
    this.filteringForm = this.fb.group({});

    this.algorithmsService.findAllAlgorithm('STATISTICS').subscribe(
      res => {
        this.algorithms = res;
        this.pageStatus = (this.algorithms.length !== 0)
          ? PageStatus.Standard
          : PageStatus.New;

        this.algorithmsFiltered = [...this.algorithms];
        /* Default Sort */
        this.sortBy('date-decreasing');
      },
      err => {
        this.pageStatus = PageStatus.Error;
      }
    );
  }

  hideMessageArea() {
    this.displayMessageArea = false;
    this.typeMessageArea = undefined;
    this.messageAreaText = undefined;
  }

}
