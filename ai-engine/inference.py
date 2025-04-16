import torch
from transformers import pipeline

# Load a pre-trained model for question-answering
qa_pipeline = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

def get_answer(question, context):
    """
    Function to get an answer from the model based on a question and context.
    """
    result = qa_pipeline(question=question, context=context)
    return result['answer']

if __name__ == "__main__":
    # Example usage
    context = "Microsoft Copilot is an AI companion that assists users with various tasks."
    question = "What is Microsoft Copilot?"
    answer = get_answer(question, context)
    print("Answer:", answer)