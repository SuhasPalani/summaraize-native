import re
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings,OpenAI
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ChatMessageHistory
from typing import Dict
from langchain_core.runnables import RunnablePassthrough
import os

from dotenv import load_dotenv

load_dotenv()
# print(os.getenv('OPENAI_API_KEY'))
# OpenAI.api_key = os.environ['CHATGPT_API_KEY']


def set_bot_schema():
    chat = ChatOpenAI(model="gpt-3.5-turbo-1106")
    
        #prompt
    question_answering_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user's questions based on the below context" 
            "and start the response as 'As per the source'." 
            "If you do not know the answer, say 'Sorry, I do not see any reference for this in the source!':\n\n{context}",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)
    demo_ephemeral_chat_history = ChatMessageHistory()

    return chat, question_answering_prompt,demo_ephemeral_chat_history


def response_retriever(url, question, chat, question_answering_prompt,demo_ephemeral_chat_history):
    if validate_url(url):
        data = load_data_from_web(url)
        vectorstore = doc_splitter(data)
        retriever = vectorstore.as_retriever(k=4)
        retreived_docs = doc_retriever(question,retriever)
        retrieval_chain = get_retreiver_chain(retreived_docs,retriever,question, chat, question_answering_prompt,demo_ephemeral_chat_history)
        response = invoke_chain(retrieval_chain,demo_ephemeral_chat_history)

        return response
    else:
        return "Invalid news source"
    
def load_data_from_web(url):
    loader =  WebBaseLoader(url) 
    data = loader.load()
    return data

def doc_splitter(data):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    all_splits = text_splitter.split_documents(data)
    vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())
    return vectorstore

def doc_retriever(question,retriever):
    retreived_docs = retriever.invoke(question)
    return retreived_docs

def get_retreiver_chain(docs,retriever,question, chat, question_answering_prompt,demo_ephemeral_chat_history):
    print('im here')

    document_chain = create_stuff_documents_chain(chat, question_answering_prompt)

        #invoke chain

    demo_ephemeral_chat_history.add_user_message(question)

    document_chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
        "context": docs,
    }
)
    retrieval_chain = RunnablePassthrough.assign(
    context=parse_retriever_input | retriever,
).assign(
    answer=document_chain,
)
    
    return retrieval_chain

def invoke_chain(chain,chat_history):
     response = chain.invoke(
    {
        "messages": chat_history.messages,
    }
)
     return response


def validate_url(url):
    regex = re.compile(
        r'^(?:http|ftp)s?://' # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
        r'localhost|' #localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
        r'(?::\d+)?' # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    is_valid_url = re.match(regex, url) is not None
    return is_valid_url

def parse_retriever_input(params: Dict):
    return params["messages"][-1].content