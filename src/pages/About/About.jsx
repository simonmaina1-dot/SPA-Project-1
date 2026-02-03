import React, { useState } from 'react';
import { Link } from "react-router-dom";
import "./About.css";

export default function About() {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className="page about-page">
      {/* Main Header */}
      <div className="about-header">
        <h1 className="about-title">About the Community</h1>
        <p className="about-lead">
          Behind every funded project is a parent who stayed up late submitting updates, 
          a volunteer who showed up on a Saturday morning, a donor who gave Ksh 18,000 
          because they remembered what it felt like to need help and not get it.
        </p>
      </div>

      {/* 3 Cards Side by Side */}
      <div className="about-grid">
        {/* Card 1: Local Spotlights */}
        <div className="about-card">
          <h3>Local Spotlights</h3>
          <p>
            Every active project gets a spotlight: a photo, a short update, and a clear 
            accounting of where things stand.{' '}
            <button 
              className="read-more-link" 
              onClick={() => toggleCard(1)}
            >
              Read more
            </button>
          </p>
          {expandedCard === 1 && (
            <div className="about-card-expanded">
              <p>
                We believe that transparency builds trust. Each project receives regular 
                updates with photos, financial breakdowns, and progress reports.
              </p>
            </div>
          )}
        </div>

        {/* Card 2: Community Signals */}
        <div className="about-card">
          <h3>Community Signals</h3>
          <p>
            We track what's moving. When a project picks up five new donors in a week, 
            you'll see it. When a volunteer callout goes unanswered, you'll see that too.{' '}
            <button 
              className="read-more-link" 
              onClick={() => toggleCard(2)}
            >
              Read more
            </button>
          </p>
          {expandedCard === 2 && (
            <div className="about-card-expanded">
              <p>
                Our platform monitors engagement in real-time. Rising momentum gets 
                highlighted. Struggling projects get visibility.
              </p>
            </div>
          )}
        </div>

        {/* Card 3: Shared Responsibility */}
        <div className="about-card">
          <h3>Shared Responsibility</h3>
          <p>
            Transparency isn't a feature here; it's the foundation. When a project hits 
            its goal, we celebrate. When something falls short, we say so.{' '}
            <button 
              className="read-more-link" 
              onClick={() => toggleCard(3)}
            >
              Read more
            </button>
          </p>
          {expandedCard === 3 && (
            <div className="about-card-expanded">
              <p>
                Every project undergoes thorough vetting. Project creators are held 
                accountable for updates and fund usage.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Feedback Section */}
      <section className="about-feedback">
        <h2>User Feedback</h2>
        <p className="feedback-intro">Community suggestions and feedback submissions.</p>
        
        <form className="feedback-form">
          <div className="form-field">
            <label htmlFor="name" className="form-label">Name</label>
            <input 
              type="text" 
              id="name" 
              placeholder="Visitor name"
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="email" className="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="email@example.com"
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="message" className="form-label">Message</label>
            <textarea 
              id="message" 
              rows="5"
              placeholder="Your feedback..."
              className="form-textarea"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Submit Feedback
          </button>
        </form>
      </section>
    </div>
  );
}
