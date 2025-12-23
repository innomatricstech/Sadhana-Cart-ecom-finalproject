import React from "react";
import "./AboutUs.css";
import aboutImg from "../../Images/aboutusimg1.jpg";

function AboutUs() {
  const teamMembers = [
    { name: "Sadhaka Anand", title: "Founder & Spiritual Visionary" },
    { name: "Priya Sharma", title: "Ethical Product Curator" },
    { name: "Rahul Verma", title: "Operations & Fulfillment" },
    { name: "Meera Iyer", title: "Community & Support" },
  ];

  return (
    <div className="about-container" id="top">
      {/* ================= HEADER ================= */}
      <header className="about-header-bg">
        <div className="container text-center">
          <h1 className="about-title">The Essence of Sadhana</h1>
          <p className="about-subtitle">
            Conscious Products. Trusted Shopping. Meaningful Living.
          </p>
        </div>
      </header>

      <div className="container about-main-content">
        {/* ================= IMAGE + CONTENT ================= */}
        <div className="row align-items-center about-section">
          <div className="col-lg-6 mb-4">
            <img
              src={aboutImg}
              alt="Sadhana Cart"
              className="about-hero-image"
            />
          </div>

          <div className="col-lg-6">
            <h2 className="section-title">About Sadhana Cart</h2>
            <p className="lead-text">
              A conscious e-commerce platform built on trust, quality, and
              ethical sourcing.
            </p>
            <p className="paragraph">
              Sadhana Cart curates spiritual essentials, wellness products, and
              natural goods with a focus on authenticity and simplicity. Every
              product is carefully selected to support mindful living.
            </p>

            <div className="info-card">
              <h4>Our Mission</h4>
              <p>
                To provide ethically sourced, high-quality products through a
                reliable online marketplace.
              </p>
            </div>

            <div className="info-card">
              <h4>Our Vision</h4>
              <p>
                To become a trusted global ecommerce destination blending
                tradition with modern technology.
              </p>
            </div>
          </div>
        </div>

        {/* ================= VALUE PROPOSITION ================= */}
        <div className="about-section">
          <h2 className="section-title text-center">
            What Makes Us Different
          </h2>

          <div className="row text-center mt-4">
            <div className="col-md-3">
              <div className="feature-box">Verified Products</div>
            </div>
            <div className="col-md-3">
              <div className="feature-box">Secure Checkout</div>
            </div>
            <div className="col-md-3">
              <div className="feature-box">Ethical Sourcing</div>
            </div>
            <div className="col-md-3">
              <div className="feature-box">Fast Delivery</div>
            </div>
          </div>
        </div>

        {/* ================= TEAM ================= */}
        <div className="about-section text-center">
          <h2 className="section-title">Meet Our Team</h2>
          <p className="paragraph">
            Dedicated professionals working behind the scenes
          </p>

          <div className="row mt-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-4">
                <div className="team-card">
                  <i className="fas fa-user-circle team-icon"></i>
                  <h5>{member.name}</h5>
                  <p>{member.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CTA ================= */}
        <div className="cta-box text-center">
          <h3>Start Shopping with Purpose</h3>
          <p>
            Discover meaningful products that support a balanced lifestyle.
          </p>
          <button className="cta-btn">Shop Now</button>
        </div>

        {/* Scroll to top */}
        <a href="#top" className="scroll-to-top-btn">↑</a>
      </div>
    </div>
  );
}

export default AboutUs;
