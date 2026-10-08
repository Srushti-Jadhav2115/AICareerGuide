<%@ page import="java.util.*" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Career Recommendations - CareerGuide</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css?v=2">

    <!-- Font -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(to right, #eef2f3, #ffffff);
        }

        .section-title {
            text-align: center;
            font-size: 30px;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .sub-text {
            text-align: center;
            color: #777;
            margin-bottom: 30px;
        }

        .career-card {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.08);
            transition: 0.3s;
            border-left: 5px solid #4CAF50;
        }

        .career-card:hover {
            transform: translateY(-5px);
        }

        .badge {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 13px;
            margin-bottom: 10px;
        }

        .career-title {
            font-size: 20px;
            font-weight: 600;
            color: #333;
        }

        .empty-box {
            background: #fff3f3;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }

        .empty-box p {
            color: #d32f2f;
            font-weight: 600;
        }
    </style>
<link rel="stylesheet" href="header.css?v=4">
<script src="header.js?v=4" defer></script>
</head>

<body>

    <!-- NAVBAR (unchanged) -->
    <nav class="cg-navbar">
        <div class="cg-nav-container">
            <a class="cg-logo" href="index.jsp">
                <img class="cg-logo-img" src="images/nexthorizon-logo.png" alt="NextHorizon">
            </a>
            <div class="cg-nav-links">
                <a href="index.jsp" class="cg-nav-link">Home</a>
                <a href="assessment/index.jsp" class="cg-nav-link">Career Assessment</a>
                <a href="resume.html" class="cg-nav-link">Resume</a>
                <a href="feedback.html" class="cg-nav-link">Feedback</a>
            </div>
        </div>
    </nav>

    <div style="margin-top:120px;"></div>

    <!-- SECTION -->
    <section class="features">
        <div class="container">
            
            <h2 class="section-title">Your Personalized Career Matches</h2>
            <p class="sub-text">Based on your interests and strengths</p>

            <div class="feature-card" style="max-width:700px; margin:auto; padding:40px;">

                <%
                    List<String> careers = (List<String>) request.getAttribute("topCareers");

                    if (careers != null && !careers.isEmpty()) {

                        int rank = 1;

                        for (String career : careers) {
                %>

                    <div class="career-card">
                        
                        <div class="badge">
                            Best Match <%= rank %>
                        </div>

                        <div class="career-title">
                            <%= career %>
                        </div>

                    </div>

                <%
                            rank++;
                        }

                    } else {
                %>

                    <div class="empty-box">
                        <p>No recommendations found. Please fill the form first.</p>
                    </div>

                <%
                    }
                %>

            </div>
        </div>
    </section>

    <footer style="text-align:center; padding:20px; margin-top:40px;">
        <p>&copy; 2026 Career Guidance Portal</p>
    </footer>

</body>
</html>