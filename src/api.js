import axios from 'axios';

//FOR LOCAL TESTING ALWAYS USE PORT 5001 UNLESS THE DOCKER CONTAINER IS DEPLOYED ON ANOTHER ENDPOINT


// to embed a new typed thought
// to retrieve existing thought
export const callAssistant = (query) => {
    const data = {
        query: query
    }
    return axios({method: 'POST', url: `http://127.0.0.1:8080/assistant`, data: data});
};

// to embed a new typed thought
export const sendToBackend = (input, type) => {
    const data = {
        input: input,
        type: type
    }
  return axios({method: 'POST', url: `http://127.0.0.1:8080/echo`, data: data});
};

// get calendar content
export const getCalContent = () => {
    return axios.get(`http://127.0.0.1:8080/calendarContent`);
  };

// to delete chroma entry
export const sendToDelete = (id) => {
    const data = {
        id: id
    }
    console.log("\n\n\ndeleting:", data, "\n\n\n")
    return axios({method: 'POST', url: `http://127.0.0.1:8080/delete`, data: data});
  };

// to retrieve existing thought
export const callShowEndpoint = (input, searchMode) => {
    const data = {
        searchMode: searchMode,
        input: input
    }
    return axios({method: 'POST', url: `http://127.0.0.1:8080/show`, data: data});
};

// to upload a pdf file and save it
export const callUploadEndpoint = (file) => {
const formData = new FormData();
formData.append('file', file);

return axios.post(`http://127.0.0.1:8080/upload`, formData, {
    headers: {
    'Content-Type': 'multipart/form-data'
    }
});
};

//get file from Docker
export const getFile = (filePath) => {
    console.log("getting file", filePath)
    return axios.get(`http://127.0.0.1:8080/getFile?file_path=${filePath}`);
};
// to convert the ave pdf to an image file
export const callConvertEndpoint = (filePath) => {
    return axios.post(`http://127.0.0.1:8080/convert`, { filePath });
};

// reset chroma stores
export const callReset = () => {
    return axios.post(`http://127.0.0.1:8080/reset`, {});
};

// get notion page
export const callNotion = (page) => {
    return axios.get(`http://127.0.0.1:8080/notion?page_id=${page}`);
};

// list dropbox files
export const callDropbox = (path, apiKey) => {
    console.log("path", path)
    console.log("api key", apiKey)
    return axios.get(`http://127.0.0.1:8080/list-files?folder_path=${path}&api_key=${apiKey}`);
};


