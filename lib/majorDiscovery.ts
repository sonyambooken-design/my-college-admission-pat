export type RatingKey =
  | "biology" | "chemistry" | "math" | "coding" | "business" | "writing"
  | "design" | "healthcare" | "research" | "helping" | "leadership" | "persuasion"
  | "data" | "building" | "creativity" | "publicSpeaking" | "teamwork" | "independence";

export type DiscoveryProfile = Record<RatingKey, number> & {
  apCourses: string[];
  activities: string[];
  leadershipRoles: string[];
  sports: string[];
  service: string[];
  work: string[];
  educationYears: "4" | "6" | "8+" | "unsure";
  priorities: string[];
};

export const defaultDiscoveryProfile: DiscoveryProfile = {
  biology: 3, chemistry: 3, math: 3, coding: 3, business: 3, writing: 3,
  design: 3, healthcare: 3, research: 3, helping: 3, leadership: 3, persuasion: 3,
  data: 3, building: 3, creativity: 3, publicSpeaking: 3, teamwork: 3, independence: 3,
  apCourses: [], activities: [], leadershipRoles: [], sports: [], service: [], work: [],
  educationYears: "unsure", priorities: []
};

export const AP_OPTIONS = ["AP Biology","AP Chemistry","AP Calculus AB/BC","AP Statistics","AP Computer Science A","AP Physics","AP Psychology","AP Economics","AP Government","AP English Language/Literature","AP Environmental Science","IB/Honors equivalent"];
export const ACTIVITY_OPTIONS = ["HOSA","Robotics","Coding Club","Science Olympiad","Math Team","DECA/FBLA","Debate","Model UN","Student Government","Newspaper/Yearbook","Music/Theater","Art/Design","Environmental Club","National Honor Society","Research Program","Entrepreneurship Club"];
export const LEADERSHIP_OPTIONS = ["Team Captain","Club President/Officer","Student Government/Class Officer","Founder of a club/project","Event Organizer","Volunteer Coordinator","Mentor/Tutor","Youth/Community Organization Leader","Fundraising Lead"];
export const SPORTS_OPTIONS = ["Soccer","Basketball","Tennis","Track/Cross Country","Swimming","Volleyball","Baseball/Softball","Football","Golf","Other competitive sport"];
export const SERVICE_OPTIONS = ["Hospital/Clinic","Nursing Home/Senior Care","Tutoring/Education","Food Bank/Hunger Relief","Youth Programs","Environmental Service","Community/Cultural Organization","International Service","Animal Welfare"];
export const WORK_OPTIONS = ["Paid job","Internship","Research internship","Medical office/healthcare","Tutoring","Refereeing/Coaching","Family business","Retail/Restaurant","Technology project/job","Started a small business/project"];
export const PRIORITY_OPTIONS = ["Helping people","High earning potential","Job stability","Creativity","Leadership","Flexible/remote work","Entrepreneurship","Research/discovery","Work-life balance","Global impact"];

type MajorModel = {
  major: string; careers: string[]; weights: Partial<Record<RatingKey, number>>;
  ap: string[]; activities: string[]; leadership?: string[]; service?: string[]; work?: string[];
  backup: "Excellent"|"Strong"|"Moderate"; education: string; note: string;
};

const models: MajorModel[] = [
  {major:"Biomedical Engineering", careers:["Biomedical Engineer","Medical Device Product Manager","Physician (with pre-med prerequisites)","Biotech R&D"], weights:{math:5,biology:4,chemistry:3,building:5,design:4,healthcare:4,research:4,data:3}, ap:["AP Calculus AB/BC","AP Physics","AP Biology","AP Chemistry"], activities:["Robotics","Science Olympiad","Research Program"], backup:"Excellent", education:"4+ years", note:"Strong for students who want healthcare impact plus engineering and a marketable standalone degree."},
  {major:"Neuroscience", careers:["Physician","Neuroscience Researcher","Clinical Research Coordinator","Biotech/Pharma Associate"], weights:{biology:5,chemistry:3,research:5,healthcare:5,helping:3,data:3}, ap:["AP Biology","AP Chemistry","AP Psychology","AP Statistics"], activities:["HOSA","Science Olympiad","Research Program"], service:["Hospital/Clinic","Nursing Home/Senior Care"], backup:"Moderate", education:"4–8+ years", note:"Excellent for medicine and research, especially when the student is genuinely interested in brain, behavior and biology."},
  {major:"Biochemistry", careers:["Physician","Pharmaceutical Scientist","Laboratory Scientist","Biotech Research Associate"], weights:{biology:5,chemistry:5,research:4,healthcare:4,math:3}, ap:["AP Biology","AP Chemistry","AP Calculus AB/BC"], activities:["Science Olympiad","Research Program","HOSA"], backup:"Moderate", education:"4–8+ years", note:"A rigorous science route with close alignment to many pre-med prerequisites and laboratory careers."},
  {major:"Public Health", careers:["Epidemiologist","Healthcare Administrator","Public Health Analyst","Physician (with prerequisites)"], weights:{healthcare:5,helping:5,data:4,leadership:3,writing:3,research:3}, ap:["AP Statistics","AP Biology","AP Psychology","AP Government"], activities:["HOSA","Student Government","National Honor Society"], service:["Hospital/Clinic","Community/Cultural Organization","International Service"], backup:"Strong", education:"4–6+ years", note:"Good for students motivated by population health, policy, prevention and community impact."},
  {major:"Nursing", careers:["Registered Nurse","Nurse Practitioner","Clinical Nurse Specialist","Healthcare Leader"], weights:{healthcare:5,helping:5,biology:4,teamwork:5,leadership:3}, ap:["AP Biology","AP Chemistry","AP Psychology"], activities:["HOSA"], service:["Hospital/Clinic","Nursing Home/Senior Care"], backup:"Excellent", education:"4–6+ years", note:"A direct clinical career path for students who want hands-on patient care and strong job stability."},
  {major:"Computer Science", careers:["Software Engineer","AI/ML Engineer","Cybersecurity Engineer","Health-Tech Engineer"], weights:{coding:5,math:4,data:4,building:4,independence:3,creativity:3}, ap:["AP Computer Science A","AP Calculus AB/BC","AP Statistics"], activities:["Coding Club","Robotics","Math Team"], work:["Technology project/job","Started a small business/project"], backup:"Excellent", education:"4+ years", note:"Best for students who enjoy logic, building software and technology; can combine well with healthcare or business."},
  {major:"Data Science", careers:["Data Scientist","Healthcare Data Scientist","Business Analyst","AI/ML Analyst"], weights:{math:5,data:5,coding:4,research:3,business:2}, ap:["AP Statistics","AP Calculus AB/BC","AP Computer Science A"], activities:["Math Team","Coding Club","Research Program"], backup:"Excellent", education:"4+ years", note:"Strong quantitative option with broad employability across healthcare, finance, technology and research."},
  {major:"Finance", careers:["Financial Analyst","Investment Banking Analyst","Corporate Finance Manager","FinTech Product Manager"], weights:{business:5,math:4,data:4,persuasion:3,leadership:3}, ap:["AP Economics","AP Calculus AB/BC","AP Statistics"], activities:["DECA/FBLA","Entrepreneurship Club","Student Government"], backup:"Excellent", education:"4+ years", note:"Good for students energized by markets, business decisions, quantitative analysis and commercial outcomes."},
  {major:"Business / Entrepreneurship", careers:["Product Manager","Management Consultant","Entrepreneur","Operations Manager","Sales Leader"], weights:{business:5,leadership:5,persuasion:5,publicSpeaking:4,teamwork:4,creativity:3}, ap:["AP Economics","AP Statistics","AP English Language/Literature"], activities:["DECA/FBLA","Entrepreneurship Club","Student Government"], leadership:["Club President/Officer","Founder of a club/project","Event Organizer","Fundraising Lead"], backup:"Excellent", education:"4+ years", note:"A strong fit when leadership, persuasion, organization and initiative show up repeatedly across the student's activities."},
  {major:"Psychology", careers:["Psychologist","Behavioral Researcher","Human Resources / People Analytics","UX Researcher","Physician/Psychiatrist (with prerequisites)"], weights:{helping:5,research:4,writing:4,biology:2,data:3,healthcare:3}, ap:["AP Psychology","AP Statistics","AP Biology"], activities:["HOSA","Debate","Research Program"], service:["Youth Programs","Nursing Home/Senior Care"], backup:"Strong", education:"4–8+ years", note:"Good for students interested in human behavior, mental health, research and people-centered work."},
  {major:"Political Science / Public Policy", careers:["Attorney","Policy Analyst","Government Affairs","Public Administrator","Nonprofit Leader"], weights:{writing:5,publicSpeaking:5,persuasion:4,leadership:4,helping:3,research:3}, ap:["AP Government","AP English Language/Literature","AP Economics"], activities:["Debate","Model UN","Student Government","Newspaper/Yearbook"], leadership:["Student Government/Class Officer","Club President/Officer"], backup:"Strong", education:"4–7+ years", note:"Strong for students who enjoy debate, writing, advocacy, leadership and understanding institutions."},
  {major:"Communications / Marketing", careers:["Marketing Manager","Public Relations Specialist","Brand Strategist","Content/Media Producer","Sales/Business Development"], weights:{writing:5,persuasion:5,creativity:5,publicSpeaking:4,business:3,teamwork:3}, ap:["AP English Language/Literature","AP Psychology","AP Statistics"], activities:["Newspaper/Yearbook","DECA/FBLA","Debate","Music/Theater"], backup:"Strong", education:"4+ years", note:"Fits students who enjoy communication, storytelling, persuasion and creative business problems."}
];

function avgWeighted(profile: DiscoveryProfile, weights: MajorModel["weights"]) {
  let total=0, max=0;
  Object.entries(weights).forEach(([k,w])=>{ const weight=w||0; total += (profile[k as RatingKey]||0)*weight; max += 5*weight; });
  return max ? total/max : 0;
}
function overlapScore(selected:string[], desired:string[], cap:number){ if(!desired?.length) return 0; return Math.min(cap, selected.filter(x=>desired.includes(x)).length*2.2); }

export function recommendMajors(profile: DiscoveryProfile) {
  return models.map(m=>{
    const core=avgWeighted(profile,m.weights)*78;
    const evidence = overlapScore(profile.apCourses,m.ap,7)+overlapScore(profile.activities,m.activities,5)+overlapScore(profile.leadershipRoles,m.leadership||[],4)+overlapScore(profile.service,m.service||[],3)+overlapScore(profile.work,m.work||[],3);
    let priorityBoost=0;
    if(profile.priorities.includes("High earning potential") && ["Biomedical Engineering","Computer Science","Data Science","Finance"].includes(m.major)) priorityBoost+=3;
    if(profile.priorities.includes("Helping people") && ["Nursing","Public Health","Psychology","Neuroscience"].includes(m.major)) priorityBoost+=3;
    if(profile.priorities.includes("Entrepreneurship") && m.major.includes("Business")) priorityBoost+=4;
    if(profile.priorities.includes("Research/discovery") && ["Neuroscience","Biochemistry","Data Science","Biomedical Engineering"].includes(m.major)) priorityBoost+=3;
    const score=Math.max(45,Math.min(98,Math.round(core+evidence+priorityBoost)));
    const strongest=Object.entries(m.weights).sort((a,b)=>(b[1]||0)-(a[1]||0)).slice(0,3).map(([k])=>k.replace(/([A-Z])/g," $1").toLowerCase());
    return {...m,score,why:`Your profile shows alignment in ${strongest.join(", ")}. ${m.note}`};
  }).sort((a,b)=>b.score-a.score);
}

export function recommendCareers(profile: DiscoveryProfile) {
  const majors=recommendMajors(profile).slice(0,6);
  const map=new Map<string,{career:string;score:number;source:string}>();
  majors.forEach((m,mi)=>m.careers.forEach((career,ci)=>{const score=Math.max(55,m.score-mi*2-ci*2);const prev=map.get(career);if(!prev||score>prev.score) map.set(career,{career,score,source:m.major});}));
  return Array.from(map.values()).sort((a,b)=>b.score-a.score).slice(0,5);
}

export function nextStepsForMajor(major:string) {
  const m=models.find(x=>x.major===major); if(!m) return {courses:[],activities:[]};
  return {courses:m.ap.slice(0,4), activities:[...m.activities,...(m.service||[]),...(m.leadership||[])].slice(0,5)};
}
