const $ = id => document.getElementById(id);
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const dateTime = value => new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const dayLabel = value => new Date(value + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
const badge = (state, text) => element('span', `badge ${state}`, text);

function latestResult(samples, id) {
  for (let i = samples.length - 1; i >= 0; i--) {
    const result = samples[i].checks.find(check => check.id === id);
    if (result) return { ...result, at: samples[i].at };
  }
  return null;
}

function renderService(check, samples, staleMs) {
  const result = latestResult(samples, check.id);
  const fresh = result && Date.now() - Date.parse(result.at) <= staleMs;
  const state = fresh ? result.status : 'unknown';
  const row = element('div', 'service');
  const top = element('div', 'service-top');
  const identity = element('div');
  const name = element(check.publicUrl ? 'a' : 'h3', 'service-name', check.name);
  if (check.publicUrl) {
    name.href = check.publicUrl;
    name.target = '_blank';
    name.rel = 'noopener noreferrer';
  }
  identity.append(name);
  if (check.description) identity.append(element('p', 'service-description', check.description));
  top.append(identity, badge(state, state === 'up' ? 'Operational' : state === 'down' ? 'Disrupted' : 'No recent data'));
  row.append(top);

  const timeline = element('div', 'timeline');
  timeline.setAttribute('role', 'img');
  timeline.setAttribute('aria-label', `Last 30 days of observations for ${check.name}`);
  let observed = 0, successful = 0;
  const today = new Date();
  for (let offset = 29; offset >= 0; offset--) {
    const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset)).toISOString().slice(0, 10);
    const checks = samples.filter(sample => sample.at.startsWith(day)).map(sample => sample.checks.find(item => item.id === check.id)).filter(Boolean);
    observed += checks.length;
    successful += checks.filter(item => item.status === 'up').length;
    const state = checks.length === 0 ? 'unknown' : checks.some(item => item.status === 'down') ? 'down' : 'up';
    const bar = element('span', `bar ${state}`);
    bar.title = `${dayLabel(day)}: ${checks.length === 0 ? 'No observations' : `${checks.filter(item => item.status === 'up').length}/${checks.length} successful checks`}`;
    timeline.append(bar);
  }
  row.append(timeline);
  const foot = element('div', 'service-foot');
  foot.append(element('span', '', '30 days ago'), element('span', '', observed ? `${(100 * successful / observed).toFixed(1)}% successful observations · ${observed} checks` : 'No observations yet'), element('span', '', 'Today'));
  row.append(foot);
  return { row, state };
}

function render({ config, history, incidents }) {
  if (config.version !== 1 || history.version !== 1 || incidents.version !== 1) throw new Error('Unsupported data version');
  const { site, groups, checks } = config;
  document.title = `${site.title} · Status`;
  $('page-title').textContent = site.title;
  $('brand-name').textContent = site.title;
  $('footer-name').textContent = site.title;
  $('description').textContent = site.description || 'Current health and recent history.';
  if (site.homeUrl) $('brand').href = site.homeUrl;
  for (const [key, value] of Object.entries(site.theme)) document.documentElement.style.setProperty(`--site-${key}`, value);

  const samples = history.samples.slice().sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const last = samples.at(-1);
  $('last-checked').textContent = last ? `Last checked ${dateTime(last.at)}` : 'Not checked yet';
  const container = $('services');
  container.replaceChildren();
  const states = [];
  const staleMs = site.staleAfterMinutes * 60000;
  for (const group of groups) {
    const entries = checks.filter(check => check.group === group.id);
    if (!entries.length) continue;
    const section = element('section', 'group');
    const heading = element('div', 'group-heading');
    const labels = element('div');
    labels.append(element('h3', '', group.name));
    if (group.description) labels.append(element('p', 'muted', group.description));
    heading.append(labels, element('span', 'group-count', `${entries.length} ${entries.length === 1 ? 'service' : 'services'}`));
    section.append(heading);
    for (const check of entries) {
      const rendered = renderService(check, samples, staleMs);
      section.append(rendered.row);
      states.push(rendered.state);
    }
    container.append(section);
  }

  const active = incidents.incidents.filter(incident => incident.status !== 'resolved');
  const overall = states.includes('down') ? 'down' : states.includes('unknown') || active.length ? 'unknown' : 'up';
  const summary = overall === 'up' ? ['All systems operational', 'All services are responding normally.'] :
    overall === 'down' ? ['Service disruption detected', 'One or more services are currently failing checks.'] :
    active.length ? ['Active incident or incomplete data', 'Review the incident updates and service health below.'] :
    ['Status data is incomplete', 'Checks have not run recently. Current health is unknown.'];
  const overview = $('overview');
  overview.className = `overview ${overall}`;
  const symbol = element('span', 'symbol', overall === 'up' ? '✓' : overall === 'down' ? '!' : '?');
  symbol.setAttribute('aria-hidden', 'true');
  const summaryText = element('span');
  summaryText.append(element('strong', '', summary[0]), element('small', '', summary[1]));
  overview.replaceChildren(symbol, summaryText);

  const incidentContainer = $('incidents');
  incidentContainer.replaceChildren();
  const ordered = incidents.incidents.slice().sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  if (!ordered.length) incidentContainer.append(element('p', 'empty', 'No incidents have been reported.'));
  for (const incident of ordered.slice(0, 10)) {
    const card = element('article', 'incident');
    const head = element('div', 'incident-head');
    head.append(element('h3', '', incident.title), badge(incident.status === 'resolved' ? 'up' : 'down', incident.status));
    card.append(head);
    const time = element('time', '', dateTime(incident.startedAt));
    time.dateTime = incident.startedAt;
    card.append(time);
    for (const update of incident.updates.slice(-3).reverse()) card.append(element('p', '', `${dateTime(update.at)} — ${update.message}`));
    incidentContainer.append(card);
  }
}

async function refresh() {
  try {
    const response = await fetch(`data/status.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    render(await response.json());
  } catch (error) {
    const overview = $('overview');
    overview.className = 'overview unknown';
    overview.textContent = 'Status data could not be loaded. Current health is unknown.';
    console.error('Status refresh failed', error);
  }
}
refresh();
setInterval(refresh, 60000);
