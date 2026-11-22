const launcher = document.getElementById('watty-launcher');
const panel = document.getElementById('watty-panel');
const close = document.getElementById('watty-close');
const log = document.getElementById('watty-log');
const form = document.getElementById('watty-form');
const input = document.getElementById('watty-input');
const send = document.getElementById('watty-send');
const questions = [];

function toggle(open) {
  panel.hidden = !open;
  launcher.setAttribute('aria-expanded',String(open));
  if (open) input.focus();
  else launcher.focus();
}
launcher.addEventListener('click',() => toggle(panel.hidden));
close.addEventListener('click',() => toggle(false));
panel.addEventListener('keydown',event => {
  if (event.key === 'Escape') toggle(false);
});

function paragraph(parent,text,tag = 'p') {
  const node = document.createElement(tag);
  node.textContent = text;
  parent.append(node);
  return node;
}

function link(parent,label,url) {
  const node = paragraph(parent,label,'a');
  node.href = url;
  return node;
}

form.addEventListener('submit',async event => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message || send.disabled) return;

  paragraph(log,'You: ' + message).className = 'watty-user';
  input.value = '';
  send.disabled = true;
  const reply = paragraph(log,'Watty is checking your question…','div');
  log.scrollTop = log.scrollHeight;
  try {
    const response = await fetch('/api/chat',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages:[...questions,message].slice(-4)})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    questions.push(message);
    if (questions.length > 3) questions.shift();

    reply.textContent = '';
    paragraph(reply,data.title,'strong');
    for (const step of data.steps) paragraph(reply,step);
    if (data.phone) link(reply,'Call ' + data.phone,'tel:' + data.phone);
    if (data.showDropoffs) {
      const dropoffs = link(reply,'Find drop-offs','#identify');
      dropoffs.addEventListener('click',() => toggle(false));
    }
  } catch {
    reply.textContent = 'Watty could not answer right now. Try again or use the disposal form.';
  } finally {
    send.disabled = false;
    log.scrollTop = log.scrollHeight;
  }
});
