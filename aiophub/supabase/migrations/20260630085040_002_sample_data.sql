/*
# AI Opportunity Hub - Sample Data

This migration adds sample data for categories and opportunities.

## Sample Categories
- Machine Learning
- Natural Language Processing
- Computer Vision
- Robotics
- Data Science
- AI Research

## Sample Opportunities
15 diverse AI opportunities across categories with realistic details including:
- Various companies (Google, OpenAI, Anthropic, Meta, Microsoft, etc.)
- Different types (remote, hybrid, onsite)
- Salary ranges
- Requirements and benefits

## Notes
1. All opportunities are marked as active
2. Deadlines are set 30-90 days in the future
3. Realistic job requirements and benefits included
*/

-- Insert categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Machine Learning', 'machine-learning', 'Machine learning engineering and MLOps positions', 'Brain'),
('Natural Language Processing', 'nlp', 'NLP, LLM, and text AI positions', 'MessageSquare'),
('Computer Vision', 'computer-vision', 'Image and video AI positions', 'Eye'),
('Robotics', 'robotics', 'AI robotics and automation positions', 'Bot'),
('Data Science', 'data-science', 'Data science and analytics positions', 'BarChart3'),
('AI Research', 'ai-research', 'Research scientist and R&D positions', 'FlaskConical')
ON CONFLICT (slug) DO NOTHING;

-- Insert opportunities
INSERT INTO opportunities (title, description, company, location, type, salary_min, salary_max, category_id, requirements, benefits, apply_url, deadline, is_active) VALUES
(
  'Senior ML Engineer',
  'Lead the development of cutting-edge machine learning models for our recommendation system. You will work with petabytes of data and serve millions of users daily.',
  'Google',
  'Mountain View, CA',
  'hybrid',
  180000,
  280000,
  (SELECT id FROM categories WHERE slug = 'machine-learning'),
  ARRAY['5+ years ML experience', 'Python, TensorFlow, PyTorch', 'Distributed systems', 'PhD preferred'],
  ARRAY['Equity package', 'Health benefits', '401k matching', 'Unlimited PTO', 'Learning budget'],
  'https://careers.google/ml-engineer',
  CURRENT_DATE + INTERVAL '60 days',
  true
),
(
  'LLM Research Scientist',
  'Join our team to advance the capabilities of large language models. Focus on alignment, safety, and capability improvements.',
  'Anthropic',
  'San Francisco, CA',
  'hybrid',
  200000,
  350000,
  (SELECT id FROM categories WHERE slug = 'nlp'),
  ARRAY['PhD in ML or related field', 'Published research in NLP/LLMs', 'Python expertise', 'Experience with transformers'],
  ARRAY['Competitive equity', 'Full health coverage', 'Remote flexibility', 'Research freedom', 'Conference budget'],
  'https://anthropic.com/careers',
  CURRENT_DATE + INTERVAL '45 days',
  true
),
(
  'Computer Vision Engineer',
  'Build perception systems for autonomous vehicles. Work on object detection, segmentation, and tracking in real-time scenarios.',
  'Waymo',
  'Palo Alto, CA',
  'onsite',
  160000,
  250000,
  (SELECT id FROM categories WHERE slug = 'computer-vision'),
  ARRAY['3+ years CV experience', 'C++ and Python', 'CUDA programming', 'Deep learning frameworks'],
  ARRAY['Stock options', 'Relocation assistance', 'Health & wellness', 'Education stipend'],
  'https://waymo.com/careers',
  CURRENT_DATE + INTERVAL '30 days',
  true
),
(
  'AI Platform Engineer',
  'Design and build scalable ML infrastructure serving thousands of models. Optimize inference pipelines for latency and cost.',
  'Meta',
  'Menlo Park, CA',
  'hybrid',
  175000,
  270000,
  (SELECT id FROM categories WHERE slug = 'machine-learning'),
  ARRAY['Strong systems background', 'Kubernetes, Docker', 'ML frameworks', 'Performance optimization'],
  ARRAY['RSUs', 'Health benefits', 'Gym membership', 'Parental leave', 'Meta AI research access'],
  'https://metacareers.com',
  CURRENT_DATE + INTERVAL '75 days',
  true
),
(
  'NLP Engineer',
  'Develop conversational AI systems and chatbots. Work on intent recognition, entity extraction, and dialogue management.',
  'OpenAI',
  'Remote',
  'remote',
  170000,
  300000,
  (SELECT id FROM categories WHERE slug = 'nlp'),
  ARRAY['NLP/LLM experience', 'Python proficiency', 'API design skills', 'Prompt engineering'],
  ARRAY['Flexible remote work', 'Home office stipend', 'Health insurance', 'Equity package'],
  'https://openai.com/careers',
  CURRENT_DATE + INTERVAL '90 days',
  true
),
(
  'Robotics ML Engineer',
  'Integrate machine learning into robotic systems for manufacturing automation. Work on motion planning and manipulation.',
  'Boston Dynamics',
  'Waltham, MA',
  'onsite',
  150000,
  230000,
  (SELECT id FROM categories WHERE slug = 'robotics'),
  ARRAY['Robotics background', 'ROS experience', 'ML/CV integration', 'Control systems'],
  ARRAY['Cutting-edge projects', 'Health benefits', '401k', 'Pet-friendly office'],
  'https://bostondynamics.com/careers',
  CURRENT_DATE + INTERVAL '55 days',
  true
),
(
  'Data Scientist - AI Products',
  'Analyze user behavior and model performance to improve AI product features. Drive data-informed product decisions.',
  'Microsoft',
  'Seattle, WA',
  'hybrid',
  140000,
  220000,
  (SELECT id FROM categories WHERE slug = 'data-science'),
  ARRAY['SQL, Python, R', 'A/B testing', 'ML fundamentals', 'Product analytics'],
  ARRAY['Microsoft benefits', 'Stock purchase plan', 'Hybrid work', 'Parental leave'],
  'https://careers.microsoft.com',
  CURRENT_DATE + INTERVAL '40 days',
  true
),
(
  'Research Engineer - Multi-modal AI',
  'Build systems that combine vision, language, and audio understanding. Push the boundaries of multi-modal AI.',
  'Google DeepMind',
  'London',
  'hybrid',
  190000,
  320000,
  (SELECT id FROM categories WHERE slug = 'ai-research'),
  ARRAY['Research experience', 'Multi-modal models', 'Python, JAX', 'Published papers'],
  ARRAY['Research freedom', 'Global collaboration', 'Sabbatical program', 'Conference travel'],
  'https://deepmind.com/careers',
  CURRENT_DATE + INTERVAL '80 days',
  true
),
(
  'Computer Vision Researcher',
  'Advance state-of-the-art in image understanding. Focus on few-shot learning and domain adaptation.',
  'Adobe',
  'San Jose, CA',
  'hybrid',
  160000,
  260000,
  (SELECT id FROM categories WHERE slug = 'computer-vision'),
  ARRAY['PhD in CV/ML', 'Publications at CVPR/ICCV', 'PyTorch expertise', 'Novel architectures'],
  ARRAY['Adobe stock', 'Creative environment', 'Health benefits', 'Product impact'],
  'https://adobe.com/careers',
  CURRENT_DATE + INTERVAL '65 days',
  true
),
(
  'ML Infrastructure Lead',
  'Lead a team building ML training and inference infrastructure. Scale systems from prototype to production.',
  'NVIDIA',
  'Santa Clara, CA',
  'onsite',
  200000,
  320000,
  (SELECT id FROM categories WHERE slug = 'machine-learning'),
  ARRAY['Leadership experience', 'GPU computing', 'Distributed training', 'System design'],
  ARRAY['NVIDIA stock', 'Cutting-edge hardware', 'Health & wellness', 'Learning programs'],
  'https://nvidia.com/careers',
  CURRENT_DATE + INTERVAL '50 days',
  true
),
(
  'AI Safety Researcher',
  'Work on AI alignment and safety research. Develop techniques to ensure AI systems are beneficial and safe.',
  'DeepMind',
  'Remote',
  'remote',
  180000,
  300000,
  (SELECT id FROM categories WHERE slug = 'ai-research'),
  ARRAY['ML research background', 'Alignment/safety papers', 'Strong math skills', 'Critical thinking'],
  ARRAY['Remote-first', 'Research autonomy', 'Collaboration with pioneers', 'Health benefits'],
  'https://deepmind.com/careers/safety',
  CURRENT_DATE + INTERVAL '70 days',
  true
),
(
  'Conversational AI Engineer',
  'Build next-generation voice assistants. Work on ASR, NLU, and TTS systems at scale.',
  'Amazon Alexa',
  'Seattle, WA',
  'hybrid',
  155000,
  250000,
  (SELECT id FROM categories WHERE slug = 'nlp'),
  ARRAY['Voice AI experience', 'Deep learning for speech', 'Python, Java', 'Production ML systems'],
  ARRAY['Amazon RSUs', 'Health coverage', 'Career growth', 'Product impact'],
  'https://amazon.com/careers',
  CURRENT_DATE + INTERVAL '35 days',
  true
),
(
  'Autonomous Systems Engineer',
  'Develop perception and planning systems for autonomous robots in warehouse automation.',
  'Amazon Robotics',
  'North Reading, MA',
  'onsite',
  145000,
  230000,
  (SELECT id FROM categories WHERE slug = 'robotics'),
  ARRAY['Robotics software', 'Motion planning', 'C++, Python', 'Real-time systems'],
  ARRAY['Amazon benefits', 'Cutting-edge tech', 'Career mobility', 'Team events'],
  'https://amazonrobotics.com',
  CURRENT_DATE + INTERVAL '85 days',
  true
),
(
  'Senior Data Scientist - GenAI',
  'Build and optimize generative AI products. Analyze model behavior and user interactions.',
  'Stability AI',
  'Remote',
  'remote',
  150000,
  240000,
  (SELECT id FROM categories WHERE slug = 'data-science'),
  ARRAY['GenAI experience', 'Statistical analysis', 'Python, SQL', 'Model evaluation'],
  ARRAY['Full remote', 'Flexible hours', 'Equity', 'Home office budget'],
  'https://stability.ai/careers',
  CURRENT_DATE + INTERVAL '95 days',
  true
),
(
  'AI Product Manager',
  'Define and execute the AI product roadmap. Work with engineering and research to ship AI features.',
  'Notion',
  'San Francisco, CA',
  'hybrid',
  160000,
  250000,
  (SELECT id FROM categories WHERE slug = 'ai-research'),
  ARRAY['Product management', 'AI/ML understanding', 'Technical background', 'User research'],
  ARRAY['Notion credits', 'Equity', 'Health benefits', 'WFH stipend'],
  'https://notion.com/careers',
  CURRENT_DATE + INTERVAL '48 days',
  true
);