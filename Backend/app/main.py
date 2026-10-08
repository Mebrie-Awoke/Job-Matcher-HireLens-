import re  
from collections import Counter 
from typing import List   
  
from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel

app = FastAPI(title='HireLens API', version='1.0.0') 

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'for', 'with', 'without', 'to', 'of', 'in', 'on',
    'at', 'by', 'from', 'as', 'is', 'it', 'this', 'that', 'be', 'are', 'was', 'were',
    'you', 'your', 'we', 'our', 'they', 'them', 'their', 'his', 'her', 'he', 'she',
    'i', 'me', 'my', 'us', 'about', 'into', 'over', 'under', 'after', 'before', 'during',
    'between', 'through', 'across', 'within', 'while', 'than', 'then', 'also', 'have',
    'has', 'had', 'will', 'would', 'could', 'should', 'can', 'may', 'must', 'do', 'does',
    'did', 'not', 'more', 'most', 'some', 'such', 'very', 'using', 'used', 'work', 'works',
    'job', 'role', 'roles', 'team', 'experience', 'experiences', 'years', 'year', 'skills',
    'skill', 'responsibilities', 'responsibility', 'candidate', 'candidates', 'strong', 'good',
    'looking', 'like', 'need', 'needs', 'required', 'requirement', 'requirements', 'focus',
    'support', 'including', 'include', 'help', 'helps', 'create', 'creating', 'business',
    'people', 'process', 'processes', 'across', 'around', 'manage', 'manages', 'driven', 'using'
}


class MatchingRequest(BaseModel):
    resume_text: str
    about_me: str = ''
    job_description: str 


class Recommendation(BaseModel):
    title: str
    details: str


class MatchResponse(BaseModel):
    fit_percentage: int
    matched_skills: List[str]
    missing_skills: List[str]
    summary: str
    recommendations: List[Recommendation]


def normalize_text(text: str) -> str:
    return re.sub(r'[^a-z0-9+\s]', ' ', text.lower())


def extract_keywords(text: str) -> set[str]:
    cleaned = normalize_text(text)
    tokens = re.findall(r'\b[a-z0-9+]{2,}\b', cleaned)
    keywords = {token for token in tokens if token not in STOP_WORDS}
    return keywords


def score_match(resume_text: str, job_description: str) -> tuple[int, list[str], list[str]]:
    job_keywords = extract_keywords(job_description)
    resume_keywords = extract_keywords(resume_text)

    if not job_keywords:
        return 0, [], []

    matched = sorted(job_keywords & resume_keywords)
    missing = sorted(job_keywords - resume_keywords)

    overlap_score = len(matched) / len(job_keywords)
    percentage = max(0, min(100, round(overlap_score * 100)))
    return percentage, matched[:10], missing[:10]


def build_recommendations(missing_skills: list[str], fit_percentage: int) -> list[Recommendation]:
    if not missing_skills:
        return [
            Recommendation(
                title='Keep improving your edge',
                details='You already match well with this role. Focus on leadership, business impact, and measurable results to stand out.'
            )
        ]

    top_missing = missing_skills[:5]
    recommendations = []

    for skill in top_missing:
        recommendations.append(
            Recommendation(
                title=f'Build strength in {skill}',
                details=f'Add hands-on projects, certificates, or real examples that show your practical experience with {skill}.'
            )
        )

    if fit_percentage < 70:
        recommendations.append(
            Recommendation(
                title='Improve job readiness',
                details='Write a stronger summary, align your experience to the job description, and include measurable wins for the most important requirements.'
            )
        )

    return recommendations[:4]


@app.get('/api/health')
def health_check() -> dict:
    return {'status': 'ok', 'service': 'HireLens API'}


@app.post('/api/match', response_model=MatchResponse)
def evaluate_match(payload: MatchingRequest):
    combined_resume = f"{payload.resume_text} {payload.about_me}"
    fit_percentage, matched_skills, missing_skills = score_match(combined_resume, payload.job_description)

    summary = (
        f'You match {fit_percentage}% of the role requirements. '
        f'{len(matched_skills)} matching skills were detected, and the biggest gaps are in {", ".join(missing_skills[:3]) if missing_skills else "your overall positioning"}.'
    )

    return MatchResponse(
        fit_percentage=fit_percentage,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        summary=summary,
        recommendations=build_recommendations(missing_skills, fit_percentage),
    )
