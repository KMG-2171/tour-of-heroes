export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dob: string; // ISO date (yyyy-MM-dd)
}

export interface MemberPayload {
  firstName: string;
  lastName: string;
  dob: string;
}

