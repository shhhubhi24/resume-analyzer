# test_feedback.py
from gpt_suggester import get_resume_feedback

if __name__ == "__main__":
    resume_sample = """
    John Doe
    Software Developer with experience in Python, JavaScript, and React. Worked on several web apps and APIs.
    Education: B.Tech in Computer Science
    Projects: E-commerce site, Blog platform
    """
    result = get_resume_feedback(resume_sample)
    print("📝 FEEDBACK:\n", result)

