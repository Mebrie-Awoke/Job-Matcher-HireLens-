import { useState } from 'react' 
import './App.css'  

const sampleResume = ` 
Senior Product Analyst with 4 years of experience in data-driven decision making, dashboard design, SQL, and stakeholder communication.
Strong background in Python, Excel, and business intelligence with experience improving conversion rates and reducing churn.
Led A/B testing initiatives and built KPI dashboards for product and marketing teams.
`

const sampleAbout = `
I am a motivated professional who enjoys turning insights into action. I have worked with cross-functional teams, analyzed customer behavior, and created dashboards that improved product strategy. I am looking for a role where I can combine analytics, problem-solving, and communication.`

const sampleJob = `
We are hiring a Senior Data Analyst to support product strategy and growth. Responsibilities include SQL analysis, dashboard creation, customer behavior analysis, Python scripting, experimentation, stakeholder communication, and business intelligence reporting. Candidate should have experience in A/B testing, product analytics, and data storytelling.`

function App() {
  const [resumeText, setResumeText] = useState(sampleResume)
  const [aboutMe, setAboutMe] = useState(sampleAbout)
  const [jobDescription, setJobDescription] = useState(sampleJob)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUseSampleData = () => {
    setResumeText(sampleResume)
    setAboutMe(sampleAbout)
    setJobDescription(sampleJob)
    setResult(null)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: resumeText,
          about_me: aboutMe,
          job_description: jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error('The matching service is unavailable. Please try again.')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong while analyzing your profile.')
    } finally {
      setLoading(false)
    }
  }

  const scoreLabel = result
    ? result.fit_percentage >= 80
      ? 'Strong match'
      : result.fit_percentage >= 60
        ? 'Good potential'
        : 'Needs improvement'
    : 'Career readiness'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">H</div>
          <div>
            <p className="eyebrow">AI-powered hiring</p>
            <h1>HireLens</h1>
          </div>
        </div>

        <nav className="top-nav" aria-label="Main navigation">
          <a href="#analysis">Analysis</a>
          <a href="#results">Results</a>
          <a href="#growth">Growth plan</a>
        </nav>

        <button type="button" className="secondary-btn" onClick={handleUseSampleData}>
          Load sample data
        </button>
      </header>

      <section className="hero-banner">
        <div>
          <span className="badge">Career fit engine</span>
          <h2>Compare talent to the job before the interview.</h2>
          <p>
            Evaluate how closely a candidate matches a role and reveal the exact skills needed for the next step.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="mini-card">
            <strong>90%</strong>
            <span>Faster screening</span>
          </div>
          <div className="mini-card">
            <strong>4x</strong>
            <span>Smarter decisions</span>
          </div>
          <div className="mini-card">
            <strong>AI</strong>
            <span>Skill suggestions</span>
          </div>
        </div>
      </section>

      <main className="layout" id="analysis">
        <section className="panel form-panel">
          <div className="panel-header">
            <h3>Candidate profile</h3>
            <span className="panel-tag">Live input</span>
          </div>

          <form onSubmit={handleSubmit} className="match-form">
            <label>
              <span>Resume / CV</span>
              <textarea
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
                rows="10"
                placeholder="Paste your resume text here..."
              />
            </label>

            <label>
              <span>About you</span>
              <textarea
                value={aboutMe}
                onChange={(event) => setAboutMe(event.target.value)}
                rows="6"
                placeholder="Tell us a little about your background, goals, and strengths..."
              />
            </label>

            <label>
              <span>Job description</span>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows="12"
                placeholder="Paste the job description here..."
              />
            </label>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Analyzing fit...' : 'Check my match'}
            </button>
          </form>
        </section>

        <section className="panel results-panel" id="results">
          <div className="panel-header">
            <h3>Fit report</h3>
            <span className="panel-tag soft">Updated now</span>
          </div>

          {error && <div className="error-box">{error}</div>}

          {!result && !error && (
            <div className="empty-state">
              <div>
                <div className="empty-icon">✓</div>
                <p>Your fit score and growth recommendations will appear here.</p>
              </div>
            </div>
          )}

          {result && (
            <>
              <div className="score-box">
                <div className="score-ring">
                  <span>{result.fit_percentage}%</span>
                </div>
                <div>
                  <p className="score-label">Job fit score</p>
                  <h3>{scoreLabel}</h3>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>Matched skills</span>
                  <strong>{result.matched_skills.length}</strong>
                </div>
                <div className="stat-card">
                  <span>Missing skills</span>
                  <strong>{result.missing_skills.length}</strong>
                </div>
              </div>

              <div className="insight-box">
                <h3>AI summary</h3>
                <p>{result.summary}</p>
              </div>

              <div className="skills-box" id="growth">
                <div>
                  <h3>Matched strengths</h3>
                  <ul>
                    {result.matched_skills.length > 0 ? (
                      result.matched_skills.map((skill) => <li key={skill}>{skill}</li>)
                    ) : (
                      <li>No direct skill overlaps detected.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3>Recommended upgrades</h3>
                  <ul>
                    {result.missing_skills.length > 0 ? (
                      result.missing_skills.map((skill) => <li key={skill}>{skill}</li>)
                    ) : (
                      <li>No major gaps detected.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="recommendations-box">
                <h3>Future improvement plan</h3>
                <ul>
                  {result.recommendations.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong>
                      <span>{item.details}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
