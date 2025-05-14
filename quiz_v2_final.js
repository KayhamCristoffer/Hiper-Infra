import { getDatabase, ref, get, set, push, child, remove, update, query, orderByChild } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const db = window.firebaseDb;

const ADMIN_PASSWORD = "Admin@Pex2025";
const TOTAL_QUESTIONS_PER_QUIZ = 10;

const startSection = document.querySelector(".start-section");
const quizSection = document.querySelector(".quiz-section");
const resultSection = document.querySelector(".result-section");
const adminSection = document.querySelector(".admin-section");
const rankingSection = document.querySelector(".ranking-section");
const participantNameInput = document.getElementById("participant-name");
const levelButtons = document.querySelectorAll(".level-btn");
const startQuizButton = document.getElementById("start-quiz-btn");
const adminAccessButton = document.getElementById("admin-access-btn");
const viewRankingButton = document.getElementById("view-ranking-btn");
const questionTextElement = document.querySelector(".question-text");
const answerOptionsElement = document.querySelector(".answer-options");
const explanationElement = document.querySelector(".explanation");
const explanationTextElement = document.querySelector(".explanation-text");
const nextButton = document.getElementById("next-btn"); 
const prevButton = document.getElementById("prev-btn");
const confirmButton = document.getElementById("confirm-btn");
const submitButton = document.getElementById("submit-btn");
const progressBar = document.querySelector(".progress");
const progressInfo = document.querySelector(".progress-info span:first-child");
const quizLevelDisplay = document.getElementById("quiz-level-display");
const backToStartFromQuizBtn = document.getElementById("back-to-start-from-quiz");
const resultParticipantName = document.getElementById("result-participant-name");
const scoreElement = document.querySelector(".score");
const resultMessageElement = document.querySelector(".result-message");
const resultDescriptionElement = document.querySelector(".result-description");
const restartButton = document.getElementById("restart-btn");
const viewRankingFromResultBtn = document.getElementById("view-ranking-from-result-btn");
const adminForm = document.getElementById("admin-form");
const questionTextInput = document.getElementById("question-text-input");
const answerInputs = [
    document.getElementById("answer-1"),
    document.getElementById("answer-2"),
    document.getElementById("answer-3"),
    document.getElementById("answer-4")
];
const correctAnswerInput = document.getElementById("correct-answer-input");
const explanationInput = document.getElementById("explanation-input");
const difficultyInput = document.getElementById("difficulty-input");
const saveQuestionButton = document.getElementById("save-question-btn");
const clearFormButton = document.getElementById("clear-form-btn");
const questionsListElement = document.getElementById("questions-list");
const editQuestionIdInput = document.getElementById("edit-question-id");
const backToStartFromAdminBtn = document.getElementById("back-to-start-from-admin");
const rankingListElement = document.getElementById("ranking-list");
const backToStartFromRankingBtn = document.getElementById("back-to-start-from-ranking");

let currentQuestions = []; 
let allQuestions = {}; 
let currentQuestionIndex = 0;
let userAnswers = {}; 
let confirmedAnswers = {};
let score = 0;
let selectedLevel = "medio";
let participantName = "";

function showSection(sectionToShow) {
    [startSection, quizSection, resultSection, adminSection, rankingSection].forEach(section => {
        if (section) section.style.display = "none";
    });
    if (sectionToShow) sectionToShow.style.display = "block";
}

function initializeStartScreen() {
    levelButtons.forEach(btn => {
        if (btn.dataset.level === selectedLevel) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
        btn.addEventListener("click", () => {
            levelButtons.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedLevel = btn.dataset.level;
            console.log("Nível selecionado:", selectedLevel);
        });
    });

    startQuizButton.addEventListener("click", () => {
        participantName = participantNameInput.value.trim();
        if (!participantName) {
            alert("Por favor, digite seu nome para iniciar!");
            participantNameInput.focus();
            return;
        }
        if (!selectedLevel) {
            alert("Por favor, selecione um nível de dificuldade!");
            return;
        }
        console.log(`Iniciando quiz para ${participantName}, nível ${selectedLevel}`);
        loadAndSelectQuestions(); // Carrega e seleciona as perguntas conforme o nível
    });

    adminAccessButton.addEventListener("click", () => {
        const enteredPassword = prompt("Digite a senha de administrador:");
        if (enteredPassword === ADMIN_PASSWORD) {
            showSection(adminSection);
            loadQuestionsForAdmin(); // Carrega perguntas na área admin
        } else if (enteredPassword !== null) { // Não mostra alerta se o usuário cancelar
            alert("Senha incorreta!");
        }
    });

    viewRankingButton.addEventListener("click", () => {
        showSection(rankingSection);
        loadRanking(); // Carrega o ranking
    });

    [backToStartFromQuizBtn, backToStartFromAdminBtn, backToStartFromRankingBtn].forEach(btn => {
        if(btn) btn.addEventListener("click", () => showSection(startSection));
    });
    if(viewRankingFromResultBtn) viewRankingFromResultBtn.addEventListener("click", () => {
        showSection(rankingSection);
        loadRanking();
    });

    showSection(startSection); // Mostra a tela inicial por padrão
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function loadAndSelectQuestions() {
    const questionsRef = ref(db, 'quiz/questionBank');
    try {
        const snapshot = await get(questionsRef);
        if (snapshot.exists()) {
            const allQuestionsRaw = snapshot.val();

            allQuestions = { facil: [], medio: [], dificil: [] };
            for (const key in allQuestionsRaw) {
                const q = allQuestionsRaw[key];
                if (q && q.difficulty && allQuestions[q.difficulty]) {
                    allQuestions[q.difficulty].push(q);
                } else {
                    console.warn(`Pergunta inválida ou com dificuldade desconhecida ignorada: ${key}`);
                }
            }
            console.log("Banco de perguntas carregado e organizado:",
                `Fácil: ${allQuestions.facil.length}, Médio: ${allQuestions.medio.length}, Difícil: ${allQuestions.dificil.length}`);

            selectQuestionsForLevelSimplified();

            if (currentQuestions.length > 0) {
                startQuiz();
            } else {
                alert(`Não há perguntas suficientes cadastradas para o nível ${selectedLevel}.`);
                showSection(startSection);
            }
        } else {
            console.error("Nenhuma pergunta encontrada no banco de dados em quiz/questionBank");
            alert("Erro: Nenhuma pergunta encontrada no banco de dados.");
            showSection(startSection);
        }
    } catch (error) {
        console.error("Erro ao carregar e selecionar perguntas:", error);
        alert("Erro ao carregar perguntas do banco de dados.");
        showSection(startSection);
    }
}

function selectQuestionsForLevelSimplified() {
    const level = selectedLevel;
    if (!allQuestions[level]) {
        console.error(`Nível de dificuldade inválido: ${level}`);
        currentQuestions = [];
        return;
    }

    const questionsOfLevel = shuffleArray([...allQuestions[level]]);
    currentQuestions = questionsOfLevel.slice(0, TOTAL_QUESTIONS_PER_QUIZ);
    console.log(`Perguntas selecionadas para o nível ${level} (Simplificado):`, currentQuestions.length, currentQuestions);
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    confirmedAnswers = {};
    showSection(quizSection);
    if(quizLevelDisplay) quizLevelDisplay.textContent = `Nível: ${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}`;
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        console.warn("Tentativa de exibir pergunta fora dos limites.");
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    if (!question || !question.id) {
        console.error("Questão inválida ou sem ID no índice:", currentQuestionIndex, question);
        alert("Erro ao carregar a pergunta. Tente reiniciar.");
        showSection(startSection);
        return;
    }
    const questionId = question.id;

    questionTextElement.textContent = question.question;
    answerOptionsElement.innerHTML = ''; 
    explanationElement.style.display = 'none';
    explanationTextElement.textContent = '';
    answerOptionsElement.style.pointerEvents = 'auto';

    for (const key in question.answers) {
        const optionText = question.answers[key];
        const optionElement = document.createElement('div');
        optionElement.classList.add('answer-option');
        optionElement.classList.remove('correct', 'incorrect', 'selected');
        optionElement.textContent = optionText;
        optionElement.dataset.index = key;

        if (confirmedAnswers[questionId]) {
            const correctAnswerIndex = question.correctAnswer;
            const userAnswerIndex = userAnswers[questionId];
            const optIndex = parseInt(key);
            answerOptionsElement.style.pointerEvents = 'none'; // Desabilita se já confirmado

            if (optIndex === correctAnswerIndex) {
                optionElement.classList.add('correct');
            } else if (optIndex === userAnswerIndex) {
                optionElement.classList.add('incorrect');
            }

            if (question.explanation) {
                explanationTextElement.textContent = question.explanation;
                explanationElement.style.display = 'block';
            }
        } else {
             if (userAnswers[questionId] !== undefined && userAnswers[questionId] == key) {
                optionElement.classList.add('selected');
            }
            optionElement.addEventListener('click', () => selectAnswer(optionElement, questionId, parseInt(key)));
        }

        answerOptionsElement.appendChild(optionElement);
    }

    updateProgressBar();
    updateNavigationButtons();
}

function selectAnswer(selectedOptionElement, questionId, selectedIndex) {
    if (confirmedAnswers[questionId]) return;
    const options = answerOptionsElement.querySelectorAll('.answer-option');
    options.forEach(opt => opt.classList.remove('selected'));
    selectedOptionElement.classList.add('selected');
    userAnswers[questionId] = selectedIndex;
    console.log("Resposta selecionada:", userAnswers);
    updateNavigationButtons();
}

function confirmAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    if (!question) return;
    const questionId = question.id;

    if (userAnswers[questionId] === undefined) {
        alert("Por favor, selecione uma resposta antes de confirmar.");
        return;
    }

    confirmedAnswers[questionId] = true; 
    showExplanationAndMarkAnswers();
    updateNavigationButtons();
}

function showExplanationAndMarkAnswers() {
    const question = currentQuestions[currentQuestionIndex];
    if (!question) return;
    const questionId = question.id;
    const correctAnswerIndex = question.correctAnswer;
    const userAnswerIndex = userAnswers[questionId];

    const options = answerOptionsElement.querySelectorAll('.answer-option');
    options.forEach(opt => {
        const optIndex = parseInt(opt.dataset.index);
        opt.style.pointerEvents = 'none'; 
        opt.classList.remove('selected'); 

        if (optIndex === correctAnswerIndex) {
            opt.classList.add('correct');
        } else if (optIndex === userAnswerIndex) {
            opt.classList.add('incorrect');
        }
    });

    if (question.explanation) {
        explanationTextElement.textContent = question.explanation;
        explanationElement.style.display = 'block';
    }
}

function updateProgressBar() {
    const totalQuestions = currentQuestions.length;
    const currentQuestionNumber = Math.min(currentQuestionIndex + 1, totalQuestions);
    const progressPercentage = totalQuestions > 0 ? (currentQuestionNumber / totalQuestions) * 100 : 0;
    progressBar.style.width = `${progressPercentage}%`;
    progressInfo.textContent = `Questão ${currentQuestionNumber} de ${totalQuestions}`;
}

function updateNavigationButtons() {
    const question = currentQuestions[currentQuestionIndex];
    if (!question) return;
    const questionId = question.id;
    const isAnswerConfirmed = confirmedAnswers[questionId] === true;
    const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
    const allQuestionsConfirmed = currentQuestions.every(q => confirmedAnswers[q.id] === true);
    prevButton.disabled = currentQuestionIndex === 0;
    confirmButton.disabled = !(userAnswers[questionId] !== undefined && !isAnswerConfirmed);
    nextButton.disabled = !(isAnswerConfirmed && !isLastQuestion);
    submitButton.style.display = allQuestionsConfirmed ? 'inline-flex' : 'none';
    submitButton.disabled = !allQuestionsConfirmed;
}

function continueToNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function finishQuiz() {
    score = 0;
    currentQuestions.forEach(question => {
        const questionId = question.id;
        if (userAnswers[questionId] !== undefined && userAnswers[questionId] === question.correctAnswer) {
            score++;
        }
    });
    console.log(`Quiz finalizado. Pontuação: ${score}/${currentQuestions.length}`);
    saveResultToRanking();
    showResults();
}

function showResults() {
    showSection(resultSection);
    const totalQuestions = currentQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    resultParticipantName.textContent = participantName;
    scoreElement.textContent = `${percentage}%`;
    resultDescriptionElement.textContent = `Você acertou ${score} de ${totalQuestions} questões no nível ${selectedLevel}.`;

    if (percentage >= 80) {
        resultMessageElement.textContent = "Excelente!";
    } else if (percentage >= 50) {
        resultMessageElement.textContent = "Muito bem!";
    } else {
        resultMessageElement.textContent = "Continue tentando!";
    }
}

async function saveResultToRanking() {
    const rankingRef = ref(db, 'ranking');
    const newRankingEntryRef = push(rankingRef);

    const resultData = {
        id: newRankingEntryRef.key,
        userName: participantName,
        score: score,
        totalQuestions: currentQuestions.length,
        currentLevel: selectedLevel,
        timestamp: Date.now()
    };

    try {
        await set(newRankingEntryRef, resultData);
        console.log("Resultado salvo no ranking:", resultData);
    } catch (error) {
        console.error("Erro ao salvar resultado no ranking:", error);
        alert("Houve um erro ao salvar seu resultado no ranking.");
    }
}

function restartQuiz() {
    showSection(startSection);
}

async function loadQuestionsForAdmin() {
    const questionsRef = ref(db, 'quiz/questionBank');
    questionsListElement.innerHTML = '<p>Carregando perguntas...</p>'; 
    try {
        const snapshot = await get(questionsRef);
        if (snapshot.exists()) {
            const adminAllQuestions = snapshot.val(); 
            questionsListElement.innerHTML = '<h3>Perguntas Existentes</h3>'; 
            if (Object.keys(adminAllQuestions).length === 0) {
                 questionsListElement.innerHTML += '<p>Nenhuma pergunta cadastrada.</p>';
                 return;
            }
            const sortedKeys = Object.keys(adminAllQuestions).sort((a, b) => (adminAllQuestions[a].id || 0) - (adminAllQuestions[b].id || 0));

            sortedKeys.forEach(key => {
                const question = adminAllQuestions[key];
                 if (!question || typeof question !== 'object') {
                    console.warn("Item inválido no banco de perguntas:", key, question);
                    return; // Pula item inválido
                }
                const item = document.createElement('div');
                item.classList.add('question-item');
                item.innerHTML = `
                    <p><strong>ID ${question.id || 'N/A'}:</strong> ${question.question || 'Sem texto'} (${question.difficulty || 'N/A'})</p>
                    <button class="btn btn-secondary btn-sm edit-btn" data-key="${key}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-key="${key}"><i class="fas fa-trash"></i> Excluir</button>
                `;
                questionsListElement.appendChild(item);
            });

            addAdminButtonListeners(adminAllQuestions);
        } else {
            questionsListElement.innerHTML = '<h3>Perguntas Existentes</h3><p>Nenhuma pergunta cadastrada.</p>';
        }
    } catch (error) {
        console.error("Erro ao carregar perguntas para admin:", error);
        questionsListElement.innerHTML = '<p>Erro ao carregar perguntas.</p>';
    }
}

function addAdminButtonListeners(adminQuestions) {
    questionsListElement.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const questionKey = e.currentTarget.dataset.key;
            populateAdminFormForEdit(questionKey, adminQuestions);
        });
    });

    questionsListElement.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const questionKey = e.currentTarget.dataset.key;
            const questionIdToShow = adminQuestions[questionKey]?.id || questionKey;
            if (confirm(`Tem certeza que deseja excluir a pergunta ID ${questionIdToShow}?`)) {
                await deleteQuestion(questionKey);
            }
        });
    });
}

function populateAdminFormForEdit(questionKey, adminQuestions) {
    const question = adminQuestions[questionKey];
    if (!question) return;

    editQuestionIdInput.value = questionKey; 
    questionTextInput.value = question.question || '';
    const answers = question.answers && typeof question.answers === 'object' ? question.answers : {};
    answerInputs[0].value = answers["1"] || '';
    answerInputs[1].value = answers["2"] || '';
    answerInputs[2].value = answers["3"] || '';
    answerInputs[3].value = answers["4"] || '';
    correctAnswerInput.value = question.correctAnswer || 1;
    explanationInput.value = question.explanation || '';
    difficultyInput.value = question.difficulty || 'medio';

    saveQuestionButton.textContent = 'Atualizar Pergunta';
    window.scrollTo(0, adminForm.offsetTop);
}

function clearAdminForm() {
    editQuestionIdInput.value = '';
    adminForm.reset();
    difficultyInput.value = 'medio'; 
    correctAnswerInput.value = 1;
    saveQuestionButton.textContent = 'Salvar Pergunta';
}

async function saveQuestion(event) {
    event.preventDefault();

    const questionKey = editQuestionIdInput.value;
    const isEditing = !!questionKey;

    let currentAdminQuestions = {};
    try {
        const snapshot = await get(ref(db, 'quiz/questionBank'));
        if (snapshot.exists()) {
            currentAdminQuestions = snapshot.val();
        }
    } catch (e) {
        console.error("Erro ao buscar perguntas antes de salvar:", e);
        alert("Erro ao verificar perguntas existentes. Tente novamente.");
        return;
    }

    let nextId = 1;
    if (!isEditing && Object.keys(currentAdminQuestions).length > 0) {
        const existingIds = Object.values(currentAdminQuestions)
                                .map(q => q && typeof q === 'object' ? q.id : 0)
                                .filter(id => typeof id === 'number');
        if (existingIds.length > 0) {
            const maxId = Math.max(...existingIds);
            nextId = maxId + 1;
        }
    }

    const questionData = {

        id: isEditing ? (currentAdminQuestions[questionKey]?.id || 0) : nextId,
        question: questionTextInput.value.trim(),
        answers: {
            "1": answerInputs[0].value.trim(),
            "2": answerInputs[1].value.trim(),
            "3": answerInputs[2].value.trim(),
            "4": answerInputs[3].value.trim(),
        },
        correctAnswer: parseInt(correctAnswerInput.value),
        explanation: explanationInput.value.trim(),
        difficulty: difficultyInput.value
    };

    if (!questionData.question || !questionData.answers["1"] || !questionData.answers["2"] || !questionData.answers["3"] || !questionData.answers["4"]) {
        alert("Por favor, preencha a pergunta e todas as 4 respostas.");
        return;
    }
    if (!questionData.id) {
         alert("Erro: Não foi possível determinar o ID da pergunta.");
         return;
    }

    try {
        let questionRef;
        if (isEditing) {
            questionRef = ref(db, `quiz/questionBank/${questionKey}`);
            await update(questionRef, questionData);
            alert("Pergunta atualizada com sucesso!");
        } else {
            const newQuestionRef = push(ref(db, 'quiz/questionBank'));
            await set(newQuestionRef, questionData);
            alert(`Pergunta ID ${questionData.id} adicionada com sucesso!`);
        }
        clearAdminForm();
        loadQuestionsForAdmin();
    } catch (error) {
        console.error("Erro ao salvar pergunta:", error);
        alert("Erro ao salvar pergunta no banco de dados.");
    }
}

async function deleteQuestion(questionKey) {
    const questionRef = ref(db, `quiz/questionBank/${questionKey}`);
    try {
        await remove(questionRef);
        alert("Pergunta excluída com sucesso!");
        loadQuestionsForAdmin();
    } catch (error) {
        console.error("Erro ao excluir pergunta:", error);
        alert("Erro ao excluir pergunta do banco de dados.");
    }
}

async function loadRanking() {
    const rankingRef = ref(db, 'ranking');
    rankingListElement.innerHTML = '<li>Carregando ranking...</li>';
    console.log("Carregando ranking...");

    try {
        const snapshot = await get(rankingRef);

        if (snapshot.exists()) {
            const rankingData = [];
            snapshot.forEach(childSnapshot => {
                const entry = childSnapshot.val();
                if (entry && typeof entry === 'object' && entry.userName && typeof entry.score === 'number') {
                    rankingData.push(entry);
                } else {
                    console.warn("Entrada inválida no ranking ignorada:", childSnapshot.key, entry);
                }
            });
            console.log("Dados brutos do ranking:", rankingData.length);

            rankingData.sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score; 
                }
                return (b.timestamp || 0) - (a.timestamp || 0); 
            });

            const topRanking = rankingData.slice(0, 10);
            console.log("Top 10 Ranking:", topRanking);

            rankingListElement.innerHTML = '';
            if (topRanking.length === 0) {
                rankingListElement.innerHTML = '<li>Nenhum resultado no ranking ainda.</li>';
                return;
            }

            topRanking.forEach((entry, index) => {
                const listItem = document.createElement('li');
                listItem.classList.add('ranking-item');
                if (index === 0) listItem.classList.add('rank-1');
                if (index === 1) listItem.classList.add('rank-2');
                if (index === 2) listItem.classList.add('rank-3');

                const rankSpan = `<span class="rank-position">${index + 1}º</span>`;
                const nameSpan = `<span class="rank-name">${entry.userName} (${entry.currentLevel || 'N/A'})</span>`;
                const scoreSpan = `<span class="rank-score">${entry.score} / ${entry.totalQuestions || '?'} pts</span>`;

                listItem.innerHTML = `${rankSpan}${nameSpan}${scoreSpan}`;
                rankingListElement.appendChild(listItem);
            });
        } else {
            console.log("Nenhum dado encontrado no nó 'ranking'.");
            rankingListElement.innerHTML = '<li>Nenhum resultado no ranking ainda.</li>';
        }
    } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        rankingListElement.innerHTML = '<li>Erro ao carregar o ranking. Verifique o console.</li>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeStartScreen();
    confirmButton.addEventListener('click', confirmAnswer);
    nextButton.addEventListener('click', continueToNextQuestion);
    prevButton.addEventListener('click', prevQuestion);
    submitButton.addEventListener('click', finishQuiz);
    restartButton.addEventListener('click', restartQuiz);
    adminForm.addEventListener('submit', saveQuestion);
    clearFormButton.addEventListener('click', clearAdminForm);
    console.log("Quiz v2 Final (Simplificado) inicializado.");
});
