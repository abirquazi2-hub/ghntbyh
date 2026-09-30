// All copy lives here, separate from layout. Facts marked VERIFIED came from the client brief.
// Everything else is general educational wording that Westdale should review (see README).
export const SITE = {
  name: 'Westdale Financial Services', // VERIFIED
  url: 'https://www.westdalefinancial.com',
  email: 'steve@westdalefinancial.com', // VERIFIED
  tagline: 'Planning today. Preparing for tomorrow.',
  area: 'the greater Hamilton area',
  founded: 2006, // VERIFIED
  years: 34, // VERIFIED ("34+")
  households: 150, // VERIFIED ("150+")
  steve: 'Stephen Fricker, CFP', // VERIFIED
};

export const SERVICES = [
  {
    slug: 'retirement-income-tax-planning', n: '01', title: 'Retirement Income & Tax Planning', nav: 'Retirement Income & Tax', scene: 'rings', topic: 'Retirement planning',
    short: 'How retirement income is structured, and how tax considerations shape it.',
    lede: 'Retirement is a change from building savings to relying on them. Planning how income is drawn, and how tax affects it, helps you see the path before you take it.',
    addresses: ['How retirement income can be structured from the sources available to you', 'How tax considerations affect saving now and drawing income later', 'Whether your plan still holds up when assumptions change'],
    relevant: ['People preparing for retirement', 'People approaching retirement who want to test their timing', 'People already retired who want to review how income is being drawn'],
    questions: ['What do I want retirement to look like?', 'Which sources of income will I rely on, and when?', 'How do taxes change what I keep?', 'What could change my plan?'],
    programs: ['map', 'tax'],
  },
  {
    slug: 'investment-funds-plans-products', n: '02', title: 'Investment Funds, Plans & Products', nav: 'Investment Funds, Plans & Products', scene: 'stack', topic: 'Investment planning',
    short: 'Researching and selecting funds, plans and products where appropriate.',
    lede: 'Investments should serve a plan, not the other way around. Westdale researches funds, plans and products where appropriate and presents customized proposals for your review.',
    addresses: ['Choosing investment funds, plans and products that fit your goals and circumstances', 'Reviewing an existing portfolio inside the context of your whole plan', 'Understanding what advice costs'],
    relevant: ['People building savings for long-term goals', 'People reviewing or consolidating existing investments', 'People comparing the cost of advice'],
    questions: ['What is this money for, and when will I need it?', 'How much risk is appropriate for my plan?', 'What am I paying, and for what?', 'How would my plan cope with a market decline?'],
    programs: ['prs', 'prr', 'fee'],
    note: 'Investing involves risk. Values can go down as well as up, and returns are not guaranteed.',
  },
  {
    slug: 'risk-management-insurance', n: '03', title: 'Risk Management & Insurance', nav: 'Risk Management & Insurance', scene: 'prism', topic: 'Insurance',
    short: 'Protecting your household and your plan from unexpected events.',
    lede: 'A financial plan depends on income and capital continuing. Risk management looks at what could interrupt them and whether insurance is appropriate.',
    addresses: ['The financial effect of unexpected events on your household', 'Where insurance may belong inside an overall plan', 'How insurance capital is managed over time'],
    relevant: ['Families who rely on one or more incomes', 'Business owners', 'Anyone whose plan depends on continued income or capital'],
    questions: ['What would my household need if income stopped?', 'What coverage do I already have?', 'How does insurance fit my estate and retirement plans?'],
    programs: ['life'],
  },
  {
    slug: 'severance-pension-transfers', n: '04', title: 'Severance & Pension Transfers', nav: 'Severance & Pension Transfers', scene: 'prism', topic: 'Pension / severance',
    short: 'Decisions that arrive when you leave an employer.',
    lede: 'Leaving an employer can mean a severance payment or a pension decision, often with a deadline. Good decisions start with seeing your whole picture first.',
    addresses: ['How to treat a severance payment inside your plan', 'Options when a pension commuted value is offered', 'The timing and tax considerations around these decisions'],
    relevant: ['People facing a job change or end of employment', 'People retiring from an employer with a pension', 'Anyone who has been offered a commuted value'],
    questions: ['What are all of my options, and what are the deadlines?', 'How would each option change my retirement income?', 'What are the tax implications?'],
    programs: ['cvp'],
  },
  {
    slug: 'inheritance-wealth-transfers', n: '05', title: 'Inheritance & Wealth Transfers', nav: 'Inheritance & Wealth Transfers', scene: 'rings', topic: 'Estate / wealth transfer',
    short: 'Receiving, managing and passing on wealth.',
    lede: 'Wealth moves between generations, sometimes suddenly. Planning helps an inheritance fit your goals and helps you organize what you pass on.',
    addresses: ['How an inheritance fits your own plan', 'How capital is managed within estate planning', 'Organizing your affairs for those who will follow you'],
    relevant: ['People who have received or expect an inheritance', 'People planning their own legacy'],
    questions: ['Who do I want to benefit, and how?', 'How would an inheritance change my plan?', 'Which professionals should I coordinate with?'],
    programs: ['estate'],
    note: 'Westdale does not replace legal advice on wills or estates. Coordinate with your legal professionals.',
  },
  {
    slug: 'young-families', n: '06', title: 'Financial Planning for Young Families', nav: 'Young Families', scene: 'stack', topic: 'Young family planning',
    short: 'A financial plan while the household is growing.',
    lede: 'Young families juggle competing priorities. A plan put in place early gives each of them a place.',
    addresses: ['Putting a plan in place while priorities compete', 'Protecting the household as it grows', 'Saving for the long term alongside near-term needs'],
    relevant: ['Young couples', 'Families with young children', 'Anyone starting to plan for the long term'],
    questions: ['What matters most right now, and what can wait?', 'What if something happens to one of us?', 'How do we start saving for the long term?'],
    programs: [],
  },
];

export const PROGRAMS = [
  { id: 'map', title: 'Your Retirement Map', href: '/your-retirement-map/', service: 'retirement-income-tax-planning', text: 'A Westdale retirement planning program that lays out the path from today through retirement.' },
  { id: 'prs', title: 'Portfolio Recovery Strategy Program', service: 'investment-funds-plans-products', text: 'A Westdale program concerned with strategies for recovering a portfolio.' },
  { id: 'prr', title: 'Portfolio Recovery Report', service: 'investment-funds-plans-products', text: 'A report that accompanies Westdale’s portfolio recovery work.' },
  { id: 'cvp', title: 'Commuted Value Proposal System', service: 'severance-pension-transfers', text: 'A system for preparing proposals for pension commuted value decisions.' },
  { id: 'estate', title: 'Estate Capital Management System', service: 'inheritance-wealth-transfers', text: 'A system for managing capital within estate and wealth-transfer planning.' },
  { id: 'life', title: 'Life Insurance Capital Management System', service: 'risk-management-insurance', text: 'A system for managing capital in connection with life insurance.' },
  { id: 'tax', title: 'Client Taxation Worksheet', service: 'retirement-income-tax-planning', text: 'A worksheet used to review a client’s taxation as part of planning.' },
  { id: 'fee', title: 'Fee for Service Calculator', service: 'investment-funds-plans-products', text: 'A calculator for looking at fee-for-service arrangements.' },
];

export const PROCESS = [
  ['Information gathering', 'Understanding your household, goals and current position.'],
  ['Planning calculations & tests', 'Working the numbers to see how your plan holds up.'],
  ['Product research', 'Where appropriate, researching products that fit the plan.'],
  ['Customized proposals', 'Recommendations prepared for your circumstances.'],
  ['Review', 'Going through the proposal together.'],
  ['Implementation', 'Putting the agreed plan in place where appropriate.'],
  ['Ongoing planning & service', 'Continued planning and client service over time.'],
];

export const TOPICS = ['Retirement planning', 'Investment planning', 'Tax planning', 'Insurance', 'Pension / severance', 'Estate / wealth transfer', 'Young family planning', 'Other'];
