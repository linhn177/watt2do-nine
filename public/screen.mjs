const byId = id => document.getElementById(id);
const video = byId('camera');
const item = byId('item');
const condition = byId('condition');
const conditionReview = byId('condition-review');
const conditionChecked = byId('condition-checked');
let catalog;
let scanning;
let imageUrl;
let planRequest;
let mapRender = Promise.resolve();

function textElement(tag,text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}
function anchor(title,url) {
  const node = textElement('a',title);
  node.href = url;
  if (String(url).startsWith('https:')) {
    node.target = '_blank';
    node.rel = 'noopener noreferrer';
  }
  return node;
}
async function api(path,options) {
  const response = await fetch(path,options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

const historyLimit = 20;
const historyPreview = 3;
const historyList = byId('scan-history-list');
const historyEmpty = byId('scan-history-empty');
const historyClear = byId('scan-history-clear');
const historyMore = byId('scan-history-more');
const historyKey = 'watt2do.scanHistory.v1';
let showFullHistory = false;
let scanHistory = [];
let pendingScanEntry;

function renderScanHistory() {
  const visible = showFullHistory ? scanHistory : scanHistory.slice(0,historyPreview);
  const entries = visible.map(entry => {
    const row = textElement('li','');
    const date = new Date(entry.date);
    const time = textElement('time',date.toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'}));
    time.dateTime = date.toISOString();
    const typeLabel = [...item.options].find(option => option.value === entry.type)?.textContent || entry.type;
    const conditionLabel = [...condition.options].find(option => option.value === entry.condition)?.textContent || 'Condition unsure';
    row.append(textElement('strong',typeLabel),textElement('span',(entry.source === 'search' ? 'Condition: ' : 'Suggested condition: ') + conditionLabel),time);
    return row;
  });
  historyList.replaceChildren(...entries);
  historyEmpty.hidden = entries.length > 0;
  historyClear.hidden = entries.length === 0;
  historyMore.hidden = scanHistory.length <= historyPreview;
  historyMore.textContent = showFullHistory ? 'See less' : 'See more';
  historyMore.setAttribute('aria-expanded',String(showFullHistory));
}

try {
  const stored = JSON.parse(localStorage.getItem(historyKey) || '[]');
  if (Array.isArray(stored)) {
    scanHistory = stored.filter(entry => entry && typeof entry.type === 'string' &&
      typeof entry.condition === 'string' && Number.isFinite(entry.date) &&
      Number.isFinite(new Date(entry.date).getTime())).slice(0,historyLimit);
  }
} catch {}

function saveScanHistory() {
  try {
    localStorage.setItem(historyKey,JSON.stringify(scanHistory));
  } catch {}
  renderScanHistory();
}

function recordHistory(type,condition,source) {
  const entry = {type,condition,source,date:Date.now()};
  if (source === 'search' && pendingScanEntry?.type === type && scanHistory[0] === pendingScanEntry) {
    scanHistory.shift();
  }
  pendingScanEntry = source === 'scan' ? entry : undefined;
  scanHistory.unshift(entry);
  scanHistory.length = Math.min(scanHistory.length,historyLimit);
  saveScanHistory();
}

historyClear.addEventListener('click',() => {
  scanHistory = [];
  pendingScanEntry = undefined;
  showFullHistory = false;
  saveScanHistory();
});
historyMore.addEventListener('click',() => {
  showFullHistory = !showFullHistory;
  renderScanHistory();
});

try {
  catalog = await api('/api/options');
  for (const [label,choices] of Object.entries(catalog.groups)) {
    const group = document.createElement('optgroup');
    group.label = label;
    for (const [value,name] of Object.entries(choices)) group.append(new Option(name,value));
    item.append(group);
  }
  for (const [value,name] of Object.entries(catalog.conditions)) condition.add(new Option(name,value));
  renderScanHistory();
  byId('submit-item').disabled = false;
  byId('scan-controls').hidden = !catalog.vision;
  if (!catalog.vision) byId('scan-message').textContent = 'Camera recognition is unavailable. You can choose a type below.';
} catch {
  byId('plan-message').textContent = 'Item types could not load. Refresh to try again.';
}

function clearPlan() {
  planRequest?.abort();
  window.Watt2DoMap?.clear();
  byId('advice').hidden = true;
  byId('results').hidden = true;
  byId('map').hidden = true;
  byId('map-message').textContent = '';
  byId('plan-message').textContent = '';
  byId('place-list').replaceChildren();
}

function stopScan(message = '') {
  scanning?.controller.abort();
  scanning?.stream?.getTracks().forEach(track => track.stop());
  scanning = null;
  video.srcObject = null;
  byId('camera-box').hidden = true;
  byId('stop').hidden = true;
  byId('start').hidden = false;
  if (message) byId('scan-message').textContent = message;
}
function beginScan() {
  stopScan();
  clearPlan();
  byId('recognition').hidden = true;
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  item.value = '';
  condition.value = '';
  conditionReview.hidden = true;
  conditionChecked.checked = false;
  conditionChecked.required = false;
  scanning = {controller:new AbortController()};
  return scanning;
}
function recognize(frame,result) {
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = URL.createObjectURL(frame);
  byId('snapshot').src = imageUrl;
  byId('recognition-text').textContent = [result.description,result.markings && 'Visible label: ' + result.markings].filter(Boolean).join(' · ');
  byId('recognition').hidden = false;
  item.value = result.type === 'unsure' ? '' : result.type;
  const suggestion = Object.hasOwn(catalog.conditions,result.condition) ? result.condition : 'unsure';
  condition.value = suggestion;
  if (!['unsure','unknownBattery'].includes(result.type) &&
      [...item.options].some(option => option.value === result.type)) {
    recordHistory(result.type,suggestion,'scan');
  }
  conditionReview.hidden = false;
  conditionChecked.checked = false;
  conditionChecked.required = true;
  const note = suggestion === 'unsure' ? 'The photo cannot confirm whether the item is intact and cool.'
    : suggestion === 'intact' ? 'No visible damage found. A photo cannot tell if the item is cool.'
    : 'Photo suggestion: ' + catalog.conditions[suggestion] + (result.conditionEvidence ? ' (' + result.conditionEvidence + ').' : '.');
  byId('condition-suggestion').textContent = note + ' Check the actual item from a safe distance and correct the selection if needed. If there is smoke or fire, move away and call 911.';
}
function classify(frame,signal) {
  return api('/api/scan',{method:'POST',headers:{'Content-Type':frame.type},body:frame,signal});
}
function capture(closeUp) {
  const portion = closeUp ? 0.7 : 1;
  const width = video.videoWidth * portion;
  const height = video.videoHeight * portion;
  if (!width || !height) throw new Error('The camera did not return a frame. Try again or upload a photo.');
  const scale = Math.min(1,1600 / Math.max(width,height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d').drawImage(video,(video.videoWidth-width)/2,(video.videoHeight-height)/2,width,height,0,0,canvas.width,canvas.height);
  return new Promise((resolve,reject) => canvas.toBlob(
    blob => blob ? resolve(blob) : reject(new Error('Could not capture the camera frame.')), 'image/jpeg',.9
  ));
}

byId('start').addEventListener('click',async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    byId('scan-message').textContent = 'Open Watt2Do on localhost or HTTPS for camera access, or upload a photo.';
    return;
  }
  const session = beginScan();
  const signal = session.controller.signal;
  byId('start').hidden = true;
  byId('stop').hidden = false;
  byId('scan-message').textContent = 'Waiting for camera permission…';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1600}}});
    if (signal.aborted) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    session.stream = stream;
    for (const track of stream.getVideoTracks()) track.addEventListener('ended',() => {
      if (!signal.aborted) stopScan('Camera disconnected. Start again or upload a photo.');
    });
    video.srcObject = stream;
    byId('camera-box').hidden = false;
    await video.play();
    for (let i = 0; i < 3 && !signal.aborted; i++) {
      byId('scan-message').textContent = i === 0 ? 'Center the item in the box.' : 'Keep the label in the box and steady.';
      await new Promise(resolve => setTimeout(resolve,2000));
      if (signal.aborted) return;
      const frame = await capture(i === 1);
      if (signal.aborted) return;
      byId('scan-message').textContent = 'Checking the camera frame…';
      const suggestion = await classify(frame,signal);
      if (signal.aborted) return;
      if (suggestion.type !== 'unsure' || byId('recognition').hidden) recognize(frame,suggestion);
      if (!['unsure','unknownBattery'].includes(suggestion.type)) {
        stopScan('Check the suggested type and condition below.');
        condition.focus();
        return;
      }
    }
    if (!signal.aborted) stopScan('Scan finished. Choose or confirm the item type below.');
  } catch (error) {
    if (!signal.aborted) stopScan(error.name === 'NotAllowedError' ? 'Camera permission was denied. Upload a photo or choose a type.' : error.message);
  }
});
byId('stop').addEventListener('click',() => stopScan('Scan stopped.'));
window.addEventListener('pagehide',() => stopScan());
document.addEventListener('visibilitychange',() => {
  if (document.hidden && scanning?.stream) stopScan('Camera stopped when you left this tab.');
});
byId('photo').addEventListener('change',async event => {
  const photo = event.target.files[0];
  event.target.value = '';
  if (!photo) return;
  const {controller} = beginScan();
  byId('scan-message').textContent = 'Checking your photo…';
  try {
    const result = await classify(photo,controller.signal);
    if (controller.signal.aborted) return;
    recognize(photo,result);
    stopScan('Check the suggested type and condition below.');
  } catch (error) {
    if (!controller.signal.aborted) stopScan(error.message);
  }
});

function showAdvice(advice) {
  const box = byId('advice');
  box.className = advice.severity || '';
  const steps = document.createElement('ol');
  steps.append(...advice.steps.map(step => textElement('li',step)));
  box.replaceChildren(textElement('h3',advice.title),steps);
  if (advice.phone) {
    const phone = anchor('Call Hillsborough County at ' + advice.phone,'tel:' + advice.phone);
    phone.className = 'button secondary';
    box.append(textElement('p',advice.phoneStatus),phone);
  }
  if (advice.alternative) {
    const row = document.createElement('p');
    row.append(anchor(advice.alternative.label,advice.alternative.url));
    box.append(row);
  }
  const sources = document.createElement('details');
  sources.append(textElement('summary','Source'),anchor('Read official guidance',advice.source));
  box.append(sources);
  box.hidden = false;
}

function directions(site) {
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(site.address);
}

function showSites(sites,signal) {
  sites.forEach((site, index) => {
    const card = textElement('li','');
    card.style.cursor = 'pointer';
    card.append(textElement('h3',site.name),textElement('p',site.address),
      textElement('p',site.miles.toFixed(1) + ' mi from central Tampa · ' + site.hours),textElement('p',site.notes));
    if (site.event) card.append(textElement('p','Additional HHW event: ' + site.event + ' each month, 8 am–2 pm'));
    if (site.phone) card.append(anchor('Call ' + site.phone,'tel:' + site.phone));
    if (!site.callFirst) card.append(anchor('Directions',directions(site)));
    card.append(anchor('Acceptance details',site.source));

    card.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A' && window.Watt2DoMap) {
        window.Watt2DoMap.selectDropoff(index);
        byId('map').scrollIntoView({behavior:'smooth', block:'nearest'});
      }
    });

    byId('place-list').append(card);
  });
  if (!sites.length || !window.Watt2DoMap) return;
  const results = sites.map(site => ({
    name:site.name,address:site.address,lat:site.lat,lng:site.lng,
    distanceKm:Math.round(site.miles * 16.09344) / 10,
    hours:site.callFirst ? 'Call ahead to confirm acceptance' : site.hours
  }));
  mapRender = mapRender.then(async () => {
    if (signal?.aborted) return;
    byId('map').hidden = false;
    await window.Watt2DoMap.show('map',null,results);
    if (signal?.aborted) window.Watt2DoMap.clear();
  }).catch(() => {
    if (!signal?.aborted) byId('map').hidden = true;
  });
}

async function loadPlan() {
  if (!item.value || !condition.value || (!conditionReview.hidden && !conditionChecked.checked)) return;
  stopScan();
  clearPlan();
  planRequest = new AbortController();
  const signal = planRequest.signal;
  const selection = {type:item.value,condition:condition.value};
  byId('plan-message').textContent = 'Finding the right next step…';
  try {
    const result = await api('/api/plan',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(selection),signal
    });
    if (signal.aborted) return;
    showAdvice(result.advice);
    recordHistory(selection.type,selection.condition,'search');
    byId('plan-message').textContent = '';
    if (condition.value !== 'intact' || ['unsure','unknownBattery'].includes(item.value)) return;
    byId('results').hidden = false;
    byId('locator').hidden = !result.advice.locator;
    byId('map-message').textContent = result.sites.length
      ? result.sites.length + ' drop-off options in Hillsborough County and nearby communities.'
      : 'No matching drop-offs are listed for this item.';
    showSites(result.sites,signal);
  } catch (error) {
    if (!signal.aborted) byId('plan-message').textContent = error.message;
  }
}
for (const field of [item,condition]) field.addEventListener('change',() => {
  conditionChecked.checked = false;
  stopScan();
  clearPlan();
});
conditionChecked.addEventListener('change',() => {
  if (!conditionChecked.checked) clearPlan();
});
byId('item-form').addEventListener('submit',event => {
  event.preventDefault();
  loadPlan();
});
