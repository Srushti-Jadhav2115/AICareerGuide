# NextHorizon – Career Guidance and Job Recommendation Platform

NextHorizon is a web-based career guidance and job recommendation platform designed to help students and job seekers make informed career decisions and prepare for employment opportunities.

The platform combines career assessment, AI-assisted recommendations, resume analysis, job readiness evaluation, learning resources, and job discovery in one application.

## Key Features

### 1. Career Assessment
- Adaptive assessment based on the user's educational background.
- Supports different academic pathways, including after 10th, 12th, and diploma.
- Evaluates interests, skills, strengths, and career preferences.
- Generates personalized career recommendations.

### 2. AI-Based Career Recommendations
- Recommends suitable career options based on assessment responses.
- Provides career match percentages.
- Explains education requirements and relevant skills.
- Suggests short-term, medium-term, and long-term career roadmaps.

### 3. Learning Resources
- Accepts career assessment reports for resource recommendations.
- Suggests relevant learning materials, including courses, books, videos, documentation, notes, and projects.
- Helps users identify learning opportunities for their chosen career paths.

### 4. Profile Analysis
- Supports resume and profile analysis.
- Evaluates resume content against a target job role.
- Provides an ATS-style score, strengths, skill gaps, and improvement suggestions.
- Supports LinkedIn profile text and public GitHub profile analysis.

### 5. Job Readiness Analysis
- Evaluates a user's preparation against a specific job description.
- Identifies matching skills and missing requirements.
- Provides a job readiness score and improvement roadmap.
- Suggests practice projects, learning resources, and interview questions.

### 6. Job Recommendations
- Extracts skills from resume content.
- Uses the Adzuna Job Search API to retrieve relevant job opportunities.
- Supports job searches based on location and career field.

### 7. User Account Management
- Phone-based registration and login.
- Session-based authentication and logout.
- Password hashing using PBKDF2.

### 8. Feedback
- Allows users to submit application feedback.
- Stores feedback in the MySQL database.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Java, JSP, Java Servlets |
| Server | Apache Tomcat 9 |
| Database | MySQL |
| Database Connectivity | JDBC |
| AI Integration | Google Gemini, OpenRouter |
| Job Search | Adzuna API |
| Profile Integration | GitHub REST API |
| Document Processing | PDF.js, Tesseract.js |
| Android | Android Studio, Java, WebView |

## Application Architecture

NextHorizon follows a web-based client-server architecture.

1. **Frontend:** HTML, CSS, and JavaScript provide the user interface and interactive features.
2. **Backend:** Java Servlets handle application requests and business logic.
3. **Database:** MySQL stores user accounts, assessment results, and feedback.
4. **AI Services:** External AI APIs support career recommendations and analysis features.
5. **External Integrations:** APIs provide job listings and public profile information.

## Database

The application uses a MySQL database named `careerdb`.

Main tables include:

- `users` – User account information.
- `assessments` – Career assessment information and results.
- `feedback` – User feedback.

## Project Structure

The repository contains the web application source code, Java backend, database scripts, configuration templates, supporting libraries, and Android WebView application.

## Getting Started

### Prerequisites

- JDK 21
- Apache Tomcat 9
- MySQL Server
- MySQL Connector/J
- Android Studio (for the Android application)

### Setup Instructions

1. Clone or download this repository.
2. Configure the MySQL database using the provided SQL scripts.
3. Configure the required API settings using the supplied sample configuration files.
4. Add MySQL Connector/J to the application's library folder.
5. Compile the Java source files into `WEB-INF/classes`.
6. Deploy the web application folder to Apache Tomcat.
7. Start MySQL and Tomcat.
8. Open the application in your browser:

   `http://localhost:8080/B46-77/index.jsp`

### Android Application

The repository also includes an Android WebView application.

The Android application connects to the existing Tomcat-hosted web application. The web server and database must be running and reachable by the Android device.

## Security Notes

- Passwords are stored using PBKDF2 hashing.
- Assessment processing removes personal details before sending responses to the AI service.
- API credentials and private configuration files should be kept out of public repositories.
- Use the provided sample configuration files to create your local configuration.

## Future Enhancements

- Improved skill matching and synonym detection.
- More advanced resume analysis.
- Persistent storage of analysis reports.
- Improved API error handling.
- Additional language support.
- More comprehensive career and job recommendation features.

## Contributors

- **Srushti Jadhav**
- **Snehal Shewale**

---

**NextHorizon – Helping learners explore careers, develop skills, and discover opportunities.**
