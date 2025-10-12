export interface SubjectDetail {
  name: string;
  teaching_scope: string;
}
export interface Teacher {
  id: number;
  name: string;
  title: string;
  subjects: SubjectDetail[];
  experience: number;
  image: string;
  university: string;
  desc: string;
}
