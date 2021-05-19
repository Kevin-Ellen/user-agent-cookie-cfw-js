/*
  Using Cloudflare Workers to add a specific cookie to the request to origin; the endpoint is a simple HTML page served by the worker with the full details of the request object.
*/

// Saving the pattern we want to find/test against as a lowercased string. We will be using .includes() and not RegExp for performance reasons.
const userAgentPattern = 'googlebot';

// Default event
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const handleRequest = async (request) => {
  // Save the request as a new Request
  request = new Request(request);

  // Save the user-agent string to a const
  const userAgent = request.headers.get('User-Agent') || '';

  // Set a custom cookie - so we can read it on origin or within other services and deal with it appropriately; if multiple cookies need to be set, use request.headers.append()
  request.headers.set('Set-Cookie', `is_Googlebot= ${userAgent.toLowerCase().includes(userAgentPattern)}`);

  return endPoint(request);
}

// Creation of the endpoint page
const endPoint = (request) => {
  console.log(request);

  const url = new URL(request.url);


  const html = `<!DOCTYPE html><html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Croud Cloudflare Workers - Test endpoint</title>
    <style>
      table{
        border:1px solid black;
        border-collapse:collapse;
        font-size:0.8rem;
        table-layout: fixed;
        width: 100%;
        max-width:1000px;
        word-break: break-all;
      }
      thead{
        background:rgba(0,0,0,0.3);
      }
      tbody tr:nth-of-type(even) td{
        background:rgba(0,0,0,0.1);
      }
      th:nth-of-type(1){
        width:150px;
      }
      tbody tr:hover td{
        background:rgba(0,0,0,0.15);
      }
    </style>
  </head>
  <body>
    <h1>Endpoint</h1>
    <h2>Request URL: ${url.href}</h2>
    <p>Below are all headers that were attached the request. This would be send to origin.</p>
    ${createTable(['Request header field','value'],request.headers.entries())}
  </body></html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'x-robots-tag': 'noindex'
    }
  });
}

// Quick and dirty creation of a table
const createTable = (headers,data) => {
  let str = `<table><thead><tr>`;
  for(const header of headers){
    str += `<th>${header}</th>`;
  }
  str += `</tr></thead><tbody>`;

  for(const point of data){
    str += `<tr>`;
    for(let i = 0; i < headers.length; i++){
      str += `<td>${point[i]}</td>`;
    }
    str += `</tr>`;
  }
  
  str += `</tbody></table>`;

  return str;

}