/**
 * QUESTION BANK — PAGE 2 (dynamic, path-dependent)
 * ---------------------------------------------------------------
 * This file intentionally contains ONLY data — no DOM logic.
 * When the Java/Tomcat backend is ready, this object can be
 * replaced by a fetch('/api/questions?path=...') call that returns
 * the same shape, without touching page2.js.
 *
 * Each question: { id, text, type: 'single' | 'multi' | 'rating', maxSelect, options[] }
 * A 'single' question with exactly two options doubles as a "forced choice"
 * question — no separate type is needed since the renderer is identical.
 * 'rating' questions show a 1–5 scale; the two end-labels shown under the
 * scale come from the question's own `ratingLabels: [low, high]` when
 * present, otherwise from the global window.RATING_LABELS.
 *
 * Content source: "Career Assessment — Full Question Bank (Revised)".
 * After 12th Science is intentionally split into three separate sets
 * (PCM / PCB / PCMB) rather than one shared set, since the three groups
 * point toward very different careers — see resolveQuestionSet() in
 * page2.js, which picks the right one from profile.group.
 *
 * "diploma.branchDiscovery" is the set shown when a student after 10th has
 * chosen Diploma but selects "I'm confused" (branch not decided). It
 * deliberately never asks "which branch do you like" — it measures
 * interests, comfort levels and priorities instead, so the recommendation
 * step can infer suitable branches even for a student who doesn't know
 * the branch names yet.
 */

window.QUESTION_BANK = {

  after10th: {
    title: "Discover Your Best-Fit Stream",
    questions: [
      { id: "a10_q1", type: "multi", maxSelect: 3,
        text: "Which subjects do you enjoy the most?",
        options: ["Mathematics", "Science", "Computer", "English", "Social Science", "Languages", "Arts"] },
      { id: "a10_q2", type: "single",
        text: "Which type of activity do you enjoy the most?",
        options: ["Solving problems", "Performing experiments", "Using computers", "Drawing or designing", "Speaking or teaching", "Helping people", "Building things", "Managing activities"] },
      { id: "a10_q3", type: "single",
        text: "Which type of problem would you enjoy solving?",
        options: ["Mathematical or logical problems", "Scientific or technical problems", "Business or money-related problems", "Social or people-related problems", "Creative or design problems"] },
      { id: "a10_q4", type: "single",
        text: "Which project would you most like to do?",
        options: ["Build a scientific model", "Develop a computer application", "Create a business plan", "Conduct a social survey", "Create an art or design project"] },
      { id: "a10_q5", type: "single",
        text: "Which activity sounds most interesting to you?",
        options: ["Understanding how machines and technology work", "Managing money or resources", "Understanding people's behaviour", "Creating designs or artwork", "Researching and discovering new things"] },
      { id: "a10_q6", type: "single",
        text: "Which type of work would you enjoy most?",
        options: ["Working with numbers and logic", "Working with science and technology", "Working with people and society", "Working with creativity and ideas", "Managing people or activities"] },
      { id: "a10_q7", type: "single",
        text: "Which competition would you prefer?",
        options: ["Mathematics or Science competition", "Coding or Technology competition", "Business or Entrepreneurship competition", "Debate or Public Speaking", "Art or Design competition"] },
      { id: "a10_q8", type: "single",
        text: "Which skill would you most like to develop?",
        options: ["Mathematical and logical thinking", "Scientific and technical skills", "Computer and technology skills", "Business and financial skills", "Communication and social skills", "Creative and artistic skills"] },
      { id: "a10_q9", type: "single",
        text: "Which achievement would make you most proud?",
        options: ["Inventing or building something", "Solving a difficult problem", "Starting a successful business", "Helping or influencing people", "Creating something unique"] },
      { id: "a10_q10", type: "single",
        text: "Which statement describes you best?",
        options: ["I enjoy understanding how things work.", "I enjoy solving difficult problems.", "I enjoy managing money and resources.", "I enjoy understanding people and society.", "I enjoy expressing myself creatively."] },
      { id: "a10_q11", type: "single",
        text: "How do you prefer to learn?",
        options: ["Hands-on / practical work", "Reading and theory", "Watching and discussing with others", "A mix of both"] },
      { id: "a10_q12", type: "single",
        text: "Would the cost or location of your future course matter to you?",
        options: ["Yes, affordable/local options matter most", "Somewhat, but quality matters more", "Not a major constraint", "Not sure yet"] }
    ]
  },

  /* After 12th Science — split by PCM / PCB / PCMB rather than one shared
     set, since the three groups point toward very different careers. */
  science: {

    pcm: {
      title: "Explore Your Career Direction",
      questions: [
        { id: "pcm_q1", type: "multi", maxSelect: 3,
          text: "Which areas interest you the most?",
          options: ["Programming and Technology", "Engineering", "Mathematics and Data", "Research", "Electronics", "Robotics", "Architecture", "Design"] },
        { id: "pcm_q2", type: "single",
          text: "Which project would you enjoy the most?",
          options: ["Developing software", "Building a machine or robot", "Designing an electronic circuit", "Analyzing data", "Building an architectural model", "A physics/maths research project"] },
        { id: "pcm_q3", type: "single",
          text: "Which type of problem do you enjoy solving?",
          options: ["Mathematical problems", "Programming problems", "Engineering problems", "Physics-based problems", "Data and analytical problems"] },
        { id: "pcm_q4", type: "single",
          text: "Which activity would you enjoy the most?",
          options: ["Coding", "Designing", "Building things", "Analyzing data", "Solving equations"] },
        { id: "pcm_q5", type: "single",
          text: "Which area would you like to explore further?",
          options: ["Computer Science", "AI / Data Science", "Mechanical / Civil / Electrical Engineering", "Architecture", "Pure Mathematics or Physics", "Defence / Aviation"] },
        { id: "pcm_q6", type: "single",
          text: "Which type of work environment interests you most?",
          options: ["Technology company", "Engineering organization", "Research laboratory", "Manufacturing or industrial environment", "University or academic environment"] },
        { id: "pcm_q7", type: "single",
          text: "Which type of work would you prefer?",
          options: ["Creating technology", "Designing and building systems", "Conducting scientific research", "Analyzing information and data", "Teaching or academic work"] },
        { id: "pcm_q8", type: "single",
          text: "Which activity sounds most interesting?",
          options: ["Developing an application", "Designing a machine", "Conducting a physics experiment", "Analyzing data", "Studying scientific problems"] },
        { id: "pcm_q9", type: "single",
          text: "What would you prefer after graduation?",
          options: ["Get a job", "Pursue higher studies (M.Tech/MS)", "Enter research", "Start a business/startup", "Prepare for competitive exams (JEE Advanced-level/GATE)", "I am not sure"] },
        { id: "pcm_q10", type: "single",
          text: "Which skill would you most like to develop?",
          options: ["Programming and software development", "Engineering and technology", "Research and experimentation", "Mathematics and data analysis", "Electronics and hardware", "Design/architecture"] }
      ]
    },

    pcb: {
      title: "Explore Your Career Direction",
      questions: [
        { id: "pcb_q1", type: "multi", maxSelect: 3,
          text: "Which areas interest you the most?",
          options: ["Medicine", "Biology and Life Sciences", "Healthcare", "Biotechnology", "Research", "Nursing/Paramedical", "Nutrition", "Pharmacy"] },
        { id: "pcb_q2", type: "single",
          text: "Which project would you enjoy the most?",
          options: ["Work on a healthcare project", "Conduct a biology/life-science research project", "Study a medical case", "Work on a biotechnology project", "Study nutrition/diet planning"] },
        { id: "pcb_q3", type: "single",
          text: "Which type of problem do you enjoy solving?",
          options: ["Biological or medical problems", "Scientific/research problems", "Health and wellness related problems", "Data problems (lab research)"] },
        { id: "pcb_q4", type: "single",
          text: "Which activity would you enjoy the most?",
          options: ["Experimenting", "Researching", "Working with patients", "Studying biological systems", "Analyzing lab data"] },
        { id: "pcb_q5", type: "single",
          text: "Which area would you like to explore further?",
          options: ["Medicine (MBBS/BDS)", "Nursing", "Biotechnology", "Pharmacy", "Life Sciences research", "Physiotherapy/Allied health", "Veterinary Science"] },
        { id: "pcb_q6", type: "single",
          text: "Which type of work environment interests you most?",
          options: ["Hospital or clinic", "Research laboratory", "Pharmaceutical company", "University or academic environment", "Public health organization"] },
        { id: "pcb_q7", type: "single",
          text: "Which type of work would you prefer?",
          options: ["Helping people through healthcare", "Conducting scientific/biological research", "Working directly with patients", "Analyzing lab/medical data", "Teaching or academic work"] },
        { id: "pcb_q8", type: "single",
          text: "Which activity sounds most interesting?",
          options: ["Conducting a laboratory experiment", "Working with patients", "Studying biological systems", "Analyzing medical data", "Developing a healthcare solution"] },
        { id: "pcb_q9", type: "single",
          text: "What would you prefer after graduation?",
          options: ["Get a job", "Pursue higher studies", "Enter research", "Prepare for competitive exams (NEET-PG/other)", "Start own clinic/practice later", "I am not sure"] },
        { id: "pcb_q10", type: "single",
          text: "Which skill would you most like to develop?",
          options: ["Medical/clinical skills", "Biological/research skills", "Patient care and communication", "Data analysis (lab/clinical)", "Pharmaceutical knowledge"] }
      ]
    },

    pcmb: {
      title: "Explore Your Career Direction",
      questions: [
        { id: "pcmb_q1", type: "multi", maxSelect: 3,
          text: "Which areas interest you the most?",
          options: ["Engineering and Technology", "Medicine and Healthcare", "Biology/Life Sciences", "Mathematics and Data", "Research", "Biotechnology"] },
        { id: "pcmb_q2", type: "single",
          text: "If you had to pick one direction right now, which pulls you more?",
          options: ["Engineering/Technology path", "Medical/Healthcare path", "Still genuinely undecided"] },
        { id: "pcmb_q3", type: "single",
          text: "Which project would you enjoy the most?",
          options: ["Build a computer/engineering project", "Work on a healthcare/medical project", "Conduct a biology research project", "Analyze mathematical/data problems"] },
        { id: "pcmb_q4", type: "single",
          text: "Which type of problem do you enjoy solving?",
          options: ["Mathematical/engineering problems", "Biological/medical problems", "Both equally", "Data/analytical problems"] },
        { id: "pcmb_q5", type: "single",
          text: "Which activity would you enjoy the most?",
          options: ["Coding/building", "Working with patients/lab work", "Researching", "Analyzing data"] },
        { id: "pcmb_q6", type: "single",
          text: "Which type of work environment interests you most?",
          options: ["Technology/engineering company", "Hospital or healthcare", "Research laboratory", "University or academic environment"] },
        { id: "pcmb_q7", type: "single",
          text: "Which type of work would you prefer?",
          options: ["Creating technology", "Helping people through healthcare", "Conducting research", "Analyzing information and data"] },
        { id: "pcmb_q8", type: "single",
          text: "What would you prefer after graduation?",
          options: ["Get a job", "Pursue higher studies", "Enter research", "Prepare for competitive exams (JEE/NEET-level)", "I am not sure"] },
        { id: "pcmb_q9", type: "single",
          text: "Which skill would you most like to develop?",
          options: ["Programming/engineering", "Medical/clinical", "Research/lab skills", "Data analysis"] },
        { id: "pcmb_q10", type: "single",
          text: "How comfortable are you keeping both engineering and medical options open a bit longer?",
          options: ["Very comfortable", "I need to decide soon", "I've basically already decided"] }
      ]
    }
  },

  commerce: {
    title: "Explore Your Career Direction",
    questions: [
      { id: "com_q1", type: "multi", maxSelect: 3,
        text: "Which areas interest you the most?",
        options: ["Accounting", "Finance", "Economics", "Business", "Marketing", "Management", "Entrepreneurship", "Banking"] },
      { id: "com_q2", type: "single",
        text: "Which activity would you enjoy the most?",
        options: ["Managing money", "Analyzing financial information", "Starting a business", "Marketing a product", "Managing a team", "Studying the economy", "Working with customers"] },
      { id: "com_q3", type: "single",
        text: "Which project would you prefer?",
        options: ["Prepare a financial plan", "Create a business plan", "Develop a marketing campaign", "Analyze a company's performance", "Create an investment plan", "Start a small business idea"] },
      { id: "com_q4", type: "single",
        text: "Which type of problem would you enjoy solving?",
        options: ["Financial problems", "Business problems", "Marketing problems", "Economic problems", "Management problems"] },
      { id: "com_q5", type: "single",
        text: "Which type of work interests you most?",
        options: ["Working with numbers", "Managing businesses", "Working with customers", "Analyzing markets", "Managing organizations", "Making financial decisions"] },
      { id: "com_q6", type: "single",
        text: "Which area would you like to explore further?",
        options: ["Finance", "Accounting", "Business Management", "Marketing", "Economics", "Banking", "Entrepreneurship"] },
      { id: "com_q7", type: "single",
        text: "Which environment would you prefer?",
        options: ["Corporate company", "Bank or financial institution", "Business organization", "Startup", "Family business", "Government organization"] },
      { id: "com_q8", type: "single",
        text: "Which activity sounds most interesting?",
        options: ["Preparing financial reports", "Managing a business", "Promoting a product", "Studying market trends", "Managing employees", "Planning investments"] },
      { id: "com_q9", type: "single",
        text: "What would you prefer after graduation?",
        options: ["Get a job", "Pursue higher studies", "Complete a professional course", "Start a business", "Prepare for competitive examinations", "I am not sure"] },
      { id: "com_q10", type: "single",
        text: "Which skill would you most like to develop?",
        options: ["Financial analysis", "Accounting", "Business management", "Marketing", "Leadership", "Entrepreneurship"] },
      { id: "com_q11", type: "single",
        text: "Are you interested in a professional certification (CA / CS / CMA / CFA)?",
        options: ["Yes, very interested", "Maybe, still exploring", "No, prefer a regular degree", "Not sure"] },
      { id: "com_q12", type: "single",
        text: "How comfortable are you with financial risk (e.g. starting a business, markets)?",
        options: ["Very comfortable", "Somewhat comfortable", "Prefer stability/security", "Not sure"] }
    ]
  },

  arts: {
    title: "Explore Your Career Direction",
    questions: [
      { id: "art_q1", type: "multi", maxSelect: 3,
        text: "Which areas interest you the most?",
        options: ["Psychology", "Law", "Journalism", "Literature", "History", "Political Science", "Design", "Social Work", "Sociology"] },
      { id: "art_q2", type: "single",
        text: "Which activity do you enjoy the most?",
        options: ["Writing", "Public speaking", "Understanding people", "Researching society", "Creating designs", "Debating", "Teaching", "Reading"] },
      { id: "art_q3", type: "single",
        text: "Which project would you prefer?",
        options: ["Conduct a psychological study", "Conduct a social survey", "Write an article", "Create a design project", "Research a historical topic", "Conduct a debate", "Study a social issue"] },
      { id: "art_q4", type: "single",
        text: "Which type of problem interests you most?",
        options: ["Understanding human behaviour", "Social problems", "Legal problems", "Communication problems", "Creative problems", "Political or public issues"] },
      { id: "art_q5", type: "single",
        text: "Which type of work interests you most?",
        options: ["Understanding people", "Writing and communication", "Law and justice", "Creative work", "Social development", "Research and analysis", "Teaching"] },
      { id: "art_q6", type: "single",
        text: "Which skill would you most like to use?",
        options: ["Communication", "Writing", "Creativity", "Research", "Critical thinking", "Understanding people", "Public speaking"] },
      { id: "art_q7", type: "single",
        text: "Which environment would you prefer?",
        options: ["Media organization", "Educational institution", "Court or legal environment", "Creative organization", "Research organization", "Social organization", "Office environment"] },
      { id: "art_q8", type: "single",
        text: "Which activity sounds most interesting?",
        options: ["Writing articles", "Helping people", "Conducting research", "Designing content", "Teaching", "Debating", "Understanding people's behaviour"] },
      { id: "art_q9", type: "single",
        text: "What would you prefer after graduation?",
        options: ["Get a job", "Pursue higher studies", "Complete a professional course", "Prepare for competitive examinations", "Start a creative career", "I am not sure"] },
      { id: "art_q10", type: "single",
        text: "Which area would you most like to explore?",
        options: ["Psychology", "Law", "Journalism and Media", "Design", "Social Sciences", "Education", "Public Administration"] },
      { id: "art_q11", type: "single",
        text: "Are you interested in preparing for competitive government exams (UPSC/State PSC)?",
        options: ["Yes, strongly interested", "Maybe later", "Not interested", "Not sure"] },
      { id: "art_q12", type: "single",
        text: "Do you prefer creative/expressive work or analytical/research work?",
        options: ["Creative/expressive", "Analytical/research", "A mix of both", "Not sure"] }
    ]
  },

  diploma: {

    computer: {
      title: "Explore Your Career Direction",
      questions: [
        { id: "dcs_q1", type: "multi", maxSelect: 3,
          text: "Which areas interest you the most?",
          options: ["Programming", "Web Development", "App Development", "Artificial Intelligence", "Cybersecurity", "Networking", "Database Management", "Software Development"] },
        { id: "dcs_q2", type: "single",
          text: "Which project would you prefer?",
          options: ["Develop a website", "Develop a mobile application", "Build an AI system", "Create a cybersecurity system", "Build a computer network", "Develop a database application"] },
        { id: "dcs_q3", type: "single",
          text: "Which type of work interests you most?",
          options: ["Writing code", "Designing applications", "Analyzing data", "Protecting computer systems", "Managing networks", "Developing AI systems"] },
        { id: "dcs_q4", type: "single",
          text: "Which type of problem would you enjoy solving?",
          options: ["Programming problems", "Security problems", "Network problems", "Data problems", "Software design problems"] },
        { id: "dcs_q5", type: "single",
          text: "Which technology would you like to learn?",
          options: ["Python", "Java", "Artificial Intelligence", "Cybersecurity", "Cloud Computing", "Web Development"] },
        { id: "dcs_q6", type: "single",
          text: "Which type of project do you enjoy most?",
          options: ["Software project", "Hardware-software project", "Networking project", "AI project", "Security project"] },
        { id: "dcs_q7", type: "single",
          text: "What would you prefer after Diploma?",
          options: ["Get a job", "Pursue Degree Engineering", "Pursue higher studies", "Complete a technical certification", "Start a business", "I am not sure"] },
        { id: "dcs_q8", type: "single",
          text: "Which higher-education path appeals to you after Diploma?",
          options: ["Lateral entry to B.E./B.Tech", "Direct job placement", "Government exams (SSC JE, etc.)", "Entrepreneurship/own startup", "Higher studies abroad"] },
        { id: "dcs_q9", type: "single",
          text: "Which of these tools/platforms are you most curious about?",
          options: ["Cloud platforms (AWS/Azure)", "Mobile app frameworks", "Data Science/AI tools", "Cybersecurity tools", "Game development tools"] },
        { id: "dcs_q10", type: "single",
          text: "How do you prefer to work?",
          options: ["Independently on code", "In a team building a product", "Supporting/maintaining systems", "Research and experimentation"] }
      ]
    },

    mechanical: {
      title: "Explore Your Career Direction",
      questions: [
        { id: "dme_q1", type: "single",
          text: "Which areas interest you the most?",
          options: ["Automobile", "CAD Design", "Manufacturing", "Robotics", "Production", "Maintenance", "Machine Design"] },
        { id: "dme_q2", type: "single",
          text: "Which activity would you enjoy most?",
          options: ["Designing machines", "Working with automobiles", "Operating machines", "Designing using CAD", "Building mechanical systems", "Repairing machines"] },
        { id: "dme_q3", type: "single",
          text: "Which project would you prefer?",
          options: ["Design a mechanical component", "Build a working machine", "Design an automobile system", "Build a robotic system", "Improve a manufacturing process"] },
        { id: "dme_q4", type: "single",
          text: "Which type of work interests you most?",
          options: ["Machine design", "Manufacturing", "Automobile engineering", "Robotics", "Maintenance"] },
        { id: "dme_q5", type: "single",
          text: "Which technology would you like to learn?",
          options: ["CAD", "Robotics", "3D Printing", "Automation", "CNC", "Automobile Technology"] },
        { id: "dme_q6", type: "single",
          text: "What would you prefer after Diploma?",
          options: ["Get a job", "Pursue Degree Engineering", "Pursue higher studies", "Complete a technical certification", "Start a business", "I am not sure"] },
        { id: "dme_q7", type: "single",
          text: "Which industry sector interests you most?",
          options: ["Automotive", "Aerospace", "Manufacturing/Production", "Energy/Power plants", "Consumer goods"] },
        { id: "dme_q8", type: "single",
          text: "Which higher-education path appeals to you after Diploma?",
          options: ["Lateral entry to B.E./B.Tech (Mechanical)", "Direct job placement", "Government exams (SSC JE/Railways)", "Entrepreneurship", "Higher studies abroad"] },
        { id: "dme_q9", type: "single",
          text: "Which tools/technology are you most curious about?",
          options: ["Industrial automation & robotics", "3D printing", "CNC machining", "EV/battery technology", "CAD/CAM software"] }
      ]
    },

    civil: {
      title: "Explore Your Career Direction",
      questions: [
        { id: "dcv_q1", type: "single",
          text: "Which areas interest you the most?",
          options: ["Construction", "Structural Design", "Surveying", "Architecture", "Infrastructure", "Project Management", "Environmental Engineering"] },
        { id: "dcv_q2", type: "single",
          text: "Which activity would you enjoy most?",
          options: ["Designing buildings", "Planning construction", "Surveying land", "Designing structures", "Managing construction projects", "Working on infrastructure"] },
        { id: "dcv_q3", type: "single",
          text: "Which project would you prefer?",
          options: ["Design a building", "Plan a construction project", "Conduct a land survey", "Design a bridge", "Develop an infrastructure plan"] },
        { id: "dcv_q4", type: "single",
          text: "Which type of work interests you most?",
          options: ["Building construction", "Structural design", "Surveying", "Infrastructure", "Project management"] },
        { id: "dcv_q5", type: "single",
          text: "Which skill would you like to develop?",
          options: ["AutoCAD", "Structural Design", "Surveying", "Project Management", "Construction Technology"] },
        { id: "dcv_q6", type: "single",
          text: "What would you prefer after Diploma?",
          options: ["Get a job", "Pursue Degree Engineering", "Pursue higher studies", "Complete a technical certification", "Start a business", "I am not sure"] },
        { id: "dcv_q7", type: "single",
          text: "Which industry sector interests you most?",
          options: ["Residential/commercial construction", "Government infrastructure projects", "Real estate development", "Environmental/water projects", "Urban planning"] },
        { id: "dcv_q8", type: "single",
          text: "Which higher-education path appeals to you after Diploma?",
          options: ["Lateral entry to B.E./B.Tech (Civil)", "Direct job placement", "Government exams (SSC JE)", "Entrepreneurship/contracting business", "Higher studies abroad"] },
        { id: "dcv_q9", type: "single",
          text: "Which tools/technology are you most curious about?",
          options: ["AutoCAD/Revit", "GIS & surveying tech", "Green/sustainable building", "Project management software", "Structural analysis software"] }
      ]
    },

    /* Shared by both "Electronics" and "Electrical" branches, per the source question bank. */
    electronics: {
      title: "Explore Your Career Direction",
      questions: [
        { id: "dee_q1", type: "single",
          text: "Which areas interest you the most?",
          options: ["Electronics", "Electrical Systems", "Embedded Systems", "Robotics", "Automation", "IoT", "Power Systems"] },
        { id: "dee_q2", type: "single",
          text: "Which activity would you enjoy most?",
          options: ["Building circuits", "Programming microcontrollers", "Working with electrical systems", "Building robots", "Working with sensors", "Designing electronic systems"] },
        { id: "dee_q3", type: "single",
          text: "Which project would you prefer?",
          options: ["Build an IoT system", "Design an electronic circuit", "Build a robotic system", "Develop an embedded system", "Create an automation system"] },
        { id: "dee_q4", type: "single",
          text: "Which type of work interests you most?",
          options: ["Electronics design", "Embedded programming", "Electrical systems", "Automation", "Robotics"] },
        { id: "dee_q5", type: "single",
          text: "Which technology would you like to learn?",
          options: ["Arduino", "Embedded Systems", "IoT", "Robotics", "PLC", "Automation"] },
        { id: "dee_q6", type: "single",
          text: "What would you prefer after Diploma?",
          options: ["Get a job", "Pursue Degree Engineering", "Pursue higher studies", "Complete a technical certification", "Start a business", "I am not sure"] },
        { id: "dee_q7", type: "single",
          text: "Which industry sector interests you most?",
          options: ["Consumer electronics", "Power/utility companies", "Telecommunications", "Industrial automation", "IoT/smart devices"] },
        { id: "dee_q8", type: "single",
          text: "Which higher-education path appeals to you after Diploma?",
          options: ["Lateral entry to B.E./B.Tech", "Direct job placement", "Government exams (SSC JE)", "Entrepreneurship", "Higher studies abroad"] },
        { id: "dee_q9", type: "single",
          text: "Which tools/technology are you most curious about?",
          options: ["PLC & automation systems", "Embedded programming", "IoT platforms", "Renewable energy systems", "Circuit design software"] }
      ]
    },

    /* 10th -> Diploma -> "I'm confused" (branch not decided).
       Deliberately never asks "which branch do you like" — a confused
       student may not know. Instead this measures interests, abilities,
       preferred activities, work style, and subject comfort, and lets the
       recommendation step infer suitable branches from that profile.
       Q7's "electricity/circuits/electronics" rating is intentionally one
       combined question at the UI level — internally it should be treated
       as covering two related-but-distinct signals (Electrical interest
       and Electronics interest) when building the student feature profile,
       since they point at different branches. */
    branchDiscovery: {
      title: "Find Your Diploma Branch",
      intro: "You don't need to know your branch yet — answer honestly about your interests, comfort level, and priorities, and we'll suggest branches that fit.",
      questions: [
        { id: "bd_q1", type: "multi", maxSelect: 3,
          text: "Which school subjects do you enjoy the most?",
          options: ["Mathematics", "Science", "Computer / Information Technology", "English", "Drawing / Art", "Social Science", "I don't have a strong preference"] },
        { id: "bd_q2", type: "single",
          text: "Which activity sounds most interesting to you?",
          options: [
            "Creating a website, app, or computer program", "Building or repairing a machine",
            "Designing a building, bridge, or road", "Working with electrical equipment and power systems",
            "Building electronic devices or working with sensors", "Working with vehicles and automobiles",
            "I am not sure"
          ] },
        { id: "bd_q3", type: "single",
          text: "What kind of problems do you enjoy solving?",
          options: [
            "Logical problems where I have to find a step-by-step solution", "Problems involving machines, movement, or mechanisms",
            "Problems involving electricity and power", "Problems involving circuits, sensors, or electronic devices",
            "Problems involving measurements, structures, or construction", "Problems involving vehicles and their systems",
            "I don't know yet"
          ] },
        { id: "bd_q4", type: "single",
          text: "Which type of work would you enjoy doing?",
          options: [
            "Mostly working with computers and software", "Designing or working with machines",
            "Working at construction or infrastructure sites", "Working with electrical systems and equipment",
            "Designing/testing electronic devices", "Working with vehicles and automobile systems",
            "A combination of different types of work"
          ] },
        { id: "bd_q5", type: "rating", ratingLabels: ["Not interested", "Extremely interested"],
          text: "How interested are you in computers and programming?" },
        { id: "bd_q6", type: "rating", ratingLabels: ["Not interested", "Extremely interested"],
          text: "How interested are you in machines and mechanical systems?" },
        { id: "bd_q7", type: "rating", ratingLabels: ["Not interested", "Extremely interested"],
          text: "How interested are you in electricity, circuits and electronic devices?" },
        { id: "bd_q8", type: "rating", ratingLabels: ["Not interested", "Extremely interested"],
          text: "How interested are you in designing buildings, roads, bridges or other structures?" },
        { id: "bd_q9", type: "single",
          text: "How comfortable are you with Mathematics?",
          options: ["I really enjoy Mathematics", "I am comfortable with Mathematics", "I can manage it", "I find it difficult", "I strongly dislike it"] },
        { id: "bd_q10", type: "single",
          text: "How comfortable are you with Science and Physics?",
          options: ["I really enjoy them", "I am comfortable with them", "I can manage them", "I find them difficult", "I strongly dislike them"] },
        { id: "bd_q11", type: "single",
          text: "Which working environment sounds most suitable for you?",
          options: [
            "Computer lab / office", "Workshop / manufacturing environment", "Construction / outdoor site",
            "Electrical / industrial environment", "Electronics / laboratory environment",
            "Automobile workshop / service environment", "I am comfortable with any environment"
          ] },
        { id: "bd_q12", type: "multi", maxSelect: 2,
          text: "What is most important to you when choosing your Diploma branch?",
          options: [
            "I want a branch that matches my interests", "I want good career opportunities",
            "I want good salary potential", "I want opportunities for higher studies",
            "I want practical/hands-on work", "I want a branch with many different career options",
            "I want opportunities in government/public-sector jobs", "I am still unsure"
          ] }
      ]
    },

    /* "Other" diploma branch — full, branch-agnostic set for fields not
       covered by a dedicated quiz (Chemical, Automobile, Instrumentation,
       Textile, IT, Mining, Bio-medical, etc.). Question 1 records which
       field the student is actually in, for backend reporting; the rest of
       the set stays generic on purpose so it works across all of them. */
    other: {
      title: "Explore Your Career Direction",
      questions: [
        { id: "doth_q1", type: "single",
          text: "Which of these best describes your diploma field?",
          options: ["Chemical Engineering", "Automobile Engineering", "Instrumentation Engineering", "Textile Engineering", "Information Technology", "Mining Engineering", "Bio-medical Engineering", "Other"] },
        { id: "doth_q2", type: "multi", maxSelect: 3,
          text: "Which areas interest you the most?",
          options: ["Technical/hands-on work", "Design and planning", "Research and analysis", "Management and operations", "Client or field work", "Emerging technology"] },
        { id: "doth_q3", type: "single",
          text: "Which type of work interests you most?",
          options: ["Working with equipment or systems", "Designing or planning projects", "Managing a team or site", "Analyzing data or reports", "Working directly with clients"] },
        { id: "doth_q4", type: "single",
          text: "Which type of project would you enjoy most?",
          options: ["Hands-on technical/lab project", "Design/planning project", "Field/site work project", "Data analysis project", "Client-facing project"] },
        { id: "doth_q5", type: "single",
          text: "Which work environment do you prefer?",
          options: ["Factory/industrial site", "Office/design studio", "Field/on-site work", "Research lab", "Client-facing/sales environment"] },
        { id: "doth_q6", type: "single",
          text: "Which skill would you most like to develop?",
          options: ["Technical/hands-on skills", "Design/planning skills", "Analytical/research skills", "Management skills", "Communication/client-handling skills"] },
        { id: "doth_q7", type: "single",
          text: "Which industry interests you most?",
          options: ["Manufacturing", "Government/PSU", "Private core-sector company", "Research organization", "Own business/entrepreneurship"] },
        { id: "doth_q8", type: "single",
          text: "Which higher-education path appeals to you after Diploma?",
          options: ["Lateral entry to B.E./B.Tech", "Direct job placement", "Government exams (SSC JE)", "Entrepreneurship", "Higher studies abroad"] },
        { id: "doth_q9", type: "single",
          text: "What would you prefer after Diploma?",
          options: ["Get a job", "Pursue Degree Engineering", "Pursue higher studies", "Complete a technical certification", "Start a business", "I am not sure"] }
      ]
    }
  }
};

/**
 * PAGE 3 — Common self-rating categories (same for every user).
 */
window.SKILL_RATING_BANK = [
  { id: "skill_communication", text: "Communication Skills" },
  { id: "skill_problem_solving", text: "Problem-Solving Skills" },
  { id: "skill_analytical", text: "Analytical Thinking" },
  { id: "skill_creativity", text: "Creativity" },
  { id: "skill_leadership", text: "Leadership Skills" },
  { id: "skill_teamwork", text: "Teamwork & Collaboration" },
  { id: "skill_time_mgmt", text: "Time Management" },
  { id: "skill_decision_making", text: "Decision-Making Skills" },
  { id: "skill_adaptability", text: "Adaptability" },
  { id: "skill_willingness_to_learn", text: "Willingness to Learn" },
  { id: "skill_self_confidence", text: "Self-Confidence" },
  { id: "skill_responsibility", text: "Responsibility and Accountability" }
];

window.RATING_LABELS = ["Very Low", "Low", "Average", "Good", "Excellent"];

/**
 * PAGE 4 — Common written-response questions.
 */
window.ESSAY_BANK = [
  { id: "essay_dream_career", maxLength: 500,
    text: "Describe your dream career or the type of work you would love to do.",
    explainer: "Think about the day-to-day work, not just the job title." },
  { id: "essay_strengths", maxLength: 500,
    text: "What are your biggest strengths?",
    explainer: "Skills, habits, or qualities you rely on most." },
  { id: "essay_weaknesses", maxLength: 500,
    text: "What challenges or weaknesses do you think you need to improve?",
    explainer: "Be honest — this helps us understand where to focus guidance." },
  { id: "essay_anything_else", maxLength: 500,
    text: "Is there anything else you would like the AI to know about you or your career goals?",
    explainer: "Optional context, ambitions, or constraints that don't fit above." }
];
