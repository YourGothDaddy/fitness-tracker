import React, { useEffect } from 'react';
import AOS from 'aos'; // AOS for scroll animations
import 'aos/dist/aos.css'; // AOS CSS import
import '../../css/HomePage.css'; // Import the external CSS file

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1200 }); // Initialize AOS
  }, []);

  // Function to scroll to the next section
  const scrollToNextSection = () => {
    const nextSection = document.querySelector('.section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content" data-aos="fade-up">
          <h1 className="title">
            Welcome to <span className="highlight">Fitness Tracker</span>
          </h1>
          <h2 className="subtitle">Your Ultimate Fitness Companion</h2>
          <button className="button hero-button">Get Started</button>
        </div>
        <div className="scroll-indicator" data-aos="fade-down" onClick={scrollToNextSection}>
          <span>Scroll Down</span>
        </div>
      </section>

      {/* Goals and Features Section */}
      <section className="section">
        <h2 className="section-title" data-aos="fade-right">Why Fitnes Tracker?</h2>
        <div className="features">
          <div className="feature-card" data-aos="zoom-in">
            <div className="icon">🔥</div>
            <h3 className="feature-title">Track Your Goals</h3>
            <p className="feature-description">
              Set and monitor daily calorie intake, weight targets, and more to stay on track with your fitness journey.
            </p>
          </div>
          <div className="feature-card" data-aos="zoom-in" data-aos-delay="200">
            <div className="icon">📊</div>
            <h3 className="feature-title">Personalized Insights</h3>
            <p className="feature-description">
              Receive personalized insights based on your data to optimize your fitness and diet plans.
            </p>
          </div>
          <div className="feature-card" data-aos="zoom-in" data-aos-delay="400">
            <div className="icon">🏆</div>
            <h3 className="feature-title">Achieve Your Goals</h3>
            <p className="feature-description">
              With clear goal tracking and feedback, FitLife helps you reach your fitness milestones.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section">
        <h2 className="section-title" data-aos="fade-right">What Our Users Say</h2>
        <div className="testimonials">
          <div className="testimonial-card" data-aos="flip-left">
            <p className="quote">“The fitness tracker has completely transformed the way I approach my fitness goals!”</p>
            <p className="author">- John D.</p>
          </div>
          <div className="testimonial-card" data-aos="flip-left" data-aos-delay="200">
            <p className="quote">“The personalized insights are a game-changer for my daily routine!”</p>
            <p className="author">- Sarah L.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
