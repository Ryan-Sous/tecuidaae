// ============================================
// TECUIDAÊ - CHATBOT INTELIGENTE
// ============================================

const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const typingIndicator = document.getElementById('typingIndicator');
const sendBtn = document.getElementById('sendBtn');

// Base de conhecimento do chatbot (RF01, RNF03)
const knowledgeBase = {
    'o que é sífilis': {
        text: 'A sífilis é uma infecção sexualmente transmissível (IST) causada pela bactéria <em>Treponema pallidum</em>. Pode afetar várias partes do corpo e, se não tratada, pode causar sérios problemas de saúde ao longo dos anos.',
        source: 'Protocolo Clínico MS, 2022 | OMS, 2021'
    },
    'sintomas': {
        text: '<strong>Primária:</strong> Geralmente aparece uma úlcera (cancro) indolor nos genitais, ânus ou boca.<br><br><strong>Secundária:</strong> Manchas na pele, febre, mal-estar, queda de cabelo.<br><br><strong>Latente:</strong> Sem sintomas, mas a bactéria permanece no organismo.',
        source: 'Protocolo Clínico e Diretrizes Terapêuticas MS, 2022'
    },
    'como se proteger': {
        text: '• Use camisinha (masculina ou feminina) em todas as relações sexuais<br>• Faça testes regularmente se tem vida sexual ativa<br>• Converse com parceiros sobre saúde sexual<br>• Procure atendimento imediato em caso de exposição',
        source: 'Boletim Epidemiológico FVS-AM'
    },
    'tratamento': {
        text: 'O tratamento é feito com <strong>penicilina benzatina</strong> injetável, gratuitamente no SUS. É simples e eficaz!<br><br>⚠️ <strong>Importante:</strong> O tratamento deve ser completado mesmo que os sintomas sumam. Parceiros também precisam ser tratados.',
        source: 'Protocolo Clínico MS, 2022'
    },
    'sífilis na gravidez': {
        text: 'A sífilis na gravidez pode ser transmitida para o bebê (sífilis congênita), causando aborto, prematuridade ou malformações.<br><br>✅ <strong>Prevenção:</strong> Faça o teste no pré-natal. O tratamento é seguro durante a gravidez e protege o bebê.',
        source: 'OMS, 2021 | Protocolo MS, 2022'
    },
    'triagem': {
        text: 'Você pode fazer nossa triagem rápida clicando no botão abaixo:',
        action: 'triagem'
    },
    'ubs': {
        text: 'Encontre a UBS mais próxima de você no nosso mapa interativo:',
        action: 'mapa'
    }
};

// Variações linguísticas de Manaus (RF01)
const regionalisms = {
    'mancar': 'ferida',
    'bicho': 'doença',
    'pinta': 'sífilis',
    'sarar': 'curar',
    'remédio': 'tratamento',
    'injeção': 'penicilina'
};

function addMessage(text, isUser = false) {
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    div.innerHTML = text;
    
    if (!isUser) {
        const time = document.createElement('div');
        time.className = 'timestamp';
        time.textContent = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        div.appendChild(time);
    }
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTyping() {
    typingIndicator.classList.add('active');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTyping() {
    typingIndicator.classList.remove('active');
}

function sendQuick(text) {
    messageInput.value = text;
    sendMessage();
}

function processRegionalisms(text) {
    let processed = text.toLowerCase();
    for (const [slang, correct] of Object.entries(regionalisms)) {
        processed = processed.replace(new RegExp(slang, 'g'), correct);
    }
    return processed;
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // User message
    addMessage(text, true);
    messageInput.value = '';
    sendBtn.disabled = true;

    // Simulate typing (RNF02 - max 3 segundos)
    showTyping();

    const startTime = Date.now();

    setTimeout(() => {
        hideTyping();
        
        const processedText = processRegionalisms(text);
        
        // Find best matching response
        let bestMatch = null;
        let highestScore = 0;

        for (const [key, value] of Object.entries(knowledgeBase)) {
            const score = calculateSimilarity(processedText, key);
            if (score > highestScore && score > 0.3) {
                highestScore = score;
                bestMatch = value;
            }
        }

        const responseTime = Date.now() - startTime;

        if (bestMatch) {
            let responseHTML = bestMatch.text;
            
            // Add source tag (RNF03)
            if (bestMatch.source) {
                responseHTML += `<div class="source-tag">📚 Fonte: ${bestMatch.source}</div>`;
            }
            
            // Add action buttons if needed
            if (bestMatch.action === 'triagem') {
                responseHTML += `<br><a href="triagem.html" class="quick-reply" style="display: inline-block; text-decoration: none; margin-top: 0.5rem;">🩺 Fazer Triagem</a>`;
            } else if (bestMatch.action === 'mapa') {
                responseHTML += `<br><a href="mapa.html" class="quick-reply" style="display: inline-block; text-decoration: none; margin-top: 0.5rem;">📍 Ver Mapa</a>`;
            }
            
            addMessage(responseHTML);
            
            // Add quick replies after response
            if (!bestMatch.action) {
                setTimeout(() => {
                    const quickDiv = document.createElement('div');
                    quickDiv.className = 'quick-replies';
                    quickDiv.innerHTML = `
                        <button class="quick-reply" onclick="sendQuick('Obrigado')">Obrigado!</button>
                        <button class="quick-reply" onclick="sendQuick('Mais dúvidas')">Tenho mais dúvidas</button>
                        <button class="quick-reply" onclick="sendQuick('UBS próxima')">Encontrar UBS</button>
                    `;
                    chatContainer.appendChild(quickDiv);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }, 500);
            }
        } else {
            // Fallback response (RNF02)
            addMessage('Desculpe, não entendi completamente. Posso te ajudar com:<br>• O que é sífilis?<br>• Sintomas<br>• Prevenção<br>• Tratamento<br>• Sífilis na gravidez<br><br>Ou digite "triagem" para avaliar seu risco.');
        }
        
        sendBtn.disabled = false;
        
        // Log response time for monitoring (RNF02)
        console.log(`Tempo de resposta: ${responseTime}ms`);
    }, 1500 + Math.random() * 1000); // 1.5-2.5s (dentro do limite de 3s)
}

function calculateSimilarity(str1, str2) {
    // Simple similarity calculation
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    let matches = 0;
    
    words1.forEach(word => {
        if (words2.some(w => w.includes(word) || word.includes(w))) {
            matches++;
        }
    });
    
    return matches / Math.max(words1.length, words2.length);
}

function handleKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
}

// Fallback para resposta genérica se ultrapassar 5s (RNF02)
setTimeout(() => {
    if (typingIndicator.classList.contains('active')) {
        hideTyping();
        addMessage('Desculpe, estou demorando mais que o esperado. Por favor, tente novamente ou reformule sua pergunta.');
    }
}, 5000);

// Event listeners
messageInput.addEventListener('keypress', handleKeyPress);
