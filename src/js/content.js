/**
 * MedWriter Enhancer - Content Script
 * Provides real-time writing enhancement for medical school applications
 */

const writingPatterns = {
    wordiness: [
        { pattern: /\bin order to\b/g, suggestion: "to" },
        { pattern: /\bat this point in time\b/g, suggestion: "now" },
        { pattern: /\bdue to the fact that\b/g, suggestion: "because" },
        { pattern: /\bin spite of the fact that\b/g, suggestion: "although" },
        { pattern: /\bfor the purpose of\b/g, suggestion: "to" },
        { pattern: /\bin the event that\b/g, suggestion: "if" },
        { pattern: /\bin the process of\b/g, suggestion: "while" },
        { pattern: /\ba large number of\b/g, suggestion: "many" },
        { pattern: /\bthe majority of\b/g, suggestion: "most" },
        { pattern: /\bin the near future\b/g, suggestion: "soon" }
    ],
    medicalClichés: [
        { pattern: /\bpassion for medicine\b/g, suggestion: "Describe specific experiences or motivations" },
        { pattern: /\bwant to help people\b/g, suggestion: "Describe specific ways you plan to contribute to healthcare" },
        { pattern: /\bsince I was young\b/g, suggestion: "Focus on recent, concrete experiences" },
        { pattern: /\balways dreamed of being a doctor\b/g, suggestion: "Focus on concrete experiences that led to your decision" },
        { pattern: /\bmake a difference\b/g, suggestion: "Describe specific impacts you want to have" },
        { pattern: /\blove science\b/g, suggestion: "Describe specific aspects of science that intrigue you" },
        { pattern: /\bhelping others\b/g, suggestion: "Describe specific instances where you've made an impact" }
    ],
    weakStatements: [
        { pattern: /\bI (?:think|believe|feel)\b/g, suggestion: "Use more confident language" },
        { pattern: /\b(?:very|really|quite)\b/g, suggestion: "Use stronger, more specific words" },
        { pattern: /\b(?:good|nice|great)\b/g, suggestion: "Use more specific, impactful adjectives" },
        { pattern: /\b(?:hopefully|maybe|possibly)\b/g, suggestion: "Use more confident language" }
    ]
};

// Medical terminology validator
const medicalTerminology = {
    commonMisspellings: {
        'aesculapian': 'Aesculapian',
        'arrythmia': 'arrhythmia',
        'austeoarthritis': 'osteoarthritis',
        'cardio-vascular': 'cardiovascular'
        // Add more medical terms as needed
    }
};

class MedWriterEnhancer {
    constructor() {
        this.sidebar = null;
        this.observer = null;
        this.lastAnalyzedText = '';
        this.analyzing = false;
        this.init();
    }

    init() {
        this.waitForDocsLoad()
            .then(() => {
                this.createSidebar();
                this.setupTextObserver();
                this.analyzeDocument();
            });
    }

    waitForDocsLoad() {
        return new Promise((resolve) => {
            const checkDocs = () => {
                const editor = document.querySelector('.docs-editor-container');
                if (editor) {
                    resolve();
                } else {
                    setTimeout(checkDocs, 1000);
                }
            };
            checkDocs();
        });
    }

    createSidebar() {
        const sidebarContainer = document.createElement('div');
        sidebarContainer.id = 'medwriter-sidebar';
        sidebarContainer.style.cssText = `
            position: fixed;
            right: 0;
            top: 0;
            width: 300px;
            height: 100vh;
            background: white;
            box-shadow: -2px 0 5px rgba(0,0,0,0.1);
            z-index: 1000;
            font-family: 'Google Sans', Arial, sans-serif;
            display: flex;
            flex-direction: column;
        `;

        sidebarContainer.innerHTML = `
            <div style="padding: 16px; border-bottom: 1px solid #e0e0e0;">
                <h2 style="margin: 0; font-size: 16px; color: #202124;">MedWriter Enhancer</h2>
            </div>
            <div id="medwriter-suggestions" style="flex: 1; overflow-y: auto; padding: 16px;"></div>
        `;

        const docsContainer = document.querySelector('.docs-editor-container');
        if (docsContainer) {
            docsContainer.appendChild(sidebarContainer);
            this.sidebar = sidebarContainer;
        }
    }

    setupTextObserver() {
        const observer = new MutationObserver(() => {
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => this.handleDocumentChange());
            } else {
                setTimeout(() => this.handleDocumentChange(), 1000);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        this.observer = observer;
    }

    handleDocumentChange() {
        if (this.analyzing) return;
        this.analyzing = true;

        clearTimeout(this._analysisTimeout);
        this._analysisTimeout = setTimeout(() => {
            this.analyzeDocument();
            this.analyzing = false;
        }, 1000);
    }

    getDocumentText() {
        const selectors = [
            '.kix-paragraphrenderer',
            '.kix-lineview-content',
            '.docs-text-content'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                return Array.from(elements)
                    .map(el => el.textContent || '')
                    .join('\n');
            }
        }

        return '';
    }

    analyzeDocument() {
        const text = this.getDocumentText();
        if (!text || text === this.lastAnalyzedText) return;

        this.lastAnalyzedText = text;
        const suggestions = [];

        Object.entries(writingPatterns).forEach(([type, patterns]) => {
            patterns.forEach(pattern => {
                let match;
                while ((match = pattern.pattern.exec(text)) !== null) {
                    suggestions.push({
                        type,
                        original: match[0],
                        suggestion: pattern.suggestion,
                        index: match.index
                    });
                }
            });
        });

        this.displaySuggestions(suggestions);
    }

    displaySuggestions(suggestions) {
        const container = document.getElementById('medwriter-suggestions');
        if (!container) return;

        if (suggestions.length === 0) {
            container.innerHTML = `
                <div style="color: #666; text-align: center; padding: 20px;">
                    No suggestions yet. Keep writing!
                </div>
            `;
            return;
        }

        const typeColors = {
            wordiness: '#1a73e8',
            medicalClichés: '#ea4335',
            weakStatements: '#fbbc04'
        };

        const typeLabels = {
            wordiness: 'Wordy Phrase',
            medicalClichés: 'Medical Cliché',
            weakStatements: 'Weak Statement'
        };

        const suggestionHTML = suggestions.map(suggestion => `
            <div style="margin-bottom: 16px; padding: 12px; border-radius: 8px; border: 1px solid #e0e0e0;">
                <div style="color: ${typeColors[suggestion.type]}; font-weight: bold; margin-bottom: 8px;">
                    ${typeLabels[suggestion.type]}
                </div>
                <div style="font-size: 14px;">
                    <strong>Found:</strong> "${suggestion.original}"<br>
                    <strong>Suggestion:</strong> ${suggestion.suggestion}
                </div>
            </div>
        `).join('');

        container.innerHTML = suggestionHTML;
    }
}

new MedWriterEnhancer(); 