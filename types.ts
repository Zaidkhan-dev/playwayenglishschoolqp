export enum QuestionType {
  SHORT_ANSWER = 'Short Answer',
  LONG_ANSWER = 'Long Answer',
  MCQ = 'Multiple Choice Question',
  FILL_IN_THE_BLANKS = 'Fill in the Blanks',
  ASSERTION_REASON = 'Assertion & Reason',
  GROUPED = 'Grouped Questions',
}

export interface ImageObject {
    url: string;
    width: number;
    x?: number;
    y?: number;
}

export interface MCQOption {
  id: string;
  text: string;
}

export interface SubQuestion {
  id:string;
  text: string;
  marks: number;
}

export interface GroupedQuestionItem {
    id: string;
    text: string;
    options?: MCQOption[];
    image?: ImageObject;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  marks: number;
  subQuestions: SubQuestion[];
  options?: MCQOption[]; // For MCQ
  assertion?: string; // For Assertion/Reason
  reason?: string; // For Assertion/Reason
  items?: GroupedQuestionItem[]; // For Grouped Questions
  groupType?: QuestionType.MCQ | QuestionType.FILL_IN_THE_BLANKS; // For Grouped Questions
  image?: ImageObject;
}