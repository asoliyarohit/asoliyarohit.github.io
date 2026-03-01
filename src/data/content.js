export const about = {
  name: 'Rohit Singh Asoliya',
  tagline: 'On a joyful autopilot with curiosity.',
  roles: ['Data Scientist', 'Python Developer', 'Curious Learner', 'Problem Solver'],
  bio: `Hi there! Pleasure to meet you. I'm Rohit — a curious mind from the royal land of Rajasthan,
  India. I navigate the world of data with enthusiasm and a learner's spirit.
  Whether it's wrangling datasets, building ETL pipelines, or diving deep into descriptive statistics,
  I find joy in making sense of numbers and patterns.`,
  bio2: `Currently on a 100-day learning challenge — pushing myself academically, physically, and financially.
  Every day is a new data point in the story of becoming better.`,
  location: 'Rajasthan, India',
  email: 'asoliyarohit@gmail.com',
  links: {
    github: 'https://github.com/asoliyarohit',
    linkedin: 'https://www.linkedin.com/in/asoliyarohit',
    twitter: 'https://twitter.com/asoliyarohit',
  },
  skills: [
    { name: 'Python', level: 70 },
    { name: 'Pandas / NumPy', level: 65 },
    { name: 'Data Analysis', level: 68 },
    { name: 'ETL Pipelines', level: 60 },
    { name: 'Statistics', level: 62 },
    { name: 'Git & GitHub', level: 55 },
    { name: 'SQL', level: 50 },
    { name: 'Data Visualization', level: 58 },
  ],
  stats: [
    { label: 'Projects', value: 4, suffix: '+' },
    { label: 'Learnings', value: 5, suffix: '+' },
    { label: 'Days Challenged', value: 1, suffix: '→∞' },
  ],
}

export const learnings = [
  {
    id: 1,
    title: 'IDS Book — Ch.2: Toolboxes for Data Science',
    date: '2024-08-15',
    category: 'Data Science',
    tags: ['Python', 'Pandas', 'NumPy', 'ETL'],
    summary:
      'Explored key Python toolboxes for data science — mastered DataFrame operations, filtering, groupby, pivot tables, and lambda functions.',
    highlights: [
      'DataFrame creation and manipulation with Pandas',
      'Data filtering using boolean indexing',
      'GroupBy aggregations and pivot tables',
      'Lambda functions for data transformation',
      'Merging and joining datasets',
    ],
    link: null,
  },
  {
    id: 2,
    title: 'IDS Book — Ch.3: Descriptive Statistics',
    date: '2024-08-20',
    category: 'Statistics',
    tags: ['Statistics', 'EDA', 'Python', 'Matplotlib'],
    summary:
      'Deep dive into descriptive statistics — mean, median, variance, standard deviation, CDFs, PMFs, and exploratory data analysis.',
    highlights: [
      'Measures of central tendency (mean, median, mode)',
      'Spread: variance, standard deviation, IQR',
      'Histograms and frequency distributions',
      'CDF and PMF for probability analysis',
      'Data cleaning for outlier handling',
    ],
    link: null,
  },
  {
    id: 3,
    title: 'Python Workbook — Exercise 1: Mailing Address',
    date: '2024-07-01',
    category: 'Python',
    tags: ['Python', 'Beginner', 'Practice'],
    summary:
      'First Python workbook exercise — printing formatted mailing addresses using string operations and print statements.',
    highlights: [
      'String formatting in Python',
      'Print function with multiple arguments',
      'Variable assignment and data types',
    ],
    link: null,
  },
  {
    id: 4,
    title: '100-Day Challenge: Day 0 — Vroom!',
    date: '2024-09-22',
    category: 'Personal Growth',
    tags: ['Discipline', 'Learning', 'Challenge', 'Mindset'],
    summary:
      'Kickstarted a 100-day personal challenge covering academics, health, and financial literacy. This is Day 0 of the journey.',
    highlights: [
      'Set clear academic goals for 100 days',
      'Established daily exercise routine',
      'Started tracking financial goals',
      'Committed to daily learning entries',
    ],
    link: null,
  },
  {
    id: 5,
    title: 'Git & GitHub Fundamentals',
    date: '2024-06-15',
    category: 'Tools',
    tags: ['Git', 'GitHub', 'Version Control', 'CLI'],
    summary:
      'Learned version control fundamentals — branching, committing, pull requests, and collaborative workflows on GitHub.',
    highlights: [
      'Core git commands (init, add, commit, push, pull)',
      'Branching and merging strategies',
      'Pull request workflow',
      'Resolving merge conflicts',
    ],
    link: null,
  },
]

export const projects = [
  {
    id: 1,
    title: 'US President Heights Analysis',
    category: 'Data Analysis',
    tags: ['Python', 'Pandas', 'ETL', 'NumPy', 'Matplotlib'],
    description:
      'An ETL project analyzing heights of all US Presidents. Extracted data from a CSV, transformed it with Pandas, and computed descriptive statistics to find trends.',
    highlights: [
      'ETL pipeline: Extract → Transform → Load',
      'Computed mean, median, min, max height',
      'Visualized distribution with Matplotlib',
      'Identified tallest and shortest presidents',
    ],
    github: 'https://github.com/asoliyarohit',
    demo: null,
    status: 'completed',
    date: '2024',
    featured: true,
  },
  {
    id: 2,
    title: 'IDS Book: Chapter 2 Practice',
    category: 'Learning Project',
    tags: ['Python', 'Pandas', 'Data Science', 'ETL'],
    description:
      'Hands-on practice from the Intro to Data Science book Chapter 2. Built real DataFrames, applied groupby operations, pivot tables, and lambda transformations.',
    highlights: [
      'Built DataFrames from scratch',
      'Mastered groupby and agg functions',
      'Applied pivot tables for summary analysis',
      'Used lambda for column transformations',
    ],
    github: 'https://github.com/asoliyarohit',
    demo: null,
    status: 'completed',
    date: '2024',
    featured: false,
  },
  {
    id: 3,
    title: 'IDS Book: Chapter 3 Practice',
    category: 'Learning Project',
    tags: ['Python', 'Statistics', 'EDA', 'Matplotlib'],
    description:
      'Applied descriptive statistics concepts from Chapter 3 of the IDS book — from data cleaning to plotting CDFs and PMFs.',
    highlights: [
      'Descriptive stats with Pandas describe()',
      'Plotted histograms and frequency tables',
      'Computed CDF/PMF for distributions',
      'Handled outliers and missing data',
    ],
    github: 'https://github.com/asoliyarohit',
    demo: null,
    status: 'completed',
    date: '2024',
    featured: false,
  },
  {
    id: 4,
    title: 'Python Workbook: 100 Exercises',
    category: 'Practice',
    tags: ['Python', 'Beginner', 'Problem Solving'],
    description:
      'Working through a curated Python workbook with 100 exercises — from basic print statements to string manipulation, lists, and functions.',
    highlights: [
      'String formatting and manipulation',
      'List comprehensions and iteration',
      'Function definitions and scope',
      'File I/O basics',
    ],
    github: 'https://github.com/asoliyarohit',
    demo: null,
    status: 'in-progress',
    date: '2024',
    featured: false,
  },
]

export const contributions = {
  opensource: [
    {
      id: 1,
      title: 'Scouting Python / Data Science Repos',
      organization: 'GitHub',
      description:
        'Exploring open source data science projects to find a first contribution. Looking at Pandas, NumPy, and beginner-friendly repos tagged "good first issue".',
      status: 'planned',
      date: 'Q4 2024',
      link: null,
      type: 'code',
    },
    {
      id: 2,
      title: 'Documentation Contribution',
      organization: 'Open Source',
      description:
        'Planning to contribute documentation improvements to a Python data science library — improving README clarity, adding examples, or fixing outdated docs.',
      status: 'planned',
      date: '2025',
      link: null,
      type: 'docs',
    },
    {
      id: 3,
      title: 'Personal Portfolio Website',
      organization: 'asoliyarohit.github.io',
      description:
        'Built and maintain this open personal website — documenting learnings, projects, and the journey from beginner to practitioner.',
      status: 'active',
      date: '2024 – Present',
      link: 'https://github.com/asoliyarohit/asoliyarohit.github.io',
      type: 'project',
    },
  ],
  consulting: [
    {
      id: 1,
      title: 'Data Analysis Consulting',
      description:
        'Available for small data analysis projects — exploratory data analysis, cleaning messy datasets, and generating insights from structured data.',
      skills: ['Python', 'Pandas', 'EDA', 'Visualization'],
      status: 'available',
      priceRange: 'Flexible',
    },
    {
      id: 2,
      title: 'Python Scripting & Automation',
      description:
        'Can help automate repetitive data tasks, build simple ETL pipelines, or write Python scripts to process and transform data files.',
      skills: ['Python', 'ETL', 'Automation', 'CSV/Excel'],
      status: 'available',
      priceRange: 'Flexible',
    },
    {
      id: 3,
      title: 'Learning Mentorship',
      description:
        'Happy to guide beginners starting their Python and data science journey — explaining concepts, reviewing code, or suggesting learning paths.',
      skills: ['Teaching', 'Python', 'Data Science', 'Mentoring'],
      status: 'available',
      priceRange: 'Free / Pay-it-forward',
    },
  ],
}
