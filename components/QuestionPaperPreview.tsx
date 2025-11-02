import React, { useState, useRef } from 'react';
import { Question, QuestionType, ImageObject } from '../types';

interface QuestionPaperPreviewProps {
  schoolName: string;
  subject: string;
  className: string;
  examType: string;
  date: string;
  totalMarks: number;
  duration: string;
  questions: Question[];
  togglePreview: (updatedQuestions?: Question[]) => void;
  handleGeneratePdf: () => void;
  isGenerating: boolean;
}

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface DraggableResizableImageProps {
    image: ImageObject;
    onWidthChange: (newWidth: number) => void;
    onPositionChange: (x: number, y: number) => void;
    maxHeight?: string;
}

const DraggableResizableImage: React.FC<DraggableResizableImageProps> = ({ image, onWidthChange, onPositionChange, maxHeight = '300px' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgWrapperRef = useRef<HTMLDivElement>(null);

    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation();
        if (!imgWrapperRef.current || !containerRef.current) return;
        const startX = e.clientX; const startWidth = imgWrapperRef.current.offsetWidth; const parentWidth = containerRef.current.offsetWidth;
        const handleMouseMove = (moveEvent: MouseEvent) => { onWidthChange(Math.max(20, Math.min(100, ((startWidth + (moveEvent.clientX - startX)) / parentWidth) * 100))); };
        const handleMouseUp = () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
        window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
    };

    const handleDragMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
        e.preventDefault(); e.stopPropagation();
        const startX = e.clientX; const startY = e.clientY; const initialX = image.x || 0; const initialY = image.y || 0;
        const handleMouseMove = (moveEvent: MouseEvent) => { onPositionChange(initialX + (moveEvent.clientX - startX), initialY + (moveEvent.clientY - startY)); };
        const handleMouseUp = () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
        window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div ref={containerRef} className="my-3">
            <div ref={imgWrapperRef} className="relative group select-none cursor-move" style={{ width: `${image.width}%`, transform: `translate(${image.x || 0}px, ${image.y || 0}px)`, zIndex: 10, }} onMouseDown={handleDragMouseDown}>
                <img src={image.url} alt="Diagram" className="pointer-events-none w-full object-contain" style={{ maxHeight: maxHeight }} />
                <div className="resize-handle absolute top-0 -right-1 w-2 h-full bg-blue-500 opacity-0 group-hover:opacity-40 cursor-col-resize transition-opacity" onMouseDown={handleResizeMouseDown} />
            </div>
        </div>
    );
};

const QuestionPaperPreview: React.FC<QuestionPaperPreviewProps> = ({
  schoolName, subject, className, examType, date, totalMarks, duration, questions,
  togglePreview, handleGeneratePdf, isGenerating
}) => {
  const [localQuestions, setLocalQuestions] = useState<Question[]>(() => JSON.parse(JSON.stringify(questions)));
  const handleBackToEditor = () => { togglePreview(localQuestions); };
  const updateImageProperty = (questionId: string, itemId: string | undefined, update: (image: ImageObject) => Partial<ImageObject>) => {
    setLocalQuestions(prevQuestions => {
        return prevQuestions.map(q => {
            if (q.id !== questionId) return q;
            if (itemId && q.type === QuestionType.GROUPED) {
                return { ...q, items: q.items?.map(item => item.id === itemId && item.image ? { ...item, image: { ...item.image, ...update(item.image) } } : item) };
            } else if (!itemId && q.image) {
                return { ...q, image: { ...q.image, ...update(q.image) } };
            }
            return q;
        });
    });
  };
  const handleImageWidthChange = (questionId: string, itemId: string | undefined, newWidth: number) => { updateImageProperty(questionId, itemId, () => ({ width: newWidth })); };
  const handleImagePositionChange = (questionId: string, itemId: string | undefined, x: number, y: number) => { updateImageProperty(questionId, itemId, () => ({ x, y })); };

  return (
    <div className="bg-slate-200 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[794px] w-full mx-auto mb-8 flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-slate-800">Preview</h2>
        <div className="flex gap-4">
            <button onClick={handleBackToEditor} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition">Back to Editor</button>
            <button onClick={handleGeneratePdf} disabled={isGenerating} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition flex items-center justify-center disabled:bg-blue-400">
                {isGenerating ? <LoadingSpinner /> : null}
                {isGenerating ? 'Generating...' : 'Generate PDF'}
            </button>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto pb-8">
        <div id="pdf-preview" className="bg-white p-16 shadow-2xl text-black mx-auto" style={{ width: '794px' }}>
          <header className="text-center mb-6">
            <div className="flex justify-center items-center gap-4">
                <img src="./logo.png" alt="School Logo" style={{ height: '80px', width: 'auto' }} />
                <div>
                    <h1 className="text-4xl font-bold font-merriweather">{schoolName}</h1>
                    <p className="text-lg">Fatehpur</p>
                </div>
            </div>
            <div className="mt-4 border-y-2 border-black py-2">
                <h2 className="text-2xl font-bold font-merriweather">{examType}</h2>
            </div>
          </header>
          
          <div className="flex justify-between items-center text-base font-bold my-4">
            <span>Class: {className || 'N/A'}</span>
            <span>Subject: {subject}</span>
            <span>Max. Marks: {totalMarks}</span>
          </div>
           <div className="flex justify-between items-center text-base font-bold mb-6">
            <span>Date: {date ? new Date(date).toLocaleDateString('en-GB') : 'N/A'}</span>
            <span>Duration: {duration}</span>
          </div>
          
          <div className="border-t-2 border-black pt-4">
            <h3 className="text-lg font-bold font-merriweather text-center mb-4">General Instructions:</h3>
              <ol className="list-decimal list-inside text-sm space-y-1 px-4">
                  <li>All questions are compulsory.</li>
                  <li>The marks for each question are indicated against it.</li>
                  <li>Read each question carefully before answering.</li>
                  <li>Write legibly.</li>
              </ol>
          </div>

          <main className="mt-8 text-lg">
            {localQuestions.map((q, qIndex) => {
              if (q.type === QuestionType.GROUPED) {
                const totalGroupMarks = (q.items?.length || 0) * q.marks;
                return (
                  <div key={q.id} className="mb-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow font-bold font-merriweather pr-4"><span className="mr-2">Q{qIndex + 1}.</span>{q.text}</div>
                      <p className="font-bold ml-4 whitespace-nowrap">[{q.items?.length || 0}x{q.marks}={totalGroupMarks}]</p>
                    </div>
                    <div className="ml-8 mt-2 space-y-4">
                      {q.items?.map((item, itemIndex) => (<div key={item.id}>
                          <p className="font-semibold"><span className="mr-2">{String.fromCharCode(97 + itemIndex)})</span>{item.text}</p>
                          {item.image && (<DraggableResizableImage image={item.image} onWidthChange={(newWidth) => handleImageWidthChange(q.id, item.id, newWidth)} onPositionChange={(x,y) => handleImagePositionChange(q.id, item.id, x, y)} maxHeight="250px"/>)}
                          {q.groupType === QuestionType.MCQ && item.options && item.options.length > 0 && (<div className="grid grid-cols-2 gap-x-8 gap-y-1 ml-10 mt-2 text-base">{item.options.map((opt, optIndex) => (<p key={opt.id}>({String.fromCharCode(97 + optIndex)}) {opt.text}</p>))}</div>)}
                      </div>))}
                    </div>
                  </div>
                )
              }
              return (
                <div key={q.id} className="mb-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow font-bold font-merriweather pr-4"><span className="mr-2">Q{qIndex + 1}.</span>
                      { q.type === QuestionType.MCQ || q.type === QuestionType.ASSERTION_REASON ? null : q.text }
                      { q.type === QuestionType.MCQ && q.text }
                      { q.type === QuestionType.ASSERTION_REASON && `For the following question, two statements are given- one labelled Assertion (A) and the other labelled Reason (R). Select the correct answer to this question from the codes (a), (b), (c) and (d) as given below.`}
                    </div><p className="font-bold ml-4 whitespace-nowrap">[{q.marks}]</p>
                  </div>
                  {q.image && (<DraggableResizableImage image={q.image} onWidthChange={(newWidth) => handleImageWidthChange(q.id, undefined, newWidth)} onPositionChange={(x, y) => handleImagePositionChange(q.id, undefined, x, y)} />)}
                  {q.type === QuestionType.ASSERTION_REASON && (<div className="mt-2 ml-8 space-y-1"><p><strong>Assertion (A):</strong> {q.assertion}</p><p><strong>Reason (R):</strong> {q.reason}</p>
                      <div className="ml-4 mt-2 space-y-1 text-base pt-2">
                          <p>(a) Both A and R are true and R is the correct explanation of A.</p><p>(b) Both A and R are true but R is not the correct explanation of A.</p>
                          <p>(c) A is true but R is false.</p><p>(d) A is false but R is true.</p>
                      </div></div>)}
                  {q.type === QuestionType.MCQ && q.options && q.options.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 ml-12 mt-2 text-base">{q.options.map((opt, optIndex) => (<p key={opt.id}>({String.fromCharCode(97 + optIndex)}) {opt.text}</p>))}</div>)}
                  {q.subQuestions && q.subQuestions.length > 0 && (<div className="ml-8 mt-2 space-y-3">
                      {q.subQuestions.map((sq, sqIndex) => (<div key={sq.id} className="flex justify-between items-start"><p className="flex-grow pr-4"><span className="mr-2 font-semibold">{String.fromCharCode(97 + sqIndex)})</span>{sq.text}</p><p className="font-semibold ml-4">[{sq.marks}]</p></div>))}
                  </div>)}
                </div>
              )
            })}
          </main>
          <footer className="text-center mt-12 pt-4 border-t-2 border-dashed border-gray-400"><p className="text-lg font-bold italic font-merriweather">*** ALL THE BEST ***</p></footer>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperPreview;