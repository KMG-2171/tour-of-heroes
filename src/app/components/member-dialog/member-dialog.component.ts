import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Member, MemberPayload } from '../../models/member.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

type DialogMode = 'create' | 'edit';

interface MemberDialogData {
  mode: DialogMode;
  member?: Member;
}

export interface MemberDialogResult {
  mode: DialogMode;
  payload: MemberPayload;
  memberId?: string;
}

@Component({
  selector: 'app-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './member-dialog.component.html',
  styleUrl: './member-dialog.component.css'
})
export class MemberDialogComponent implements OnInit {
  readonly title = this.data.mode === 'edit' ? 'Edit account details' : 'Create account details';
  readonly submitLabel = this.data.mode === 'edit' ? 'Submit' : 'Create';

  readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    dob: [null as Date | null, [Validators.required]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<MemberDialogComponent, MemberDialogResult>,
    @Inject(MAT_DIALOG_DATA) public readonly data: MemberDialogData,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.data.member) {
      const { firstName, lastName, dob } = this.data.member;
      this.form.patchValue({
        firstName,
        lastName,
        dob: new Date(dob)
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const { firstName, lastName, dob } = this.form.getRawValue();
    if (!firstName || !lastName || !dob) return;

    const payload: MemberPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob: this.toIsoDate(dob)
    };

    const result: MemberDialogResult = {
      mode: this.data.mode,
      payload,
      memberId: this.data.member?.id
    };

    this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      data: { title: 'Account updated successfully', message: `Updated ${firstName}'s account details successfully` }
    }).afterClosed().subscribe(() => {
      this.dialogRef.close(result);
    });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

