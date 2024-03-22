from flask import Flask, jsonify, request, make_response, send_from_directory, session
from flask_cors import CORS, cross_origin
import chromadb
import random
from werkzeug.utils import secure_filename
import os
import fitz
import base64
import requests
from openai import OpenAI
import datetime  
import json
import dropbox
from notion_client import Client
import ast


notion = Client(auth="api-key")
chroma_client = chromadb.PersistentClient(path="../public/chroma-store")
api_key = "api-key"



app = Flask(__name__)
app.secret_key = 'app-key'
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
CORS(app)



# ----- HELPER FUNCTIONS -----



def shadowNotes(text, path = "None"):


    concept_collection = chroma_client.get_or_create_collection(name=f"concept_collection")
    shadowNote_collection = chroma_client.get_or_create_collection(name=f"shadowNote_collection")


    prompt = """Turn any writing you are provided with into JSON dictionary containing a list of Evergreen notes extracted from the provided writing. Refer to the provided details on Evergreen notes and follow the format in the provided examples.

    <provided_details>
    *Evergreen notes* are written and organized to evolve, contribute, and accumulate over time, across projects. This is an unusual way to think about writing notes: Most people take only transient notes. That’s because these practices aren’t about writing notes; they’re about effectively developing insight: “Better note-taking” misses the point; what matters is “better thinking”. When done well, these notes can be quite valuable: Evergreen note-writing as fundamental unit of knowledge work.

    It’s hard to write notes that are worth developing over time. These principles help:

    - Evergreen notes are atomic
    - Evergreen notes are concept-oriented
    - Evergreen notes are densely-linked
    - Use associative ontologies not hierarchical taxonomies
    - Evergreen notes are statements, instructions, commands, orders, or directions
    - Associated concepts should be common concepts that will be likely to have high overlap with other Evergreen notes
    - Associated concepts are only ever singular and never plural terms. E.g. "lanaguage model" not "langauge models"
    - Associated concepts are no more than two words each
    </provided_details>

    <examples>
    [
    {
    "note": "Design is never neutral, it's always embedded with cultural values and belief systems",
    "associated_concepts": ["design", "culture", "belief system"],
    "sub_notes": []
    },
    {
    "note": "Metaphors are political tools",
    "associated_concepts": ["metaphor", "politics", "tool"],
    "sub_notes": []
    },
    {
    "note": "Our minds treat ideas as objects",
    "associated_concepts": ["minds", "idea", "object"],
    "sub_notes": []
    },
    {
    "note": "Infrastructures are never the seamless dream experience we want",
    "associated_concepts": ["infrastructure", "dream experience"],
    "sub_notes": []
    },
    {
    "note": "Insanity and deviance are culturally-bound concepts",
    "associated_concepts": ["insanity", "deviance", "culturally-bound"],
    "sub_notes": []
    }

    ]
    </examples

    <examples_with_sub_evergreen_notes>
    [
    {
    "note": "Negative capability is essential for creativity and imagination",
    "associated_concepts": ["negative capability", "creativity", "imagination"],
    "sub_notes": [
    {
    "note": "Beginner's mind is the ability to see things fresh and without preconceptions",
    "associated_concepts": ["beginner’s mind", "preconception"]
    },
    {
    "note": "Divergent thinking is the ability to generate many possible ideas and solutions",
    "associated_concepts": ["divergent thinking", "generate", "solution"]
    },
    {
    "note": "The creative power of constraints is how limitations and puzzles can spur ingenuity",
    "associated_concepts": ["creative power", "constraint", "limitation", "puzzle", "ingenuity"]
    },
    {
    "note": "Artistic detachment is the ability to let go of the personal to create universal works",
    "associated_concepts": ["artistic detachment", "letting go", "universal work"]
    },
    {
    "note": "Intellectual humility is being able to say \"I don't know\" and live with uncertainty",
    "associated_concepts": ["intellectual humility", "uncertainty"]
    }
    ]
    },
    {
    "note": "The Curse of Knowledge is a cognitive bias that causes people who are experts in a subject to have difficulty explaining it in simple terms to others",
    "associated_concepts": ["curse of knowledge", "cognitive bias", "expers"]
    "sub_notes": [
    {
    "note": "Experts often use jargon and technical terms without explaining them",
    "associated_concepts": ["expert", "jargon", "technical terminology"]
    },
    {
    "note": "People tend to think their friends and family know more than they actually do",
    "associated_concepts": ["friends and family", "knowledge"]
    },
    {
    "note": "The Curse of Knowledge makes teaching hard",
    "associated_concepts": ["curse of knowledge", "teaching"]
    }
    ]
    },
    {
    "note": "In user research and product design, user interviews are often seen as the gold standard",
    "associated_concepts": ["user research", "product design", "user interview", "gold standard"],
    "sub_notes": [
    {
    "note": "Users don't always know what they want - often what people say they want is different from what they actually need",
    "associated_concepts": ["user", "expressing desire"]
    },
    {
    "note": "what people say in an interview is often based on how they want to perceive themselves",
    "associated_concepts": ["interview", "perception"]
    },
    {
    "note": "The artificiality of interviews distorts responses",
    "associated_concepts": ["artificiality", "interview"]
    }
    ]
    }
    ]
    </examples_with_sub_evergreen_notes>

    <final_JSON_format>
    {'notes':[{'note':'','associated_concepts':['']}, {'note':'','associated_concepts':['']}, ...]}
    </final_JSON_format>
    
    """


    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4-turbo-preview",
        "messages": [
                {"role": "system", "content": prompt },
                {"role": "user", "content": text}
        ],
        "max_tokens": 1000
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    response_data = response.json()

    eg_notes = response_data['choices'][0]['message']['content']



    start_index = eg_notes.find('{')
    end_index = eg_notes.rfind('}')
    parsed_json = {}



    if start_index != -1 and end_index != -1:
        json_str = eg_notes[start_index:end_index+1]
        try:
            # Attempt to parse the JSON string
            parsed_json = json.loads(json_str)
        except json.JSONDecodeError as e:
            print("Error parsing JSON:", e)
    else:
        print("Valid JSON not found in the response.")

        

    eg_notes = parsed_json

    print("\n\n\nresponse", eg_notes)

    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    id = random.random()


    for note_entry in eg_notes["notes"]:
        note = note_entry["note"]
        associated_concepts = note_entry["associated_concepts"]
        
        for concept in associated_concepts:
            # Add each concept as a separate document to the concept collection with the note as metadata
            concept_collection.add(
                documents=[concept],
                metadatas=[{"type": "concept", "note": note, "date": current_date, "path": path}],
                ids=[str(random.random())]  # Generate a unique ID for each entry
            )
        concepts_string = ", ".join(associated_concepts)
        shadowNote_collection.add(
                documents=[note],
                metadatas=[{"type": "shadow note", "associates_concepts": concepts_string, "date": current_date, "path": path}],
                ids=[str(random.random())]  # Generate a unique ID for each entry
            )


# ----- END HELPER FUNCTIONS -----

@app.route('/')
def home():
    return jsonify({"echo": "App is alive!"})


# @app.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()  # Parse JSON data from the request body
#     username = data['username']
#     session['username'] = username
#     os.makedirs(f"./public/user_content", exist_ok=True)  # Create the directory if it does not exist
#     os.makedirs(f"./public/dropbox", exist_ok=True)
#     # Process the username as needed
#     print(session)
#     return jsonify({'message': f'Hello, {session["username"]} your internet is ready'})








@app.route('/reset', methods=['POST'])
def reset():
    chroma_client.reset()
    chroma_client.get_or_create_collection(name=f"text_collection")
    chroma_client.get_or_create_collection(name=f"file_collection")
    chroma_client.get_or_create_collection(name=f"citation_collection")
    return jsonify({'reset': 'done'})









@app.route('/calendarContent', methods=['GET'])
def calendarContent():
    text_collection = chroma_client.get_or_create_collection(name=f"text_collection")
    file_collection = chroma_client.get_or_create_collection(name=f"file_collection")
    citation_collection = chroma_client.get_or_create_collection(name=f"citation_collection")
    #data = request.get_json()
    # file_collection.delete(id)
    # citation_collection.delete(id)
    data = text_collection.get()
    print(data)
    documents = data.get('documents', [])
    metadatas = data.get('metadatas', [])
    
    transformed_data = []
    for index, metadata in enumerate(metadatas):
        # Assuming 'type' of 'text' should be mapped to 'Note', others remain as they are
        title = 'Note' if metadata.get('type') == 'text' else metadata.get('type')
        transformed_data.append({
            'id': index + 1,  # Assuming id starts at 1 and increments for each item
            'title': title,
            'date': metadata.get('date'),
            'meta': documents[index] if index < len(documents) else ''
        })
    
    return jsonify(transformed_data)









@app.route('/assistant', methods=['POST'])
def assistant():

    data = request.get_json()
    query=[data['query']]

    search_data = query_interpreter(query)
    search_data = ast.literal_eval(search_data)

    print("\n\n\n search data:", search_data, "\n\n\n")
    
    final_structure = {
        'ids': [],
        'distances': [],
        'metadatas': [],
        'documents': [],
    }
    
    for term in search_data:
        temp = rag_data(term, final_structure)
        data, status_code = temp
        final_structure = data.get_json()
   
    context_data = final_structure
    
    #group all object data into a distinct object
    max_length = max(len(context_data['ids']), len(context_data['distances']), len(context_data['documents']), len(context_data['metadatas']))
    
    reformatted_data = []
    paths = set()  
    
    for i in range(max_length):
        metadata = context_data['metadatas'][i] if i < len(context_data['metadatas']) else {}
        entry = {
            'id': context_data['ids'][i] if i < len(context_data['ids']) else None,
            'distance': context_data['distances'][i] if i < len(context_data['distances']) else None,
            'document': context_data['documents'][i] if i < len(context_data['documents']) else None,
            'metadata': context_data['metadatas'][i] if i < len(context_data['metadatas']) else {}
        }
        
        reformatted_data.append(entry)
        
        if 'path' in metadata:  # Check if 'path' exists in metadata
            last_segment = metadata['path'].rsplit('/', 1)[-1]
            paths.add(last_segment)
        else:
            paths.add("Note")
    
    context_data = reformatted_data
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4-turbo-preview",
        "messages": [
                {"role": "system", "content": f"You will be passed the JSON results of a vector search run with the provided query and your task is your respond with a response that synthesizes all information into an informative web-page that communicates all of the relevant data in the JSON. Provided query: {query}\n Context: You are a research assistant helping an academic researcher get learn and accompligh goals with the content they have collected. You are in the context of a tool they are using to manage their research content which includes PDFs, PDF annotations, and other documents. Your response will serve as the best possible a reference for all of the information and considerations they will need in order to accomplish their goal. Structure it like a web-page designed specifically to communicate the information they need. Ensure that you make distinction when refering to document content, found in the 'file details' and  'dense_summary' sections of the JSON data, versus their personal annotations, found in the 'writing' section of the JSON data. JSON objects with the same 'path' value are from the same document. Always include the annotation text when referring to it. Format your reponse using markfown formatting tags."},
                {"role": "user", "content": f"Vecor search results: {context_data}"}
        ],
        "max_tokens": 1100
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    
    response_data = response.json()
    
    return jsonify({'assistant_response': response_data['choices'][0]['message']['content'], 'paths': list(paths)})    


def query_interpreter(query):
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4-turbo-preview",
        "messages": [
                {"role": "system", "content": f"You are an expert query interpreter. You will be provided with the initial user quert and your responsibility is to construct a list of search entries that will be used to retrieve relevant content from the user's content storage. Think deeply about what related terms and concepts that will be useful and give an LLM the information is needs to help the user accomplish their goal. Respond if a list of search terms in the following format: ['term 1', 'term 2', 'term 3', ..., 'term 10']. The respone will be iterated on using a python script so the format must be exactly a list. Items will be comma separated and items will be strings.\n Your context: You are part of an AI research assistant attached to a research ub for a researcher. You have access to all the files, writing, and annotations that the researcher has created. As a research assistant your only goal is to ensure that you provide the  head researcher (user) with the information they need to accomplish their research goals. Take your time and be very detailed.\n Query structure considerations: The user's inital query may include refernces to the information they want and also what they want to do with it. Ensure that the search terms you create only reference the information they want, not what they want to do with it."},
                {"role": "user", "content": f"Initial query: {query}"}
        ],
        "max_tokens": 400
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    
    response_data = response.json()
    
    return response_data['choices'][0]['message']['content']

def rag_data(query, final_structure, searchMode = 'broad'):
    
    text_collection = chroma_client.get_or_create_collection(name="text_collection")
    file_collection = chroma_client.get_or_create_collection(name="file_collection")
    citation_collection = chroma_client.get_or_create_collection(name="citation_collection")
    
    print("Show route called")
    
    data = request.get_json()

    # Extract threshold input from the request data
    if (searchMode == 'citations'):
        results = citation_collection.query(
        query_texts=query,
        n_results=100
        )
        return results
    
    # Function to get thresholds based on searchMode
    def get_RAG_data(search_mode):
        thresholds = {
            'precise': [1.1, 1.1],
            'focused': [1.1, 1.1],
            'broad': [1.1, 1.1],
            'everything': [1.1, 1.1],
        }
        
        return thresholds.get(search_mode)  # Default to 'precise' if unknown mode

    thresholds = get_RAG_data(searchMode)

    # Use the thresholds for your search filtering logic
    # Assuming you have a way to apply these thresholds in your search
    text_threshold, file_threshold = thresholds

    text_results = text_collection.query(
        query_texts=query,
        n_results=100
    )
    
    print(text_results)

    file_results = file_collection.query(
        query_texts=query,
        n_results=100
    )
    print(file_results)

    annotation_results = citation_collection.query(
        query_texts=query,
        n_results=100
    )

    # Filter text_results and file_results separately before combining
    def filter_RAG_results(results, threshold):
        
        filtered = [
            (id, distance, metadata, document)
            for ids_group, distances_group, metadatas_group, documents_group in zip(
                results['ids'], results['distances'], results['metadatas'], results['documents']
            )
            for id, distance, metadata, document in zip(ids_group, distances_group, metadatas_group, documents_group)
            if distance <= threshold
        ]
        
        return filtered

    filtered_text_results = filter_RAG_results(text_results, text_threshold)
    filtered_file_results = filter_RAG_results(file_results, file_threshold)
    filtered_annotation_results = filter_RAG_results(annotation_results, text_threshold)


    # Combine filtered results
    combined_filtered_results = filtered_text_results + filtered_file_results + filtered_annotation_results

    # Sort combined filtered results by distance
    sorted_combined_filtered_results = sorted(combined_filtered_results, key=lambda x: x[1])

    # Reconstruct the filtered results structure to match the expected format
    final_ids = []
    final_distances = []
    final_metadatas = []
    final_documents = []

    for result in sorted_combined_filtered_results:
        final_ids.append(result[0])
        final_distances.append(result[1])
        final_metadatas.append(result[2])
        final_documents.append(result[3])

    final_structure["ids"].extend(final_ids)
    final_structure["distances"].extend(final_distances)
    final_structure["metadatas"].extend(final_metadatas)
    final_structure["documents"].extend(final_documents)

    #dedup
    final_structure["ids"] = list(dict.fromkeys(final_structure["ids"]))
    final_structure["distances"] = list(dict.fromkeys(final_structure["distances"]))
    final_structure["metadatas"] = [dict(t) for t in {tuple(d.items()) for d in final_structure["metadatas"]}]
    final_structure["documents"] = list(dict.fromkeys(final_structure["documents"]))

    print("\n\n\n", final_structure, "\n\n\n")
    return jsonify(final_structure), 200









@app.route('/delete', methods=['POST'])
def delete_entry():
    concept_collection = chroma_client.get_or_create_collection(name=f"concept_collection")
    text_collection = chroma_client.get_or_create_collection(name=f"text_collection")
    file_collection = chroma_client.get_or_create_collection(name=f"file_collection")
    citation_collection = chroma_client.get_or_create_collection(name=f"citation_collection")
    
    data = request.get_json()
    
    id=[data['id']]
    concept_collection.delete(id)
    file_collection.delete(id)
    citation_collection.delete(id)
    text_collection.delete(id)
    
    return jsonify({'delete': 'done'})








#to post a new thought to chroma
@app.route('/echo', methods=['POST'])
def echo():
    text_collection = chroma_client.get_or_create_collection(name=f"text_collection")
    file_collection = chroma_client.get_or_create_collection(name=f"file_collection")
    citation_collection = chroma_client.get_or_create_collection(name=f"citation_collection")
    
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    if request.method == 'OPTIONS':
        # Preflight request. Reply successfully:
        return jsonify({'ok': 'ok'})
    else:
        # Actual request; reply with the echo.
        id = random.random()
        
        data = request.get_json()
        
        type = data['type']
        text_collection.add(
            documents=[data['input']],
        metadatas=[{"type": type, "date": current_date}],
        
        ids=[str(id)]
        )
        
        id = id+1
        #shadowNotes(data['input'])
        return jsonify({"echo": data})
    
@app.route('/getFile', methods=["GET"])
def user_content():

    filepath = request.args.get('file_path')
    filename = filepath.rsplit('/', 1)[-1]
    folder = filepath.rsplit('/', 1)[0]
    
    return send_from_directory(folder, filename)

# to get related thought from chroma
@app.route('/show', methods=['POST'])
def show():

    shadowNote_collection = chroma_client.get_or_create_collection(name=f"shadowNote_collection")
    concept_collection = chroma_client.get_or_create_collection(name=f"concept_collection")
    text_collection = chroma_client.get_or_create_collection(name=f"text_collection")
    file_collection = chroma_client.get_or_create_collection(name=f"file_collection")
    citation_collection = chroma_client.get_or_create_collection(name=f"citation_collection")
        
    data = request.get_json()

    searchMode = data.get('searchMode')

    if (searchMode == 'citations'):
        results = citation_collection.query(
        query_texts=[data['input']],
        n_results=1000
        )
        
        return results
    
    elif (searchMode == 'concepts'):
        results = concept_collection.query(
        query_texts=[data['input']],
        n_results=1000
        )
        
        return results
    
    elif (searchMode == 'shadow-notes'):
        results = shadowNote_collection.query(
        query_texts=[data['input']],
        n_results=1000
        )
        
        return results
    
    # Function to get thresholds based on searchMode
    def get_thresholds_by_search_mode(search_mode):
        thresholds = {
            'precise': [1.50, 1.35],
            'focused': [1.65, 1.46],
            'broad': [1.77, 1.67],
            'everything': [3.0, 3.0],
        }
        return thresholds.get(search_mode)  # Default to 'precise' if unknown mode

    thresholds = get_thresholds_by_search_mode(searchMode)

    # Use the thresholds for your search filtering logic
    # Assuming you have a way to apply these thresholds in your search
    text_threshold, file_threshold = thresholds

    text_results = text_collection.query(
        query_texts=[data['input']],
        n_results=100
    )
    print(text_results)

    file_results = file_collection.query(
        query_texts=[data['input']],
        n_results=100
    )
    print(file_results)


    # Filter text_results and file_results separately before combining
    def filter_and_prepare_results(results, threshold):
        filtered = [
            (id, distance, metadata, document)
            for ids_group, distances_group, metadatas_group, documents_group in zip(
                results['ids'], results['distances'], results['metadatas'], results['documents']
            )
            for id, distance, metadata, document in zip(ids_group, distances_group, metadatas_group, documents_group)
            if distance <= threshold
        ]
        return filtered

    filtered_text_results = filter_and_prepare_results(text_results, text_threshold)
    filtered_file_results = filter_and_prepare_results(file_results, file_threshold)


    # Combine filtered results
    combined_filtered_results = filtered_text_results + filtered_file_results

    # Sort combined filtered results by distance
    sorted_combined_filtered_results = sorted(combined_filtered_results, key=lambda x: x[1])

    # Reconstruct the filtered results structure to match the expected format
    final_ids = []
    final_distances = []
    final_metadatas = []
    final_documents = []

    for result in sorted_combined_filtered_results:
        final_ids.append(result[0])
        final_distances.append(result[1])
        final_metadatas.append(result[2])
        final_documents.append(result[3])

    final_structure = {
        'ids': [final_ids],
        'distances': [final_distances],
        'metadatas': [final_metadatas],
        'documents': [final_documents],
    }

    print("\n\n\n", final_structure, "\n\n\n")
    return jsonify(final_structure), 200

# to upload a document and save it
@app.route('/upload', methods=['POST'])
@cross_origin()
def upload_file():

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    
    print("\n\n\nFile:", file, "\n\n\n")
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Updated to support both PDF and image file uploads
    allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
    
    if file and any(file.filename.endswith(ext) for ext in allowed_extensions):
        filename = secure_filename(file.filename)
        file.save(os.path.join(f"./public/user_content/", filename))
        
        return jsonify({'file_path': f"/user_content/" + filename}), 200
    
    # text = ''
    # filename = secure_filename(file.filename)
    # file_path = "./public/user_content/" + filename
    # with fitz.open('./public' + file_path) as doc:
    #     for page in doc:
    #         text += page.get_text()
    # shadowNotes(text)

    return jsonify({'error': 'Invalid file type'}), 400

# to convert a saved pdf to an image that can be interpreted by GPT to create a text version for chroma embedding
@app.route('/convert', methods=['POST'])
@cross_origin()
def convert_pdf():

    shadow_path = "./public"
    shadow_file = request.json['filePath']
    shadow_file_path = shadow_path + shadow_file
    text = ''
    with fitz.open(shadow_file_path) as doc:
        for page in doc:
            text += page.get_text()
    shadowNotes(text)
    
    file_path = request.json['filePath']
    print("\n\n\nFile path:", file_path, "\n\n\n")
    filename = os.path.basename(file_path)
    base_filename = os.path.splitext(filename)[0]
    file_extension = os.path.splitext(filename)[1]
    image_paths = []
    
    # Check if the file is a PDF, if not, skip PDF conversion
    if file_extension.lower() == '.pdf':
        image_paths = convertPDF('./public' + file_path, base_filename)
    else:
        # For image files, use the original file path
        image_path = './public' + file_path
        image_paths.append(image_path)
    
    page_number = 0
    
    for image_path in image_paths:
        encoded_image = encodeImage(image_path)
        response = packageImage(encoded_image)
        saveFile(response['choices'][0]['message']['content'], file_path, file_extension.lower(), page_number)
        page_number = page_number +1
        print(response)

    return jsonify({'al good': 'PDF pages embedded'}), 200


def saveFile(file, path, extension, page_number):
    

    text_collection = chroma_client.get_or_create_collection(name=f"text_collection")
    file_collection = chroma_client.get_or_create_collection(name=f"file_collection")
    citation_collection = chroma_client.get_or_create_collection(name=f"citation_collection")


    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    id = random.random()

    start_index = file.find('{')
    end_index = file.rfind('}')
    
    # If both '{' and '}' are found, slice the string to keep only the part between them
    if start_index != -1 and end_index != -1:
        file = file[start_index:end_index+1]
    
    print("\n\n\nfile: ", file, "\n\n\n")
    
    response = json.loads(file)
    
    print("\n\n\nresponse: ", response, "\n\n\n")
    
    
    path = "./public" + path
    
    id = random.random()
    
    # Assuming 'writing' is a list of items you want to iterate over
    for item in response['writing']:
        citation_collection.add(
            documents=[item],
            metadatas=[{"type": "Annotation", "date": current_date, "path": path, "content": "writing", "page": page_number}],
            ids=[str(id)]
        )
        
        id = random.random()  # Update id for each item
    
    if request.method == 'OPTIONS':
        # Preflight request. Reply successfully:
        return jsonify({'ok': 'ok'})
    else:
        # Actual request; reply with the echo.
        id = random.random()
        
        data = request.get_json()
        
        file_collection.add(
            documents=[file],
            metadatas=[{"type": "file", "date": current_date, "path": path, "page": page_number}],
            ids=[str(id)]
        )
        id = id+1
        
        return jsonify({"echo": data})

def convertPDF(path, base_filename):
    
    pdf_document = fitz.open(path)
    image_paths = []
    
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        pix = page.get_pixmap()
        image_path = f"./public/user_content/{base_filename}_{page_num}.png"  # Append page number to base_filename
        pix.save(image_path)
        image_paths.append(image_path)
        print(image_paths)


    return image_paths

def encodeImage(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def packageImage(encoded_image):
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Identify the hand writing and respond with a list of every piece of hand writing in the document. This section will strictly include the text of the hand writing you identify. Hand writing text will look very different than the typed text in the document, ensure that you are very precise when identifying hand writing. In a separate section, identify the most defining pieces and list them objectively in a list of 20 key terms that characterize what the text is about. In your third section you will write a dense summary of the document that minimizes information loss in as few characters as possible. This section should be no more than 1000 characters. Your response will be JSON string and have three attributes: 'writing', 'file details', and 'dense_summary', which each have a list of the relevant content. Use the example response as a structural reference. Your response will be parsed as a JSON string and must be exaclty as seen. Example response: {'writing':['cite pages 6, 4, 8 for thesis paper', 's-shaped tails', 'check this online', 'leon's peoems feel related to this. look into it'], 'file details': ['3D content creation','high-resolution Multi-View Gaussian Model', 'frame rendering','single-view prompts','efficient yet pose-agnostic representation','differentiable rendering U-Net','LGM 3D content','jane goodall, moreen trople, mao xing, lex rechil','stanford AI lab','3D backbone'], 'dense_summary': 'dense summary of the document text'}"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{encoded_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 1500
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    
    print("\n\n\nresponse", response, "\n\n\n")
    
    return response.json()

@app.route('/notion', methods=['GET'])
@cross_origin()
def notion_endpoint():
    page_id = request.args.get('page_id')
    print("\n\n\n", page_id, "\n\n\n")

    # Fetch and add the main page content to the text collection
    main_page_content, main_page_title = fetch_page_content(page_id)
    add_content_to_collection(main_page_content, page_id, main_page_title)

    # Recursively fetch sub-pages and add their content to the text collection
    fetch_sub_pages_and_add_content(page_id)

    print("\n\n\nNotion content embedded\n\n\n")
    return jsonify({"message": "Notion page and sub-pages processed successfully"})

def add_content_to_collection(content, page_id, title):
    """
    Adds the given content to the Chroma text collection if it contains more than just the title.
    - content: The content of the page, including its title.
    - page_id: The ID of the page.
    - title: The title of the page.
    """
    # Remove the title and any leading/trailing whitespace from the content
    content_without_title = content.replace(f"# {title}\n\n", "").strip()

    # Check if there is any content left after removing the title
    if content_without_title:
        current_date = datetime.datetime.now().strftime("%Y-%m-%d")
        id = random.random()
        text_collection = chroma_client.get_or_create_collection(name=f"text_collection")
        text_collection.add(
            documents=[content],
            metadatas=[{"type": "Notion", "date": current_date, "page_id": page_id}],
            ids=[str(id)]
        )
    else:
        print(f"Page {page_id} titled '{title}' contains only a title and will not be added to the collection.")

# Adjust fetch_page_content to return both content and title
def fetch_page_content(page_id):
    """
    Fetches the content of a single page, including its title, and returns both content and title.
    """
    # Fetch the page details to get the title
    page_details = notion.pages.retrieve(page_id=page_id)
    if "title" in page_details["properties"]:
        title_property = page_details["properties"]["title"]
        if "title" in title_property and title_property["title"]:
            title_content = title_property["title"][0]["plain_text"]
        else:
            title_content = "Untitled"
    else:
        title_content = "Untitled"
    
    all_text_content = f"# {title_content}\n\n"
    
    response = notion.blocks.children.list(block_id=page_id)
    blocks = response["results"]

    for block in blocks:
        if block["type"] in ["paragraph", "bulleted_list_item", "numbered_list_item"]:
            text_content = apply_markdown_formatting_to_block(block)
            all_text_content += text_content + "\n"

    return all_text_content, title_content

# Adjust fetch_sub_pages_and_add_content to use the updated fetch_page_content
def fetch_sub_pages_and_add_content(page_id, level=0):
    """
    Recursively fetches sub-pages of a given page and adds their content to the text collection if it contains more than just the title.
    """
    response = notion.blocks.children.list(block_id=page_id)
    blocks = response["results"]

    for block in blocks:
        if block["type"] == "child_page":
            sub_page_id = block["id"]
            sub_page_content, sub_page_title = fetch_page_content(sub_page_id)
            add_content_to_collection(sub_page_content, sub_page_id, sub_page_title)
            fetch_sub_pages_and_add_content(sub_page_id, level + 1)

def apply_markdown_formatting_to_block(block):
    """
    Applies Markdown formatting based on the block type and annotations.
    """
    block_type = block['type']
    rich_texts = block[block_type].get('rich_text', [])
    text_content = ""

    for rich_text in rich_texts:
        annotations = rich_text['annotations']
        plain_text = rich_text['plain_text']
        formatted_text = apply_markdown_formatting(plain_text, annotations)
        
        if block_type == "bulleted_list_item":
            text_content += f"- {formatted_text}"
        elif block_type == "numbered_list_item":
            text_content += f"1. {formatted_text}"  # Simplified numbering
        else:
            text_content += formatted_text

    return text_content

def apply_markdown_formatting(text, annotations):
    """
    Applies Markdown formatting based on the annotations of a text segment.
    """
    if annotations['bold']:
        text = f"**{text}**"
    if annotations['italic']:
        text = f"*{text}*"
    if annotations['code']:
        text = f"`{text}`"
    # Add more formatting options here as needed (e.g., strikethrough, underline, etc.)
    return text

#get dropbox files
@app.route('/list-files', methods=['GET'])
@cross_origin()
def list_files():
    user_path = request.args.get('folder_path')
    api_key = request.args.get('api_key')
    dbx = dropbox.Dropbox(api_key)
    folder_path = "/" + user_path
    print("\n\n\n", folder_path, "\n\n\n")
    try:
        files = []
        response = dbx.files_list_folder(folder_path)
        new_content = []
        # Collect initial set of files/folders
        files.extend([entry.name for entry in response.entries])

        # If there are more files/folders, continue listing them
        while response.has_more:
            response = dbx.files_list_folder_continue(response.cursor)
            files.extend([entry.name for entry in response.entries])
        for file in files:

            allowed_extensions = ('.pdf', '.jpg', '.jpeg', '.png')
            if not file.lower().endswith(allowed_extensions):
                continue
            # Extract the filename and construct the local path
            embed_path = f"./public/dropbox/{file}"
            local_file_path = f"./public/dropbox/{file}"
            filename = f"{folder_path}/{file}"

            #check if the pulled file already exists in the content folder
            if os.path.exists(local_file_path):
                print(f"File {file} already exists. Skipping download.")
                continue

            # Download the file from Dropbox
            download_file_from_dropbox(filename, local_file_path, embed_path, dbx)
            new_content.append(file)
            print("\n\n\nnew content:", new_content, "\n\n\n")
        embed_files(new_content)
        return new_content
    except dropbox.exceptions.ApiError as err:
        print(f"Failed to list files in Dropbox: {err}")
        return jsonify({"error": "Failed to list files"}), 500
    
def download_file_from_dropbox(dropbox_file_path, local_file_path, embed_path, dbx):
    try:
        # Call the Dropbox API to download the file
        metadata, res = dbx.files_download(dropbox_file_path)
        
        # Open a file in the local path with write-binary ('wb') mode
        with open(local_file_path, 'wb') as f:
            f.write(res.content)
            print("\n\n\n", embed_path, "\n\n\n")
        print(f"Downloaded '{dropbox_file_path}' to '{local_file_path}'")
        return embed_path
    except Exception as e:
        print(f"Failed to download '{dropbox_file_path}': {e}")

def embed_files(new_files):
    if len(new_files) < 1:
        return jsonify({"all good": "no new files"}), 200
    print("\n\n\nnew files: ", new_files, "\n\n\n")
    directory_path = './public/dropbox/'  # Adjust the path as needed

    try:
        # Iterate through all files in the directory
        for filename in os.listdir(directory_path):
            if filename in new_files:
                print(filename, directory_path)
                file_path = os.path.join(directory_path, filename)
                convert_pdf(file_path)
        return jsonify({"message": "Dropbox files processed successfully."})
    except Exception as e:
        print(f"Error processing PDF files: {e}")
        return jsonify({"error": "Failed to process PDF files"}), 500

def convert_pdf(file_path):
    print("\n\n\nFile path:", file_path, "\n\n\n")

    filename = os.path.basename(file_path)
    base_filename = os.path.splitext(filename)[0]
    file_extension = os.path.splitext(filename)[1]
    image_paths =[]
    # Check if the file is a PDF, if not, skip PDF conversion
    if file_extension.lower() == '.pdf':
        image_paths = convertPDF( file_path, base_filename)
        page_number = 0
        for image_path in image_paths:
            encoded_image = encodeImage(image_path)
            print("\n\n\n about to package the image \n\n\n")
            response = packageImage(encoded_image)
            saveDropboxFile(response['choices'][0]['message']['content'], file_path, file_extension.lower(), page_number)
            page_number = page_number + 1
            print(response)
    else:
        # For image files, use the original file path
        image_path =  file_path
        encoded_image = encodeImage(image_path)
        response = packageImage(encoded_image)
        saveDropboxFile(response['choices'][0]['message']['content'], file_path, file_extension.lower(), 0)
        print(response)

    # clean up storage folder of temp filesused for LLM   
    for path in image_paths:
        try:
            os.remove(path)
            print(f"Deleted file: {path}")
        except Exception as e:
            print(f"Error deleting file {path}: {e}")
    return jsonify({"all good": "PDFs embedded"}), 200

def saveDropboxFile(file, path, extension, page_number):
    text_collection = chroma_client.get_or_create_collection(name=f"text_collection")
    file_collection = chroma_client.get_or_create_collection(name=f"file_collection")
    citation_collection = chroma_client.get_or_create_collection(name=f"citation_collection")
    # Find the index of the first '{'
    start_index = file.find('{')
    # Find the index of the last '}'
    end_index = file.rfind('}')
    
    # If both '{' and '}' are found, slice the string to keep only the part between them
    if start_index != -1 and end_index != -1:
        file = file[start_index:end_index+1]
    print("\n\n\nfile: ", file, "\n\n\n")
    response = json.loads(file)
    print("\n\n\nresponse: ", response, "\n\n\n")
    print(extension)
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    print("\n\n\npath for embedding: ", path, "\n\n\n")

    id = random.random()
    # Assuming 'writing' is a list of items you want to iterate over
    for item in response['writing']:
        citation_collection.add(
            documents=[item],
            metadatas=[{"type": "Annotation", "date": current_date, "path": path, "content": "writing", "page": page_number}],
            ids=[str(id)]
        )
        id = random.random()  # Update id for each item

    if request.method == 'OPTIONS':
        # Preflight request. Reply successfully:
        return jsonify({'ok': 'ok'})
    else:
        # Actual request; reply with the echo.
        id = random.random()
        #data = request.get_json()
        file_collection.add(
            documents=[file],
            metadatas=[{"type": "Dropbox", "date": current_date, "path": path, "page": page_number}],
            ids=[str(id)]
        )
        id = id+1
        return jsonify({"echo": "embedded"})

def convertPDF(path, base_filename):
    pdf_document = fitz.open(path)
    image_paths = []
    for page_num in range(len(pdf_document)):
        page = pdf_document[page_num]
        pix = page.get_pixmap()
        image_path = f"./public/dropbox/{base_filename}_{page_num}.png"  # Append page number to base_filename
        pix.save(image_path)
        image_paths.append(image_path)
    print("\n\n\nimage paths: ", image_paths, "\n\n\n")
    return image_paths

def encodeImage(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def packageImage(encoded_image):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Identify the hand writing and respond with a list of every piece of hand writing in the document. This section will strictly include the text of the hand writing you identify. Hand writing text will look very different than the typed text in the document, ensure that you are very precise when identifying hand writing. In a separate section, identify the most defining pieces and list them objectively in a list of 20 key terms that characterize what the text is about. In your third section you will write a dense summary of the document that minimizes information loss in as few characters as possible. This section should be no more than 1000 characters. Your response will be JSON string and have three attributes: 'writing', 'file details', and 'dense_summary', which each have a list of the relevant content. Use the example response as a structural reference. Your response will be parsed as a JSON string and must be exaclty as seen. Example response: {'writing':['cite pages 6, 4, 8 for thesis paper', 's-shaped tails', 'check this online', 'leon's peoems feel related to this. look into it'], 'file details': ['3D content creation','high-resolution Multi-View Gaussian Model', 'frame rendering','single-view prompts','efficient yet pose-agnostic representation','differentiable rendering U-Net','LGM 3D content','jane goodall, moreen trople, mao xing, lex rechil','stanford AI lab','3D backbone'], 'dense_summary': 'dense summary of the document text'}"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{encoded_image}"
                        }
                    }
                ]
            }
        ],
        "max_tokens": 1500
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    print("\n\n\nresponse", response.json(), "\n\n\n")
    return response.json()



if __name__ == '__main__':
    app.run(port=8080, debug=True)