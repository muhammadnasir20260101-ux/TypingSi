import { Course, Lesson } from '../types';
import { COURSES as GENERATED_COURSES, ALL_LESSONS as GENERATED_LESSONS } from './curriculumGenerator';

export const COURSES: Course[] = GENERATED_COURSES;
export const ALL_LESSONS: Lesson[] = GENERATED_LESSONS;
