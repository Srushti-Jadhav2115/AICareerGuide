<!DOCTYPE html>
<html>
<head>
<title>Signup - CareerGuide</title>
<style>
        *{
            margin:0;
            padding:0;
            box-sizing:border-box;
            font-family:'Poppins', sans-serif;
        }

        body{
            height:100vh;
            display:flex;
            justify-content:center;
            align-items:center;
            background:url('pic8.png') no-repeat center center;
            background-size:cover;
            position:relative;
        }

        body::before{
            content:"";
            position:absolute;
            width:100%;
            height:100%;
            background:rgba(0,0,0,0.6);
        }

        .container{
            position:relative;
            background:rgba(255,255,255,0.1);
            padding:40px;
            width:380px;
            border-radius:20px;
            backdrop-filter:blur(15px);
            box-shadow:0 20px 40px rgba(0,0,0,0.4);
            color:white;
            animation:fadeIn 0.8s ease-in-out;
        }

        @keyframes fadeIn{
            from{opacity:0; transform:translateY(20px);}
            to{opacity:1; transform:translateY(0);}
        }

        .logo{
            text-align:center;
            font-size:28px;
            font-weight:600;
            margin-bottom:10px;
        }

        h2{
            text-align:center;
            margin-bottom:25px;
            font-weight:400;
        }

        .input-group{
            margin-bottom:20px;
        }

        input{
            width:100%;
            padding:12px 15px;
            border-radius:8px;
            border:none;
            outline:none;
            font-size:14px;
        }

        input:focus{
            box-shadow:0 0 10px #3b82f6;
        }

        button{
            width:100%;
            padding:12px;
            border:none;
            border-radius:8px;
            background:#3b82f6;
            color:white;
            font-size:16px;
            cursor:pointer;
            transition:0.3s;
            font-weight:600;
        }

        button:hover{
            background:#1d4ed8;
            transform:scale(1.05);
        }

        .bottom-text{
            text-align:center;
            margin-top:18px;
            font-size:14px;
        }

        .bottom-text a{
            color:#60a5fa;
            font-weight:600;
            text-decoration:none;
        }

        .bottom-text a:hover{
            text-decoration:underline;
        }

    
        .logo .brand-logo{
            height:60px;
            width:auto;
            background:#fff;
            padding:8px 18px;
            border-radius:14px;
            box-shadow:0 8px 24px rgba(0,0,0,0.25);
        }
    </style>
<script>
  // A new login always starts with a clean assessment form.
  try { localStorage.removeItem("careerAssessmentData"); } catch (e) {}
</script>
</head>

<body>

<div class="container">
    <div class="logo"><img class="brand-logo" src="images/nexthorizon-logo.png" alt="NextHorizon"></div>
    <h2>Create Account </h2>

    <form action="SignupServlet" method="post">

    <div class="input-group">
        <input type="text" name="phone" placeholder=" Phone Number" required>
    </div>

    <div class="input-group">
        <input type="password" name="password" placeholder=  Create Password" required>
    </div>

    <button type="submit">Sign Up</button>

</form>

<div class="bottom-text">
    Already have an account?  
    <a href="login.jsp">Login</a>
</div>
</div>

</body>
</html>