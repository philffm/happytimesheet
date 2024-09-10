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
                        var styleElement = document.createElement('style');
                        styleElement.textContent = `
                            @keyframes bounceIn {
                                0% { transform: scale(0.5); opacity: 0; }
                                60% { transform: scale(1.1); opacity: 1; }
                                100% { transform: scale(1); }
                            }
                            div[data-dyn-controlname="TotalHours"]::after {
                                content: "${randomAffirmation}";
                                display: block;
                                margin-top: 10px;
                                font-size: large;
                                color: #ff4500; /* OrangeRed text for emphasis */
                                animation: bounceIn 0.5s ease-out;
                            }
                        `;
                        document.head.appendChild(styleElement);
                        console.log('🌟 Affirmation:', randomAffirmation);
                        clearInterval(intervalId);
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
