<%@ page language="java" contentType="text/html; charset=UTF-8" %>

<%
    String user = (String) session.getAttribute("phone");
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CareerGuide - AI-Powered Career Guidance & Job Recommendation</title>
    <link rel="stylesheet" href="style.css?v=3">

    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="script.js?v=3"></script>
<link rel="stylesheet" href="header.css?v=4">
</head>

<body>

<!-- Navigation Bar -->
<nav class="cg-navbar" id="navbar">
        <div class="cg-nav-container">
            <a class="cg-logo" href="index.jsp">
                <img class="cg-logo-img" src="images/nexthorizon-logo.png" alt="NextHorizon">
            </a>
            <div class="cg-nav-links">
                <a href="index.jsp" class="cg-nav-link active">Home</a>
                <a href="assessment/index.jsp" class="cg-nav-link">Career Assessment</a>
                <a href="resume.html" class="cg-nav-link">Resume</a>
                <a href="feedback.html" class="cg-nav-link">Feedback</a>
                <%
                    if (user != null) {
                %>
                    <a href="logout.jsp" class="btn-login cg-auth-btn">Logout</a>
                <%
                    } else {
                %>
                    <a href="login.jsp" class="btn-login cg-auth-btn">Login</a>
                <%
                    }
                %>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="home">
        <div class="animated-bg">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
        </div>
        <div class="container">
            <div class="hero-content">
                <div class="hero-left">
                    <div class="hero-badge">
                        <i data-lucide="sparkles"></i>
                        <span>AI-Powered Career Guidance</span>
                    </div>
                    <h1 class="hero-title">
                        Discover the <span class="gradient-text">Right Career Path</span> for Your Future
                    </h1>
                    <p class="hero-description">
                        Leverage cutting-edge web scraping technology and AI-driven insights to find personalized career recommendations, skill assessments, and real-time job opportunities tailored just for you.
                    </p>
                    <div class="hero-buttons">
                        <a href="assessment/index.jsp" class="btn-primary">
                            Get Started
                            <i data-lucide="arrow-right"></i>
                        </a>
                        <button type="button" class="btn-secondary" id="exploreFeaturesBtn">Explore Features</button>
                    </div>
                    <div class="hero-stats">
                        <div class="stat-item">
                            <div class="stat-title">Career Assessment</div>
                            <div class="stat-label">Discover career options based on interests, skills, strengths, education, and preferences.</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-title">Career Roadmaps</div>
                            <div class="stat-label">Understand the education, skills, certifications, and experience needed for a chosen career.</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-title">Resume Analysis</div>
                            <div class="stat-label">Create and improve resumes and identify areas for improvement.</div>
                        </div>
                    </div>
                </div>
                <div class="hero-right">
                    <div class="hero-image">
                        <img src="https://images.unsplash.com/photo-1758599543378-ba892b220c89?w=600" alt="Career Growth">
                        <div class="floating-card card-1">
                            <div class="card-icon">
                                <i data-lucide="target"></i>
                            </div>
                            <div>
                                <div class="card-title">Career Match</div>
                                <div class="card-subtitle">98% Accuracy</div>
                            </div>
                        </div>
                        <div class="floating-card card-2">
                            <div class="card-icon">
                                <i data-lucide="trending-up"></i>
                            </div>
                            <div>
                                <div class="card-title">Market Trends</div>
                                <div class="card-subtitle">Real-time Data</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- Features Section -->
    <section class="features" id="features">
        <div class="container">
            <div class="features-header">
                <div class="feature-badge">
                    <i data-lucide="zap"></i>
                    <span>Powerful Features</span>
                </div>
                <h2 class="section-title">
                    Everything You Need for <span class="gradient-text">Career Success</span>
                </h2>
                <p class="section-description">
                    Our comprehensive platform combines AI, web scraping, and expert insights to guide you through every step of your career journey.
                </p>
            </div>

            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i data-lucide="brain"></i>
                    </div>
                    <h3 class="feature-title">AI-Powered Skill Analysis</h3>
                    <p class="feature-description">Advanced algorithms analyze your skills, strengths, and potential to provide accurate career recommendations.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i data-lucide="target"></i>
                    </div>
                    <h3 class="feature-title">Personalized Career Suggestions</h3>
                    <p class="feature-description">Get tailored career paths based on your unique profile, interests, and market demand.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i data-lucide="search"></i>
                    </div>
                    <h3 class="feature-title">Smart Job Matching</h3>
                    <p class="feature-description">Real-time web scraping technology finds the perfect job opportunities that match your skills.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i data-lucide="trending-up"></i>
                    </div>
                    <h3 class="feature-title">Market Trend Insights</h3>
                    <p class="feature-description">Stay updated with latest industry trends, salary insights, and in-demand skills analysis.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i data-lucide="file-text"></i>
                    </div>
                    <h3 class="feature-title">Resume Builder & Guidance</h3>
                    <p class="feature-description">Create ATS-friendly resumes with AI-powered suggestions and industry-specific templates.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i data-lucide="bar-chart-3"></i>
                    </div>
                    <h3 class="feature-title">Skill Gap Analysis</h3>
                    <p class="feature-description">Identify skill gaps and get personalized learning recommendations to advance your career.</p>
                </div>

                
                <div class="feature-card">
                    <div class="feature-icon">
                        <i data-lucide="zap"></i>
                    </div>
                    <h3 class="feature-title">Quick Apply System</h3>
                    <p class="feature-description">Apply to multiple jobs with one click using your saved profile and custom resumes.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i data-lucide="shield"></i>
                    </div>
                    <h3 class="feature-title">Privacy Protected</h3>
                    <p class="feature-description">Your data is encrypted and secure. We never share your information without permission.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i data-lucide="clock"></i>
                    </div>
                    <h3 class="feature-title">24/7 Career Support</h3>
                    <p class="feature-description">Get instant answers to your career questions with our AI chatbot available round the clock.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works" id="about">
        <div class="animated-bg">
            <div class="blob blob-3"></div>
            <div class="blob blob-4"></div>
        </div>
        <div class="container">
            <h2 class="section-title white-text">How It Works</h2>
            <p class="section-description white-text">Four simple steps to help you discover your career and prepare for the job market.</p>

            <div class="steps-grid">
                <div class="step-card">
                    <div class="step-number">01</div>
                    <div class="step-icon">
                        <i data-lucide="target"></i>
                    </div>
                    <h3 class="step-title">Discover Your Career</h3>
                    <p class="step-description">Complete the career assessment based on your interests, skills, strengths, education, and preferences to discover suitable career options.</p>
                </div>

                <div class="step-card">
                    <div class="step-number">02</div>
                    <div class="step-icon">
                        <i data-lucide="map"></i>
                    </div>
                    <h3 class="step-title">Plan Your Career Path</h3>
                    <p class="step-description">Compare career options and explore personalized roadmaps for the education, skills, certifications, and experience you may need.</p>
                </div>

                <div class="step-card">
                    <div class="step-number">03</div>
                    <div class="step-icon">
                        <i data-lucide="file-text"></i>
                    </div>
                    <h3 class="step-title">Build Your Job Profile</h3>
                    <p class="step-description">Create and improve your resume, analyze your skills, identify skill gaps, and get suggestions to strengthen your LinkedIn and GitHub profiles.</p>
                </div>

                <div class="step-card">
                    <div class="step-number">04</div>
                    <div class="step-icon">
                        <i data-lucide="briefcase"></i>
                    </div>
                    <h3 class="step-title">Find Suitable Jobs</h3>
                    <p class="step-description">Get job recommendations based on your profile and skills, with available application links to explore relevant opportunities.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Live Demo Section -->
 

    <!-- FAQ Section -->
    <section class="faq">
        <div class="container">
            <h2 class="section-title">Frequently Asked <span class="gradient-text">Questions</span></h2>
            <p class="section-description">Everything you need to know about our career guidance platform</p>

            <div class="faq-list">
                <div class="faq-item">
                    <button type="button" class="faq-question" aria-expanded="false">
                        <span>How can this platform help me choose the right career?</span>
                        <i data-lucide="plus" class="faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        Our Career Assessment analyzes your interests, skills, strengths, qualifications, and preferences to suggest career options that may suit your profile.
                    </div>
                </div>

                <div class="faq-item">
                    <button type="button" class="faq-question" aria-expanded="false">
                        <span>I know my interests, but which careers match them?</span>
                        <i data-lucide="plus" class="faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        Simply complete the career assessment. Based on your interests, abilities, and preferred work style, the system will recommend suitable career paths.
                    </div>
                </div>

                <div class="faq-item">
                    <button type="button" class="faq-question" aria-expanded="false">
                        <span>Can I compare different career options?</span>
                        <i data-lucide="plus" class="faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        Yes. You can compare careers based on factors such as interest match, required skills, education, career opportunities, and growth potential.
                    </div>
                </div>

                <div class="faq-item">
                    <button type="button" class="faq-question" aria-expanded="false">
                        <span>Can I get a roadmap for my desired career?</span>
                        <i data-lucide="plus" class="faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        Yes. The platform can provide a personalized roadmap showing the education, skills, certifications, and experience you may need to pursue your chosen career.
                    </div>
                </div>

                <div class="faq-item">
                    <button type="button" class="faq-question" aria-expanded="false">
                        <span>What if my marks or qualifications are not very high?</span>
                        <i data-lucide="plus" class="faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        Marks are only one part of your profile. The system also considers your interests, skills, preferences, and qualifications to suggest suitable career options.
                    </div>
                </div>

                <h3 class="faq-group-title">Jobs &amp; Career Preparation</h3>

                <div class="faq-item">
                    <button type="button" class="faq-question" aria-expanded="false">
                        <span>Can I create and improve my resume on the platform?</span>
                        <i data-lucide="plus" class="faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        Yes. You can build a professional resume and analyze your existing resume. The system can identify areas for improvement and suggest ways to make your resume stronger.
                    </div>
                </div>

                <div class="faq-item">
                    <button type="button" class="faq-question" aria-expanded="false">
                        <span>Can I create a resume specifically for a company or job?</span>
                        <i data-lucide="plus" class="faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        Yes. You can provide a target company or job description, and the system can help tailor your resume according to the relevant requirements, skills, and role.
                    </div>
                </div>

                <div class="faq-item">
                    <button type="button" class="faq-question" aria-expanded="false">
                        <span>Can the platform analyze my LinkedIn and GitHub profiles?</span>
                        <i data-lucide="plus" class="faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        Yes. You can provide your LinkedIn and GitHub profile links for analysis. The platform can identify areas that could be improved and provide suggestions to strengthen your professional profile.
                    </div>
                </div>

                <div class="faq-item">
                    <button type="button" class="faq-question" aria-expanded="false">
                        <span>How can I know which skills I need for my desired job?</span>
                        <i data-lucide="plus" class="faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        The system can compare your resume, skills, and profile with the requirements of a target job and identify skill gaps, helping you understand what you should improve.
                    </div>
                </div>

                <div class="faq-item">
                    <button type="button" class="faq-question" aria-expanded="false">
                        <span>Can I find suitable jobs and get their application links?</span>
                        <i data-lucide="plus" class="faq-icon"></i>
                    </button>
                    <div class="faq-answer">
                        Yes. The Job Recommendation System can match your profile with relevant job opportunities and provide available job links so you can explore and apply for suitable positions.
                    </div>
                </div>
            </div>
        </div>
    </section>

  

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="logo">
                        <img class="footer-logo-img" src="images/nexthorizon-logo.png" alt="NextHorizon">
                    </div>
                    <p class="footer-description">
                        Empowering students and professionals with AI-driven career guidance and real-time job recommendations.
                    </p>
                    <div class="footer-contact">
                        <div class="contact-item">
                            <i data-lucide="mail"></i>
                            <span>contact@careerguide.com</span>
                        </div>
                        <div class="contact-item">
                            <i data-lucide="phone"></i>
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div class="contact-item">
                            <i data-lucide="map-pin"></i>
                            <span>San Francisco, CA 94102</span>
                        </div>
                    </div>
                </div>

                <div class="footer-links">
                    <h4>Product</h4>
                    <a href="#">Features</a>
                    <a href="#">How it Works</a>
                    <a href="#">Pricing</a>
                    <a href="#">Success Stories</a>
                </div>

                <div class="footer-links">
                    <h4>Company</h4>
                    <a href="#">About Us</a>
                    <a href="#">Careers</a>
                    <a href="#">Blog</a>
                    <a href="#">Partners</a>
                </div>

                <div class="footer-links">
                    <h4>Resources</h4>
                    <a href="#">Help Center</a>
                    <a href="#">Documentation</a>
                    <a href="#">Community</a>
                    <a href="#">Status</a>
                </div>

                <div class="footer-links">
                    <h4>Legal</h4>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Cookie Policy</a>
                    <a href="#">GDPR</a>
                </div>
            </div>

            <div class="footer-bottom">
                <p class="copyright">© 2026 CareerGuide. All rights reserved. Built with ❤️ for your success.</p>
                <div class="social-links">
                    <a href="#" class="social-link"><i data-lucide="linkedin"></i></a>
                    <a href="#" class="social-link"><i data-lucide="twitter"></i></a>
                    <a href="#" class="social-link"><i data-lucide="github"></i></a>
                    <a href="#" class="social-link"><i data-lucide="instagram"></i></a>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scroll to Top Button -->
    <button class="scroll-top hidden" id="scrollTop">
        <i data-lucide="arrow-up"></i>
    </button>

</body>
</html>