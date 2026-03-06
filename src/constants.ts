import { HealthModule, Habit, Quiz, SeasonalTip } from './types';

export const HEALTH_MODULES: HealthModule[] = [
  {
    id: 'nutrition',
    title: 'Nutrition Basics',
    description: 'Learn about balanced diets and Indian superfoods.',
    icon: 'Apple',
    color: 'bg-emerald-500',
    lessons: [
      {
        id: 'n1',
        title: 'The Balanced Plate',
        content: 'A healthy Indian meal should include a mix of grains, pulses, vegetables, and curd. Aim for half your plate to be vegetables!',
      },
      {
        id: 'n2',
        title: 'Hidden Sugars',
        content: 'Many processed snacks and drinks contain high amounts of sugar. Check labels for words like sucrose, high fructose corn syrup, and maltodextrin.',
      }
    ]
  },
  {
    id: 'heart',
    title: 'Heart Health',
    description: 'Keep your heart strong with simple lifestyle changes.',
    icon: 'Heart',
    color: 'bg-rose-500',
    lessons: [
      {
        id: 'h1',
        title: 'Active Living',
        content: 'Walking for just 30 minutes a day can reduce heart disease risk by 30%. Start with a brisk walk after dinner!',
      }
    ]
  },
  {
    id: 'diabetes',
    title: 'Diabetes Awareness',
    description: 'Understanding blood sugar and prevention strategies.',
    icon: 'Activity',
    color: 'bg-blue-500',
    lessons: [
      {
        id: 'd1',
        title: 'What is Diabetes?',
        content: 'Diabetes occurs when your body cannot effectively use insulin. Type 2 diabetes is often preventable through diet and exercise.',
      }
    ]
  },
  {
    id: 'mental',
    title: 'Mental Wellness',
    description: 'Techniques for stress management and emotional health.',
    icon: 'Brain',
    color: 'bg-purple-500',
    lessons: [
      {
        id: 'm1',
        title: 'Mindfulness & Meditation',
        content: 'Practicing mindfulness for just 10 minutes a day can significantly lower cortisol levels and improve focus.',
      },
      {
        id: 'm2',
        title: 'Breaking the Stigma',
        content: 'Mental health is as important as physical health. Seeking help is a sign of strength, not weakness.',
      }
    ]
  },
  {
    id: 'sleep',
    title: 'Sleep Health',
    description: 'The science of rest and how to improve your sleep quality.',
    icon: 'Moon',
    color: 'bg-indigo-600',
    lessons: [
      {
        id: 's1',
        title: 'Circadian Rhythm',
        content: 'Your body has a natural clock. Maintaining a consistent sleep-wake cycle helps regulate hormones and energy.',
      },
      {
        id: 's2',
        title: 'Digital Detox',
        content: 'Blue light from screens interferes with melatonin production. Try to avoid screens 1 hour before bed.',
      }
    ]
  },
  {
    id: 'hygiene',
    title: 'Hygiene & Prevention',
    description: 'Daily habits to prevent infections and stay clean.',
    icon: 'ShieldCheck',
    color: 'bg-cyan-500',
    lessons: [
      {
        id: 'hy1',
        title: 'Hand Washing',
        content: 'Proper handwashing with soap for 20 seconds can prevent 1 in 3 diarrhea-related illnesses and 1 in 5 respiratory infections.',
      },
      {
        id: 'hy2',
        title: 'Oral Hygiene',
        content: 'Brushing twice a day and flossing helps prevent gum disease, which is linked to heart health.',
      }
    ]
  }
];

export const HABITS: Habit[] = [
  { id: 'water', name: 'Drink Water', description: '8 glasses of water', icon: 'Droplets', targetCount: 8, unit: 'glasses' },
  { id: 'sunlight', name: 'Morning Sun', description: '15 mins of sunlight', icon: 'Sun', targetCount: 15, unit: 'mins' },
  { id: 'walk', name: 'Daily Walk', description: '30 mins of walking', icon: 'Footprints', targetCount: 30, unit: 'mins' },
  { id: 'sleep', name: 'Proper Sleep', description: '7-8 hours of rest', icon: 'Moon', targetCount: 8, unit: 'hours' },
];

export const QUIZZES: Quiz[] = [
  {
    id: 'q-nutrition',
    moduleId: 'nutrition',
    title: 'Nutrition Challenge',
    questions: [
      {
        id: 'qn1',
        text: 'What percentage of your plate should ideally be vegetables?',
        options: ['10%', '25%', '50%', '75%'],
        correctAnswer: 2,
        explanation: 'Half of your plate (50%) should be filled with colorful vegetables for optimal fiber and micronutrients.'
      },
      {
        id: 'qn2',
        text: 'Which of these is a common Indian superfood rich in Vitamin C?',
        options: ['Amla', 'Potato', 'White Rice', 'Bread'],
        correctAnswer: 0,
        explanation: 'Amla (Indian Gooseberry) is one of the richest natural sources of Vitamin C.'
      }
    ]
  },
  {
    id: 'q-mental',
    moduleId: 'mental',
    title: 'Mindfulness Quiz',
    questions: [
      {
        id: 'qm1',
        text: 'How many minutes of daily meditation can help lower stress?',
        options: ['1 minute', '10 minutes', '60 minutes', '120 minutes'],
        correctAnswer: 1,
        explanation: 'Just 10 minutes of daily mindfulness can help regulate stress hormones.'
      }
    ]
  },
  {
    id: 'q-sleep',
    moduleId: 'sleep',
    title: 'Sleep Science Quiz',
    questions: [
      {
        id: 'qs1',
        text: 'Which hormone is responsible for regulating your sleep-wake cycle?',
        options: ['Insulin', 'Melatonin', 'Adrenaline', 'Cortisol'],
        correctAnswer: 1,
        explanation: 'Melatonin is the hormone that signals to your body that it is time to sleep.'
      }
    ]
  },
  {
    id: 'q-hygiene',
    moduleId: 'hygiene',
    title: 'Hygiene Quiz',
    questions: [
      {
        id: 'qh1',
        text: 'How long should you wash your hands with soap to effectively remove germs?',
        options: ['5 seconds', '10 seconds', '20 seconds', '60 seconds'],
        correctAnswer: 2,
        explanation: 'Washing hands for at least 20 seconds is recommended by health experts to kill most germs.'
      }
    ]
  }
];

export const SEASONAL_TIPS: SeasonalTip[] = [
  {
    season: 'Vasanta (Spring)',
    description: 'Mid-March to Mid-May. The season of rebirth where accumulated Kapha begins to melt.',
    icon: 'SunMedium',
    chapters: [
      {
        title: 'Dietary Regimen',
        content: 'Focus on bitter, pungent, and astringent tastes. Avoid heavy, oily, and sweet foods. Honey is excellent in this season. Drink warm water with ginger.',
        image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Lifestyle & Exercise',
        content: 'This is the best time for vigorous exercise. Dry massage (Udvartana) helps reduce Kapha. Avoid daytime naps as they increase Kapha and sluggishness.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    season: 'Grishma (Summer)',
    description: 'Mid-May to Mid-July. Intense heat depletes energy and increases Vata and Pitta.',
    icon: 'SunMedium',
    chapters: [
      {
        title: 'Cooling Foods',
        content: 'Consume sweet, cold, and liquid foods. Buttermilk, coconut water, and juicy fruits like grapes and melons are ideal. Avoid spicy and salty foods.',
        image: 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Summer Lifestyle',
        content: 'Stay in cool places. Wear light cotton clothes. Apply sandalwood paste for its cooling effect. A short afternoon nap is beneficial in this season.',
        image: 'https://images.unsplash.com/photo-1523381235312-3a16838b452c?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    season: 'Varsha (Monsoon)',
    description: 'Mid-July to Mid-September. Humidity is high and digestive fire (Agni) is weak.',
    icon: 'CloudRain',
    chapters: [
      {
        title: 'Digestive Support',
        content: 'Eat warm, light, and easily digestible meals. Use ginger, black pepper, and lemon to boost digestion. Avoid raw vegetables and leafy greens.',
        image: 'https://images.unsplash.com/photo-1515486191131-8d67e935110e?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Immunity & Protection',
        content: 'Drink boiled and cooled water. Keep your surroundings dry. Use herbal teas with Tulsi and Cinnamon to prevent seasonal infections.',
        image: 'https://images.unsplash.com/photo-1544070078-a212eaa27b45?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    season: 'Hemanta (Winter)',
    description: 'Mid-November to Mid-January. Digestive fire is strongest, and the body needs nourishment.',
    icon: 'Snowflake',
    chapters: [
      {
        title: 'Nourishing Diet',
        content: 'Enjoy heavy, warm, and oily foods. Ghee, nuts, sesame seeds, and jaggery are excellent. This is the time to eat well-cooked, hearty meals.',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Winter Wellness',
        content: 'Daily oil massage (Abhyanga) is highly recommended. Stay active to maintain circulation. Wear warm clothes and enjoy the morning sun.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];

export const GOVT_SCHEMES = [
  {
    name: 'Ayushman Bharat (PM-JAY)',
    description: 'The world\'s largest health insurance scheme, providing ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
    link: 'https://nha.gov.in/'
  },
  {
    name: 'Mission Indradhanush',
    description: 'A health mission to ensure full immunization with all available vaccines for children up to two years of age and pregnant women.',
    link: 'https://www.nhp.gov.in/mission-indradhanush_pg'
  },
  {
    name: 'PM Bhartiya Janaushadhi Pariyojana',
    description: 'Making quality medicines available at affordable prices for all, particularly the poor and disadvantaged, through exclusive outlets (Jan Aushadhi Kendras).',
    link: 'http://janaushadhi.gov.in/'
  },
  {
    name: 'National Health Mission (NHM)',
    description: 'Aims to provide universal access to equitable, affordable and quality health care services which is accountable and responsive to people\'s needs.',
    link: 'https://nhm.gov.in/'
  },
  {
    name: 'PM Surakshit Matritva Abhiyan',
    description: 'Ensures quality antenatal care and free health check-ups to pregnant women on the 9th of every month.',
    link: 'https://pmsma.nhp.gov.in/'
  },
  {
    name: 'Ayushman Bharat Digital Mission',
    description: 'Developing the backbone necessary to support the integrated digital health infrastructure of the country.',
    link: 'https://abdm.gov.in/'
  }
];
