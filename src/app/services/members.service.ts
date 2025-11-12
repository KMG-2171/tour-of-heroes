import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Member, MemberPayload } from '../models/member.model';

const BASE_URL = 'http://localhost:3000/members';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly http = inject(HttpClient);

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(BASE_URL);
  }

  createMember(payload: MemberPayload): Observable<Member> {
    return this.http.post<Member>(BASE_URL, payload);
  }

  updateMember(id: string, payload: MemberPayload): Observable<Member> {
    return this.http.put<Member>(`${BASE_URL}/${id}`, payload);
  }

  deleteMember(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}

