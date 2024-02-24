const fetch = require('node-fetch');
var request = require('request');


async function getPage(pageId) {
    var request = require('request');
    var options = {
    'method': 'GET',
    'url': `https://api.notion.com/v1/pages/${pageId}`,
    'headers': {
        'Notion-Version': '2022-02-22',
        'Authorization': `Bearer ${process.env.REACT_APP_NOTION_TOKEN}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': '__cf_bm=mG7Dn7O.bDkNtMbCv21PWUGa9vmyWan02q39NarvQPQ-1707095130-1-ARdOsvXJH/l1PqaI2PLYdqkdfmn5jT8rCXxiVcN8w/qeHmaSBGVaGUswQr2cdgzDbNdCLJ0k2Kfh/WSW7vSiAYE='
        }
    };
    request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    });


}

//   const url = `https://cors-anywhere.herokuapp.com/https://api.notion.com/v1/pages/${pageId}`;
//   const response = await fetch(url, {
//     method: 'GET', // Notion API requests for retrieving pages are GET requests
//     headers: {
//       'Authorization': `Bearer ${process.env.REACT_APP_NOTION_TOKEN}`, // Ensure you're using the REACT_APP_ prefix for client-side environment variables
//       'Notion-Version': '2021-05-13',
//       'X-Requested-With': 'XMLHttpRequest' // This header is often used to bypass simple CORS policies in development environments
//     }
//   }).catch(error => console.error('Error:', error));

//   if (!response.ok) {
//     throw new Error(`Error fetching Notion page: ${response.statusText}`);
//   }

//   const data = await response.json();
//   console.log(data);
//   return data; // Return the data for further processing or rendering in your application
// }

// // Ensure to export your function if it needs to be imported elsewhere

// const { Client } = require("@notionhq/client")

// // Initializing a client
// const notion = new Client({
// 	auth: process.env.NOTION_TOKEN,
// })

// const getUsers = async () => {
// 	const listUsersResponse = await notion.users.list({})
//     console.log(listUsersResponse)
//     return listUsersResponse
// }


export { getPage };

