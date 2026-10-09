export interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  expYearsReq: number;
  role: string;
  totalPositions: number;
  jdUrl: string;
  contactMail: string;
}

export interface ReferalCreate {
  JobId: number;
  ReffName: string;
  ReffMail: string;
 ReffResume: File | null;
 SendMails: string[];
  EmpId: number;
  Description: string;
}

export interface ShareJob{
  JobId: number;
  ReceiverMail: string;
//   JdUrl: string;
  EmpId: number;
  Subject: string;
  Message : string;
}