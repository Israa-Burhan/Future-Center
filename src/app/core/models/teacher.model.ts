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
export interface ClassSchedule {
  id: number;
  teacher_id: number;
  day: string;
  start_time: string;
  class_name?: string;
  subject: string;
  class_level_scope: string;
}
