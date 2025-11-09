/**
 * Resume Builder
 * Dynamically populates resume content from data/resume.json
 * Makes editing your resume as simple as updating the JSON file
 */

let resumeData = null;

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
  const about = resumeData.about;
  
  // Update name
  const nameElements = document.querySelectorAll('.navbar-brand span');
  const h1Element = document.querySelector('#about h1');
  
  if (nameElements.length > 0) {
    nameElements[0].textContent = `${about.firstName} ${about.lastName}`;
  }
  
  if (h1Element) {
    // Clear existing content
    h1Element.textContent = '';
    // Create sanitized elements
    const firstNameNode = document.createTextNode(about.firstName);
    const br = document.createElement('br');
    const span = document.createElement('span');
    span.className = 'text-primary';
    span.textContent = about.lastName;
    
    h1Element.appendChild(firstNameNode);
    h1Element.appendChild(br);
    h1Element.appendChild(span);
  }
  
  // Update bio
  const bioElement = document.querySelector('#about .lead');
  if (bioElement) {
    bioElement.textContent = about.bio;
  }
  
  // Update social links - sanitize URLs and use safe DOM methods
  const socialIconsContainer = document.querySelector('#about .social-icons');
  if (socialIconsContainer) {
    socialIconsContainer.textContent = ''; // Clear existing content
    about.socialLinks.forEach(link => {
      const a = document.createElement('a');
      a.className = 'social-icon';
      a.href = sanitizeUrl(link.url);
      a.target = '_blank';
      a.rel = 'noopener noreferrer'; // Security best practice
      a.title = sanitizeText(link.platform);
      
      const i = document.createElement('i');
      i.className = sanitizeText(link.icon);
      
      a.appendChild(i);
      socialIconsContainer.appendChild(a);
    });
  }
}

/**
 * Populate Experience section
 */
function populateExperience() {
  const experiences = resumeData.experience;
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
    h3.textContent = job.title;
    
    const subheading = document.createElement('div');
    subheading.className = 'subheading mb-3';
    subheading.textContent = `${job.company} | ${job.location}`;
    
    const ul = document.createElement('ul');
    job.responsibilities.forEach(resp => {
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
    dateSpan.textContent = `${job.startDate} - ${job.endDate}`;
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
  const skills = resumeData.skills;
  const skillsSection = document.querySelector('#skills .resume-section-content');
  
  if (!skillsSection) {
    console.error('Skills section not found');
    return;
  }
  
  // Get all ul elements in the skills section
  const allUlElements = skillsSection.querySelectorAll('ul');
  console.log(`Found ${allUlElements.length} ul elements in skills section`);
  
  // First ul is for languages
  if (allUlElements[0]) {
    console.log('Populating languages into ul[0]');
    allUlElements[0].textContent = ''; // Clear existing content
    skills.languages.forEach(lang => {
      const li = document.createElement('li');
      
      const span = document.createElement('span');
      span.className = 'fa-li';
      const icon = document.createElement('i');
      icon.className = 'fas fa-check';
      span.appendChild(icon);
      
      li.appendChild(span);
      li.appendChild(document.createTextNode(`${lang.name} · ${lang.skills} · ${lang.proficiency}`));
      
      allUlElements[0].appendChild(li);
    });
  } else {
    console.warn('ul[0] not found for languages');
  }
  
  // Second ul is for tools
  if (allUlElements[1]) {
    console.log('Populating tools into ul[1]');
    allUlElements[1].textContent = ''; // Clear existing content
    
    skills.tools.forEach(tool => {
      const li = document.createElement('li');
      li.className = 'list-inline-item';
      
      const a = document.createElement('a');
      a.href = sanitizeUrl(tool.url);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = sanitizeText(tool.name);
      
      if (tool.iconType === 'iconify') {
        li.className = 'list-inline-item iconify';
        li.setAttribute('data-icon', sanitizeText(tool.icon));
        a.appendChild(li);
        allUlElements[1].appendChild(a);
      } else {
        const icon = document.createElement('i');
        icon.className = sanitizeText(tool.icon);
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
  if (allUlElements[2]) {
    console.log('Populating workflow into ul[2]');
    allUlElements[2].textContent = ''; // Clear existing content
    
    skills.workflow.forEach(item => {
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
  
  // Create and insert sanitized paragraphs
  const p1 = document.createElement('p');
  p1.textContent = interests.summary;
  
  const p2 = document.createElement('p');
  p2.textContent = interests.details;
  
  const p3 = document.createElement('p');
  p3.className = 'mb-0';
  p3.textContent = interests.hobbies;
  
  console.log('Interests paragraphs created');
  
  if (h2) {
    h2.after(p1, p2, p3);
    console.log('Interests container after insertion:', interestsContainer.outerHTML);
  } else {
    interestsContainer.append(p1, p2, p3);
  }
}

/**
 * Initialize resume builder when DOM is ready
 */
document.addEventListener('DOMContentLoaded', loadResumeData);
