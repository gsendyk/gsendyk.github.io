/**
 * Resume Builder
 * Dynamically populates resume content from data/resume.json
 * Data follows the JSON Resume schema: https://jsonresume.org/schema
 * Makes editing your resume as simple as updating the JSON file
 */

let resumeData = null;

/**
 * Format an ISO 8601 date string (YYYY-MM or YYYY) for display.
 * Returns 'Present' for an empty or missing date.
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parts[1] ? parseInt(parts[1], 10) : null;
  if (month) {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }
  return String(year);
}

/**
 * Sanitize text to prevent XSS attacks
 * Escapes HTML special characters
 */
function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize URL to prevent javascript: or data: URL attacks
 */
function sanitizeUrl(url) {
  const allowedProtocols = ['http:', 'https:', 'mailto:'];
  try {
    const parsed = new URL(url, window.location.origin);
    if (allowedProtocols.includes(parsed.protocol)) {
      return url;
    }
  } catch (e) {
    // Invalid URL
  }
  return '#';
}

/**
 * Fetch and load resume data from JSON
 */
async function loadResumeData() {
  try {
    const response = await fetch('data/resume.json');
    if (!response.ok) {
      throw new Error(`Failed to load resume data: ${response.status}`);
    }
    resumeData = await response.json();
    console.log('Resume data loaded:', resumeData);
    populateResume();
  } catch (error) {
    console.error('Error loading resume data:', error);
    alert('Failed to load resume data. Check console for details.');
  }
}

/**
 * Populate all resume sections
 */
function populateResume() {
  if (!resumeData) return;
  
  console.log('Starting to populate resume...');
  populateAbout();
  console.log('About section populated');
  populateExperience();
  console.log('Experience section populated');
  populateSkills();
  console.log('Skills section populated');
  populateInterests();
  console.log('Interests section populated');
}

/**
 * Populate About section
 */
function populateAbout() {
  const basics = resumeData.basics;

  // Split full name into first and last name for styled display
  const nameParts = basics.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  // Update name
  const nameElements = document.querySelectorAll('.navbar-brand span');
  const h1Element = document.querySelector('#about h1');

  if (nameElements.length > 0) {
    nameElements[0].textContent = basics.name;
  }

  if (h1Element) {
    // Clear existing content
    h1Element.textContent = '';
    // Create sanitized elements
    const firstNameNode = document.createTextNode(firstName);
    const br = document.createElement('br');
    const span = document.createElement('span');
    span.className = 'text-primary';
    span.textContent = lastName;

    h1Element.appendChild(firstNameNode);
    h1Element.appendChild(br);
    h1Element.appendChild(span);
  }

  // Update bio/summary
  const bioElement = document.querySelector('#about .lead');
  if (bioElement) {
    bioElement.textContent = basics.summary;
  }

  // Update social links from profiles - sanitize URLs and use safe DOM methods
  const socialIconsContainer = document.querySelector('#about .social-icons');
  if (socialIconsContainer) {
    socialIconsContainer.textContent = ''; // Clear existing content
    basics.profiles.forEach(profile => {
      const a = document.createElement('a');
      a.className = 'social-icon';
      a.href = sanitizeUrl(profile.url);
      a.target = '_blank';
      a.rel = 'noopener noreferrer'; // Security best practice
      a.title = profile.network;

      const i = document.createElement('i');
      i.className = profile.icon;

      a.appendChild(i);
      socialIconsContainer.appendChild(a);
    });
  }
}

/**
 * Populate Experience section
 */
function populateExperience() {
  const experiences = resumeData.work;
  const experienceContainer = document.querySelector('#experience .resume-section-content');

  if (!experienceContainer) return;

  // Remove existing experience items (keep the h2)
  const existingItems = experienceContainer.querySelectorAll('.d-flex');
  existingItems.forEach(item => item.remove());

  // Add new experience items using safe DOM methods
  experiences.forEach((job, index) => {
    const jobDiv = document.createElement('div');
    jobDiv.className = `d-flex flex-column flex-md-row justify-content-between ${index < experiences.length - 1 ? 'mb-5' : ''}`;

    const flexGrow = document.createElement('div');
    flexGrow.className = 'flex-grow-1';

    const h3 = document.createElement('h3');
    h3.className = 'mb-0';
    h3.textContent = job.position;

    const subheading = document.createElement('div');
    subheading.className = 'subheading mb-3';
    subheading.textContent = `${job.name} | ${job.location}`;

    const ul = document.createElement('ul');
    job.highlights.forEach(resp => {
      const li = document.createElement('li');
      li.textContent = resp;
      ul.appendChild(li);
    });

    flexGrow.appendChild(h3);
    flexGrow.appendChild(subheading);
    flexGrow.appendChild(ul);

    const flexShrink = document.createElement('div');
    flexShrink.className = 'flex-shrink-0';
    const dateSpan = document.createElement('span');
    dateSpan.className = 'text-primary';
    dateSpan.textContent = `${formatDate(job.startDate)} - ${formatDate(job.endDate)}`;
    flexShrink.appendChild(dateSpan);

    jobDiv.appendChild(flexGrow);
    jobDiv.appendChild(flexShrink);
    experienceContainer.appendChild(jobDiv);
  });
}

/**
 * Populate Skills section
 */
function populateSkills() {
  const skillsSection = document.querySelector('#skills .resume-section-content');

  if (!skillsSection) {
    console.error('Skills section not found');
    return;
  }

  // Get all ul elements in the skills section
  const allUlElements = skillsSection.querySelectorAll('ul');
  console.log(`Found ${allUlElements.length} ul elements in skills section`);

  // First ul is for languages (top-level resumeData.languages)
  if (allUlElements[0] && resumeData.languages) {
    console.log('Populating languages into ul[0]');
    allUlElements[0].textContent = ''; // Clear existing content
    resumeData.languages.forEach(lang => {
      const li = document.createElement('li');

      const span = document.createElement('span');
      span.className = 'fa-li';
      const icon = document.createElement('i');
      icon.className = 'fas fa-check';
      span.appendChild(icon);

      li.appendChild(span);
      li.appendChild(document.createTextNode(`${lang.language} · ${lang.fluency}`));

      allUlElements[0].appendChild(li);
    });
  } else {
    console.warn('ul[0] not found for languages');
  }

  // Second ul is for tools
  // Find the skills entry that has a 'tools' sub-array
  const toolsSkill = resumeData.skills ? resumeData.skills.find(s => s.tools) : null;
  if (allUlElements[1] && toolsSkill) {
    console.log('Populating tools into ul[1]');
    allUlElements[1].textContent = ''; // Clear existing content

    toolsSkill.tools.forEach(tool => {
      const li = document.createElement('li');
      li.className = 'list-inline-item';

      const a = document.createElement('a');
      a.href = sanitizeUrl(tool.url);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = tool.name;

      if (tool.iconType === 'iconify') {
        // Create a span for iconify instead of using li directly
        const iconifySpan = document.createElement('span');
        iconifySpan.className = 'iconify';
        iconifySpan.setAttribute('data-icon', tool.icon);
        a.appendChild(iconifySpan);
        li.appendChild(a);
        allUlElements[1].appendChild(li);
      } else {
        const icon = document.createElement('i');
        icon.className = tool.icon;
        a.appendChild(icon);
        li.appendChild(a);
        allUlElements[1].appendChild(li);
      }
    });

    // Reinitialize Iconify if already loaded
    if (typeof Iconify !== 'undefined' && Iconify && typeof Iconify.scan === 'function') {
      try {
        Iconify.scan();
      } catch (e) {
        console.warn('Iconify scan failed:', e);
      }
    }
  } else {
    console.warn('ul[1] not found for tools');
  }

  // Third ul is for workflow
  // Find the skills entry named 'Workflow'
  const workflowSkill = resumeData.skills ? resumeData.skills.find(s => s.name === 'Workflow') : null;
  if (allUlElements[2] && workflowSkill) {
    console.log('Populating workflow into ul[2]');
    allUlElements[2].textContent = ''; // Clear existing content

    workflowSkill.keywords.forEach(item => {
      const li = document.createElement('li');

      const span = document.createElement('span');
      span.className = 'fa-li';
      const icon = document.createElement('i');
      icon.className = 'fas fa-check';
      span.appendChild(icon);
      li.appendChild(span);
      li.appendChild(document.createTextNode(item));

      allUlElements[2].appendChild(li);
    });

    console.log('Workflow ul after population:', allUlElements[2].outerHTML);
  } else {
    console.warn('ul[2] not found for workflow');
  }
}

/**
 * Populate Interests section
 */
function populateInterests() {
  const interests = resumeData.interests;
  const interestsContainer = document.querySelector('#interests .resume-section-content');

  if (!interestsContainer) {
    console.error('Interests section not found');
    return;
  }

  console.log('Interests data:', interests);

  // Get the h2 element
  const h2 = interestsContainer.querySelector('h2');

  // Clear everything after the h2
  const children = Array.from(interestsContainer.children);
  const h2Index = children.indexOf(h2);

  // Remove all elements after h2
  for (let i = children.length - 1; i > h2Index; i--) {
    children[i].remove();
  }

  // Build paragraphs from each interest's summary field
  const paragraphs = interests
    .filter(interest => interest.summary)
    .map((interest, idx, arr) => {
      const p = document.createElement('p');
      if (idx === arr.length - 1) {
        p.className = 'mb-0';
      }
      p.textContent = interest.summary;
      return p;
    });

  console.log('Interests paragraphs created');

  if (h2) {
    h2.after(...paragraphs);
    console.log('Interests container after insertion:', interestsContainer.outerHTML);
  } else {
    interestsContainer.append(...paragraphs);
  }
}

/**
 * Initialize resume builder when DOM is ready
 */
document.addEventListener('DOMContentLoaded', loadResumeData);
