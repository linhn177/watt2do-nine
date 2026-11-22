import {handleRequest} from '../index.mjs';

export default function handler(request,response) {
  const url = new URL(request.url,'http://localhost');
  const route = url.searchParams.get('_watt2do_route');
  if (route?.startsWith('/')) request.url = route;
  return handleRequest(request,response);
}