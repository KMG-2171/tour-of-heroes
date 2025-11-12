import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { MembersComponent } from './members.component';
import { MembersService } from '../../services/members.service';
import { Member, MemberPayload } from '../../models/member.model';
import { MemberDialogComponent, MemberDialogResult } from '../member-dialog/member-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

describe('MembersComponent', () => {
  let component: MembersComponent;
  let membersServiceSpy: jasmine.SpyObj<MembersService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogOpenSpy: jasmine.Spy;

  beforeEach(async () => {
    membersServiceSpy = jasmine.createSpyObj<MembersService>('MembersService', [
      'getMembers',
      'createMember',
      'updateMember',
      'deleteMember'
    ]);
    matDialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [MembersComponent]
    });
    TestBed.overrideProvider(MembersService, { useValue: membersServiceSpy });
    TestBed.overrideProvider(MatDialog, { useValue: matDialogSpy });
    await TestBed.compileComponents();

    dialogOpenSpy = matDialogSpy.open;
    dialogOpenSpy.calls.reset();
    dialogOpenSpy.and.returnValue({ afterClosed: () => of(null) } as any);
    membersServiceSpy.getMembers.and.returnValue(of([]));

    const fixture = TestBed.createComponent(MembersComponent);
    component = fixture.componentInstance;
  });

  it('should load members on init and populate the table', () => {
    const mockMembers: Member[] = [
      { id: '1', firstName: 'Bruce', lastName: 'Wayne', dob: '1980-05-27' }
    ];
    membersServiceSpy.getMembers.and.returnValue(of(mockMembers));

    component.ngOnInit();

    expect(membersServiceSpy.getMembers).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(mockMembers);
    expect((component as any).errorSubject.getValue()).toBeNull();
    expect((component as any).loadingSubject.getValue()).toBeFalse();
  });

  it('should set an error message when loading members fails', () => {
    membersServiceSpy.getMembers.and.returnValue(throwError(() => new Error('boom')));

    component.ngOnInit();

    expect(component.dataSource.data).toEqual([]);
    expect((component as any).errorSubject.getValue()).toBe('Failed to load accounts.');
    expect((component as any).loadingSubject.getValue()).toBeFalse();
  });

  it('should create a member when the create dialog returns a result', () => {
    const payload: MemberPayload = {
      firstName: 'Diana',
      lastName: 'Prince',
      dob: '1976-03-22'
    };
    const dialogResult: MemberDialogResult = {
      mode: 'create',
      payload
    };
    membersServiceSpy.createMember.and.returnValue(
      of({ id: '42', ...payload } as Member)
    );
    const refreshSpy = spyOn<any>(component, 'refreshMembers').and.callThrough();

    dialogOpenSpy.and.callFake((dialogComponent: any) => {
      if (dialogComponent === MemberDialogComponent) {
        return { afterClosed: () => of(dialogResult) } as any;
      }
      return {} as any;
    });

    component.openCreateDialog();

    expect(membersServiceSpy.createMember).toHaveBeenCalledWith(payload);
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('should update a member when the edit dialog returns a result', () => {
    const member: Member = {
      id: '99',
      firstName: 'Clark',
      lastName: 'Kent',
      dob: '1978-06-18'
    };
    const payload: MemberPayload = {
      firstName: 'Clark',
      lastName: 'Kent',
      dob: '1978-06-18'
    };
    membersServiceSpy.updateMember.and.returnValue(of(member));
    const refreshSpy = spyOn<any>(component, 'refreshMembers').and.callThrough();

    dialogOpenSpy.and.callFake((dialogComponent: any) => {
      if (dialogComponent === MemberDialogComponent) {
        return {
          afterClosed: () =>
            of({
              mode: 'edit',
              payload,
              memberId: member.id
            } as MemberDialogResult)
        } as any;
      }
      return {} as any;
    });

    component.openEditDialog(member);

    expect(membersServiceSpy.updateMember).toHaveBeenCalledWith(member.id, payload);
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('should not update a member when the dialog result omits the member id', () => {
    const member: Member = {
      id: '24',
      firstName: 'Arthur',
      lastName: 'Curry',
      dob: '1985-01-29'
    };
    const payload: MemberPayload = {
      firstName: member.firstName,
      lastName: member.lastName,
      dob: member.dob
    };
    membersServiceSpy.updateMember.and.returnValue(of(member));

    dialogOpenSpy.and.callFake((dialogComponent: any) => {
      if (dialogComponent === MemberDialogComponent) {
        return {
          afterClosed: () =>
            of({
              mode: 'edit',
              payload
            } as MemberDialogResult)
        } as any;
      }
      return {} as any;
    });

    component.openEditDialog(member);

    expect(membersServiceSpy.updateMember).not.toHaveBeenCalled();
  });

  it('should delete a member when the confirmation dialog is confirmed', () => {
    membersServiceSpy.deleteMember.and.returnValue(of(void 0));
    const refreshSpy = spyOn<any>(component, 'refreshMembers').and.callThrough();

    dialogOpenSpy.and.callFake((dialogComponent: any) => {
      if (dialogComponent === ConfirmationDialogComponent) {
        return { afterClosed: () => of(true) } as any;
      }
      return {} as any;
    });

    component.confirmDelete({
      id: '77',
      firstName: 'Barry',
      lastName: 'Allen',
      dob: '1989-03-14'
    });

    expect(membersServiceSpy.deleteMember).toHaveBeenCalledWith('77');
    expect(refreshSpy).toHaveBeenCalled();
  });
});

