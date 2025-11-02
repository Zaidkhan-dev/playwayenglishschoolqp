import React, { useState, useCallback } from 'react';
import { Question, QuestionType } from './types';
import QuestionPaperForm from './components/QuestionPaperForm';
import QuestionPaperPreview from './components/QuestionPaperPreview';

// @ts-ignore
const { jsPDF } = window.jspdf;
// @ts-ignore
const html2canvas = window.html2canvas;

const App: React.FC = () => {
  const [schoolName] = useState<string>("Playway English School");
  const [subject, setSubject] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [examType, setExamType] = useState<string>("Unit Test 1");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [duration, setDuration] = useState<string>("3 Hours");
  const [questions, setQuestions] = useState<Question[]>([
    { id: crypto.randomUUID(), type: QuestionType.SHORT_ANSWER, text: '', marks: 5, subQuestions: [] }
  ]);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGeneratePdf = useCallback(() => {
    setIsGenerating(true);
    const input = document.getElementById('pdf-preview');
    if (input) {
        html2canvas(input, {
            scale: 2.5,
            useCORS: true,
            logging: false,
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            let heightLeft = pdfHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            pdf.save(`${subject.replace(/ /g, '_') || 'Question'}_Paper.pdf`);
            setIsGenerating(false);
        }).catch(err => {
            console.error("Error generating PDF", err);
            setIsGenerating(false);
        });
    } else {
        setIsGenerating(false);
    }
  }, [subject]);

  const togglePreview = (updatedQuestions?: Question[]) => {
    if (updatedQuestions && Array.isArray(updatedQuestions)) {
        setQuestions(updatedQuestions);
    }
    setIsPreviewing(prev => !prev);
  };

  const formProps = {
    schoolName,
    subject, setSubject,
    className, setClassName,
    examType, setExamType,
    date, setDate,
    totalMarks, setTotalMarks,
    duration, setDuration,
    questions, setQuestions,
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {isPreviewing ? (
        <QuestionPaperPreview
          {...formProps}
          togglePreview={togglePreview}
          handleGeneratePdf={handleGeneratePdf}
          isGenerating={isGenerating}
        />
      ) : (
        <QuestionPaperForm
          {...formProps}
          togglePreview={() => togglePreview()}
        />
      )}
    </div>
  );
};

export default App;