export interface SampleQuestion {
  question: string;
  expectedAnswer: string;
  category: string;
}

const sampleQuestions: SampleQuestion[] = [
  // ─── Legal ───────────────────────────────────────────────────
  {
    question: "Under which section of IPC is theft defined?",
    expectedAnswer: "Section 378",
    category: "legal",
  },
  {
    question:
      "What are the essential elements of a valid contract under Indian Contract Act?",
    expectedAnswer:
      "Offer, acceptance, consideration, capacity, free consent, lawful object",
    category: "legal",
  },
  {
    question:
      "What is the maximum punishment for cheating under Section 420 of IPC?",
    expectedAnswer:
      "Imprisonment up to 7 years and fine",
    category: "legal",
  },
  {
    question:
      "Under the Indian Constitution, which article guarantees the Right to Equality?",
    expectedAnswer: "Article 14",
    category: "legal",
  },
  {
    question:
      "What is the limitation period for filing a suit for recovery of money under the Limitation Act, 1963?",
    expectedAnswer: "3 years from the date when the money becomes due",
    category: "legal",
  },
  {
    question:
      "Which section of the Companies Act 2013 deals with the incorporation of a company?",
    expectedAnswer: "Section 3",
    category: "legal",
  },
  {
    question:
      "What does Section 125 CrPC provide for?",
    expectedAnswer:
      "Maintenance for wives, children and parents",
    category: "legal",
  },
  {
    question:
      "Under the RTI Act 2005, what is the time limit for providing information by a PIO?",
    expectedAnswer: "30 days from the receipt of request",
    category: "legal",
  },

  // ─── Healthcare ──────────────────────────────────────────────
  {
    question:
      "What is the coverage limit under Ayushman Bharat for secondary care?",
    expectedAnswer: "₹5 lakh per family per year",
    category: "healthcare",
  },
  {
    question:
      "What is the flagship mental health programme launched by Government of India?",
    expectedAnswer: "National Mental Health Programme (NMHP)",
    category: "healthcare",
  },
  {
    question:
      "Under the Clinical Establishments Act, who is the registering authority?",
    expectedAnswer: "The District Registering Authority",
    category: "healthcare",
  },
  {
    question:
      "What is the infant mortality rate target set by India's National Health Policy 2017?",
    expectedAnswer: "28 per 1000 live births by 2025",
    category: "healthcare",
  },
  {
    question:
      "Which vaccine is given at birth under India's Universal Immunization Programme?",
    expectedAnswer: "BCG and OPV-0 (zero dose)",
    category: "healthcare",
  },
  {
    question:
      "What is the telemedicine practice guideline issued by the Medical Council of India called?",
    expectedAnswer:
      "Telemedicine Practice Guidelines – Registered Practitioners, 2020",
    category: "healthcare",
  },
  {
    question:
      "What percentage of GDP does India's National Health Policy 2017 target for public health expenditure?",
    expectedAnswer: "2.5% of GDP",
    category: "healthcare",
  },

  // ─── Fintech ─────────────────────────────────────────────────
  {
    question:
      "What is the current GST rate on restaurant services in India?",
    expectedAnswer: "5% without ITC",
    category: "fintech",
  },
  {
    question:
      "What is the maximum transaction limit for UPI using a single transaction?",
    expectedAnswer: "₹1 lakh (may vary by bank, typically ₹1 lakh)",
    category: "fintech",
  },
  {
    question:
      "Under the PMLA 2002, what is the obligation of a banking company regarding KYC?",
    expectedAnswer:
      "Maintain KYC records and report suspicious transactions to FIU-IND",
    category: "fintech",
  },
  {
    question:
      "What is the maximum amount covered under RBI's Deposit Insurance scheme?",
    expectedAnswer: "₹5 lakh per depositor per bank",
    category: "fintech",
  },
  {
    question:
      "What is the maximum investment limit in PPF for a financial year?",
    expectedAnswer: "₹1.5 lakh",
    category: "fintech",
  },
  {
    question:
      "Which entity operates the National Payments Corporation of India (NPCI)?",
    expectedAnswer:
      "NPCI is a not-for-profit company under RBI and IBA sponsorship",
    category: "fintech",
  },
  {
    question:
      "What is the TDS rate on fixed deposits for senior citizens under Section 194P?",
    expectedAnswer: "10% (no TDS if total interest is up to ₹50,000)",
    category: "fintech",
  },
  {
    question:
      "What is the penalty for late filing of ITR under Section 234F?",
    expectedAnswer:
      "₹1,000 if income up to ₹5 lakh; ₹5,000 otherwise (for FY 2023-24 onwards)",
    category: "fintech",
  },

  // ─── Vernacular ──────────────────────────────────────────────
  {
    question: "निम्नलिखित में से कौन सा भारत की राजधानी है?",
    expectedAnswer: "नई दिल्ली",
    category: "vernacular",
  },
  {
    question: "भारत का राष्ट्रीय पशु कौन सा है?",
    expectedAnswer: "बाघ (Tiger)",
    category: "vernacular",
  },
  {
    question: "இந்தியாவின் தேசிய கொடி எவ்வாறு அழைக்கப்படுகிறது?",
    expectedAnswer: "திருவணை (Tiranga)",
    category: "vernacular",
  },
  {
    question: "భారతదేశంలో ఎన్ని రాష్ట్రాలు ఉన్నాయి?",
    expectedAnswer: "28 రాష్ట్రాలు",
    category: "vernacular",
  },
  {
    question: "ਭਾਰਤ ਦਾ ਰਾਸ਼ਟਰੀ ਫੁੱਲ ਕਿਹੜਾ ਹੈ?",
    expectedAnswer: "ਕਮਲ (Lotus)",
    category: "vernacular",
  },
  {
    question: "महात्मा गांधी का जन्म कहाँ हुआ था?",
    expectedAnswer: "पोरबंदर, गुजरात",
    category: "vernacular",
  },
  {
    question: "বাংলাদেশের মুক্তিযুদ্ধে ভারতের ভূমিকা কী ছিল?",
    expectedAnswer:
      "ভারত মুক্তিযোদ্ধাদের প্রশিক্ষণ ও সামরিক সহায়তা প্রদান করেছিল (1971)",
    category: "vernacular",
  },

  // ─── Education ───────────────────────────────────────────────
  {
    question:
      "What is the medium of instruction recommended by NEP 2020 until Grade 5?",
    expectedAnswer: "Mother tongue/local language",
    category: "education",
  },
  {
    question:
      "What is the new 5+3+3+4 structure proposed by NEP 2020?",
    expectedAnswer:
      "Foundational (5 yrs), Preparatory (3 yrs), Middle (3 yrs), Secondary (4 yrs)",
    category: "education",
  },
  {
    question:
      "Under the RTE Act 2009, what is the minimum percentage of teachers required to be trained?",
    expectedAnswer: "All teachers must be professionally qualified as per NCTE norms",
    category: "education",
  },
  {
    question:
      "What is the gross enrolment ratio (GER) target for higher education by 2035 under NEP 2020?",
    expectedAnswer: "50%",
    category: "education",
  },
  {
    question:
      "Which regulatory body oversees technical education in India?",
    expectedAnswer: "AICTE (All India Council for Technical Education)",
    category: "education",
  },
  {
    question:
      "What is the age group covered under the RTE Act for free and compulsory education?",
    expectedAnswer: "6 to 14 years",
    category: "education",
  },
  {
    question:
      "What percentage of GDP does NEP 2020 target for education expenditure?",
    expectedAnswer: "6% of GDP",
    category: "education",
  },
  {
    question:
      "What is the National Institutional Ranking Framework (NIRF) launched by?",
    expectedAnswer: "Ministry of Education, Government of India (MHRD)",
    category: "education",
  },
];

export default sampleQuestions;

export function getQuestionsByCategory(category: string): SampleQuestion[] {
  return sampleQuestions.filter((q) => q.category === category);
}

export function getQuestionsByCategories(
  categories: string[]
): SampleQuestion[] {
  return sampleQuestions.filter((q) => categories.includes(q.category));
}
