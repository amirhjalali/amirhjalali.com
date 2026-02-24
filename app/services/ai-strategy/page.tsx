import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Strategy Consulting',
  description:
    'AI strategy consulting for organizations ready to move beyond experimentation. From readiness assessments to full-scale GenAI implementation, LLM integration, and AI governance frameworks.',
  keywords: [
    'AI strategy consultant',
    'AI strategy consulting',
    'generative AI implementation',
    'AI readiness assessment',
    'LLM integration consulting',
    'AI governance framework',
    'enterprise AI strategy',
    'AI transformation',
    'artificial intelligence consultant',
    'GenAI strategy',
  ],
  openGraph: {
    title: 'AI Strategy Consulting | Amir H. Jalali',
    description:
      'AI strategy consulting for organizations ready to move beyond experimentation. Readiness assessments, GenAI implementation, LLM integration, and governance frameworks.',
    url: 'https://amirhjalali.com/services/ai-strategy',
    type: 'website',
    images: [
      {
        url: 'https://amirhjalali.com/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'AI Strategy Consulting - Amir H. Jalali',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Strategy Consulting | Amir H. Jalali',
    description:
      'AI strategy consulting for organizations ready to move beyond experimentation.',
    images: ['https://amirhjalali.com/og-image.webp'],
  },
  alternates: {
    canonical: 'https://amirhjalali.com/services/ai-strategy',
  },
}

const serviceAreas = [
  {
    title: 'AI Strategy Development',
    description:
      'Define a clear AI roadmap aligned with your business objectives. Identify high-impact use cases, prioritize initiatives, and build an execution plan that delivers measurable results.',
  },
  {
    title: 'Generative AI Implementation',
    description:
      'Move from proof-of-concept to production with confidence. Architecture design, model selection, prompt engineering, and deployment of GenAI solutions that integrate into existing workflows.',
  },
  {
    title: 'AI Readiness Assessment',
    description:
      'Evaluate your organization\'s data infrastructure, team capabilities, and operational readiness for AI adoption. Get a clear picture of where you stand and what needs to change.',
  },
  {
    title: 'LLM Integration',
    description:
      'Integrate large language models into your products and processes. From RAG pipelines and fine-tuning to API orchestration and cost optimization across OpenAI, Anthropic, and open-source models.',
  },
  {
    title: 'AI Governance & Risk',
    description:
      'Establish responsible AI frameworks covering data privacy, model bias, security, and compliance. Build guardrails that protect your organization while enabling innovation.',
  },
]

const processSteps = [
  {
    step: '01',
    title: 'Discovery',
    description:
      'Deep dive into your business context, existing technology landscape, data assets, and strategic goals. Identify where AI creates the highest leverage.',
  },
  {
    step: '02',
    title: 'Strategy',
    description:
      'Develop a prioritized AI roadmap with clear milestones, resource requirements, and success metrics. No generic frameworks; every strategy is built for your specific context.',
  },
  {
    step: '03',
    title: 'Implementation',
    description:
      'Hands-on execution alongside your team. Architecture decisions, model selection, integration patterns, and iterative deployment with continuous feedback loops.',
  },
  {
    step: '04',
    title: 'Optimization',
    description:
      'Monitor performance, optimize costs, iterate on models, and scale what works. Build internal capabilities so your team can sustain and evolve AI initiatives independently.',
  },
]

const audiences = [
  {
    title: 'Startups & Scale-ups',
    description:
      'Build AI into your product from day one or add AI capabilities to gain a competitive edge. Fast, focused engagements that match startup pace.',
  },
  {
    title: 'Mid-Market Companies',
    description:
      'Navigate the AI landscape without building a full research team. Get strategic clarity and hands-on implementation support that moves at your speed.',
  },
  {
    title: 'Enterprise Organizations',
    description:
      'Accelerate enterprise AI adoption across business units. Governance frameworks, vendor evaluation, and integration strategies that work within complex organizational structures.',
  },
]

const faqItems = [
  {
    question: 'What does an AI strategy consultant do?',
    answer:
      'An AI strategy consultant helps organizations identify where artificial intelligence can create the most business value, then builds a practical plan to get there. This includes assessing your current capabilities, evaluating AI technologies against your specific use cases, designing implementation roadmaps, and guiding execution. The goal is to move beyond generic hype into concrete, measurable outcomes tailored to your business.',
  },
  {
    question: 'How long does an AI strategy engagement take?',
    answer:
      'Timelines vary based on scope and complexity. A focused AI readiness assessment typically takes 2 to 4 weeks. A full strategy engagement, from discovery through roadmap delivery, usually runs 6 to 10 weeks. Implementation support can extend over several months depending on the number of initiatives. I structure engagements in phases so you see value at each stage rather than waiting for a final deliverable.',
  },
  {
    question: 'What industries do you work with?',
    answer:
      'I work across industries including financial services, healthcare, e-commerce, media, SaaS, and professional services. The underlying principles of AI strategy, data readiness, model selection, and responsible deployment, apply broadly. What matters most is not the industry label but the quality of your data, the clarity of your business objectives, and your willingness to invest in doing AI well.',
  },
  {
    question: 'What is the difference between AI strategy and AI implementation?',
    answer:
      'AI strategy is about deciding what to build and why. It covers use case prioritization, technology selection, organizational readiness, and roadmap planning. AI implementation is the hands-on work of building it: architecture design, model training or integration, prompt engineering, testing, and deployment. Most organizations need both. I offer strategy-only engagements for teams that have engineering capacity, and end-to-end engagements for those who need strategic guidance and execution support together.',
  },
  {
    question: 'How do I know if my organization needs an AI consultant?',
    answer:
      'You likely need an AI consultant if you are exploring AI but unsure where to start, if pilot projects have stalled or failed to scale, if you lack in-house AI expertise for strategic decisions, or if you need an outside perspective to evaluate vendors and technologies objectively. A consultant is especially valuable when the cost of getting AI wrong, wasted investment, compliance risk, or missed opportunity, outweighs the cost of getting expert guidance.',
  },
  {
    question: 'What makes your approach different from other AI consultants?',
    answer:
      'I combine 18 years of hands-on data engineering experience with deep expertise in modern AI, including large language models, generative AI, and agentic systems. I do not just write strategy decks; I build and ship AI products. This means my recommendations are grounded in what actually works in production, not what looks good in a presentation. Every engagement is tailored to your context, and I work alongside your team rather than handing off a report.',
  },
]

// ProfessionalService JSON-LD
const professionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://amirhjalali.com/services/ai-strategy#service',
  name: 'AI Strategy Consulting - Amir H. Jalali',
  description:
    'AI strategy consulting for organizations ready to move beyond experimentation. From readiness assessments to full-scale GenAI implementation, LLM integration, and AI governance frameworks.',
  url: 'https://amirhjalali.com/services/ai-strategy',
  image: 'https://amirhjalali.com/og-image.webp',
  provider: {
    '@type': 'Person',
    '@id': 'https://amirhjalali.com/#person',
    name: 'Amir H. Jalali',
    url: 'https://amirhjalali.com',
  },
  areaServed: {
    '@type': 'Place',
    name: 'Worldwide',
  },
  serviceType: [
    'AI Strategy Development',
    'Generative AI Implementation',
    'AI Readiness Assessment',
    'LLM Integration',
    'AI Governance',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'AI Consulting Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI Strategy Development',
          description:
            'Define a clear AI roadmap aligned with business objectives with high-impact use case identification and execution planning.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Generative AI Implementation',
          description:
            'End-to-end GenAI solution deployment from architecture design and model selection to production integration.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI Readiness Assessment',
          description:
            'Comprehensive evaluation of data infrastructure, team capabilities, and operational readiness for AI adoption.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'LLM Integration',
          description:
            'Large language model integration including RAG pipelines, fine-tuning, API orchestration, and cost optimization.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI Governance & Risk',
          description:
            'Responsible AI frameworks covering data privacy, model bias, security, and regulatory compliance.',
        },
      },
    ],
  },
}

// FAQPage JSON-LD
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function AIStrategyPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(professionalServiceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <div className="min-h-screen bg-[#050505]">
        {/* Hero */}
        <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="mx-auto max-w-4xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#888888]">
              Services
            </p>
            <h1 className="font-serif text-4xl font-light leading-tight text-[#EAEAEA] md:text-6xl">
              AI Strategy Consulting
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#888888] md:text-xl">
              I help organizations move beyond AI experimentation into
              structured, high-impact implementation. Whether you need a
              strategic roadmap or hands-on technical guidance, I work alongside
              your team to turn AI ambition into measurable results.
            </p>
          </div>
        </section>

        {/* What I Do */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 font-serif text-3xl font-light text-[#EAEAEA] md:text-4xl">
              What I Do
            </h2>
            <p className="mb-12 max-w-2xl text-[#888888]">
              Five core service areas designed to meet you wherever you are in
              your AI journey.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {serviceAreas.map((service, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/[0.07]"
                >
                  <h3 className="mb-3 font-mono text-sm font-medium uppercase tracking-wider text-[#EAEAEA]">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#888888]">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 font-serif text-3xl font-light text-[#EAEAEA] md:text-4xl">
              How It Works
            </h2>
            <p className="mb-12 max-w-2xl text-[#888888]">
              A structured process that adapts to your pace and priorities.
            </p>
            <div className="space-y-8">
              {processSteps.map((step) => (
                <div
                  key={step.step}
                  className="flex gap-6 rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex-shrink-0">
                    <span className="font-mono text-2xl font-light text-white/20">
                      {step.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-2 font-mono text-sm font-medium uppercase tracking-wider text-[#EAEAEA]">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#888888]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who I Work With */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 font-serif text-3xl font-light text-[#EAEAEA] md:text-4xl">
              Who I Work With
            </h2>
            <p className="mb-12 max-w-2xl text-[#888888]">
              Organizations at every stage of the AI adoption curve.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {audiences.map((audience, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <h3 className="mb-3 font-mono text-sm font-medium uppercase tracking-wider text-[#EAEAEA]">
                    {audience.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#888888]">
                    {audience.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 font-serif text-3xl font-light text-[#EAEAEA] md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mb-12 max-w-2xl text-[#888888]">
              Common questions about working with an AI strategy consultant.
            </p>
            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <h3 className="mb-3 text-base font-medium text-[#EAEAEA]">
                    {item.question}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#888888]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-light text-[#EAEAEA] md:text-4xl">
              Ready to Build Your AI Strategy?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-[#888888]">
              Every engagement starts with a conversation. Let me understand
              your challenges and goals before proposing a path forward.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-lg bg-white px-8 py-3 font-mono text-xs uppercase tracking-widest text-black transition-colors hover:bg-[#EAEAEA]"
            >
              Start a Conversation
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
