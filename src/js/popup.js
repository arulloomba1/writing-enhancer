console.log('Popup script starting...');

// Writing enhancement patterns
const writingPatterns = {
    wordiness: [
        { pattern: /in order to/gi, suggestion: "to" },
        { pattern: /at this point in time/gi, suggestion: "now" },
        { pattern: /due to the fact that/gi, suggestion: "because" },
        { pattern: /in spite of the fact that/gi, suggestion: "although" },
        { pattern: /for the purpose of/gi, suggestion: "to" },
        { pattern: /in the event that/gi, suggestion: "if" },
        { pattern: /in the process of/gi, suggestion: "while" },
        { pattern: /a large number of/gi, suggestion: "many" },
        { pattern: /the majority of/gi, suggestion: "most" },
        { pattern: /in the near future/gi, suggestion: "soon" }
    ],
    cliches: [
        { pattern: /passion for medicine/gi, suggestion: "Consider describing specific experiences or motivations" },
        { pattern: /want to help people/gi, suggestion: "Consider describing specific ways you plan to contribute to healthcare" },
        { pattern: /since I was young/gi, suggestion: "Consider focusing on recent, concrete experiences" },
        { pattern: /always dreamed of being a doctor/gi, suggestion: "Consider focusing on concrete experiences that led to your decision" },
        { pattern: /make a difference/gi, suggestion: "Consider describing specific impacts you want to have" },
        { pattern: /love science/gi, suggestion: "Consider describing specific aspects of science that intrigue you" },
        { pattern: /helping others/gi, suggestion: "Consider describing specific instances where you've made an impact" }
    ],
    weak_statements: [
        // Vague Emotional Expressions
        {
            pattern: /(?:felt|feel|experienced) (?:an?|the) (?:immense|great|strong|deep) (?:amount of |sense of )?(?:concern|worry|anxiety|sadness|happiness|joy)/gi,
            suggestion: "Describe the specific thoughts, physical reactions, or actions that resulted from this emotion"
        },
        // Missed Opportunities for Detail
        {
            pattern: /(?:began to|started to) (?:believe|think|feel|realize)/gi,
            suggestion: "What specific moment or observation led to this realization?"
        },
        // Passive Voice Constructions
        {
            pattern: /(?:was|were|had been) (?:\w+ed) (?:by|from|through)/gi,
            suggestion: "Consider rewriting in active voice to emphasize who performed the action"
        },
        // Time Transitions Without Context
        {
            pattern: /(?:then|after that|later|soon|eventually|over time)/gi,
            suggestion: "Consider adding specific timeframes or meaningful transitions between events"
        },
        // Vague Descriptors
        {
            pattern: /(?:several|many|various|different|some) (?:times|people|things|ways|aspects|moments)/gi,
            suggestion: "Quantify or provide specific examples instead of using general terms"
        },
        // Unspecified Impact Statements
        {
            pattern: /(?:it|this|that) (?:made|helped|allowed|enabled) (?:me|us|them) (?:to|realize|understand|learn)/gi,
            suggestion: "Explain exactly what was learned or how understanding changed"
        },
        // Generic Observations
        {
            pattern: /(?:I|we) (?:noticed|observed|saw|watched) (?:that|how|when)/gi,
            suggestion: "What specific details did you observe? What made this observation significant?"
        },
        // Incomplete Comparisons
        {
            pattern: /(?:more|less|better|worse|different) than (?:before|usual|expected|normal)/gi,
            suggestion: "Provide specific comparisons or metrics to illustrate the difference"
        },
        // Unsubstantiated Claims
        {
            pattern: /(?:I|we) (?:knew|understood|realized) (?:that|how|what)/gi,
            suggestion: "What evidence or experience led to this understanding?"
        },
        // Missing Context
        {
            pattern: /(?:the|this|that) (?:situation|experience|event|moment)/gi,
            suggestion: "Provide more specific context about what made this particular situation significant"
        },
        // Broad Generalizations
        {
            pattern: /(?:always|never|everyone|nobody|all|none)/gi,
            suggestion: "Consider if there are exceptions or if this is truly universal - be more specific"
        },
        // Underdeveloped Relationships
        {
            pattern: /(?:worked with|helped|assisted|supported) (?:patients|people|individuals|them)/gi,
            suggestion: "Describe specific interactions or the nature of your role in more detail"
        },
        // Abstract Goals
        {
            pattern: /(?:hope to|want to|plan to|aim to) (?:become|achieve|make|create|help)/gi,
            suggestion: "What specific steps or actions will you take to achieve this goal?"
        },
        // Missed Technical Details
        {
            pattern: /(?:analyzed|studied|researched|examined) (?:the|their|its) (?:data|results|findings|outcomes)/gi,
            suggestion: "What specific methods, tools, or metrics did you use in your analysis?"
        },
        // Emotional Impact Without Context
        {
            pattern: /(?:touched|moved|inspired|motivated|encouraged) (?:by|through|from)/gi,
            suggestion: "Describe the specific aspects that created this emotional response"
        }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    const editor = document.getElementById('editor');
    const suggestionsContainer = document.getElementById('suggestions');
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    
    // Load saved text
    chrome.storage.sync.get(['savedText'], (result) => {
        if (result.savedText) {
            editor.value = result.savedText;
            analyzeText(result.savedText);
            updateCounts(result.savedText);
        }
    });

    let analysisTimeout;
    let saveTimeout;

    editor.addEventListener('input', (event) => {
        const text = event.target.value;
        
        // Update counts immediately
        updateCounts(text);

        // Clear previous timeouts
        if (analysisTimeout) clearTimeout(analysisTimeout);
        if (saveTimeout) clearTimeout(saveTimeout);

        // Set new timeout to analyze text
        analysisTimeout = setTimeout(() => {
            analyzeText(text);
        }, 300);

        // Set new timeout to save text
        saveTimeout = setTimeout(() => {
            chrome.storage.sync.set({ savedText: text });
        }, 500);
    });

    function updateCounts(text) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        wordCount.textContent = `Words: ${words}`;
        charCount.textContent = `Characters: ${chars}`;
    }

    function findMatches(text, pattern) {
        const matches = [];
        let match;
        pattern.lastIndex = 0;
        while ((match = pattern.exec(text)) !== null) {
            // Avoid duplicate matches that are too close to each other
            if (matches.length === 0 || match.index > matches[matches.length - 1].index + 10) {
                matches.push({
                    text: match[0],
                    index: match.index
                });
            }
        }
        return matches;
    }

    function analyzeText(text) {
        const suggestions = [];

        // Check for wordiness
        writingPatterns.wordiness.forEach(pattern => {
            const matches = findMatches(text, pattern.pattern);
            matches.forEach(match => {
                suggestions.push({
                    type: 'wordiness',
                    original: match.text,
                    suggestion: pattern.suggestion,
                    position: match.index
                });
            });
        });

        // Check for clichés
        writingPatterns.cliches.forEach(pattern => {
            const matches = findMatches(text, pattern.pattern);
            matches.forEach(match => {
                suggestions.push({
                    type: 'cliche',
                    original: match.text,
                    suggestion: pattern.suggestion,
                    position: match.index
                });
            });
        });

        // Check for weak statements
        writingPatterns.weak_statements.forEach(pattern => {
            const matches = findMatches(text, pattern.pattern);
            matches.forEach(match => {
                suggestions.push({
                    type: 'weak',
                    original: match.text,
                    suggestion: pattern.suggestion,
                    position: match.index
                });
            });
        });

        displaySuggestions(suggestions);
    }

    function displaySuggestions(suggestions) {
        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '<div style="color: #6c757d; padding: 12px; text-align: center; background: white; border-radius: 6px;">No suggestions yet. Try typing some text.</div>';
            return;
        }

        // Group suggestions by type
        const grouped = suggestions.reduce((acc, suggestion) => {
            if (!acc[suggestion.type]) acc[suggestion.type] = [];
            acc[suggestion.type].push(suggestion);
            return acc;
        }, {});

        const typeLabels = {
            wordiness: 'Wordy Phrase',
            cliche: 'Medical School Cliché',
            weak: 'Weak Statement'
        };

        suggestionsContainer.innerHTML = Object.entries(grouped).map(([type, items]) => `
            <div class="suggestion-group">
                ${items.map(suggestion => `
                    <div class="suggestion ${type}">
                        <strong>${typeLabels[type]}</strong>
                        <p style="margin: 4px 0">
                            Found: "${suggestion.original}"<br>
                            Suggestion: ${suggestion.suggestion}
                        </p>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    // Initial message
    suggestionsContainer.innerHTML = '<div style="color: #6c757d; padding: 12px; text-align: center; background: white; border-radius: 6px;">No suggestions yet. Try typing some text.</div>';
}); 