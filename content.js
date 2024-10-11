(function() {
    // Fetch the messages from the JSON file
    fetch(chrome.runtime.getURL('messages.json'))
        .then(response => response.json())
        .then(data => {
            // Get the affirmations and quotes from the JSON data
            const affirmations = data.affirmations;
            const quotes = data.quotes;

            // Select a random affirmation from the list
            const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

            // Get the current day of the week
            const currentDay = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();

            // Select a random quote for the current day
            const randomQuote = quotes[currentDay][Math.floor(Math.random() * quotes[currentDay].length)];

            // Function to replace hostile words with friendlier alternatives
            function replaceHostileWords() {
                const replacements = {
                    "Resource": "Team Member",
                    "Hours": "Effort",
                    "Timesheet": "Time Log",
                    "Task": "Activity",
                    "Project": "Mission",
                    "Workload": "Contribution",
                    "Deadline": "Goal"
                };

                function replaceTextContent(node) {
                    let text = node.nodeValue;
                    for (let [original, replacement] of Object.entries(replacements)) {
                        const regex = new RegExp(`\\b${original}\\b`, 'gi');
                        text = text.replace(regex, replacement);
                    }
                    node.nodeValue = text;
                }

                function traverseDOM(node) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        replaceTextContent(node);
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "SCRIPT" && node.nodeName !== "STYLE") {
                        node.childNodes.forEach(traverseDOM);
                    }
                }

                // Run the replacement on the entire document body
                traverseDOM(document.body);

                // Observe for dynamic content changes and apply replacements
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach(mutation => {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                traverseDOM(node);
                            } else if (node.nodeType === Node.TEXT_NODE) {
                                replaceTextContent(node);
                            }
                        });
                    });
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }

            // Function to inject the affirmation into the "Total Hours" field
            function injectAffirmation() {
                var intervalId = setInterval(function() {
                    var targetElement = document.querySelector('div[data-dyn-controlname="TotalHours"]');
                    if (targetElement) {
                        // Create the affirmation element
                        var affirmationElement = document.createElement('div');
                        affirmationElement.textContent = randomAffirmation;
                        affirmationElement.className = 'affirmation';
                        // Set up the affirmation element as a flexbox container
                        affirmationElement.style.display = 'flex';
                        affirmationElement.style.alignItems = 'center'; // Vertically center the content
                        affirmationElement.style.justifyContent = 'flex-start'; // Align items to the left
                        affirmationElement.style.flexDirection = 'row-reverse'; // Reverse the row direction
                        affirmationElement.style.marginTop = '10px';
                        affirmationElement.style.fontSize = 'large';
                        affirmationElement.style.color = '#ff4500';
                        affirmationElement.style.animation = 'bounceIn 0.5s ease-out';

                        // Create an img element and set the base64 image
                        const imgElement = document.createElement('img');
                        imgElement.src = 'data:image/png;base64,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'; 
                        imgElement.style.width = '60px';
                        imgElement.style.height = '60px';
                        imgElement.style.marginRight = '10px'; // Add some space between image and text

                        // Append the img to the affirmation element
                        affirmationElement.appendChild(imgElement);

                        // Set additional styles for the affirmation element content
                        affirmationElement.style.backgroundSize = 'contain';
                        affirmationElement.style.backgroundRepeat = 'no-repeat';
                        // add base64 image to the affirmation element
                        // Create the donation button
                        var donateButton = document.createElement('a');
                        donateButton.href = 'https://link.philwornath.com/#donate';
                        donateButton.target = '_blank';
                        donateButton.textContent = '❤️ Support this plugin';
                        donateButton.style = 'display: block; margin-top: 5px; font-size: medium; color: #888; text-decoration: none; opacity: 0.8;';

                        // Append the affirmation element before the donation button
                        targetElement.appendChild(affirmationElement);
                        targetElement.appendChild(donateButton);

                        console.log('🌟 Affirmation:', randomAffirmation);

                        clearInterval(intervalId);
                    } else {
                        console.log('❓ Total Hours element not found, retrying...');
                    }
                }, 100);
            }


            // Function to inject the quote into the header
            function injectQuote() {
                var intervalId = setInterval(function() {
                    var targetElement = document.querySelector('div[data-dyn-controlname="Title"]');
                    if (targetElement) {
                        var styleElement = document.createElement('style');
                        styleElement.textContent = `
                            @keyframes rotatingGradient {
                                0% { background-position: 0% 50%; }
                                50% { background-position: 100% 50%; }
                                100% { background-position: 0% 50%; }
                            }
                            [data-dyn-controlname="Title"]::after {
                                content: "${randomQuote}";
                                font-size: 24px;
                                font-weight: bold;
                                background: linear-gradient(270deg, red, orange, yellow, green, blue, violet);
                                background-size: 400% 400%;
                                -webkit-background-clip: text;
                                color: transparent;
                                display: inline-block;
                                animation: rotatingGradient 4s ease infinite;
                            }
                        `;
                        document.head.appendChild(styleElement);
                        console.log('📜 Quote:', randomQuote);
                        clearInterval(intervalId);
                    }
                }, 100);
            }

            // Function to handle the streak counter and inject it into the "HeaderTitle"
            function handleStreakCounter() {
                console.log('🚀 Running handleStreakCounter...');

                const today = new Date();
                const dayOfWeek = today.getDay(); // Sunday - Saturday : 0 - 6

                // Ignore if today is Saturday (6) or Sunday (0)
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    console.log('🚫 Skipping streak count for weekend');
                    return;
                }

                const lastVisit = localStorage.getItem('lastVisitDate');
                let streakCount = parseInt(localStorage.getItem('streakCount'), 10) || 0;

                // If last visit is today, show the current streak count
                if (lastVisit === today.toDateString()) {
                    console.log('🕒 Last visit was today, no update needed.');
                    streakCount = streakCount || 1; // Ensure streak count shows at least 1
                } else {
                    // If last visit was yesterday (ignoring weekends), increment the streak
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    if (lastVisit === yesterday.toDateString() && dayOfWeek !== 1) { // If today is not Monday, increment
                        streakCount += 1;
                        console.log('✅ Streak incremented:', streakCount);
                    } else { // Reset streak
                        streakCount = 1;
                        console.log('🔄 Streak reset to 1');
                    }

                    // Update last visit to today
                    localStorage.setItem('lastVisitDate', today.toDateString());
                    console.log('🗓️ Updated last visit date:', today.toDateString());
                }

                // Store the updated streak count in localStorage
                localStorage.setItem('streakCount', streakCount);

                // Inject the streak counter after the "HeaderTitle"
                var intervalId = setInterval(function() {
                    var targetElement = document.querySelector('span[data-dyn-controlname="HeaderTitle"]');
                    if (targetElement) {
                        var styleElement = document.createElement('style');
                        styleElement.textContent = `
                            [data-dyn-controlname="HeaderTitle"]::after {
                                content: "🔥 Streak: ${localStorage.getItem('streakCount')} days!";
                                margin-left: 10px;
                                font-size: 18px;
                                color: #ff4500; /* OrangeRed text for emphasis */
                            }
                        `;
                        document.head.appendChild(styleElement);
                        console.log('🔥 Displaying streak:', localStorage.getItem('streakCount'));
                        clearInterval(intervalId);
                    } else {
                        console.log('❓ HeaderTitle not found, retrying...');
                    }
                }, 100); // Check every 100 milliseconds
            }



            // Inject both the affirmation and the quote
            injectAffirmation();
            injectQuote();
            // Handle the streak counter
            handleStreakCounter();
            // Replace hostile words with friendlier alternatives
            replaceHostileWords();
        })
        .catch(error => console.error('Error loading messages:', error));
})();
