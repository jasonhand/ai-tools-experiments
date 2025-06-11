class QuizGame {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.timeLeft = 30;
        this.gameSettings = {
            difficulty: 'medium',
            questionCount: 5
        };
        this.timer = null;
        this.gameStartTime = null;
        this.questionStartTime = null;
        this.answered = false;
        
        this.initializeEventListeners();
        this.loadQuizData();
    }

    async loadQuizData() {
        try {
            const response = await fetch('quiz-dataset.json');
            const data = await response.json();
            this.allQuestions = data.questions;
            console.log(`Loaded ${this.allQuestions.length} questions`);
        } catch (error) {
            console.error('Error loading quiz data:', error);
            this.showError('Failed to load quiz questions. Please refresh the page.');
        }
    }


    initializeEventListeners() {
        // Start screen
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('view-leaderboard').addEventListener('click', () => this.showLeaderboard());
        
        // Results screen
        document.getElementById('play-again').addEventListener('click', () => this.resetGame());
        document.getElementById('view-leaderboard-results').addEventListener('click', () => this.showLeaderboard());
        
        // Leaderboard screen
        const backToMenuBtn = document.getElementById('back-to-menu');
        const clearLeaderboardBtn = document.getElementById('clear-leaderboard');
        
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => this.showStartScreen());
        }
        if (clearLeaderboardBtn) {
            clearLeaderboardBtn.addEventListener('click', () => this.clearLeaderboard());
        }
        
        // Leaderboard filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterLeaderboard(e.target.dataset.filter);
            });
        });
        
        
        // Feedback modal
        document.getElementById('next-question').addEventListener('click', () => this.nextQuestion());
    }

    startGame() {
        // Get player name from start screen
        const nameInput = document.getElementById('player-name-start');
        const rawName = nameInput.value.trim();
        
        if (!rawName) {
            alert('Please enter your name to start the quiz!');
            nameInput.focus();
            return;
        }
        
        // Just basic length check - no content filtering
        if (rawName.length > 50) {
            alert('Please enter a shorter name (50 characters max)');
            nameInput.focus();
            return;
        }
        
        this.playerName = rawName;
        this.resetGameState();
        this.selectQuestions();
        this.gameStartTime = Date.now();
        this.showGameScreen();
        this.loadQuestion();
    }

    generateDisplayName(fullName, timestamp) {
        // Get first letter (or fallback to '?')
        const firstLetter = fullName.charAt(0).toUpperCase() || '?';
        
        // Array of emojis for unique identification
        const emojis = [
            '🎮', '🚀', '⭐', '🌟', '💎', '🔥', '⚡', '🎯', '🏆', '🎪',
            '🎨', '🎭', '🎪', '🎺', '🎸', '🎹', '🥁', '🎤', '🎧', '🎬',
            '🍕', '🍔', '🍟', '🍦', '🍪', '🍰', '🧁', '🍎', '🍌', '🍇',
            '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥊', '🎳',
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
            '🌺', '🌻', '🌹', '🌷', '🌸', '🌼', '🌿', '🍀', '🌵', '🌲',
            '🎈', '🎁', '🎉', '🎊', '🎀', '🎂', '🎄', '🎋', '🎍', '🎌'
        ];
        
        // Generate a consistent emoji based on name and timestamp
        const hash = this.simpleHash(fullName + timestamp);
        const emojiIndex = hash % emojis.length;
        const emoji = emojis[emojiIndex];
        
        return `${firstLetter}${emoji}`;
    }
    
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    resetGameState() {
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.answered = false;
        this.timeLeft = 30;
    }

    selectQuestions() {
        // Always filter for multiple choice questions only
        let filteredQuestions = this.allQuestions.filter(q => q.type === 'multiple-choice');
        
        // Shuffle and select required number
        filteredQuestions = this.shuffleArray(filteredQuestions);
        this.questions = filteredQuestions.slice(0, this.gameSettings.questionCount);
        
        console.log(`Selected ${this.questions.length} multiple choice questions`);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    loadQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.endGame();
            return;
        }

        const question = this.questions[this.currentQuestion];
        this.answered = false;
        this.questionStartTime = Date.now();
        
        // Update UI
        this.updateGameStats();
        this.updateProgressBar();
        this.displayQuestion(question);
        this.startTimer();
    }

    displayQuestion(question) {
        // Update question metadata
        document.getElementById('episode-tag').textContent = `Episode ${question.episode}`;
        document.getElementById('question-type').textContent = 'Multiple Choice';
        document.getElementById('question-text').textContent = question.question;
        
        // Display tools
        this.displayTools(question.tools, 'question-tools');
        
        // Clear previous answers and display multiple choice options
        document.getElementById('answer-options').innerHTML = '';
        this.displayMultipleChoice(question);
    }

    displayMultipleChoice(question) {
        const container = document.getElementById('answer-options');
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-option';
            button.textContent = option;
            button.addEventListener('click', () => this.selectAnswer(index));
            container.appendChild(button);
        });
    }


    selectAnswer(answer) {
        if (this.answered) return;
        
        this.answered = true;
        this.stopTimer();
        
        const question = this.questions[this.currentQuestion];
        const isCorrect = this.checkAnswer(question, answer);
        
        // Visual feedback for multiple choice
        const buttons = document.querySelectorAll('.answer-option');
        buttons.forEach((btn, index) => {
            if (index === question.correctAnswer) {
                btn.classList.add('correct');
            } else if (index === answer && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // Calculate and add score
        const points = this.calculatePoints(isCorrect);
        if (isCorrect) {
            this.correctAnswers++;
            this.score += points;
        }
        
        // Show feedback
        setTimeout(() => {
            this.showFeedback(question, isCorrect, points);
        }, 1000);
    }


    checkAnswer(question, answer) {
        return answer === question.correctAnswer;
    }

    calculatePoints(isCorrect) {
        if (!isCorrect) return 0;
        
        let points = 100; // Base points for multiple choice questions
        
        // Time bonus (faster answers get more points)
        const timeBonus = Math.floor((this.timeLeft / 30) * 50);
        points += timeBonus;
        
        // Standard difficulty multiplier
        points = Math.floor(points * 1.2);
        
        return points;
    }

    showFeedback(question, isCorrect, points) {
        const modal = document.getElementById('feedback-modal');
        const result = document.getElementById('feedback-result');
        const pointsDisplay = document.getElementById('feedback-points');
        const explanation = document.getElementById('feedback-text');
        
        result.textContent = isCorrect ? 'Correct!' : 'Incorrect';
        result.className = `feedback-result ${isCorrect ? 'correct' : 'incorrect'}`;
        
        pointsDisplay.textContent = isCorrect ? `+${points} points` : '0 points';
        explanation.textContent = question.explanation;
        
        this.displayTools(question.tools, 'feedback-tools');
        
        modal.classList.add('active');
    }

    displayTools(tools, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        tools.forEach(tool => {
            const tag = document.createElement('span');
            tag.className = 'tool-tag';
            tag.textContent = tool;
            container.appendChild(tag);
        });
    }

    nextQuestion() {
        document.getElementById('feedback-modal').classList.remove('active');
        this.currentQuestion++;
        this.loadQuestion();
    }

    startTimer() {
        this.timeLeft = 30;
        
        // Start the liquid filling animation
        const questionContainer = document.querySelector('.question-content');
        questionContainer.classList.add('timer-active');
        
        // Create bubble elements
        this.createBubbles(questionContainer);
        
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 5) {
                questionContainer.classList.add('timer-warning');
            }
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    createBubbles(container) {
        // Remove any existing bubbles
        const existingBubbles = container.querySelectorAll('.liquid-bubble');
        existingBubbles.forEach(bubble => bubble.remove());
        
        // Define all bubble classes with marquee light colors
        const bubbleClasses = [
            // Blue bubbles
            'bubble-blue-1', 'bubble-blue-2', 'bubble-blue-3',
            // Pink bubbles
            'bubble-pink-1', 'bubble-pink-2', 'bubble-pink-3',
            // Turquoise bubbles
            'bubble-turquoise-1', 'bubble-turquoise-2', 'bubble-turquoise-3',
            // Purple bubbles
            'bubble-purple-1', 'bubble-purple-2', 'bubble-purple-3',
            // Orange bubbles
            'bubble-orange-1', 'bubble-orange-2', 'bubble-orange-3',
            // Small bubbles
            'bubble-small-1', 'bubble-small-2', 'bubble-small-3', 
            'bubble-small-4', 'bubble-small-5', 'bubble-small-6',
            // Micro bubbles
            'bubble-micro-1', 'bubble-micro-2', 'bubble-micro-3'
        ];
        
        // Create all the colorful bubbles
        bubbleClasses.forEach(bubbleClass => {
            const bubble = document.createElement('div');
            bubble.className = `liquid-bubble ${bubbleClass}`;
            container.appendChild(bubble);
        });
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Stop the liquid filling animation and remove bubbles
        const questionContainer = document.querySelector('.question-content');
        questionContainer.classList.remove('timer-active', 'timer-warning');
        
        // Remove bubbles
        const bubbles = questionContainer.querySelectorAll('.liquid-bubble');
        bubbles.forEach(bubble => bubble.remove());
    }

    updateTimerDisplay() {
        // Update the header timer display (keeping the number in header for reference)
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
        }
    }

    timeUp() {
        if (this.answered) return;
        
        this.answered = true;
        this.stopTimer();
        
        const question = this.questions[this.currentQuestion];
        setTimeout(() => {
            this.showFeedback(question, false, 0);
        }, 500);
    }

    updateGameStats() {
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('question-counter').textContent = 
            `${this.currentQuestion + 1}/5`;
    }

    updateProgressBar() {
        const progress = ((this.currentQuestion) / this.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }

    endGame() {
        this.stopTimer();
        this.showResultsScreen();
    }

    showResultsScreen() {
        this.hideAllScreens();
        document.getElementById('results-screen').classList.add('active');
        
        const accuracy = Math.round((this.correctAnswers / this.questions.length) * 100);
        const timeBonus = this.calculateTimeBonus();
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('correct-answers').textContent = 
            `${this.correctAnswers}/${this.questions.length}`;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        document.getElementById('time-bonus').textContent = timeBonus;
        
        this.generatePerformanceBreakdown();
        
        // Automatically save the score
        this.autoSaveScore();
    }

    calculateTimeBonus() {
        const totalTime = Date.now() - this.gameStartTime;
        const expectedTime = this.questions.length * 30000; // 30 seconds per question
        const timeSaved = Math.max(0, expectedTime - totalTime);
        return Math.floor(timeSaved / 1000);
    }

    generatePerformanceBreakdown() {
        const container = document.getElementById('performance-breakdown');
        container.innerHTML = '<h3>Performance Breakdown</h3>';
        
        const breakdown = document.createElement('div');
        breakdown.innerHTML = `
            <p>Great job! You've completed the AI Tools Lab Quiz Challenge.</p>
            <p>Your performance shows good knowledge of AI tools and development practices.</p>
        `;
        container.appendChild(breakdown);
    }

    autoSaveScore() {
        const fullName = this.playerName || 'Anonymous';
        const timestamp = Date.now();
        
        const scoreEntry = {
            name: fullName, // Keep full name for internal use
            displayName: this.generateDisplayName(fullName, timestamp),
            score: this.score,
            accuracy: Math.round((this.correctAnswers / this.questions.length) * 100),
            correctAnswers: this.correctAnswers,
            totalQuestions: this.questions.length,
            difficulty: this.gameSettings.difficulty,
            date: new Date().toISOString(),
            timestamp: timestamp
        };
        
        this.addToLeaderboard(scoreEntry);
        
        // Show confirmation message
        this.showScoreSavedMessage();
    }
    
    showScoreSavedMessage() {
        const resultsContent = document.querySelector('.results-content h2');
        const originalText = resultsContent.textContent;
        resultsContent.textContent = 'Quiz Complete! Score Saved to Leaderboard!';
        resultsContent.style.color = '#48bb78';
        
        setTimeout(() => {
            resultsContent.textContent = originalText;
            resultsContent.style.color = '';
        }, 3000);
    }

    addToLeaderboard(scoreEntry) {
        let leaderboard = JSON.parse(localStorage.getItem('quiz-leaderboard') || '[]');
        leaderboard.push(scoreEntry);
        
        // Sort by score (descending)
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Keep only top 100 scores
        leaderboard = leaderboard.slice(0, 100);
        
        localStorage.setItem('quiz-leaderboard', JSON.stringify(leaderboard));
    }

    showLeaderboard() {
        this.hideAllScreens();
        document.getElementById('leaderboard-screen').classList.add('active');
        this.loadLeaderboard();
        
        // Ensure event listeners are attached when leaderboard is shown
        this.setupLeaderboardEventListeners();
    }

    loadLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('quiz-leaderboard') || '[]');
        this.displayLeaderboard(leaderboard);
    }

    displayLeaderboard(scores) {
        const tbody = document.getElementById('leaderboard-body');
        tbody.innerHTML = '';
        
        if (scores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">No scores yet. Be the first to play!</td></tr>';
            return;
        }
        
        scores.slice(0, 20).forEach((score, index) => {
            const row = document.createElement('tr');
            const date = new Date(score.date).toLocaleDateString();
            
            let rankDisplay = index + 1;
            if (index < 3) {
                rankDisplay = `<span class="rank-medal rank-${index + 1}">${index + 1}</span>`;
            }
            
            // Use displayName if available, otherwise generate one from existing data
            let displayName = score.displayName;
            if (!displayName && score.name) {
                displayName = this.generateDisplayName(score.name, score.timestamp || Date.now());
            } else if (!displayName) {
                displayName = 'A🎮'; // Fallback
            }
            
            row.innerHTML = `
                <td>${rankDisplay}</td>
                <td style="font-size: 1.2rem;">${displayName}</td>
                <td>${score.score}</td>
                <td>${score.accuracy}%</td>
                <td>${date}</td>
            `;
            tbody.appendChild(row);
        });
    }

    filterLeaderboard(filter) {
        const leaderboard = JSON.parse(localStorage.getItem('quiz-leaderboard') || '[]');
        let filteredScores = leaderboard;
        
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        
        switch (filter) {
            case 'today':
                filteredScores = leaderboard.filter(score => 
                    now - score.timestamp < oneDay
                );
                break;
            case 'week':
                filteredScores = leaderboard.filter(score => 
                    now - score.timestamp < oneWeek
                );
                break;
        }
        
        this.displayLeaderboard(filteredScores);
    }

    clearLeaderboard() {
        if (confirm('Are you sure you want to clear the leaderboard? This cannot be undone.')) {
            localStorage.removeItem('quiz-leaderboard');
            this.loadLeaderboard();
        }
    }

    resetGame() {
        // Clear the name input on the start screen
        document.getElementById('player-name-start').value = '';
        this.playerName = null;
        this.hideAllScreens();
        this.showStartScreen();
    }

    showStartScreen() {
        this.hideAllScreens();
        document.getElementById('start-screen').classList.add('active');
    }

    showGameScreen() {
        this.hideAllScreens();
        document.getElementById('game-screen').classList.add('active');
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }


    setupLeaderboardEventListeners() {
        const backToMenuBtn = document.getElementById('back-to-menu');
        const clearLeaderboardBtn = document.getElementById('clear-leaderboard');
        
        if (backToMenuBtn && !backToMenuBtn.hasAttribute('data-listener-added')) {
            backToMenuBtn.addEventListener('click', () => this.showStartScreen());
            backToMenuBtn.setAttribute('data-listener-added', 'true');
        }
        if (clearLeaderboardBtn && !clearLeaderboardBtn.hasAttribute('data-listener-added')) {
            clearLeaderboardBtn.addEventListener('click', () => this.clearLeaderboard());
            clearLeaderboardBtn.setAttribute('data-listener-added', 'true');
        }
    }

    showError(message) {
        alert(message); // Simple error handling for now
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.quizGame = new QuizGame();
});