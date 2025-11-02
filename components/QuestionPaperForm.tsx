import React, { useState } from 'react';
import { Question, SubQuestion, QuestionType, MCQOption, GroupedQuestionItem } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface QuestionPaperFormProps {
  schoolName: string;
  subject: string;
  setSubject: React.Dispatch<React.SetStateAction<string>>;
  className: string;
  setClassName: React.Dispatch<React.SetStateAction<string>>;
  examType: string;
  setExamType: React.Dispatch<React.SetStateAction<string>>;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  totalMarks: number;
  setTotalMarks: React.Dispatch<React.SetStateAction<number>>;
  duration: string;
  setDuration: React.Dispatch<React.SetStateAction<string>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  togglePreview: () => void;
}

const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
);

const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.405A12.032 12.032 0 0 1 6 6v1.168l-1.621.81a.75.75 0 0 0 .81 1.366l2.121-1.06v3.161a.75.75 0 0 0 1.5 0V7.93l2.121 1.06a.75.75 0 0 0 .81-1.366L14 7.168V6a12.032 12.032 0 0 1 1.835-1.335.75.75 0 0 0 .53-1.405A13.532 13.532 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.966-.784-1.75-1.75-1.75h-1.5c-.966 0-1.75.784-1.75 1.75v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
);

const SparklesIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
        <path fillRule="evenodd" d="M9.422 2.23a.75.75 0 0 1 1.156 0l1.25 1.562a.75.75 0 0 0 .61.357h1.72c.503 0 .934.346 1.037.834.02.094.02.19.001.283l-.33 1.652a.75.75 0 0 0 .28.69l1.417 1.18a.75.75 0 0 1 .153.948l-.97 1.616a.75.75 0 0 0-.012.72l.745 1.529a.75.75 0 0 1-.364.962l-1.724.96a.75.75 0 0 0-.44.717v1.829a.75.75 0 0 1-.948.705l-1.752-.613a.75.75 0 0 0-.69.045L9.6 19.34a.75.75 0 0 1-.998-.213l-1.32-1.76a.75.75 0 0 0-.68-.363h-1.72a.75.75 0 0 1-.723-.923l.33-1.652a.75.75 0 0 0-.28-.69L2.12 11.6a.75.75 0 0 1-.153-.948l.97-1.616a.75.75 0 0 0 .012-.72L2.205 6.78a.75.75 0 0 1 .364-.962l1.724-.96a.75.75 0 0 0 .44-.717V2.314a.75.75 0 0 1 .948-.705l1.752.613a.75.75 0 0 0 .69-.045l1.52-1.216Z" clipRule="evenodd" />
    </svg>
);

const QuestionPaperForm: React.FC<QuestionPaperFormProps> = ({
  schoolName, subject, setSubject, className, setClassName, examType, setExamType, date, setDate,
  totalMarks, setTotalMarks, duration, setDuration, questions, setQuestions,
  togglePreview
}) => {
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const examTypes = ["Unit Test 1", "Unit Test 2", "Unit Test 3", "Unit Test 4", "Semester 1 Exam", "Semester 2 Exam"];

  const addQuestion = () => {
    setQuestions([...questions, { id: crypto.randomUUID(), type: QuestionType.SHORT_ANSWER, text: '', marks: 5, subQuestions: [] }]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => {
        if (q.id === id) {
            const updatedQuestion = { ...q, [field]: value };
            if (field === 'type') {
                delete updatedQuestion.options; delete updatedQuestion.assertion; delete updatedQuestion.reason;
                delete updatedQuestion.items; delete updatedQuestion.groupType; delete updatedQuestion.image;
                if (value === QuestionType.MCQ) updatedQuestion.options = [{ id: crypto.randomUUID(), text: '' }];
                else if (value === QuestionType.ASSERTION_REASON) { updatedQuestion.text = ''; updatedQuestion.assertion = ''; updatedQuestion.reason = ''; } 
                else if (value === QuestionType.GROUPED) { updatedQuestion.groupType = QuestionType.MCQ; updatedQuestion.items = [{ id: crypto.randomUUID(), text: '', options: [{id: crypto.randomUUID(), text: ''}] }]; updatedQuestion.marks = 1; }
            }
            return updatedQuestion;
        }
        return q;
    }));
  };
  
  const handleImageUpload = (questionId: string, file: File, itemId?: string) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          const imageObject = { url: reader.result as string, width: 70, x: 0, y: 0 };
          if (itemId) updateItem(questionId, itemId, 'image', imageObject); else updateQuestion(questionId, 'image', imageObject);
      };
      reader.readAsDataURL(file);
  };

  const removeImage = (questionId: string, itemId?: string) => {
      if (itemId) updateItem(questionId, itemId, 'image', undefined); else updateQuestion(questionId, 'image', undefined);
  };

  const addOption = (questionId: string) => setQuestions(questions.map(q => q.id === questionId ? { ...q, options: [...(q.options || []), { id: crypto.randomUUID(), text: '' }] } : q));
  const removeOption = (questionId: string, optionId: string) => setQuestions(questions.map(q => q.id === questionId ? { ...q, options: q.options?.filter(opt => opt.id !== optionId) } : q));
  const updateOption = (questionId: string, optionId: string, text: string) => setQuestions(questions.map(q => q.id === questionId ? { ...q, options: q.options?.map(opt => opt.id === optionId ? { ...opt, text } : opt) } : q));
  const addSubQuestion = (questionId: string) => setQuestions(questions.map(q => q.id === questionId ? { ...q, subQuestions: [...q.subQuestions, { id: crypto.randomUUID(), text: '', marks: 1 }] } : q));
  const removeSubQuestion = (questionId: string, subQuestionId: string) => setQuestions(questions.map(q => q.id === questionId ? { ...q, subQuestions: q.subQuestions.filter(sq => sq.id !== subQuestionId) } : q));
  const updateSubQuestion = (questionId: string, subQuestionId: string, field: 'text' | 'marks', value: string | number) => setQuestions(questions.map(q => q.id === questionId ? { ...q, subQuestions: q.subQuestions.map(sq => sq.id === subQuestionId ? { ...sq, [field]: value } : sq) } : q));
  const updateGroupType = (questionId: string, groupType: QuestionType.MCQ | QuestionType.FILL_IN_THE_BLANKS) => setQuestions(questions.map(q => q.id === questionId ? { ...q, groupType, items: q.items?.map(item => ({ ...item, options: groupType === QuestionType.MCQ ? (item.options || [{id: crypto.randomUUID(), text: ''}]) : undefined })) } : q));
  const addItem = (questionId: string) => setQuestions(questions.map(q => { if (q.id === questionId) { const newItem: GroupedQuestionItem = { id: crypto.randomUUID(), text: '' }; if (q.groupType === QuestionType.MCQ) newItem.options = [{ id: crypto.randomUUID(), text: '' }]; return { ...q, items: [...(q.items || []), newItem] }; } return q; }));
  const removeItem = (questionId: string, itemId: string) => setQuestions(questions.map(q => q.id === questionId ? { ...q, items: q.items?.filter(item => item.id !== itemId) } : q));
  const updateItem = (questionId: string, itemId: string, field: keyof GroupedQuestionItem, value: any) => setQuestions(questions.map(q => q.id === questionId ? { ...q, items: q.items?.map(item => item.id === itemId ? { ...item, [field]: value } : item) } : q));
  const addItemOption = (questionId: string, itemId: string) => setQuestions(questions.map(q => q.id === questionId ? { ...q, items: q.items?.map(item => item.id === itemId ? { ...item, options: [...(item.options || []), { id: crypto.randomUUID(), text: '' }] } : item) } : q));
  const removeItemOption = (questionId: string, itemId: string, optionId: string) => setQuestions(questions.map(q => q.id === questionId ? { ...q, items: q.items?.map(item => item.id === itemId ? { ...item, options: item.options?.filter(opt => opt.id !== optionId) } : item) } : q));
  const updateItemOption = (questionId: string, itemId: string, optionId: string, text: string) => setQuestions(questions.map(q => q.id === questionId ? { ...q, items: q.items?.map(item => item.id === itemId ? { ...item, options: item.options?.map(opt => opt.id === optionId ? { ...opt, text } : opt) } : q) } : q));

    const handleAiGenerate = async () => {
        if (!subject || !className) {
            alert("Please provide a Subject and Class before generating questions.");
            return;
        }
        if (!window.confirm("This will replace all current questions with AI-generated ones. Are you sure?")) {
            return;
        }

        setIsAiGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const optionSchema = { type: Type.OBJECT, properties: { text: { type: Type.STRING } } };
            const groupedItemSchema = {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: optionSchema }
                },
                required: ["text"]
            };
            const subQuestionSchema = {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    marks: { type: Type.NUMBER }
                },
                required: ["text", "marks"]
            };
            const questionSchema = {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: Object.values(QuestionType) },
                    text: { type: Type.STRING, description: "The question text, or title for grouped questions." },
                    marks: { type: Type.NUMBER, description: "Marks per question, or per item for grouped questions." },
                    options: { type: Type.ARRAY, items: optionSchema },
                    assertion: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    groupType: { type: Type.STRING, enum: [QuestionType.MCQ, QuestionType.FILL_IN_THE_BLANKS] },
                    items: { type: Type.ARRAY, items: groupedItemSchema },
                    subQuestions: { type: Type.ARRAY, items: subQuestionSchema }
                },
                required: ["type", "text", "marks"]
            };

            const prompt = `You are an expert question paper setter for an Indian school. Generate a set of questions for the following exam:
            - Subject: ${subject}
            - Class: ${className}
            - Examination: ${examType}
            - Total Marks: Approximately ${totalMarks}
            
            Please create a balanced paper with a mix of question types like Short Answer, Long Answer, Multiple Choice, and Grouped Questions (e.g., a set of MCQs under one main question). The response must be a valid JSON array of question objects that strictly follows the provided JSON schema. Ensure the content is appropriate for the specified class level.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { type: Type.ARRAY, items: questionSchema },
                },
            });

            const generatedQuestions = JSON.parse(response.text);
            
            // Add unique IDs to all parts of the questions for React keys
            const questionsWithIds = generatedQuestions.map((q: any) => ({
                ...q,
                id: crypto.randomUUID(),
                options: q.options?.map((opt: any) => ({ ...opt, id: crypto.randomUUID() })),
                subQuestions: q.subQuestions?.map((sq: any) => ({ ...sq, id: crypto.randomUUID() })),
                items: q.items?.map((item: any) => ({
                    ...item,
                    id: crypto.randomUUID(),
                    options: item.options?.map((opt: any) => ({ ...opt, id: crypto.randomUUID() }))
                }))
            }));
            
            setQuestions(questionsWithIds);

        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Failed to generate questions. Please check the console for details.");
        } finally {
            setIsAiGenerating(false);
        }
    };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8 flex flex-col items-center">
        <img src="./logo.png" alt="School Logo" className="h-28 w-auto mb-4" />
        <h1 className="text-4xl font-bold text-slate-800 font-merriweather">{schoolName}</h1>
        <p className="text-xl text-slate-600 mt-2">Question Paper Generator</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mb-8">
        <h2 className="text-2xl font-bold text-slate-700 mb-6 border-b pb-4">Examination Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
            <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="e.g. Mathematics" />
          </div>
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-slate-600 mb-1">Class</label>
            <input type="text" id="className" value={className} onChange={e => setClassName(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="e.g. 10th A" />
          </div>
          <div>
            <label htmlFor="examType" className="block text-sm font-medium text-slate-600 mb-1">Examination Type</label>
            <select id="examType" value={examType} onChange={e => setExamType(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                {examTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-600 mb-1">Date</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
          </div>
          <div>
            <label htmlFor="totalMarks" className="block text-sm font-medium text-slate-600 mb-1">Total Marks</label>
            <input type="number" id="totalMarks" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-slate-600 mb-1">Duration</label>
            <input type="text" id="duration" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="e.g. 3 Hours" />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-slate-700">Questions</h2>
            <button
                onClick={handleAiGenerate}
                disabled={isAiGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:from-purple-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-wait"
            >
                <SparklesIcon className="w-5 h-5" />
                {isAiGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
        </div>
        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-slate-600">Q{qIndex + 1}.</span>
                  <select
                      value={q.type}
                      onChange={e => updateQuestion(q.id, 'type', e.target.value as QuestionType)}
                      className="p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                      {Object.values(QuestionType).map(type => (
                          <option key={type} value={type}>{type}</option>
                      ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <input type="number" value={q.marks} onChange={e => updateQuestion(q.id, 'marks', Number(e.target.value))} className="w-20 p-2 border border-slate-300 rounded-md shadow-sm"/>
                    <span className="text-sm text-slate-500">{q.type === QuestionType.GROUPED ? 'Marks/item' : 'Marks'}</span>
                    <button onClick={() => removeQuestion(q.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition">
                        <TrashIcon />
                    </button>
                </div>
              </div>

              {q.type !== QuestionType.GROUPED && (<div className="flex-grow space-y-4">
                  {q.type === QuestionType.ASSERTION_REASON ? (
                      <div className="space-y-2">
                          <div><label className="block text-sm font-medium text-slate-600 mb-1">Assertion (A)</label><textarea value={q.assertion || ''} onChange={e => updateQuestion(q.id, 'assertion', e.target.value)} placeholder="Enter assertion text..." className="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows={2}></textarea></div>
                          <div><label className="block text-sm font-medium text-slate-600 mb-1">Reason (R)</label><textarea value={q.reason || ''} onChange={e => updateQuestion(q.id, 'reason', e.target.value)} placeholder="Enter reason text..." className="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows={2}></textarea></div>
                      </div>
                  ) : q.type === QuestionType.MCQ ? (
                      <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Question Stem</label>
                          <textarea value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} placeholder="Enter question stem..." className="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows={3}></textarea>
                          <div className="mt-4 space-y-2"><label className="block text-sm font-medium text-slate-600">Options</label>
                              {q.options?.map((opt, optIndex) => (
                                  <div key={opt.id} className="flex items-center gap-2"><span>{String.fromCharCode(65 + optIndex)}.</span><input type="text" value={opt.text} onChange={e => updateOption(q.id, opt.id, e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm" placeholder={`Option ${optIndex + 1}`} /><button onClick={() => removeOption(q.id, opt.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"><TrashIcon className="w-4 h-4" /></button></div>
                              ))}
                              <button onClick={() => addOption(q.id)} className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-800 transition"><PlusIcon className="w-4 h-4"/> Add Option</button>
                          </div>
                      </div>
                  ) : (<textarea value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} placeholder={q.type === QuestionType.FILL_IN_THE_BLANKS ? "Use '___' for blanks." : "Enter question text..."} className="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows={3}></textarea>)}
                  <div className="mt-4"><label className="block text-sm font-medium text-slate-600 mb-1">Add Image/Diagram</label>
                      {q.image ? (<div className="relative w-fit"><img src={q.image.url} alt="Question diagram" className="max-w-xs max-h-48 rounded-md border border-slate-300 p-1" /><button onClick={() => removeImage(q.id)} className="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 leading-none hover:bg-red-600"><TrashIcon className="w-3 h-3" /></button></div>
                      ) : (<input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(q.id, e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />)}
                  </div>
              </div>)}

              {q.type === QuestionType.GROUPED && (<div className="space-y-4">
                  <div><label className="block text-sm font-medium text-slate-600 mb-1">Group Title</label><textarea value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} placeholder="e.g., Tick the correct option" className="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows={2}></textarea></div>
                  <div><label className="block text-sm font-medium text-slate-600 mb-1">Item Type</label>
                    <select value={q.groupType} onChange={e => updateGroupType(q.id, e.target.value as QuestionType.MCQ | QuestionType.FILL_IN_THE_BLANKS)} className="p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                      <option value={QuestionType.MCQ}>Multiple Choice</option><option value={QuestionType.FILL_IN_THE_BLANKS}>Fill in the Blanks</option>
                    </select>
                  </div>
                  <div className="space-y-4 pl-4 border-l-2 border-slate-300">
                    {q.items?.map((item, itemIndex) => (
                      <div key={item.id} className="p-4 bg-white rounded-md border border-slate-300">
                        <div className="flex justify-between items-start mb-2"><span className="font-semibold text-slate-600">{String.fromCharCode(97 + itemIndex)})</span><button onClick={() => removeItem(q.id, item.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition"><TrashIcon className="w-4 h-4" /></button></div>
                        {q.groupType === QuestionType.MCQ ? (<div><textarea value={item.text} onChange={e => updateItem(q.id, item.id, 'text', e.target.value)} placeholder="Enter question stem..." className="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows={2}></textarea>
                              <div className="mt-2 space-y-2">
                                  {item.options?.map((opt, optIndex) => (<div key={opt.id} className="flex items-center gap-2 pl-4"><span>{String.fromCharCode(65 + optIndex)}.</span><input type="text" value={opt.text} onChange={e => updateItemOption(q.id, item.id, opt.id, e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm" placeholder={`Option ${optIndex + 1}`} /><button onClick={() => removeItemOption(q.id, item.id, opt.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"><TrashIcon className="w-4 h-4" /></button></div>))}
                                  <button onClick={() => addItemOption(q.id, item.id)} className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-800 transition ml-4"><PlusIcon className="w-4 h-4"/> Add Option</button>
                              </div></div>
                        ) : (<textarea value={item.text} onChange={e => updateItem(q.id, item.id, 'text', e.target.value)} placeholder="Enter text, use '___' for blanks" className="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows={2}></textarea>)}
                        <div className="mt-3"><label className="block text-xs font-medium text-slate-500 mb-1">Add Image to this item</label>
                          {item.image ? (<div className="relative w-fit"><img src={item.image.url} alt="Item diagram" className="max-w-xs max-h-32 rounded-md border border-slate-300 p-1" /><button onClick={() => removeImage(q.id, item.id)} className="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 leading-none hover:bg-red-600"><TrashIcon className="w-3 h-3" /></button></div>
                          ) : (<input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(q.id, e.target.files[0], item.id)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />)}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => addItem(q.id)} className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-800 transition"><PlusIcon className="w-4 h-4"/> Add Item</button>
                  </div>
              </div>)}

              {q.type !== QuestionType.GROUPED && q.type !== QuestionType.ASSERTION_REASON && (<div className="pl-8 mt-4 space-y-4">
                  {q.subQuestions.map((sq, sqIndex) => (
                    <div key={sq.id} className="flex items-start gap-3">
                      <span className="text-md font-semibold text-slate-500 mt-2">{String.fromCharCode(97 + sqIndex)})</span>
                      <div className="flex-grow"><input type="text" value={sq.text} onChange={e => updateSubQuestion(q.id, sq.id, 'text', e.target.value)} placeholder="Enter sub-question..." className="w-full p-2 border border-slate-300 rounded-md shadow-sm" /></div>
                      <div className="flex items-center gap-2"><input type="number" value={sq.marks} onChange={e => updateSubQuestion(q.id, sq.id, 'marks', Number(e.target.value))} className="w-20 p-2 border border-slate-300 rounded-md shadow-sm" /><span className="text-sm text-slate-500">Marks</span></div>
                      <button onClick={() => removeSubQuestion(q.id, sq.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => addSubQuestion(q.id)} className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-800 transition"><PlusIcon className="w-4 h-4"/> Add Sub-question</button>
              </div>)}
            </div>
          ))}
        </div>
        <button onClick={addQuestion} className="mt-6 flex items-center gap-2 w-full justify-center p-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 hover:border-slate-400 transition">
          <PlusIcon /> Add New Question
        </button>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <button onClick={togglePreview} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition">
          Preview & Generate
        </button>
      </div>
    </div>
  );
};

export default QuestionPaperForm;