document.addEventListener('DOMContentLoaded', () => {

    // Typing effect for multiple texts
    const typingEffect = (element, texts, speed) => {
        let textIndex = 0;
        let charIndex = 0;
        let currentText = '';
        let isDeleting = false;
        const interval = setInterval(() => {
            if (textIndex < texts.length) {
                if (isDeleting) {
                    currentText = texts[textIndex].substring(0, charIndex--);
                } else {
                    currentText = texts[textIndex].substring(0, charIndex++);
                }
                element.innerHTML = currentText;

                if (!isDeleting && charIndex === texts[textIndex].length) {
                    isDeleting = true;
                    setTimeout(() => { }, 1000); // Pause before deleting
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    textIndex++;
                    if (textIndex === texts.length) {
                        textIndex = 0; // Restart typing effect
                    }
                }
            }
        }, speed);
    };

    const typingElement = document.getElementById('typing-effect');
    if (typingElement) {
        typingEffect(typingElement, [
            'Welcome to my portfolio website.',
            'I am passionate about software development.',
            'Let\'s build something amazing together!'
        ], 100); // Adjust speed as needed
    }

    // Fetch and populate social icons
    const fetchSocialIcons = async () => {
        try {
            const response = await fetch('data/social.json');
            const socialData = await response.json();
            const socialIconsContainer = document.getElementById('social-icons');

            if (socialIconsContainer) {
                socialIconsContainer.innerHTML = ''; // Clear existing content
                socialData.forEach(social => {
                    const icon = document.createElement('a');
                    icon.href = social.link;
                    icon.target = '_blank';
                    icon.innerHTML = `
                        <img src="${social.icon}" alt="${social.name}" class="social-icon" title="${social.name}">
                    `;
                    socialIconsContainer.appendChild(icon);
                });
            } else {
                console.error('Social icons container not found');
            }
        } catch (error) {
            console.error('Error fetching social data:', error);
        }
    };

    fetchSocialIcons();

    // Navbar active state handler
    window.onscroll = function () {
        let sections = document.querySelectorAll("section");
        let navLinks = document.querySelectorAll(".nav-link");
        let current = "";

        sections.forEach(section => {
            let sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 50) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active");
            }
        });
    };

    const timelineItems = document.querySelectorAll('.timeline-item');

    timelineItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove active class from all items
            timelineItems.forEach(el => el.classList.remove('active'));

            // Add active class to the clicked item
            this.classList.add('active');
        });
    });

    // Timeline item click event
    const addClickListeners = () => {
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', () => {
                const details = item.querySelector('.timeline-details');
                if (details) {
                    details.classList.toggle('hidden'); // Toggle visibility
                }
            });
        });
    };

    // Fetch and populate data
    const fetchAndPopulateData = async () => {
        try {
            const [careerResponse, skillsResponse, projectsResponse, blogsResponse] = await Promise.all([
                fetch('data/career.json'),
                fetch('data/skills.json'),
                fetch('data/projects.json'),
                fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@dwivedi.ankit21')
            ]);

            const [careerData, skillsData, projectsData, blogsData] = await Promise.all([
                careerResponse.json(),
                skillsResponse.json(),
                projectsResponse.json(),
                blogsResponse.json()
            ]);

            // Populate Experience Section
            const timelineContainer = document.querySelector('.timeline-container');
            if (timelineContainer) {
                timelineContainer.innerHTML = ''; // Clear existing content
                careerData.forEach(entry => {
                    const item = document.createElement('div');
                    item.className = 'timeline-item active'; // Set default state to open
                    item.innerHTML = `
                        <div class="timeline-content">
                            <div class="timeline-header">
                                
                                <h3 class="text-xl font-semibold">${entry.position} <img src="${entry.logo}" alt="${entry.company} Logo" class="company-logo"></h3>
                                <p class="date">${entry.date}</p>
                            </div>
                            <div class="timeline-details mt-4">
                                <p>${entry.description}</p>
                            </div>
                        </div>
                    `;
                    timelineContainer.appendChild(item);
                });

                addClickListeners(); // Add click event listeners after populating
            } else {
                console.error('Timeline container not found');
            }

            // Populate Skills Section
            const skillsContainer = document.querySelector('.skills-container');
            if (skillsContainer) {
                skillsContainer.innerHTML = ''; // Clear existing content
                skillsData.forEach(skill => {
                    const skillIcon = document.createElement('div');
                    skillIcon.className = 'skill-container'; // Updated class name for container
                    skillIcon.innerHTML = `
                        <img src="${skill.icon}" alt="${skill.name}" title="${skill.name}" class="skill-icon">
                    `;
                    skillsContainer.appendChild(skillIcon);
                });
            } else {
                console.error('Skills container not found');
            }

            // Populate Projects Section
            const projectsContainer = document.querySelector('.projects-container');
            if (projectsContainer) {
                projectsContainer.innerHTML = ''; // Clear existing content
                projectsData.forEach(project => {
                    const projectItem = document.createElement('div');
                    projectItem.className = 'project-card'; // Updated class name for card
                    projectItem.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="project-card-image">
            <div class="project-card-content">
                <h3 class="project-card-title">${project.title}</h3>
                <p class="project-card-description">${project.description}</p>
                <a href="${project.link}" class="project-card-link">Learn More</a>
            </div>
        `;
                    projectsContainer.appendChild(projectItem);
                });
            } else {
                console.error('Projects container not found');
            }

            // Populate Blogs Section
            const blogsContainer = document.querySelector('.blogs-container');
            if (blogsContainer && blogsData.status === 'ok') {
                const sanitizeDescription = (description) => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = description;
                    const sanitizedText = tempDiv.textContent || tempDiv.innerText || "";
                    return sanitizedText.slice(0, 150) + "..."; // Limit to 150 characters
                };

                blogsContainer.innerHTML = ''; // Clear existing content
                blogsData.items.slice(0, 6).forEach(blog => {
                    const blogItem = document.createElement('div');
                    blogItem.className = 'blog-item';
                    blogItem.innerHTML = `
                        <h3 class="text-2xl font-bold"><a href="${blog.link}" target="_blank">${blog.title}</a></h3>
                        <p class="mt-2 text-gray-400">${new Date(blog.pubDate).toDateString()}</p>
                        <p class="mt-4 text-gray-300">${sanitizeDescription(blog.description)}</p>
                        <a href="${blog.link}" class="text-green-500 hover:underline mt-4 block">Read More</a>
                    `;
                    blogsContainer.appendChild(blogItem);
                });

                const viewAllButton = document.createElement('div');
                viewAllButton.innerHTML = `
                    <a href="https://medium.com/@dwivedi.ankit21" target="_blank" class="view-all-button text-green-500 hover:underline">
                        View All Blog Posts
                    </a>
                `;
                blogsContainer.appendChild(viewAllButton);

            } else if (!blogsContainer) {
                console.error('Blogs container not found');
            } else {
                console.error('Failed to fetch blog data');
            }

        } catch (error) {
            console.error('Error fetching or processing data:', error);
        }
    };

    fetchAndPopulateData();
});
