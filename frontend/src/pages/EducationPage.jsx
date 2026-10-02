import React, { useState } from 'react';
import { BookOpen, ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle, Award, RotateCcw, Lightbulb, Lock } from 'lucide-react';

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState('encyclopedia'); // 'encyclopedia' or 'quiz'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const attackTypes = [
    {
      title: 'Typosquatting & Lookalike Domains',
      badge: 'COMMON',
      description: 'Attackers register domains with subtle spelling variations, character substitutions (e.g., paypa1.com or goog1e.com), or missing letters to trick hurried visitors.',
      indicators: ['Single character replacements', 'Transposed adjacent letters', 'Omitted or doubled vowels'],
      example: 'https://www.micros0ft-support-login.com/auth'
    },
    {
      title: 'Subdomain Deception',
      badge: 'HIGH RISK',
      description: 'Attackers embed a trusted brand name inside a multi-level subdomain (e.g. chase.com.evil-server.xyz), banking on users glancing only at the left side of the URL.',
      indicators: ['3+ nested subdomains', 'Brand name positioned before attacker domain', 'Extremely long hostnames'],
      example: 'https://paypal.com.verify-account.security-update.xyz/login'
    },
    {
      title: 'Raw IP Address Hostnames',
      badge: 'CRITICAL',
      description: 'Legitimate institutions almost universally use registered, authenticated domain names. Connecting directly to a raw IPv4/IPv6 host is a strong signal of evasion.',
      indicators: ['Dotted quad IP syntax (e.g. 192.168.1.10)', 'Hexadecimal or integer IP encodings', 'Lack of TLS certificate matching'],
      example: 'http://185.220.101.5/banking/signin.html'
    },
    {
      title: 'Credential Divider (@) Exploitation',
      badge: 'HIGH RISK',
      description: 'RFC 3986 specifies everything before an "@" symbol as userinfo. Attackers prepend a legitimate brand before the "@" to deceive users on destination host.',
      indicators: ['"@" character inside URL host/path', 'Legitimate brand placed before "@"', 'Unexpected redirect behavior'],
      example: 'https://google.com@attacker-controlled-host.biz/login'
    },
    {
      title: 'Suspicious Path Harvesting Keywords',
      badge: 'COMMON',
      description: 'Phishing attack toolkits frequently pack sensitive keywords like "login", "verify", "secure", "billing", and "account-update" into URL paths to foster fake urgency.',
      indicators: ['Urgent words in unverified domain paths', 'Excessive query parameters', 'Fake SSL wording'],
      example: 'https://secure-token-update.online/auth/login-verify-account.php'
    },
  ];

  const quizQuestions = [
    {
      question: 'Which of the following URLs is a safe, legitimate domain?',
      options: [
        'http://chase.com.security-verify.org/login',
        'https://www.chase.com/personal/banking',
        'http://192.168.1.100/chase-online/index.html',
        'https://chase-update-account.biz/secure'
      ],
      correct: 1,
      explanation: 'Only "https://www.chase.com/personal/banking" belongs directly to the verified "chase.com" top-level domain over encrypted HTTPS.'
    },
    {
      question: 'What is the danger of a URL containing an "@" symbol (e.g. https://paypal.com@evil-site.com)?',
      options: [
        'It sends an email automatically to the target server.',
        'The browser treats "paypal.com" as userinfo credentials and navigates directly to "evil-site.com".',
        'It forces the browser to disable JavaScript.',
        'It opens the website inside a secure sandbox.'
      ],
      correct: 1,
      explanation: 'According to URL standards (RFC 3986), text before the "@" character is interpreted as username information, directing the user to the host after the "@".'
    },
    {
      question: 'Why is high character entropy in a domain name (e.g. "x9z7q-v8m2p.xyz") a warning sign?',
      options: [
        'It indicates strong encryption.',
        'It is a sign of Domain Generation Algorithms (DGA) used in automated phishing and botnets.',
        'It makes the website load faster.',
        'It guarantees the domain is registered with ICANN.'
      ],
      correct: 1,
      explanation: 'High character randomness/entropy often indicates algorithmically generated disposable domains (DGAs) created by cybercriminals to bypass static blocklists.'
    },
    {
      question: 'Is a website guaranteed to be 100% safe if it has a padlock (HTTPS) icon?',
      options: [
        'Yes, HTTPS means the company identity has been verified by law.',
        'No, HTTPS only means communication is encrypted. Cybercriminals can obtain free SSL certificates for phishing sites too.',
        'Yes, search engines block all unverified HTTPS websites.',
        'No, HTTPS is only used for government portals.'
      ],
      correct: 1,
      explanation: 'HTTPS encrypts the data in transit, but modern phishing sites frequently use free SSL certificates (like Let\'s Encrypt). Always inspect the domain name itself!'
    }
  ];

  const handleSelectAnswer = (qIndex, optIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qIndex]: optIndex
    });
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) {
        score += 1;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setShowResult(false);
    setCurrentQuestion(0);
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px auto' }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>
            Cybersecurity <span className="gradient-text">Education & Training Hub</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            Master URL threat anatomy, recognize attack vectors, and test your defense skills with interactive quizzes.
          </p>

          {/* Tab Switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-md)',
              padding: 4,
              marginTop: 24,
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              onClick={() => setActiveTab('encyclopedia')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'encyclopedia' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'encyclopedia' ? '#050b14' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <BookOpen size={16} /> Phishing Attack Patterns
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'quiz' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'quiz' ? '#050b14' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <HelpCircle size={16} /> Interactive URL Challenge
            </button>
          </div>
        </div>

        {activeTab === 'encyclopedia' ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
              {attackTypes.map((item, idx) => (
                <div key={idx} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{item.title}</h3>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: item.badge === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: item.badge === 'CRITICAL' ? '#f87171' : '#fbbf24',
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                      {item.description}
                    </p>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                        KEY INDICATORS:
                      </div>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {item.indicators.map((ind, i) => (
                          <li key={i} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={13} color="var(--accent-cyan)" /> {ind}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>EXAMPLE ATTACK STRING:</div>
                    <div className="font-mono" style={{ fontSize: '0.8rem', color: '#fca5a5', wordBreak: 'break-all', marginTop: 2 }}>
                      {item.example}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Defense Tips Banner */}
            <div
              className="glass-card"
              style={{
                marginTop: 40,
                padding: 32,
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.06) 0%, rgba(99, 102, 241, 0.06) 100%)',
                border: '1px solid var(--border-color-glow)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24,
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Lightbulb size={20} color="var(--accent-cyan)" /> Essential Defense Principles
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Always verify the registered root domain (the word right before the .com / .org) before entering passwords or confidential data.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  <span>Never trust links in unexpected SMS or email notifications.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  <span>Use PhishShield AI to statically evaluate links before clicking.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  <span>Enable hardware-backed Two-Factor Authentication (2FA/FIDO2).</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Quiz View */
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: 36 }}>
              {!showResult ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      QUESTION {currentQuestion + 1} OF {quizQuestions.length}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {Object.keys(selectedAnswers).length} answered
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 24 }}>
                    {quizQuestions[currentQuestion].question}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                    {quizQuestions[currentQuestion].options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQuestion] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(currentQuestion, optIdx)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-color)',
                            background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: isSelected ? 600 : 400,
                            textAlign: 'left',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <span className="font-mono" style={{ marginRight: 10, color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      disabled={currentQuestion === 0}
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Previous
                    </button>

                    {currentQuestion < quizQuestions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestion(currentQuestion + 1)}
                        className="btn btn-primary"
                        style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                        onClick={() => setShowResult(true)}
                        className="btn btn-primary"
                        style={{ padding: '8px 24px', fontSize: '0.85rem' }}
                      >
                        Finish & See Score
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Results View */
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'rgba(0, 242, 254, 0.15)',
                      border: '1px solid var(--accent-cyan)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Award size={36} color="var(--accent-cyan)" />
                  </div>

                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
                    Quiz Completed!
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                    You scored <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.4rem' }}>{calculateScore()}</strong> out of {quizQuestions.length} correct ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)
                  </p>

                  {/* Question breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', marginBottom: 30 }}>
                    {quizQuestions.map((q, idx) => {
                      const userChoice = selectedAnswers[idx];
                      const isCorrect = userChoice === q.correct;
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: 16,
                            borderRadius: 'var(--radius-md)',
                            background: isCorrect ? 'var(--status-safe-bg)' : 'var(--status-phishing-bg)',
                            border: `1px solid ${isCorrect ? 'var(--status-safe-border)' : 'var(--status-phishing-border)'}`,
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isCorrect ? <CheckCircle2 size={16} color="#34d399" /> : <AlertTriangle size={16} color="#f87171" />}
                            <span>Q{idx + 1}: {q.question}</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={resetQuiz}
                    className="btn btn-primary"
                    style={{ padding: '10px 24px' }}
                  >
                    <RotateCcw size={16} /> Retake Challenge
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
