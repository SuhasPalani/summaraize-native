import re
import bs4
from bs4 import BeautifulSoup
from langchain.schema import Document
import requests
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_openai import ChatOpenAI
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ChatMessageHistory
from langchain.globals import set_llm_cache
from langchain.cache import InMemoryCache
from typing import Dict
from langchain_core.runnables.history import RunnableWithMessageHistory
from dotenv import load_dotenv
load_dotenv()


store = {}

class schemaObject(object):
    chat = ""
    question_answering_prompt = ""
    demo_ephemeral_chat_history = ""
    contextualize_q_prompt = ""
    def __init__(self,chat, question_answering_prompt,demo_ephemeral_chat_history, contextualize_q_prompt):
        self.chat = chat
        self.question_answering_prompt = question_answering_prompt
        self.demo_ephemeral_chat_history = demo_ephemeral_chat_history
        self.contextualize_q_prompt = contextualize_q_prompt

def set_bot_schema():
    chat = ChatOpenAI(model="gpt-3.5-turbo-1106")

    ### Contextualize question ###
    contextualize_q_system_prompt = """Given a chat history and the latest user question \
        which might reference context in the chat history, formulate a standalone question \
        which can be understood without the chat history. Do NOT answer the question, \
        just reformulate it if needed and otherwise return it as is."""
    
    contextualize_q_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", contextualize_q_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )

    
    #qa_prompt
    question_answering_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "Answer the user's questions based on the below context" 
                "and start the response as 'As per the source ' or 'Well, ' or without and start phrase randomly." 
                "If you do not know the answer, say 'Sorry, I do not see any reference for this in the source!':\n\n{context}",
            ),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )

    demo_ephemeral_chat_history = ChatMessageHistory()

    bot_schema = schemaObject(chat, question_answering_prompt,demo_ephemeral_chat_history, contextualize_q_prompt)

    return bot_schema


def response_retriever(url, question,session_id, bot_schema):
    print("URL not validated")
    if validate_url(url):
        data = load_data_from_web(url)
        print("Before split", data)
        vectorstore = doc_splitter(data)
        print("URL not validated")
        retriever = vectorstore.as_retriever(k=4)
        history_aware_retriever = create_history_aware_retriever(
            bot_schema.chat, retriever, bot_schema.contextualize_q_prompt
        )
        print("URL validated")
        retrieval_chain = get_retreiver_chain(history_aware_retriever, bot_schema.chat, bot_schema.question_answering_prompt)
        conversational_rag_chain = get_conversational_rag_chain(retrieval_chain)
        response = invoke_conversational_chat(conversational_rag_chain,question,session_id)
        return response
    else:
        return "Invalid news source"
    
def get_web_page_content(url):
    """Fetches content from the specified URL."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Failed to retrieve web page. Error: {e}")
        return None
    
def load_data_from_web(url):
    ### Construct retriever ###
    # loader = WebBaseLoader(
    #     web_paths=(url,),
    #     bs_kwargs=dict(
    #         parse_only=bs4.SoupStrainer(
    #             class_=("post-content", "post-title", "post-header")
    #         )
    #     ),
    # )
    # data = loader.load()
    # return data
    """Parses the HTML content to extract contemmmnt paragraphs."""
    html_content = get_web_page_content(url)
    soup = BeautifulSoup(html_content, 'html.parser')
    content_paragraphs = soup.find_all('p')
    data = '\n'.join(p.text.strip() for p in content_paragraphs)
    return data

def doc_splitter(data):
    print('spliting')
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    print('spliting1')
    document = Document(page_content=data)
    all_splits = text_splitter.split_documents([document])
    print('spliting2', all_splits)
    vectorstore = Chroma.from_documents(documents=all_splits, embedding=OpenAIEmbeddings())
    print('spliting3')
    return vectorstore

def get_retreiver_chain(history_aware_retriever, chat, question_answering_prompt):
    print('im here')

    question_answer_chain = create_stuff_documents_chain(chat, question_answering_prompt)

    retrieval_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)
    
    return retrieval_chain

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    
    print(store)
    return store[session_id]

def get_conversational_rag_chain(rag_chain):
    conversational_rag_chain = RunnableWithMessageHistory(
        rag_chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )
    return conversational_rag_chain

def invoke_conversational_chat(conversational_rag_chain,question,session_id):
    set_llm_cache(InMemoryCache())
    response = conversational_rag_chain.invoke(
    {"input": question},
    config={
        "configurable": {"session_id": session_id}
    },
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