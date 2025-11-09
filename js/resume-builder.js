/**
 * Resume Builder
 * Dynamically populates resume content from data/resume.json
 * Makes editing your resume as simple as updating the JSON file
 */

let resumeData = null;

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
    h1Element.innerHTML = `${about.firstName}<br><span class="text-primary">${about.lastName}</span>`;
  }
  
  // Update bio
  const bioElement = document.querySelector('#about .lead');
  if (bioElement) {
    bioElement.textContent = about.bio;
  }
  
  // Update social links
  const socialIconsContainer = document.querySelector('#about .social-icons');
  if (socialIconsContainer) {
    socialIconsContainer.innerHTML = about.socialLinks
      .map(link => `<a class="social-icon" href="${link.url}" target="_blank" title="${link.platform}"><i class="${link.icon}"></i></a>`)
      .join('');
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
  
  // Add new experience items
  experiences.forEach((job, index) => {
    const jobHTML = `
      <div class="d-flex flex-column flex-md-row justify-content-between ${index < experiences.length - 1 ? 'mb-5' : ''}">
        <div class="flex-grow-1">
          <h3 class="mb-0">${job.title}</h3>
          <div class="subheading mb-3">${job.company} | ${job.location}</div>
          <ul>
            ${job.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
          </ul>
        </div>
        <div class="flex-shrink-0"><span class="text-primary">${job.startDate} - ${job.endDate}</span></div>
      </div>
    `;
    experienceContainer.insertAdjacentHTML('beforeend', jobHTML);
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
    allUlElements[0].innerHTML = skills.languages
      .map(lang => `<li><span class="fa-li"><i class="fas fa-check"></i></span>${lang.name} &#183; ${lang.skills} &#183; ${lang.proficiency}</li>`)
      .join('');
  } else {
    console.warn('ul[0] not found for languages');
  }
  
  // Second ul is for tools
  if (allUlElements[1]) {
    console.log('Populating tools into ul[1]');
    allUlElements[1].innerHTML = skills.tools
      .map(tool => {
        if (tool.iconType === 'iconify') {
          return `<a href="${tool.url}" target="_blank" title="${tool.name}"><li class="list-inline-item iconify" data-icon="${tool.icon}"></li></a>`;
        } else {
          return `<li class="list-inline-item"><a href="${tool.url}" target="_blank" title="${tool.name}"><i class="${tool.icon}"></i></a></li>`;
        }
      })
      .join('');
    
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
    const workflowHTML = skills.workflow
      .map(item => `<li><span class="fa-li"><i class="fas fa-check"></i></span>${item}</li>`)
      .join('');
    console.log('Workflow HTML:', workflowHTML);
    allUlElements[2].innerHTML = workflowHTML;
    console.log('Workflow ul after setting innerHTML:', allUlElements[2].outerHTML);
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
  
  // Insert the paragraphs after h2
  const paragraphsHTML = `
    <p>${interests.summary}</p>
    <p>${interests.details}</p>
    <p class="mb-0">${interests.hobbies}</p>
  `;
  
  console.log('Interests HTML to insert:', paragraphsHTML);
  
  if (h2) {
    h2.insertAdjacentHTML('afterend', paragraphsHTML);
    console.log('Interests container after insertion:', interestsContainer.outerHTML);
  } else {
    interestsContainer.innerHTML += paragraphsHTML;
  }
}

/**
 * Initialize resume builder when DOM is ready
 */
document.addEventListener('DOMContentLoaded', loadResumeData);
