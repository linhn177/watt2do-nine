import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {OAuth2Client} from 'google-auth-library';

const clientId = process.env.GOOGLE_SIGN_IN_CLIENT_ID?.trim() || '';
const verifier = new OAuth2Client();
const sessionSecret = process.env.WATT2DO_SESSION_SECRET;
const lifetime = 8 * 60 * 60;
const cookieName = 'watt2do_session';

function sign(value) {
  return createHmac('sha256',sessionSecret).update(value).digest('base64url');
}

function readSession(request) {
  if (!sessionSecret) return null;
  const value = (request.headers.cookie || '').match(/(?:^|;\s*)watt2do_session=([\w.-]+)(?:;|$)/)?.[1];
  if (!value) return null;
  const [payload,signature,extra] = value.split('.');
  if (!signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual,expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
    if (data.expires > Date.now() && typeof data.user?.name === 'string') return data.user;
  } catch {}
  return null;
}

function writeCookie(response, value, age) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader('Set-Cookie', `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${secure}`);
}

export async function handleAccount(request,response,{readBody,respond,RequestError}) {
  if (request.method === 'GET') {
    return respond(response,200,{clientId:sessionSecret ? clientId : '',user:readSession(request)});
  }

  if (request.headers['sec-fetch-site'] === 'cross-site' ||
      request.headers['content-type']?.split(';')[0] !== 'application/json') {
    throw new RequestError(403,'Use Watt2Do to change your sign-in.');
  }

  let input;
  try {
    input = JSON.parse((await readBody(request,16_384)).toString('utf8'));
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(400,'Invalid sign-in request.');
  }

  if (input?.action === 'sign-out') {
    writeCookie(response,'',0);
    return respond(response,200,{user:null});
  }
  if (input?.action !== 'google' || typeof input.credential !== 'string' || !input.credential) {
    throw new RequestError(400,'A Google sign-in credential is required.');
  }
  if (!clientId || !sessionSecret) throw new RequestError(503,'Google sign-in is unavailable. You can continue as a guest.');

  let profile;
  try {
    const ticket = await verifier.verifyIdToken({idToken:input.credential,audience:clientId});
    profile = ticket.getPayload();
    if (!profile?.sub) throw new Error('Missing account identifier');
  } catch {
    throw new RequestError(401,'Google sign-in could not be verified. Try again or continue as a guest.');
  }

  const user = {name:profile.name || 'Google user'};
  const session = Buffer.from(JSON.stringify({user,expires:Date.now() + lifetime * 1000,nonce:randomBytes(16).toString('hex')})).toString('base64url');
  writeCookie(response,session + '.' + sign(session),lifetime);
  return respond(response,200,{user});
}
