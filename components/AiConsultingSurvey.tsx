import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SURVEY_STEPS } from '../constants.tsx';
import { authService } from '../services/authService';
import { generateStrategicReport } from '../services/geminiService';
import type { SurveyResponses, StrategicReport, SurveyStep } from '../types';
import SurveyReport from './SurveyReport';

// --- Web Speech API Type Definitions ---
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionStatic {
  new(): ISpeechRecognition;
}
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

// --- Icon Components ---
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>;
const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>;
const CheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Mic = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>;
const MicOff = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22"></line><path d="M18.89 13.23A7.12 7.12 0 0 1 19 12v-2"></path><path d="M5 10v2a7 7 0 0 0 12 5"></path><path d="M12 2a3 3 0 0 0-3 3v7"></path><path d="M9 9.5a3 3 0 0 0 3.13 2.87"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>;
const Loader = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
const ServerCrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"></path><path d="M12 10V2"></path><path d="m14 14-1 3-1-3-1 3-1-3h-2l1 3-1 3h2l1-3 1 3h2l-1-3 1 3h2l-1-3 1-3z"></path><path d="M6 22h12"></path></svg>;
const Download = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>;
const Upload = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>;
const FileCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m9 15 2 2 4-4"></path></svg>;

// --- State and UI Components ---
const LoadingState = ({ loadingMessage }: { loadingMessage: string }) => (
  <div className="loading-container">
    <Loader />
    <h2 className="loading-title">Generating Your Strategic Roadmap...</h2>
    <p className="loading-message">{loadingMessage}</p>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void; }) => (
  <div className="error-container">
    <ServerCrash />
    <h2 className="error-title">An Error Occurred</h2>
    <p className="error-message">{error}</p>
    <button onClick={onRetry} className="button button--primary">
      <ChevronLeft />
      <span>Return to Survey</span>
    </button>
  </div>
);

const ReviewStep = ({ responses, onEdit, onBack, onSubmit }: { responses: SurveyResponses; onEdit: (index: number) => void; onBack: () => void; onSubmit: () => void; }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div ref={containerRef} className="survey-container review-container">
      <header className="review-header">
        <FileCheck />
        <h2 className="survey-title">Review Your Answers</h2>
        <p className="survey-subtitle">Please review your answers for accuracy before we generate your strategic report. This information is critical for providing the best possible analysis.</p>
      </header>
      <main className="review-content">
        {SURVEY_STEPS.map((step, index) => (
          <div key={step.id} className="review-item">
            <div className="review-item-header">
              <h4 className="review-item-title">{index + 1}. {step.title}</h4>
              <button onClick={() => onEdit(index)} className="button-edit">Edit Section</button>
            </div>
            {step.questions.map(q => (
                <div key={q.id} className="review-question-group">
                    <h5 className="review-question-text">{q.text}</h5>
                     <p className="review-item-answer">
                        {responses[q.id] || <span className="no-answer">No answer provided.</span>}
                    </p>
                </div>
            ))}
          </div>
        ))}
      </main>
      <footer className="survey-footer">
        <div className="survey-footer__nav">
          <button onClick={onBack} className="button button--secondary">
            <ChevronLeft />
            <span>Back to Edit</span>
          </button>
          <button onClick={onSubmit} className="button button--success">
            <span>Confirm & Generate Report</span>
            <CheckCircle />
          </button>
        </div>
      </footer>
    </div>
  );
};


// --- Main Survey Component ---
interface AiConsultingSurveyProps {
  initialData?: SurveyResponses;
  onDataChange: (responses: SurveyResponses) => void;
}

const AiConsultingSurvey: React.FC<AiConsultingSurveyProps> = ({ initialData = {}, onDataChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<SurveyResponses>(initialData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState<StrategicReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listeningField, setListeningField] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const surveyContainerRef = useRef<HTMLDivElement>(null);
  const [loadingMessage, setLoadingMessage] = useState('Our AI consultant is analyzing your data...');

  useEffect(() => {
    onDataChange(responses);
  }, [responses, onDataChange]);
  
  useEffect(() => {
    surveyContainerRef.current?.scrollTo(0, 0);
  }, [currentStep]);
  
  useEffect(() => {
    let interval: number | undefined;
    if (isProcessing) {
        const messages = [ "Analyzing your business model...", "Evaluating tech stack readiness...", "Cross-referencing market trends...", "Conducting SWOT analysis...", "Identifying strategic disconnects...", "Formulating actionable initiatives...", "Compiling your custom roadmap...", ];
        let messageIndex = 0;
        setLoadingMessage(messages[0]);
        interval = window.setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setLoadingMessage(messages[messageIndex]);
        }, 2500);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isProcessing]);

  const isSectionComplete = useCallback((stepIndex: number) => {
    return SURVEY_STEPS[stepIndex].questions.every(q => responses[q.id]?.trim());
  }, [responses]);

  const toggleListening = useCallback((fieldId: string) => {
    if (listeningField === fieldId) {
      recognitionRef.current?.stop();
      setListeningField(null);
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        if (finalTranscript) {
             setResponses(prev => ({ ...prev, [fieldId]: (prev[fieldId] || '') + finalTranscript + '. ' }));
        }
    };
    
    recognitionRef.current.onend = () => { setListeningField(null); };
    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        setListeningField(null);
    };
    
    recognitionRef.current.start();
    setListeningField(fieldId);
  }, [listeningField]);

  const updateResponse = (key: string, value: string) => {
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => { if (currentStep < SURVEY_STEPS.length) { setCurrentStep(prev => prev + 1); } };
  const prevStep = () => { if (currentStep > 0) { setCurrentStep(prev => prev - 1); } };
  const goToStep = (stepIndex: number) => { if(stepIndex >= 0 && stepIndex <= SURVEY_STEPS.length) { setCurrentStep(stepIndex); } };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const generatedReport = await generateStrategicReport(responses);
      setReport(generatedReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportProgress = () => {
      const dataStr = JSON.stringify(responses);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `AIWinLab_Progress_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
  };

  const handleImportProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const importedResponses = JSON.parse(e.target?.result as string);
              if (typeof importedResponses === 'object' && importedResponses !== null) {
                  setResponses(importedResponses);
                  alert('Progress restored successfully!');
              } else { throw new Error('Invalid file format.'); }
          } catch (err) {
              alert('Error: Could not import file. Please ensure it is a valid progress backup file.');
              console.error("Import error:", err);
          }
      };
      reader.readAsText(file);
      if(event.target) event.target.value = '';
  };

  if (isProcessing) return <LoadingState loadingMessage={loadingMessage} />;
  if (error) return <ErrorState error={error} onRetry={() => { setError(null); setIsProcessing(false); }} />;
  if (report) return <SurveyReport report={report} responses={responses} />;

  if (currentStep === SURVEY_STEPS.length) {
    return <ReviewStep responses={responses} onEdit={goToStep} onBack={() => setCurrentStep(SURVEY_STEPS.length - 1)} onSubmit={handleSubmit} />;
  }

  const currentStepData = SURVEY_STEPS[currentStep];

  return (
    <div className="survey-layout">
        <aside className="survey-sidebar">
            <h3 className="sidebar-title">Assessment Sections</h3>
            <nav className="sidebar-nav">
                {SURVEY_STEPS.map((step, index) => (
                    <button key={step.id} onClick={() => goToStep(index)} className={`sidebar-item ${currentStep === index ? 'sidebar-item--active' : ''} ${isSectionComplete(index) ? 'sidebar-item--complete' : ''}`}>
                        <div className="sidebar-item__icon"><step.icon /></div>
                        <span>{step.title}</span>
                         {isSectionComplete(index) && <div className="sidebar-item__check"><CheckCircle/></div>}
                    </button>
                ))}
            </nav>
            <div className="sidebar-footer">
                 <div className="file-ops-container">
                    <input type="file" ref={fileInputRef} onChange={handleImportProgress} accept=".json" style={{ display: 'none' }} />
                    <button onClick={handleExportProgress} className="file-op-button"> <Download /> <span>Export</span></button>
                    <button onClick={() => fileInputRef.current?.click()} className="file-op-button"><Upload /> <span>Import</span></button>
                </div>
            </div>
        </aside>
        <main ref={surveyContainerRef} className="survey-main">
            <div className="survey-container">
                <header>
                    <div className="survey-header">
                        <div className="survey-header__icon-wrapper"><currentStepData.icon/></div>
                        <div><h2 className="survey-title">{currentStepData.title}</h2></div>
                    </div>
                </header>

                <main className="question-list">
                    {currentStepData.questions.map(q => (
                        <div key={q.id} className="question-item">
                            <label htmlFor={q.id} className="question-label">{q.text}</label>
                            <div className="survey-textarea-wrapper">
                                <textarea id={q.id} rows={8} value={responses[q.id] || ''} onChange={(e) => updateResponse(q.id, e.target.value)} placeholder={q.placeholder} className="survey-textarea"/>
                                <button onClick={() => toggleListening(q.id)} title="Use voice-to-text" className={`voice-toggle-button ${listeningField === q.id ? 'listening' : ''}`}>
                                    {listeningField === q.id ? <MicOff /> : <Mic />}
                                </button>
                            </div>
                        </div>
                    ))}
                </main>

                <footer className="survey-footer">
                    <div className="survey-footer__nav">
                        <button onClick={prevStep} disabled={currentStep === 0} className="button button--secondary"><ChevronLeft /><span>Previous</span></button>
                        <button onClick={nextStep} className="button button--primary">
                           <span>{currentStep < SURVEY_STEPS.length - 1 ? 'Next Section' : 'Review Answers'}</span> <ChevronRight />
                        </button>
                    </div>
                </footer>
            </div>
        </main>
    </div>
  );
};

export default AiConsultingSurvey;
