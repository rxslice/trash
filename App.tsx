import React from 'react';
import SecureSurveyWrapper from './components/SecureSurveyWrapper';

function App() {
  return (
    <div className="App">
      <header className="app-header print-hidden">
        <h1 className="app-title">
          AIWinLab<span className="app-title-brand">.</span> Strategic AI Assessment
        </h1>
      </header>
      <main>
        <SecureSurveyWrapper />
      </main>
    </div>
  );
}

export default App;