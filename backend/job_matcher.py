# --- job_matcher.py ---
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from ollama import embeddings

# --- Load & filter dataset on module load ---
try:
    df = pd.read_csv("data/data job posts.csv")
    df = df.dropna(subset=["Title", "JobDescription"])
    df = df[df["Title"].str.contains("Engineer|Developer|Data", case=False, na=False)]
    job_data = df[["Title", "JobDescription"]].drop_duplicates().head(20)  # Limit results
except Exception as e:
    print("❌ Failed to load job data:", e)
    job_data = pd.DataFrame(columns=["Title", "JobDescription"])

# --- Embedding helper ---
async def embed_text(text: str):
    try:
        response = embeddings(model="nomic-embed-text", prompt=text)
        return response["embedding"]
    except Exception as e:
        print("❌ Embedding error:", e)
        return [0.0] * 768  # fallback dummy vector

# --- Job matching logic ---
async def match_jobs(resume_text: str):
    resume_emb = await embed_text(resume_text)
    results = []

    for _, row in job_data.iterrows():
        job_emb = await embed_text(row["JobDescription"])
        score = cosine_similarity([resume_emb], [job_emb])[0][0]
        results.append({
            "title": row["Title"],
            "score": round(score * 100, 2)
        })

    return sorted(results, key=lambda x: x["score"], reverse=True)

