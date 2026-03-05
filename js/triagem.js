// ============================================
// TECUIDAÊ - TRIAGEM DE SINTOMAS (RF02)
// ============================================

let currentStep = 1;
const totalSteps = 5;
const answers = {};
let riskScore = 0;

function updateProgress() {
    const progress = ((currentStep - 1) / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function answer(step, value) {
    answers[step] = value;
    
    // Calcular pontuação de risco
    if (step === 1 && (value === 'sim' || value === 'ja')) riskScore += 3;
    if (step === 2 && value === 'sim') riskScore += 2;
    if (step === 3 && value === 'sim') riskScore += 2;
    if (step === 4 && (value === 'sim' || value === 'tentando')) riskScore += 3;
    if (step === 5 && value === 'sim') riskScore += 3;
    
    document.getElementById('nextBtn').disabled = false;
    
    // Auto-advance após 300ms
    setTimeout(() => {
        if (currentStep < totalSteps) {
            nextQuestion();
        } else {
            showResult();
        }
    }, 300);
}

function nextQuestion() {
    if (currentStep < totalSteps) {
        document.querySelector(`.question[data-step="${currentStep}"]`).classList.remove('active');
        currentStep++;
        document.querySelector(`.question[data-step="${currentStep}"]`).classList.add('active');
        document.getElementById('prevBtn').disabled = false;
        document.getElementById('nextBtn').disabled = !answers[currentStep];
        updateProgress();
    } else {
        showResult();
    }
}

function prevQuestion() {
    if (currentStep > 1) {
        document.querySelector(`.question[data-step="${currentStep}"]`).classList.remove('active');
        currentStep--;
        document.querySelector(`.question[data-step="${currentStep}"]`).classList.add('active');
        document.getElementById('prevBtn').disabled = currentStep === 1;
        document.getElementById('nextBtn').disabled = false;
        updateProgress();
    }
}

function showResult() {
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('progressBar').style.width = '100%';
    
    const resultContainer = document.getElementById('resultContainer');
    let resultHTML = '';
    let resultClass = '';
    
    if (riskScore >= 7) {
        // Risco Alto
        resultClass = 'result-alto';
        resultHTML = `
            <div class="result-icon">🚨</div>
            <h2 class="result-title">Risco Alto Detectado</h2>
            <p class="result-text">
                Com base nas suas respostas, recomendamos que você procure atendimento médico <strong>urgentemente</strong>. 
                Você apresenta sinais que podem indicar sífilis ou outra IST.
            </p>
            <div class="action-cards">
                <div class="action-card">
                    <h4>🏥 Ação Imediata</h4>
                    <p>Dirija-se à UBS mais próxima hoje mesmo. O tratamento é gratuito e confidencial.</p>
                </div>
                <div class="action-card">
                    <h4>📞 Ligue 192</h4>
                    <p>Se não puder ir pessoalmente, ligue para o SAMU ou procure o pronto-socorro.</p>
                </div>
            </div>
            <a href="mapa.html" class="btn-action">Encontrar UBS Próxima</a>
        `;
    } else if (riskScore >= 3) {
        // Risco Moderado
        resultClass = 'result-moderado';
        resultHTML = `
            <div class="result-icon">⚠️</div>
            <h2 class="result-title">Risco Moderado</h2>
            <p class="result-text">
                Você apresenta alguns fatores de risco. Recomendamos fazer o <strong>teste de sífilis</strong> 
                nas próximas 48 horas para sua tranquilidade.
            </p>
            <div class="action-cards">
                <div class="action-card">
                    <h4>🧪 Teste Rápido</h4>
                    <p>O teste é gratuito, rápido (resultado em 30 min) e disponível em todas as UBSs.</p>
                </div>
                <div class="action-card">
                    <h4>📅 Agende sua Consulta</h4>
                    <p>Marque um horário na UBS mais conveniente para você.</p>
                </div>
            </div>
            <a href="mapa.html" class="btn-action">Encontrar UBS para Teste</a>
        `;
    } else {
        // Sem Risco
        resultClass = 'result-baixo';
        resultHTML = `
            <div class="result-icon">✅</div>
            <h2 class="result-title">Baixo Risco</h2>
            <p class="result-text">
                Pelas suas respostas, seu risco atual parece baixo. Continue com as práticas de prevenção 
                e mantenha seus exames de rotina em dia.
            </p>
            <div class="action-cards">
                <div class="action-card">
                    <h4>🛡️ Prevenção</h4>
                    <p>Use camisinha em todas as relações e faça testes anuais se tiver vida sexual ativa.</p>
                </div>
                <div class="action-card">
                    <h4>📚 Informe-se</h4>
                    <p>Conheça mais sobre prevenção de ISTs em nossa biblioteca de conteúdos.</p>
                </div>
            </div>
            <a href="conteudos.html" class="btn-action">Ver Conteúdos Educativos</a>
        `;
    }
    
    resultContainer.className = 'result-container ' + resultClass;
    resultContainer.innerHTML = resultHTML + `
        <div class="disclaimer">
            <strong>⚠️ Aviso importante:</strong> Esta triagem é apenas uma ferramenta de orientação inicial 
            e não substitui o diagnóstico médico. Se tiver qualquer sintoma ou dúvida, procure sempre um profissional de saúde.
        </div>
    `;
    resultContainer.style.display = 'block';
    
    // Salvar resultado no localStorage para analytics
    localStorage.setItem('triagemResult', JSON.stringify({
        score: riskScore,
        level: resultClass,
        timestamp: new Date().toISOString()
    }));
}

// Initialize
updateProgress();
