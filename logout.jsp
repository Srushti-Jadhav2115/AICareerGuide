<%
response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
response.setHeader("Pragma", "no-cache");
session.invalidate();
%><!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Logging out…</title>
<meta http-equiv="refresh" content="1;url=index.jsp">
<script>
  // Remove any assessment answers saved in this browser so the next person to log in starts clean.
  try { localStorage.removeItem("careerAssessmentData"); } catch (e) {}
  window.location.replace("index.jsp");
</script>
</head>
<body></body>
</html>
