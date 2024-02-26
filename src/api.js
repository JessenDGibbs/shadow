import axios from 'axios';

//FOR LOCAL TESTING ALWAYS USE PORT 5001 UNLESS THE DOCKER CONTAINER IS DEPLOYED ON ANOTHER ENDPOINT

// to embed a new typed thought
export const sendToBackend = (input) => {
  return axios.post('https://8ded-2001-569-7dbb-ca00-a448-c2b-8dc-f2dc.ngrok-free.app/echo', { input });
};

// to retrieve existing thought
export const callShowEndpoint = (input, searchMode) => {
    const data = {
        searchMode: searchMode,
        input: input
    }
    return axios({method: 'POST', url: 'https://8ded-2001-569-7dbb-ca00-a448-c2b-8dc-f2dc.ngrok-free.app/show', data: data});
};

// to upload a pdf file and save it
export const callUploadEndpoint = (file) => {
const formData = new FormData();
formData.append('file', file);

return axios.post('https://8ded-2001-569-7dbb-ca00-a448-c2b-8dc-f2dc.ngrok-free.app/upload', formData, {
    headers: {
    'Content-Type': 'multipart/form-data'
    }
});
};

//get file from Docker
export const getFile = (filePath) => {
    console.log("getting file", filePath)
    return axios.get(`https://8ded-2001-569-7dbb-ca00-a448-c2b-8dc-f2dc.ngrok-free.app/getFile?file_path=${filePath}`);
};
// to convert the ave pdf to an image file
export const callConvertEndpoint = (filePath) => {
    return axios.post('https://8ded-2001-569-7dbb-ca00-a448-c2b-8dc-f2dc.ngrok-free.app/convert', { filePath });
};

// reset chroma stores
export const callReset = () => {
    return axios.post('https://8ded-2001-569-7dbb-ca00-a448-c2b-8dc-f2dc.ngrok-free.app/reset', {});
};

// get notion page
export const callNotion = (page) => {
    return axios.get(`https://8ded-2001-569-7dbb-ca00-a448-c2b-8dc-f2dc.ngrok-free.app/notion?page_id=${page}`);
};

// list dropbox files
export const callDropbox = (path, apiKey) => {
    console.log("path", path)
    console.log("api key", apiKey)
    return axios.get(`https://8ded-2001-569-7dbb-ca00-a448-c2b-8dc-f2dc.ngrok-free.app/list-files?folder_path=${path}&api_key=${apiKey}`);
};


