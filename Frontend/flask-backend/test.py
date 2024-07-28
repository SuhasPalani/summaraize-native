import requests
from bs4 import BeautifulSoup
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import CharacterTextSplitter
from langchain.schema import Document

# Step 1: Fetch the webpage content
url = "https://www.fool.com/investing/2024/07/28/meta-platforms-ai-llama-3-point-1-game-changer/"
response = requests.get(url)

if response.status_code == 200:
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find the main content of the article
    article_content = soup.find_all('p')
    text = ' '.join(paragraph.get_text() for paragraph in article_content)
else:
    raise Exception(f"Failed to retrieve the page. Status code: {response.status_code}")

# Step 2: Create a Document object and split the content into chunks
document = Document(page_content=text)
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
chunks = text_splitter.split_documents([document])

# Debugging: Print chunk information
print(f"Number of chunks: {len(chunks)}")
for i, chunk in enumerate(chunks):
    print(f"Chunk {i}: Length = {len(chunk.page_content)}, Content: {chunk.page_content[:200]}...")  # Print the first 200 characters of each chunk

# Step 3: Create the OpenAI embedding function
embedding_function = OpenAIEmbeddings(model="text-embedding-ada-002")

# Debugging: Print to check if embedding_function is created
print("Embedding function created")

# Step 4: Load the chunks into Chroma with detailed error handling
try:
    print('entering')
    db = Chroma.from_documents(chunks, embedding_function)
    print("Chroma DB created successfully")
except AttributeError as e:
    print(f"AttributeError: {e}")
except TypeError as e:
    print(f"TypeError: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")

# Optional: Save the database to a file (if needed)
try:
    db.save("chroma_db")
    print("Chroma DB saved successfully")
except Exception as e:
    print(f"Error saving Chroma DB: {e}")

# Verify by querying
query = "What is the main topic of the article?"
try:
    result = db.similarity_search(query)
    print("Query results:")
    for r in result:
        print(r.page_content)
except Exception as e:
    print(f"Error querying Chroma DB: {e}")
