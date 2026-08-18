import { db } from '@/lib/db'

async function seed() {
  console.log('🌱 Seeding IndicBench database...')

  // Create benchmark categories
  const categories = await Promise.all([
    db.benchmarkCategory.create({
      data: {
        slug: 'legal',
        name: 'Indian Legal Reasoning',
        description: 'Evaluates LLMs on Indian Penal Code, Constitutional Law, GST compliance, and judicial reasoning tasks specific to the Indian legal system.',
        icon: 'Scale',
        color: '#e67e22',
        order: 1,
      }
    }),
    db.benchmarkCategory.create({
      data: {
        slug: 'healthcare',
        name: 'Indian Healthcare AI',
        description: 'Benchmarks LLMs on Ayushman Bharat scheme comprehension, Indian pharmacopeia, rural healthcare diagnostics, and medical report analysis in Indian contexts.',
        icon: 'Heart',
        color: '#e74c3c',
        order: 2,
      }
    }),
    db.benchmarkCategory.create({
      data: {
        slug: 'fintech',
        name: 'Indian Fintech & BFSI',
        description: 'Tests LLMs on UPI transaction reasoning, RBI regulatory compliance, Indian tax computation (ITR), credit scoring, and Neo-banking workflows.',
        icon: 'Landmark',
        color: '#27ae60',
        order: 3,
      }
    }),
    db.benchmarkCategory.create({
      data: {
        slug: 'vernacular',
        name: 'Vernacular Language AI',
        description: 'Evaluates LLMs on Hindi, Tamil, Bengali, Telugu, Marathi reasoning, code-mixed (Hinglish) comprehension, and Indic script understanding.',
        icon: 'Languages',
        color: '#8e44ad',
        order: 4,
      }
    }),
    db.benchmarkCategory.create({
      data: {
        slug: 'education',
        name: 'Indian Education & Skilling',
        description: 'Benchmarks LLMs on NEP 2020 comprehension, CBSE/ICSE curriculum reasoning, competitive exam solving (JEE/NEET style), and India-specific tutoring scenarios.',
        icon: 'GraduationCap',
        color: '#2980b9',
        order: 5,
      }
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Create benchmarks for each category
  const legalBenchmarks = await Promise.all([
    db.benchmark.create({ data: { slug: 'ipc-reasoning', name: 'IPC Section Reasoning', description: 'Identify correct IPC sections for given criminal scenarios and explain the reasoning.', categoryId: categories[0].id, numQuestions: 250, difficulty: 'hard' } }),
    db.benchmark.create({ data: { slug: 'constitutional-law', name: 'Constitutional Law QA', description: 'Answer questions about Indian Constitution articles, amendments, and landmark judgments.', categoryId: categories[0].id, numQuestions: 200, difficulty: 'hard' } }),
    db.benchmark.create({ data: { slug: 'gst-compliance', name: 'GST Compliance Checker', description: 'Determine GST rates, HSN codes, and compliance requirements for Indian business scenarios.', categoryId: categories[0].id, numQuestions: 180, difficulty: 'medium' } }),
    db.benchmark.create({ data: { slug: 'contract-drafting', name: 'Indian Contract Drafting', description: 'Generate legally sound contract clauses compliant with Indian Contract Act, 1872.', categoryId: categories[0].id, numQuestions: 150, difficulty: 'hard' } }),
  ])

  const healthcareBenchmarks = await Promise.all([
    db.benchmark.create({ data: { slug: 'ayushman-comprehension', name: 'Ayushman Bharat Comprehension', description: 'Understand and reason about Ayushman Bharat scheme benefits, eligibility, and claim processes.', categoryId: categories[1].id, numQuestions: 200, difficulty: 'medium' } }),
    db.benchmark.create({ data: { slug: 'indian-pharmacopeia', name: 'Indian Pharmacopeia', description: 'Identify correct drugs, dosages, and interactions per Indian Pharmacopeia standards.', categoryId: categories[1].id, numQuestions: 180, difficulty: 'hard' } }),
    db.benchmark.create({ data: { slug: 'rural-diagnosis', name: 'Rural Healthcare Triage', description: 'Suggest appropriate triage and referrals for common rural Indian health scenarios.', categoryId: categories[1].id, numQuestions: 160, difficulty: 'medium' } }),
  ])

  const fintechBenchmarks = await Promise.all([
    db.benchmark.create({ data: { slug: 'upi-reasoning', name: 'UPI Transaction Reasoning', description: 'Analyze UPI transaction flows, detect anomalies, and reason about payment failures.', categoryId: categories[2].id, numQuestions: 220, difficulty: 'medium' } }),
    db.benchmark.create({ data: { slug: 'rbi-compliance', name: 'RBI Regulatory Compliance', description: 'Check compliance of banking scenarios against RBI circulars and guidelines.', categoryId: categories[2].id, numQuestions: 190, difficulty: 'hard' } }),
    db.benchmark.create({ data: { slug: 'itr-computation', name: 'Indian Tax Computation', description: 'Compute income tax liabilities under old and new regimes for Indian taxpayer profiles.', categoryId: categories[2].id, numQuestions: 175, difficulty: 'hard' } }),
    db.benchmark.create({ data: { slug: 'credit-scoring', name: 'Credit Scoring India', description: 'Evaluate creditworthiness using CIBIL-style parameters for Indian consumer profiles.', categoryId: categories[2].id, numQuestions: 150, difficulty: 'medium' } }),
  ])

  const vernacularBenchmarks = await Promise.all([
    db.benchmark.create({ data: { slug: 'hindi-reasoning', name: 'Hindi Logical Reasoning', description: 'Solve logical reasoning and comprehension problems in pure Hindi.', categoryId: categories[3].id, numQuestions: 300, difficulty: 'medium' } }),
    db.benchmark.create({ data: { slug: 'hinglish-qa', name: 'Hinglish Code-Mixed QA', description: 'Answer questions in Hinglish (Hindi-English mixed), common in Indian digital communication.', categoryId: categories[3].id, numQuestions: 250, difficulty: 'easy' } }),
    db.benchmark.create({ data: { slug: 'tamil-bengali-reasoning', name: 'Tamil & Bengali Reasoning', description: 'Cross-lingual reasoning tasks in Tamil and Bengali scripts.', categoryId: categories[3].id, numQuestions: 200, difficulty: 'hard' } }),
  ])

  const educationBenchmarks = await Promise.all([
    db.benchmark.create({ data: { slug: 'nep2020', name: 'NEP 2020 Comprehension', description: 'Answer questions about National Education Policy 2020 provisions and implementation.', categoryId: categories[4].id, numQuestions: 180, difficulty: 'medium' } }),
    db.benchmark.create({ data: { slug: 'jee-neet-style', name: 'JEE/NEET Style Reasoning', description: 'Solve physics, chemistry, and biology problems in JEE/NEET format.', categoryId: categories[4].id, numQuestions: 300, difficulty: 'hard' } }),
    db.benchmark.create({ data: { slug: 'cbse-curriculum', name: 'CBSE Curriculum QA', description: 'Answer CBSE board exam style questions across subjects for Classes 10-12.', categoryId: categories[4].id, numQuestions: 250, difficulty: 'medium' } }),
  ])

  const allBenchmarks = [...legalBenchmarks, ...healthcareBenchmarks, ...fintechBenchmarks, ...vernacularBenchmarks, ...educationBenchmarks]
  console.log(`✅ Created ${allBenchmarks.length} benchmarks`)

  // Create AI models
  const models = await Promise.all([
    db.aIModel.create({ data: { slug: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', version: '2024-11-20', description: 'OpenAI\'s flagship multimodal model' } }),
    db.aIModel.create({ data: { slug: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', version: '2024-07-18', description: 'OpenAI\'s cost-efficient model' } }),
    db.aIModel.create({ data: { slug: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', version: '2025-05-14', description: 'Anthropic\'s balanced performance model' } }),
    db.aIModel.create({ data: { slug: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', version: '2025-05-14', description: 'Anthropic\'s most capable model' } }),
    db.aIModel.create({ data: { slug: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google', version: '2025-06-05', description: 'Google DeepMind\'s thinking model' } }),
    db.aIModel.create({ data: { slug: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', version: '2025-05-20', description: 'Google\'s fast and efficient model' } }),
    db.aIModel.create({ data: { slug: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', version: '2025-04-05', description: 'Meta\'s open-source MoE model' } }),
    db.aIModel.create({ data: { slug: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', version: '2024-12-26', description: 'DeepSeek\'s efficient MoE model' } }),
    db.aIModel.create({ data: { slug: 'command-r-plus', name: 'Command R+', provider: 'Cohere', version: '2024-09-27', description: 'Cohere\'s retrieval-augmented model' } }),
    db.aIModel.create({ data: { slug: 'qwq-32b', name: 'QwQ-32B', provider: 'Alibaba', version: '2024-11-28', description: 'Alibaba\'s reasoning model' } }),
  ])

  console.log(`✅ Created ${models.length} models`)

  // Create evaluation results
  // Score patterns per model (base performance) — varying by category to make it realistic
  const modelScoreProfiles: Record<string, Record<string, number>> = {
    'gpt-4o': { legal: 82.4, healthcare: 78.6, fintech: 85.2, vernacular: 72.8, education: 88.1 },
    'gpt-4o-mini': { legal: 71.3, healthcare: 68.9, fintech: 74.6, vernacular: 65.2, education: 79.4 },
    'claude-sonnet-4': { legal: 86.7, healthcare: 83.2, fintech: 84.9, vernacular: 76.5, education: 90.3 },
    'claude-opus-4': { legal: 89.1, healthcare: 87.4, fintech: 88.3, vernacular: 79.2, education: 92.7 },
    'gemini-2.5-pro': { legal: 84.3, healthcare: 86.1, fintech: 82.7, vernacular: 81.4, education: 89.6 },
    'gemini-2.5-flash': { legal: 74.2, healthcare: 73.8, fintech: 71.5, vernacular: 74.3, education: 80.9 },
    'llama-4-maverick': { legal: 72.6, healthcare: 69.4, fintech: 70.8, vernacular: 68.7, education: 76.3 },
    'deepseek-v3': { legal: 76.8, healthcare: 74.2, fintech: 77.1, vernacular: 66.9, education: 82.5 },
    'command-r-plus': { legal: 70.1, healthcare: 71.6, fintech: 73.4, vernacular: 62.3, education: 74.8 },
    'qwq-32b': { legal: 78.5, healthcare: 75.9, fintech: 79.2, vernacular: 64.8, education: 84.1 },
  }

  const categorySlugs = ['legal', 'healthcare', 'fintech', 'vernacular', 'education']

  const resultPromises: Promise<any>[] = []

  for (const model of models) {
    const profile = modelScoreProfiles[model.slug]
    for (const benchmark of allBenchmarks) {
      const catIndex = categorySlugs.indexOf(benchmark.categoryId === categories[0].id ? 'legal' : benchmark.categoryId === categories[1].id ? 'healthcare' : benchmark.categoryId === categories[2].id ? 'fintech' : benchmark.categoryId === categories[3].id ? 'vernacular' : 'education')
      const catSlug = categorySlugs[catIndex]
      const baseScore = profile[catSlug] || 70

      // Add some variation per benchmark within a category
      const variation = (Math.random() - 0.5) * 10
      const score = Math.min(100, Math.max(30, baseScore + variation))
      const numTotal = benchmark.numQuestions
      const numCorrect = Math.round(numTotal * score / 100)

      // Latency varies by model
      const latencyBase = model.slug.includes('mini') || model.slug.includes('flash') ? 400 : model.slug.includes('opus') ? 1800 : 900
      const latency = latencyBase + Math.random() * 500

      // Cost varies
      const costBase = model.slug.includes('mini') || model.slug.includes('flash') ? 0.02 : model.slug.includes('opus') ? 0.15 : 0.05
      const cost = costBase + Math.random() * 0.03

      resultPromises.push(
        db.evaluationResult.create({
          data: {
            modelId: model.id,
            benchmarkId: benchmark.id,
            score: Math.round(score * 10) / 10,
            accuracy: Math.round(score * 10) / 10,
            f1Score: Math.round((score - Math.random() * 5) * 10) / 10,
            latencyMs: Math.round(latency),
            costUsd: Math.round(cost * 1000) / 1000,
            numCorrect,
            numTotal,
          }
        })
      )
    }
  }

  await Promise.all(resultPromises)
  console.log(`✅ Created ${resultPromises.length} evaluation results`)

  console.log('🎉 Seeding complete!')
}

seed()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
