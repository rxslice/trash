import React, { useState, useEffect, useRef } from 'react';
import type { StrategicReport, ReadinessAssessment, SurveyResponses, ChatMessage } from '../types';
import { createChat } from '../services/geminiService';
import type { Chat } from '@google/genai';


// --- Icon Components ---
const CheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const Zap = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const ShieldAlert = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>;
const Printer = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect width="12" height="8" x="6" y="14"></rect></svg>;
const Compass = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>;
const Info = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="16" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></svg>;
const Map = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" x2="8" y1="2" y2="18"></line><line x1="16" x2="16" y1="6" y2="22"></line></svg>;
const TrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>;
const MessageSquare = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const Send = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const X = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;


// --- Visual Components ---

const ReadinessGauge = ({ score }: { score: number }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    return (
        <svg width="120" height="120" viewBox="0 0 120 120" className="readiness-gauge">
            <circle className="gauge-bg" cx="60" cy="60" r={radius} />
            <circle className="gauge-fg" cx="60" cy="60" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="gauge-text">{score}</text>
        </svg>
    );
};

const ReadinessRadarChart = ({ breakdown }: { breakdown: ReadinessAssessment['scoreBreakdown'] }) => {
    const size = 300;
    const center = size / 2;
    const maxRadius = size * 0.4;
    const levels = 4; // 25, 50, 75, 100
    const sides = 4;
    const slice = (Math.PI * 2) / sides;

    const points = [
        breakdown.strategy,
        breakdown.data,
        breakdown.team,
        breakdown.process,
    ];

    const labels = ['Strategy', 'Data', 'Team', 'Process'];
    
    const getPoint = (value: number, index: number) => {
        const radius = (value / 100) * maxRadius;
        const angle = slice * index - Math.PI / 2; // Start from top
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
        };
    };

    const scorePath = points.map((p, i) => {
        const point = getPoint(p, i);
        return `${point.x},${point.y}`;
    }).join(' ');

    return (
        <div className="radar-chart-container">
            <svg width="100%" viewBox={`0 0 ${size} ${size}`} className="radar-chart-svg">
                <g>
                    {[...Array(levels)].map((_, i) => {
                        const radius = (maxRadius * (levels - i)) / levels;
                        const gridPath = [...Array(sides)].map((_, j) => {
                            const angle = slice * j - Math.PI / 2;
                            return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`;
                        }).join(' ');
                        return <polygon key={i} points={gridPath} className="radar-grid-polygon" />;
                    })}
                </g>
                <g>
                    {[...Array(sides)].map((_, i) => {
                        const endPoint = getPoint(100, i);
                        return <line key={i} x1={center} y1={center} x2={endPoint.x} y2={endPoint.y} className="radar-axis-line" />;
                    })}
                </g>
                 <g>
                    {labels.map((label, i) => {
                        const point = getPoint(115, i); // Position labels outside the max radius
                        return <text key={label} x={point.x} y={point.y} dy="0.3em" className="radar-axis-label">{label}</text>;
                    })}
                </g>
                <g>
                    <polygon points={scorePath} className="radar-score-area" />
                </g>
            </svg>
        </div>
    );
};


const RoadmapTimeline = ({ roadmap }: { roadmap: StrategicReport['implementationRoadmap'] }) => {
    const phases = [
        { title: roadmap.phase1_title, duration: roadmap.phase1_duration, initiatives: roadmap.phase1_initiatives },
        { title: roadmap.phase2_title, duration: roadmap.phase2_duration, initiatives: roadmap.phase2_initiatives },
        { title: roadmap.phase3_title, duration: roadmap.phase3_duration, initiatives: roadmap.phase3_initiatives },
    ];

    return (
        <div className="roadmap-timeline-wrapper">
            <div className="roadmap-timeline">
                {phases.map((phase, index) => (
                    <React.Fragment key={index}>
                        <div className="roadmap-phase-column">
                            <div className="roadmap-phase-header">
                                <h4 className="roadmap-phase-title">{phase.title}</h4>
                                <span className="roadmap-phase-duration">{phase.duration}</span>
                            </div>
                            <div className="roadmap-phase-initiatives">
                                {phase.initiatives.map(initiative => (
                                    <div key={initiative} className="roadmap-timeline-initiative">{initiative}</div>
                                ))}
                            </div>
                        </div>
                        {index < phases.length - 1 && (
                            <div className="roadmap-connector">
                                <ChevronRight />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, history, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history, isOpen]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const formatMessage = (content: string) => {
        // A simple markdown-like formatter
        return { __html: content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>')     // Italics
            .replace(/^- (.*$)/gm, '<li>$1</li>')      // List items
            .replace(/(\<li\>.*\<\/li\>)/gs, '<ul>$1</ul>') // Wrap lists in <ul>
            .replace(/\n/g, '<br />')
        };
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="chat-panel-overlay" onClick={onClose}></div>
            <div className="chat-panel">
                <header className="chat-header">
                    <h3 className="chat-title">Chat with Strategos AI</h3>
                    <button onClick={onClose} className="chat-close-button"><X/></button>
                </header>
                <div className="chat-message-list">
                    {history.map((msg, index) => (
                        <div key={index} className={`chat-message chat-message--${msg.role}`}>
                            <div className="chat-bubble" dangerouslySetInnerHTML={formatMessage(msg.content)} />
                        </div>
                    ))}
                    {isLoading && history[history.length - 1]?.role === 'user' && (
                        <div className="chat-message chat-message--model">
                            <div className="chat-bubble chat-bubble--loading">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <footer className="chat-footer">
                    <form onSubmit={handleSend} className="chat-form">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="chat-input"
                            placeholder="Ask a follow-up question..."
                            disabled={isLoading}
                        />
                        <button type="submit" className="chat-send-button" disabled={isLoading}>
                            <Send />
                        </button>
                    </form>
                </footer>
            </div>
        </>
    );
};


const SurveyReport = ({ report, responses }: { report: StrategicReport, responses: SurveyResponses }) => {
    const [highlightedSwot, setHighlightedSwot] = useState<string | null>(null);
    const initiativeRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    useEffect(() => {
        initiativeRefs.current = initiativeRefs.current.slice(0, report.recommendedInitiatives.length);
    }, [report.recommendedInitiatives]);

    useEffect(() => {
        if(report && responses) {
            const session = createChat(responses, report);
            setChatSession(session);
            setChatHistory([{
                role: 'model',
                content: "**Hello!** I've reviewed your strategic report. How can I help you clarify or expand on any of the points?"
            }]);
        }
    }, [report, responses]);

    const handleSendMessage = async (message: string) => {
        if (!chatSession) return;
        
        setIsChatLoading(true);
        const newHistory = [...chatHistory, { role: 'user' as const, content: message }];
        setChatHistory(newHistory);

        try {
            const stream = await chatSession.sendMessageStream({ message });
            let text = '';
            // Add a placeholder for the model's response
            setChatHistory(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of stream) {
                text += chunk.text;
                setChatHistory(prev => {
                    const latestHistory = [...prev];
                    latestHistory[latestHistory.length - 1].content = text;
                    return latestHistory;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setChatHistory(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Please try again."}]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleSwotClick = (swotText: string) => {
        const newHighlight = highlightedSwot === swotText ? null : swotText;
        setHighlightedSwot(newHighlight);
        if (newHighlight) {
            const targetIndex = report.recommendedInitiatives.findIndex(init => init.linkedSwotItems?.includes(newHighlight));
            if (targetIndex !== -1 && initiativeRefs.current[targetIndex]) {
                initiativeRefs.current[targetIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };
    
    const impactColorClass = (impact: string) => {
        switch (impact) {
            case 'High': return 'tag--high-impact';
            case 'Medium': return 'tag--medium-impact';
            case 'Low': return 'tag--low-impact';
            default: return 'tag--low-impact';
        }
    };
    
    return (
        <div id="survey-report" className="report-container">
            <header className="report-header">
                 <div className="report-header__print-button print-hidden">
                    <button onClick={() => window.print()} className="button button--secondary"><Printer /><span>Print / Save PDF</span></button>
                </div>
                <CheckCircle />
                <h1 className="report-title">Your Strategic AI Roadmap</h1>
                <p className="report-subtitle">Based on your provided information, our AI has generated a tailored strategic analysis to guide your AI journey.</p>
            </header>
            
            <main>
                <section className="report-section" id="summary">
                    <div className="report-card">
                        <h2 className="report-card__title">Executive Summary</h2>
                        <p>{report.executiveSummary}</p>
                    </div>
                </section>

                <section className="report-section" id="readiness">
                    <h2 className="report-section-title"><TrendingUp/>AI Readiness & Maturity</h2>
                    <div className="readiness-grid">
                        <div className="report-card readiness-card--gauge">
                            <h3 className="readiness-card__title">Overall Score</h3>
                            <ReadinessGauge score={report.readiness.overallScore} />
                             <h3 className="readiness-card__title" style={{marginTop: '1.5rem'}}>Maturity Level: {report.readiness.maturityLevel}</h3>
                        </div>
                        <div className="report-card readiness-card--radar">
                             <h3 className="readiness-card__title">Readiness Breakdown</h3>
                             <ReadinessRadarChart breakdown={report.readiness.scoreBreakdown} />
                        </div>
                    </div>
                </section>

                <section className="report-section" id="swot">
                    <h2 className="report-section-title"><Compass />SWOT Analysis</h2>
                    <div className="swot-grid">
                        <div className="swot-card swot-card--strengths"><h3>Strengths</h3><ul>{report.swotAnalysis.strengths.map((item, i) => <li key={`s-${i}`}>{item}</li>)}</ul></div>
                        <div className="swot-card swot-card--weaknesses"><h3>Weaknesses</h3><ul>{report.swotAnalysis.weaknesses.map((item, i) => <li key={`w-${i}`} onClick={() => handleSwotClick(item)} className={`swot-item ${highlightedSwot === item ? 'swot-item--highlighted' : ''}`}>{item}</li>)}</ul></div>
                        <div className="swot-card swot-card--opportunities"><h3>Opportunities</h3><ul>{report.swotAnalysis.opportunities.map((item, i) => <li key={`o-${i}`} onClick={() => handleSwotClick(item)} className={`swot-item ${highlightedSwot === item ? 'swot-item--highlighted' : ''}`}>{item}</li>)}</ul></div>
                        <div className="swot-card swot-card--threats"><h3>Threats</h3><ul>{report.swotAnalysis.threats.map((item, i) => <li key={`t-${i}`} onClick={() => handleSwotClick(item)} className={`swot-item ${highlightedSwot === item ? 'swot-item--highlighted' : ''}`}>{item}</li>)}</ul></div>
                    </div>
                </section>

                <section className="report-section" id="initiatives">
                    <h2 className="report-section-title">Recommended Initiatives</h2>
                    <div className="initiatives-container">
                        {report.recommendedInitiatives.map((item, i) => {
                            const isHighlighted = highlightedSwot && item.linkedSwotItems?.includes(highlightedSwot);
                            return (
                             <div key={i} ref={el => { initiativeRefs.current[i] = el; }} className={`report-card initiative-card ${isHighlighted ? 'initiative-card--highlighted' : ''}`}>
                                <div className="initiative-card__header">
                                     <h3 className="initiative-card__title"><Zap />{item.initiativeName}</h3>
                                     <div className="initiative-card__tags">
                                        <span className={`tag tag--type-${item.initiativeType.toLowerCase().replace(' ','-')}`}>{item.initiativeType}</span>
                                        <span className={`tag ${impactColorClass(item.potentialImpact)}`}>Impact: {item.potentialImpact}</span>
                                        <span className={`tag ${impactColorClass(item.effortLevel)}`}>Effort: {item.effortLevel}</span>
                                     </div>
                                 </div>
                                <div className="initiative-card__body">
                                    <p>{item.description}</p>
                                    <h4>First Steps:</h4> <p>{item.firstSteps}</p>
                                    <div className="initiative-details-grid">
                                        <div><h4>KPIs to Track</h4><ul>{item.kpisToTrack.map(kpi => <li key={kpi}>{kpi}</li>)}</ul></div>
                                        <div><h4>Required Resources</h4><p>{item.requiredResources}</p></div>
                                        <div><h4>Timeline Estimate</h4><p>{item.timelineEstimate}</p></div>
                                    </div>
                                </div>
                                <div className="initiative-card__justification"><h5><Info/>Strategic Justification</h5><p>{item.justification}</p></div>
                            </div>
                        )})}
                    </div>
                </section>

                <section className="report-section" id="roadmap">
                    <h2 className="report-section-title"><Map />Implementation Roadmap</h2>
                    <div className="report-card">
                        <RoadmapTimeline roadmap={report.implementationRoadmap} />
                    </div>
                </section>

                 <section className="report-section" id="risks">
                    <h2 className="report-section-title"><ShieldAlert/>Risk Analysis</h2>
                     <div className="report-grid--risk">
                         <div className="risk-card risk-card--technical"><h4>Technical Risks</h4><p>{report.riskAnalysis.technicalRisks}</p></div>
                         <div className="risk-card risk-card--operational"><h4>Operational Risks</h4><p>{report.riskAnalysis.operationalRisks}</p></div>
                         <div className="risk-card risk-card--market"><h4>Market Risks</h4><p>{report.riskAnalysis.marketRisks}</p></div>
                     </div>
                </section>

                 <section className="report-section">
                    <div className="conclusion-card">
                        <h2 className="conclusion-card__title">Conclusion & Next Steps</h2>
                        <p>{report.conclusion}</p>
                        <p className="emphasis">We will be in touch shortly to schedule your executive strategy session.</p>
                    </div>
                </section>
            </main>
            
            <button className="chat-fab print-hidden" onClick={() => setIsChatOpen(true)}>
                <MessageSquare />
                <span>Chat with your report</span>
            </button>
            <ChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                history={chatHistory}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
            />

        </div>
    );
};

export default SurveyReport;
