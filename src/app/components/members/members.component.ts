import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  BehaviorSubject,
  Subject,
  catchError,
  finalize,
  of,
  startWith,
  switchMap,
  takeUntil,
  tap,
  take
} from 'rxjs';
import { Member, MemberPayload } from '../../models/member.model';
import { MemberDialogComponent, MemberDialogResult } from '../member-dialog/member-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AsyncPipe } from '@angular/common';
import { MembersService } from '../../services/members.service';


@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    AsyncPipe
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css'
})
export class MembersComponent implements OnInit, OnDestroy {
  displayedColumns = ['id', 'name', 'dob', 'actions'];
  readonly dataSource = new MatTableDataSource<Member>([]);

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();

  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  readonly error$ = this.errorSubject.asObservable();

  private readonly refreshSubject = new Subject<void>();
  readonly members$ = this.refreshSubject.pipe(
    startWith(void 0),
    switchMap(() => {
      this.setLoading(true);
      return this.membersService.getMembers().pipe(
        tap(members => {
          this.dataSource.data = members;
          this.errorSubject.next(null);
        }),
        catchError(error => {
          console.error(error);
          this.errorSubject.next('Failed to load accounts.');
          this.dataSource.data = [];
          return of([]);
        }),
        finalize(() => this.setLoading(false))
      );
    })
  );

  private readonly destroy$ = new Subject<void>();


  constructor(
    private readonly membersService: MembersService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.members$.pipe(take(1)).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  openCreateDialog() {
    const dialogRef = this.dialog.open(MemberDialogComponent, {
      width: '460px',
      data: { mode: 'create' }
    }).afterClosed().pipe(take(1))
      .subscribe((result: MemberDialogResult) => {
        this.createMember(result.payload);
      });
  }

  openEditDialog(member: Member) {
    const dialogRef = this.dialog.open(MemberDialogComponent, {
      width: '800px',

      data: { mode: 'edit', member }
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: MemberDialogResult) => {
        if (result.memberId) {
          this.updateMember(result.memberId, result.payload);
        }
      });
  }

  confirmDelete(member: Member) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete account',
        message: `Are you sure you want to delete ${member.firstName} ${member.lastName}?`
      }
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe(() => {
      this.deleteMember(member.id);
    });
  }

  trackById(_index: number, member: Member) {
    return member.id;
  }

  private createMember(payload: MemberPayload) {
    this.setLoading(true);
    this.membersService
      .createMember(payload)
      .pipe(
        tap(member => {
          this.refreshMembers();
        }),
        catchError(error => {
          console.error(error);
          this.errorSubject.next('Failed to create account.');
          return of(null);
        }),
        finalize(() => this.setLoading(false)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private updateMember(id: string, payload: MemberPayload) {
    this.setLoading(true);
    this.membersService
      .updateMember(id, payload)
      .pipe(
        tap(member => {
          this.refreshMembers();
        }),
        catchError(error => {
          console.error(error);
          this.errorSubject.next('Failed to update account.');
          return of(null);
        }),
        finalize(() => this.setLoading(false)),
        take(1)
      )
      .subscribe();
  }

  private deleteMember(id: string) {
    this.setLoading(true);
    this.membersService
      .deleteMember(id)
      .pipe(
        tap(() => {
          this.refreshMembers();
        }),
        catchError(error => {
          console.error(error);
          this.errorSubject.next('Failed to delete account.');
          return of(null);
        }),
        finalize(() => this.setLoading(false)),
        take(1)
      )
      .subscribe();
  }

  private refreshMembers() {
    this.refreshSubject.next();
  }


  private setLoading(isLoading: boolean) {
    this.loadingSubject.next(isLoading);
  }
}

