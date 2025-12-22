import React from 'react';
import './AboutUs.css';

function AboutUs() {
  const teamMembers = [
    { name: "Sadhaka Anand", title: "Founder & Spiritual Visionary" },
    { name: "Priya Sharma", title: "Curator of Ethical Products" },
    { name: "Rahul Verma", title: "Operations & Logistics" },
    { name: "Meera Iyer", title: "Community Relations" }
  ];

  return (
    <div className="about-container" id="top">
      {/* Header with Spiritual Theme */}
      <header className="about-header-bg" style={{ backgroundColor: '#fdf2e9' }}>
        <div className="container about-header-content">
          <i className="about-icon fas fa-om" style={{ color: '#d35400' }}></i>
          <h1 style={{ color: '#5d4037' }}>The Essence of Sadhana</h1>
          <p className="header-subtitle" style={{ color: '#8d6e63' }}>Curating Purity for Your Spiritual Journey</p>
        </div>
      </header>

      <div className="container">
        <main className="about-main-content">
          <div className="about-intro text-center">
            <h2 className="main-policy-title">Welcome to Sadhana Cart</h2>
            <p className="lead">More than an e-commerce platform, we are a bridge to a more mindful and conscious lifestyle.</p>
            <p>At Sadhana Cart, we believe that every product you bring into your home should support your physical well-being and spiritual growth.</p>
          </div>

          {/* Mission Box */}
          <div className="about-mission-box box-highlight fade-in-up">
            <div className="d-flex align-items-center">
              <i className="fas fa-leaf mission-icon me-3" style={{ color: '#27ae60' }}></i>
              <div>
                <h3 className="highlight-title">Our Sacred Mission</h3>
                <p className="mb-0">
                  To provide seekers with authentic, ethically sourced, and high-quality spiritual tools and natural products that enhance their daily practice.
                </p>
              </div>
            </div>
          </div>

          {/* Vision Box */}
          <div className="about-vision-box box-highlight fade-in-up">
            <div className="d-flex align-items-center">
              <i className="fas fa-sun vision-icon me-3" style={{ color: '#f1c40f' }}></i>
              <div>
                <h3 className="highlight-title">Our Vision</h3>
                <p className="mb-0">
                  To become the global cornerstone for conscious living, where tradition meets modern convenience without compromising on purity.
                </p>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="about-offer-box fade-in-up">
            <h3 className="offer-title">The Sadhana Standard</h3>
            <ul className="offer-list">
              <li><i className="fas fa-heart me-2"></i> <strong>Sustainably Sourced:</strong> Products that respect the Earth.</li>
              <li><i className="fas fa-vihara me-2"></i> <strong>Traditional Authenticity:</strong> Sourced directly from artisans and ashrams.</li>
              <li><i className="fas fa-shield-alt me-2"></i> <strong>Uncompromising Purity:</strong> 100% natural and chemical-free selections.</li>
              <li><i className="fas fa-hands-helping me-2"></i> <strong>Giving Back:</strong> A portion of every sale supports spiritual education.</li>
            </ul>
          </div>

          {/* Team Section */}
          <div className="team-section text-center mt-5">
            <h2 className="team-heading">The Hearts Behind the Cart</h2>
            <p className="team-subtitle">A team dedicated to serving the community of seekers</p>
            <div className="row justify-content-center mt-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="col-lg-3 col-md-6 col-sm-6 mb-4">
                  <div className="team-member animated-card" style={{ animationDelay: `${index * 0.1}s`, borderTop: '4px solid #d35400' }}>
                    <div className="team-circle-img">
                      <i className="fas fa-user-circle team-placeholder" style={{ color: '#d35400' }}></i> 
                    </div>
                    <h4 className="member-name">{member.name}</h4>
                    <p className="member-title">{member.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="join-journey-box fade-in-up mt-5" style={{ background: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)' }}>
            <i className="fas fa-lotus join-icon"></i>
            <h3>Walk the Path With Us</h3>
            <p>Discover products designed to bring peace, health, and harmony to your life.</p>
            <button className="btn join-btn-primary" style={{ backgroundColor: '#fff', color: '#d35400', fontWeight: 'bold' }}>
              Begin Your Sadhana
            </button>
          </div>

          <a href="#top" className="scroll-to-top-btn animate__bounceInRight">
            <i className="fas fa-arrow-up"></i>
          </a>
        </main>
      </div>
    </div>
  );
}

export default AboutUs;