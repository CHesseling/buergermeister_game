document.addEventListener('DOMContentLoaded', () => {
    // Spielzustand
    const gameState = {
        round: 1,
        maxRounds: 10,
        initialBudget: -500000,
        budget: -500000,
        initialDebt: 2000000,
        debt: 2000000,
        satisfaction: 75,
        jobs: 2000,
        stats: {
            previousBudget: -500000,
            previousDebt: 2000000,
            previousSatisfaction: 75,
            previousJobs: 2000,
            budgetChanges: [],
            debtChanges: [],
            satisfactionChanges: [],
            jobsChanges: []
        },
        goals: {
            targetBudget: 0,        // Ziel: ausgeglichener Haushalt
            targetDebt: 1000000     // Ziel: Schulden halbieren
        },
        actions: {
            libraryOpen: true,
            poolOpen: true,
            youthCenterOpen: true,
            staffCuts: false,
            propertyTaxRaised: false,
            businessTaxRaised: false,
            parkingFeeRaised: false,
            propertySold: false
        },
        currentRoundActions: [],
        history: []
    };

    // DOM-Elemente
    const elements = {
        budget: document.getElementById('budget'),
        debt: document.getElementById('debt'),
        satisfaction: document.getElementById('satisfaction'),
        jobs: document.getElementById('jobs'),
        currentRound: document.getElementById('current-round'),
        maxRounds: document.getElementById('max-rounds'),
        budgetTrend: document.getElementById('budget-trend'),
        debtTrend: document.getElementById('debt-trend'),
        satisfactionTrend: document.getElementById('satisfaction-trend'),
        jobsTrend: document.getElementById('jobs-trend'),
        budgetProgress: document.getElementById('budget-progress'),
        budgetGoalPercent: document.getElementById('budget-goal-percent'),
        debtProgress: document.getElementById('debt-progress'),
        debtReductionPercent: document.getElementById('debt-reduction-percent'),
        events: document.getElementById('events'),
        gameOver: document.getElementById('game-over'),
        gameOverMessage: document.getElementById('game-over-message'),
        finalStats: document.getElementById('final-stats'),
        nextRoundButton: document.getElementById('next-round'),
        restartButton: document.getElementById('restart-game')
    };

    // Aktionsbuttons
    const actionButtons = {
        closeLibrary: document.getElementById('close-library'),
        closePool: document.getElementById('close-pool'),
        closeYouth: document.getElementById('close-youth'),
        reduceStaff: document.getElementById('reduce-staff'),
        increasePropertyTax: document.getElementById('increase-property-tax'),
        increaseBusinessTax: document.getElementById('increase-business-tax'),
        increaseParking: document.getElementById('increase-parking'),
        sellProperty: document.getElementById('sell-property')
    };

    // Zufällige Ereignisse
    const randomEvents = [
        {
            name: "Undichtes Schuldach",
            description: "Das Dach der städtischen Schule ist undicht und muss dringend repariert werden.",
            budgetEffect: -150000,
            satisfactionEffect: 0,
            type: "negative",
            priority: "high"
        },
        {
            name: "Starke Regenfälle",
            description: "Überflutungen nach Starkregen haben Infrastrukturschäden verursacht.",
            budgetEffect: -100000,
            satisfactionEffect: -5,
            type: "negative",
            priority: "medium"
        },
        {
            name: "Neue Industrieansiedlung",
            description: "Ein neues Unternehmen siedelt sich in der Stadt an.",
            budgetEffect: 200000,
            satisfactionEffect: 10,
            jobsEffect: 100,
            type: "positive",
            priority: "high"
        },
        {
            name: "Unerwartete Steuereinnahmen",
            description: "Durch eine Betriebsprüfung wurden zusätzliche Steuereinnahmen festgestellt.",
            budgetEffect: 80000,
            satisfactionEffect: 0,
            type: "positive",
            priority: "medium"
        },
        {
            name: "Kulturpreisverleihung",
            description: "Ihre Stadt erhält einen Kulturpreis, was das Image verbessert.",
            budgetEffect: 0,
            satisfactionEffect: 15,
            type: "positive",
            priority: "low"
        },
        {
            name: "Abwanderung",
            description: "Einige Bürger:innen verlassen die Stadt aufgrund der Sparmaßnahmen.",
            budgetEffect: -50000,
            satisfactionEffect: -10,
            type: "negative",
            priority: "medium"
        },
        {
            name: "Landesförderung",
            description: "Ihre Stadt erhält eine Sonderförderung vom Land.",
            budgetEffect: 150000,
            satisfactionEffect: 5,
            type: "positive",
            priority: "medium"
        },
        {
            name: "Digitalisierungsförderung",
            description: "Ihre Stadt erhält Fördermittel für digitale Infrastruktur.",
            budgetEffect: 120000,
            satisfactionEffect: 8,
            jobsEffect: 20,
            type: "positive",
            priority: "medium"
        },
        {
            name: "Vandalismus im Stadtpark",
            description: "Reparaturkosten für Schäden durch Vandalismus im Stadtpark.",
            budgetEffect: -40000,
            satisfactionEffect: -5,
            type: "negative",
            priority: "low"
        },
        {
            name: "Bürgerprotest",
            description: "Bürger:innen protestieren gegen die Sparmaßnahmen der Stadt.",
            budgetEffect: 0,
            satisfactionEffect: -15,
            type: "negative",
            priority: "high"
        },
        {
            name: "Stadtfest",
            description: "Das jährliche Stadtfest steigert die Zufriedenheit, kostet aber auch Geld.",
            budgetEffect: -30000,
            satisfactionEffect: 20,
            type: "mixed",
            priority: "medium"
        },
        {
            name: "Unternehmen verlässt die Stadt",
            description: "Ein mittelgroßes Unternehmen verlegt seinen Standort in eine andere Stadt.",
            budgetEffect: -80000,
            satisfactionEffect: -5,
            jobsEffect: -80,
            type: "negative",
            priority: "high"
        }
    ];

    // Kontext-abhängige Ereignisse
    const contextualEvents = [
        {
            name: "Proteste gegen Büchereischließung",
            description: "Nach der Schließung der Bücherei protestieren Bürger:innen und Bildungseinrichtungen.",
            condition: () => !gameState.actions.libraryOpen,
            budgetEffect: 0,
            satisfactionEffect: -10,
            type: "negative",
            priority: "medium",
            oneTime: true
        },
        {
            name: "Proteste gegen Freibadschließung",
            description: "Die Schließung des Freibads hat zu Bürgerprotesten geführt.",
            condition: () => !gameState.actions.poolOpen,
            budgetEffect: 0,
            satisfactionEffect: -12,
            type: "negative",
            priority: "medium",
            oneTime: true
        },
        {
            name: "Jugendkriminalität steigt",
            description: "Nach der Schließung des Jugendtreffs berichtet die Polizei von gestiegener Jugendkriminalität.",
            condition: () => !gameState.actions.youthCenterOpen,
            budgetEffect: -30000,
            satisfactionEffect: -8,
            type: "negative",
            priority: "high",
            oneTime: true
        },
        {
            name: "Personalengpässe in der Verwaltung",
            description: "Nach den Personalkürzungen gibt es Verzögerungen bei Verwaltungsvorgängen.",
            condition: () => gameState.actions.staffCuts,
            budgetEffect: -20000,
            satisfactionEffect: -8,
            type: "negative",
            priority: "medium",
            oneTime: true
        },
        {
            name: "Immobilienmarkt unter Druck",
            description: "Die erhöhte Grundsteuer führt zu Druck auf dem lokalen Immobilienmarkt.",
            condition: () => gameState.actions.propertyTaxRaised,
            satisfactionEffect: -5,
            jobsEffect: -10,
            type: "negative",
            priority: "low",
            oneTime: true
        },
        {
            name: "Unternehmen drohen mit Wegzug",
            description: "Nach der Erhöhung der Gewerbesteuer drohen mehrere Unternehmen mit Standortverlagerung.",
            condition: () => gameState.actions.businessTaxRaised,
            satisfactionEffect: -5,
            jobsEffect: -50,
            type: "negative",
            priority: "high",
            oneTime: true
        }
    ];

    // Dilemma-Ereignisse, die Entscheidungen erfordern
    const dilemmaEvents = [
        {
            name: "Stadtentwicklungsprojekt",
            description: "Ein Investor möchte ein großes Wohn- und Geschäftsgebäude errichten, fordert aber Steuervergünstigungen.",
            options: [
                {
                    text: "Projekt mit Steuervergünstigungen genehmigen",
                    effects: {
                        budget: -50000,
                        satisfaction: 15,
                        jobs: 80
                    }
                },
                {
                    text: "Projekt ohne Vergünstigungen genehmigen",
                    effects: {
                        satisfaction: -5,
                        jobs: 30
                    }
                },
                {
                    text: "Projekt ablehnen",
                    effects: {
                        satisfaction: -10
                    }
                }
            ]
        },
        {
            name: "Kulturförderung",
            description: "Ein lokales Kulturprojekt bittet um Förderung für ein größeres Festival.",
            options: [
                {
                    text: "Großzügige Förderung bewilligen",
                    effects: {
                        budget: -80000,
                        satisfaction: 20
                    }
                },
                {
                    text: "Minimale Förderung bewilligen",
                    effects: {
                        budget: -30000,
                        satisfaction: 10
                    }
                },
                {
                    text: "Förderung ablehnen",
                    effects: {
                        satisfaction: -10
                    }
                }
            ]
        }
    ];

    // Spielende-Bedingungen
    function checkGameOver() {
        let isGameOver = false;
        let message = "";
        let result = "";

        if (gameState.round > gameState.maxRounds) {
            isGameOver = true;
            
            if (gameState.budget >= 0 && gameState.debt < 1000000) {
                result = "success";
                message = "Gratulation! Sie haben die städtischen Finanzen saniert und eine Schuldenaufsicht abgewendet.";
            } else if (gameState.budget >= 0) {
                result = "partial";
                message = "Sie haben einen ausgeglichenen Haushalt erreicht, aber die Schulden sind immer noch hoch.";
            } else if (gameState.debt < 1500000) {
                result = "partial";
                message = "Sie haben die Schulden reduziert, aber der Haushalt ist noch nicht ausgeglichen.";
            } else {
                result = "failure";
                message = "Sie haben es nicht geschafft, die Finanzen zu sanieren. Die Schuldenaufsicht übernimmt.";
            }
        } else if (gameState.satisfaction <= 0) {
            isGameOver = true;
            result = "failure";
            message = "Die Bürger:innen sind so unzufrieden, dass Sie durch ein Misstrauensvotum abgewählt wurden.";
        } else if (gameState.jobs <= 500) {
            isGameOver = true;
            result = "failure";
            message = "Die Arbeitslosigkeit ist so hoch, dass die Wirtschaft zusammengebrochen ist.";
        }

        if (isGameOver) {
            showGameOver(message, result);
        }

        return isGameOver;
    }

    // Spielende anzeigen
    function showGameOver(message, result) {
        elements.gameOver.style.display = 'flex';
        elements.gameOverMessage.textContent = message;
        
        // Abschlussstatistik erstellen
        const budgetChange = gameState.budget - gameState.initialBudget;
        const debtChange = gameState.initialDebt - gameState.debt;
        
        let statsHTML = '<div class="final-stats-grid">';
        statsHTML += `<div class="final-stat ${budgetChange >= 0 ? 'positive' : 'negative'}">
                        <div class="final-stat-title">Haushalt</div>
                        <div class="final-stat-value">${formatEuro(gameState.budget)}</div>
                        <div class="final-stat-change">${budgetChange >= 0 ? '+' : ''}${formatEuro(budgetChange)}</div>
                      </div>`;
        
        statsHTML += `<div class="final-stat ${debtChange >= 0 ? 'positive' : 'negative'}">
                        <div class="final-stat-title">Schulden</div>
                        <div class="final-stat-value">${formatEuro(gameState.debt)}</div>
                        <div class="final-stat-change">${debtChange >= 0 ? '-' : '+'}${formatEuro(Math.abs(debtChange))}</div>
                      </div>`;
        
        statsHTML += `<div class="final-stat">
                        <div class="final-stat-title">Zufriedenheit</div>
                        <div class="final-stat-value">${gameState.satisfaction}%</div>
                      </div>`;
        
        statsHTML += `<div class="final-stat">
                        <div class="final-stat-title">Arbeitsplätze</div>
                        <div class="final-stat-value">${gameState.jobs}</div>
                      </div>`;
        
        statsHTML += '</div>';
        
        elements.finalStats.innerHTML = statsHTML;
        elements.nextRoundButton.disabled = true;
        disableAllActionButtons();
    }

    // UI aktualisieren
    function updateUI() {
        // Rundeninformation aktualisieren
        elements.currentRound.textContent = gameState.round;
        elements.maxRounds.textContent = gameState.maxRounds;
        
        // Statistiken formatieren und anzeigen
        elements.budget.textContent = formatEuro(gameState.budget);
        elements.debt.textContent = formatEuro(gameState.debt);
        elements.satisfaction.textContent = `${gameState.satisfaction}%`;
        elements.jobs.textContent = gameState.jobs.toString();
        
        // Trends aktualisieren
        updateTrends();
        
        // Fortschrittsbalken aktualisieren
        updateProgressBars();
        
        // Button-Status aktualisieren
        updateButtons();
    }

    // Aktionen-Buttons aktualisieren
    function updateButtons() {
        // Buttons für permanente Aktionen
        if (!gameState.actions.libraryOpen) actionButtons.closeLibrary.disabled = true;
        if (!gameState.actions.poolOpen) actionButtons.closePool.disabled = true;
        if (!gameState.actions.youthCenterOpen) actionButtons.closeYouth.disabled = true;
        if (gameState.actions.staffCuts) actionButtons.reduceStaff.disabled = true;
        if (gameState.actions.propertyTaxRaised) actionButtons.increasePropertyTax.disabled = true;
        if (gameState.actions.businessTaxRaised) actionButtons.increaseBusinessTax.disabled = true;
        if (gameState.actions.parkingFeeRaised) actionButtons.increaseParking.disabled = true;
        if (gameState.actions.propertySold) actionButtons.sellProperty.disabled = true;
    }

    // Trend-Pfeile aktualisieren
    function updateTrends() {
        // Budget-Trend
        const budgetDiff = gameState.budget - gameState.stats.previousBudget;
        if (budgetDiff > 0) {
            elements.budgetTrend.innerHTML = '<i class="fas fa-arrow-up trend-up"></i>';
            elements.budgetTrend.classList.add('trend-up');
            elements.budgetTrend.classList.remove('trend-down');
        } else if (budgetDiff < 0) {
            elements.budgetTrend.innerHTML = '<i class="fas fa-arrow-down trend-down"></i>';
            elements.budgetTrend.classList.add('trend-down');
            elements.budgetTrend.classList.remove('trend-up');
        } else {
            elements.budgetTrend.innerHTML = '<i class="fas fa-minus"></i>';
            elements.budgetTrend.classList.remove('trend-up', 'trend-down');
        }
        
        // Schulden-Trend
        const debtDiff = gameState.debt - gameState.stats.previousDebt;
        if (debtDiff < 0) { // Weniger Schulden ist gut
            elements.debtTrend.innerHTML = '<i class="fas fa-arrow-down trend-up"></i>';
            elements.debtTrend.classList.add('trend-up');
            elements.debtTrend.classList.remove('trend-down');
        } else if (debtDiff > 0) {
            elements.debtTrend.innerHTML = '<i class="fas fa-arrow-up trend-down"></i>';
            elements.debtTrend.classList.add('trend-down');
            elements.debtTrend.classList.remove('trend-up');
        } else {
            elements.debtTrend.innerHTML = '<i class="fas fa-minus"></i>';
            elements.debtTrend.classList.remove('trend-up', 'trend-down');
        }
        
        // Zufriedenheits-Trend
        const satisfactionDiff = gameState.satisfaction - gameState.stats.previousSatisfaction;
        if (satisfactionDiff > 0) {
            elements.satisfactionTrend.innerHTML = '<i class="fas fa-arrow-up trend-up"></i>';
            elements.satisfactionTrend.classList.add('trend-up');
            elements.satisfactionTrend.classList.remove('trend-down');
        } else if (satisfactionDiff < 0) {
            elements.satisfactionTrend.innerHTML = '<i class="fas fa-arrow-down trend-down"></i>';
            elements.satisfactionTrend.classList.add('trend-down');
            elements.satisfactionTrend.classList.remove('trend-up');
        } else {
            elements.satisfactionTrend.innerHTML = '<i class="fas fa-minus"></i>';
            elements.satisfactionTrend.classList.remove('trend-up', 'trend-down');
        }
        
        // Arbeitsplätze-Trend
        const jobsDiff = gameState.jobs - gameState.stats.previousJobs;
        if (jobsDiff > 0) {
            elements.jobsTrend.innerHTML = '<i class="fas fa-arrow-up trend-up"></i>';
            elements.jobsTrend.classList.add('trend-up');
            elements.jobsTrend.classList.remove('trend-down');
        } else if (jobsDiff < 0) {
            elements.jobsTrend.innerHTML = '<i class="fas fa-arrow-down trend-down"></i>';
            elements.jobsTrend.classList.add('trend-down');
            elements.jobsTrend.classList.remove('trend-up');
        } else {
            elements.jobsTrend.innerHTML = '<i class="fas fa-minus"></i>';
            elements.jobsTrend.classList.remove('trend-up', 'trend-down');
        }
    }

    // Fortschrittsbalken aktualisieren
    function updateProgressBars() {
        // Budget-Fortschritt (Vom negativen Budget zu 0 oder positiv)
        let budgetProgress = 0;
        if (gameState.initialBudget < 0) {
            budgetProgress = Math.min(100, Math.max(0, (gameState.budget - gameState.initialBudget) / (-gameState.initialBudget) * 100));
        } else if (gameState.budget >= 0) {
            budgetProgress = 100;
        }
        elements.budgetProgress.style.width = `${budgetProgress}%`;
        elements.budgetGoalPercent.textContent = `${Math.round(budgetProgress)}%`;
        
        // Schuldenabbau-Fortschritt (Vom Anfangsschuldenstand zum Zielwert)
        const debtReductionTarget = gameState.initialDebt - gameState.goals.targetDebt;
        const currentDebtReduction = gameState.initialDebt - gameState.debt;
        const debtProgress = Math.min(100, Math.max(0, (currentDebtReduction / debtReductionTarget) * 100));
        elements.debtProgress.style.width = `${debtProgress}%`;
        elements.debtReductionPercent.textContent = `${Math.round(debtProgress)}%`;
    }

    // Hilfsfunktion für Euro-Formatierung
    function formatEuro(amount) {
        const formatted = Math.abs(amount).toLocaleString('de-DE');
        return `${amount < 0 ? '-' : ''}${formatted} €`;
    }

    // Runde beenden und zur nächsten wechseln
    function nextRound() {
        if (checkGameOver()) return;

        // Statistiken für Trends speichern
        saveCurrentStats();
        
        // Laufende Kosten/Einnahmen addieren
        applyRecurringChanges();
        
        // Schulden basierend auf Budget aktualisieren
        updateDebtBasedOnBudget();
        
        // Kontextuelle Ereignisse prüfen
        checkContextualEvents();

        // Zufälliges Ereignis
        if (Math.random() < 0.7) { // 70% Chance für ein Ereignis
            if (Math.random() < 0.2 && dilemmaEvents.length > 0) { // 20% Chance für ein Dilemma
                const dilemmaIndex = Math.floor(Math.random() * dilemmaEvents.length);
                showDilemma(dilemmaEvents[dilemmaIndex]);
            } else {
                const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
                applyEvent(event);
            }
        }

        // Nächste Runde
        gameState.round++;
        gameState.currentRoundActions = []; // Aktionen der aktuellen Runde zurücksetzen
        
        resetActionButtonsForNewRound();
        updateUI();
        checkGameOver();
    }

    // Aktuelle Statistiken für Trend-Berechnung speichern
    function saveCurrentStats() {
        gameState.stats.previousBudget = gameState.budget;
        gameState.stats.previousDebt = gameState.debt;
        gameState.stats.previousSatisfaction = gameState.satisfaction;
        gameState.stats.previousJobs = gameState.jobs;
        
        // Historie aktualisieren
        gameState.stats.budgetChanges.push(gameState.budget);
        gameState.stats.debtChanges.push(gameState.debt);
        gameState.stats.satisfactionChanges.push(gameState.satisfaction);
        gameState.stats.jobsChanges.push(gameState.jobs);
    }

    // Wiederholende Budgetänderungen anwenden
    function applyRecurringChanges() {
        const changes = calculateRecurringBudgetChanges();
        if (changes !== 0) {
            gameState.budget += changes;
            
            // Nur anzeigen, wenn es Veränderungen gibt
            addEventItem({
                name: "Regelmäßige Änderungen",
                description: "Auswirkungen Ihrer dauerhaften Maßnahmen auf den städtischen Haushalt.",
                budgetEffect: changes,
                type: changes > 0 ? "positive" : "negative"
            });
        }
    }

    // Schulden basierend auf Budget aktualisieren
    function updateDebtBasedOnBudget() {
        if (gameState.budget < 0) {
            // Wenn Budget negativ ist, erhöhe Schulden
            gameState.debt -= gameState.budget; // Budget ist negativ, also subtrahieren wir es (= Addition)
        } else {
            // Wenn Budget positiv ist, verwende es zum Schuldenabbau
            gameState.debt -= gameState.budget;
            if (gameState.debt < 0) gameState.debt = 0;
            gameState.budget = 0; // Reset Budget nach Schuldenabbau
        }
    }

    // Kontextabhängige Ereignisse prüfen und anwenden
    function checkContextualEvents() {
        for (const event of contextualEvents) {
            // Prüfen, ob die Bedingung erfüllt ist und das Ereignis noch nicht aufgetreten ist
            if (event.condition() && (!event.oneTime || !event.hasOccurred)) {
                applyEvent(event);
                if (event.oneTime) {
                    event.hasOccurred = true;
                }
                // Nur ein kontextuelles Ereignis pro Runde
                break;
            }
        }
    }

    // Dilemma anzeigen und Benutzerentscheidung abwarten
    function showDilemma(dilemma) {
        // Aktuelle Spielaktion pausieren
        elements.nextRoundButton.disabled = true;
        disableAllActionButtons();
        
        // Dilemma-Modal erstellen
        const dilemmaModal = document.createElement('div');
        dilemmaModal.className = 'dilemma-modal';
        dilemmaModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        let optionsHTML = '';
        dilemma.options.forEach((option, index) => {
            optionsHTML += `
                <button class="dilemma-option" data-index="${index}">
                    ${option.text}
                    <div class="option-effects">
                        ${option.effects.budget ? `<span class="${option.effects.budget > 0 ? 'positive' : 'negative'}">${formatEuro(option.effects.budget)}</span>` : ''}
                        ${option.effects.satisfaction ? `<span class="${option.effects.satisfaction > 0 ? 'positive' : 'negative'}">${option.effects.satisfaction > 0 ? '+' : ''}${option.effects.satisfaction}% Zufriedenheit</span>` : ''}
                        ${option.effects.jobs ? `<span class="${option.effects.jobs > 0 ? 'positive' : 'negative'}">${option.effects.jobs > 0 ? '+' : ''}${option.effects.jobs} Arbeitsplätze</span>` : ''}
                    </div>
                </button>
            `;
        });
        
        dilemmaModal.innerHTML = `
            <div class="dilemma-content" style="
                background-color: white;
                padding: 25px;
                border-radius: 10px;
                max-width: 600px;
                width: 90%;
            ">
                <h2 style="color: #2c3e50; margin-bottom: 15px;">${dilemma.name}</h2>
                <p style="margin-bottom: 20px; line-height: 1.6;">${dilemma.description}</p>
                <div class="dilemma-options" style="display: flex; flex-direction: column; gap: 15px;">
                    ${optionsHTML}
                </div>
            </div>
        `;
        
        document.body.appendChild(dilemmaModal);
        
        // Event-Listener für Optionen
        const optionButtons = dilemmaModal.querySelectorAll('.dilemma-option');
        optionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const optionIndex = parseInt(button.dataset.index);
                const selectedOption = dilemma.options[optionIndex];
                
                // Effekte anwenden
                if (selectedOption.effects.budget) gameState.budget += selectedOption.effects.budget;
                if (selectedOption.effects.satisfaction) {
                    gameState.satisfaction += selectedOption.effects.satisfaction;
                    if (gameState.satisfaction > 100) gameState.satisfaction = 100;
                    if (gameState.satisfaction < 0) gameState.satisfaction = 0;
                }
                if (selectedOption.effects.jobs) gameState.jobs += selectedOption.effects.jobs;
                
                // Dilemma-Antwort zum Ereignislog hinzufügen
                addEventItem({
                    name: dilemma.name,
                    description: `${dilemma.description}<br>Ihre Entscheidung: ${selectedOption.text}`,
                    budgetEffect: selectedOption.effects.budget || 0,
                    satisfactionEffect: selectedOption.effects.satisfaction || 0,
                    jobsEffect: selectedOption.effects.jobs || 0,
                    type: "dilemma"
                });
                
                // Modal entfernen
                document.body.removeChild(dilemmaModal);
                
                // Spiel fortsetzen
                elements.nextRoundButton.disabled = false;
                resetActionButtonsForNewRound();
                updateUI();
            });
        });
    }

    // Berechnet wiederkehrende Budget-Änderungen basierend auf bisherigen Aktionen
    function calculateRecurringBudgetChanges() {
        let changes = 0;
        
        // Einsparungen
        if (!gameState.actions.libraryOpen) changes += 50000;
        if (!gameState.actions.poolOpen) changes += 80000;
        if (!gameState.actions.youthCenterOpen) changes += 30000;
        if (gameState.actions.staffCuts) changes += 100000;
        
        // Zusätzliche Einnahmen
        if (gameState.actions.propertyTaxRaised) changes += 60000;
        if (gameState.actions.businessTaxRaised) changes += 100000;
        if (gameState.actions.parkingFeeRaised) changes += 20000;
        
        return changes;
    }

    // Zufälliges Ereignis anwenden
    function applyEvent(event) {
        // Effekte auf den Spielzustand anwenden
        if (event.budgetEffect) gameState.budget += event.budgetEffect;
        if (event.satisfactionEffect) {
            gameState.satisfaction += event.satisfactionEffect;
            // Begrenze Zufriedenheit auf 0-100%
            if (gameState.satisfaction > 100) gameState.satisfaction = 100;
            if (gameState.satisfaction < 0) gameState.satisfaction = 0;
        }
        if (event.jobsEffect) gameState.jobs += event.jobsEffect;
        
        // Ereignis zur UI hinzufügen
        addEventItem(event);
        
        // Historie für spätere Verwendung speichern
        gameState.history.push({
            round: gameState.round,
            event: event.name,
            budgetEffect: event.budgetEffect || 0,
            satisfactionEffect: event.satisfactionEffect || 0,
            jobsEffect: event.jobsEffect || 0,
            type: event.type || "neutral"
        });
    }

    // Fügt ein Ereignis zur Timeline hinzu
    function addEventItem(event) {
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${event.type || 'neutral'}`;
        
        let eventHTML = `
            <div class="event-title">
                <span class="event-name">${event.name}</span>
                <span class="event-round">Runde ${gameState.round}</span>
            </div>
            <div class="event-description">${event.description}</div>
        `;
        
        // Effekte anzeigen, falls vorhanden
        let effectsHTML = '';
        if (event.budgetEffect) {
            effectsHTML += `<span class="event-effect ${event.budgetEffect > 0 ? 'effect-budget-positive' : 'effect-budget-negative'}">
                              ${event.budgetEffect > 0 ? '+' : ''}${formatEuro(event.budgetEffect)}
                            </span>`;
        }
        
        if (event.satisfactionEffect) {
            effectsHTML += `<span class="event-effect effect-satisfaction">
                              ${event.satisfactionEffect > 0 ? '+' : ''}${event.satisfactionEffect}% Zufriedenheit
                            </span>`;
        }
        
        if (event.jobsEffect) {
            effectsHTML += `<span class="event-effect effect-jobs">
                              ${event.jobsEffect > 0 ? '+' : ''}${event.jobsEffect} Arbeitsplätze
                            </span>`;
        }
        
        if (effectsHTML) {
            eventHTML += `<div class="event-effects">${effectsHTML}</div>`;
        }
        
        eventItem.innerHTML = eventHTML;
        elements.events.insertBefore(eventItem, elements.events.firstChild);
    }

    // Alle Aktionsbuttons für eine neue Runde zurücksetzen
    function resetActionButtonsForNewRound() {
        // Setze nur die Buttons zurück, die pro Runde verwendet werden können
        // Dauerhaft geschlossene Einrichtungen bleiben deaktiviert
        Object.values(actionButtons).forEach(button => {
            // Überprüfe, ob der Button nicht aufgrund einer dauerhaften Aktion deaktiviert wurde
            if ((button === actionButtons.closeLibrary && gameState.actions.libraryOpen) ||
                (button === actionButtons.closePool && gameState.actions.poolOpen) ||
                (button === actionButtons.closeYouth && gameState.actions.youthCenterOpen) ||
                (button === actionButtons.reduceStaff && !gameState.actions.staffCuts) ||
                (button === actionButtons.increasePropertyTax && !gameState.actions.propertyTaxRaised) ||
                (button === actionButtons.increaseBusinessTax && !gameState.actions.businessTaxRaised) ||
                (button === actionButtons.increaseParking && !gameState.actions.parkingFeeRaised) ||
                (button === actionButtons.sellProperty && !gameState.actions.propertySold)) {
                button.disabled = false;
            }
        });
    }

    // Alle Aktionsbuttons deaktivieren (bei Spielende oder Dilemma)
    function disableAllActionButtons() {
        Object.values(actionButtons).forEach(button => {
            button.disabled = true;
        });
    }

    // Aktionen definieren
    function closeLibrary() {
        gameState.actions.libraryOpen = false;
        gameState.satisfaction -= 15;
        addAction("closeLibrary");
        addEventItem({
            name: "Bücherei geschlossen",
            description: "Sie haben die Stadtbücherei geschlossen, um Kosten zu sparen.",
            budgetEffect: 0, // Keine sofortige Einsparung, nur in folgenden Runden
            satisfactionEffect: -15,
            type: "negative"
        });
        updateUI();
    }

    function closePool() {
        gameState.actions.poolOpen = false;
        gameState.satisfaction -= 20;
        addAction("closePool");
        addEventItem({
            name: "Freibad geschlossen",
            description: "Sie haben das städtische Freibad geschlossen, um Unterhaltskosten zu sparen.",
            budgetEffect: 0,
            satisfactionEffect: -20,
            type: "negative"
        });
        updateUI();
    }

    function closeYouthCenter() {
        gameState.actions.youthCenterOpen = false;
        gameState.satisfaction -= 10;
        addAction("closeYouthCenter");
        addEventItem({
            name: "Jugendtreff geschlossen",
            description: "Der städtische Jugendtreff wurde aus Kostengründen geschlossen.",
            budgetEffect: 0,
            satisfactionEffect: -10,
            type: "negative"
        });
        updateUI();
    }

    function reduceStaff() {
        gameState.actions.staffCuts = true;
        gameState.satisfaction -= 15;
        gameState.jobs -= 50;
        addAction("reduceStaff");
        addEventItem({
            name: "Personalabbau",
            description: "Durch Stellenabbau in der Verwaltung wurden Personalkosten gesenkt.",
            budgetEffect: 0,
            satisfactionEffect: -15,
            jobsEffect: -50,
            type: "negative"
        });
        updateUI();
    }

    function increasePropertyTax() {
        gameState.actions.propertyTaxRaised = true;
        gameState.satisfaction -= 15;
        addAction("increasePropertyTax");
        addEventItem({
            name: "Grundsteuererhöhung",
            description: "Die Grundsteuer wurde erhöht, um zusätzliche Einnahmen zu generieren.",
            budgetEffect: 0,
            satisfactionEffect: -15,
            type: "negative"
        });
        updateUI();
    }

    function increaseBusinessTax() {
        gameState.actions.businessTaxRaised = true;
        gameState.satisfaction -= 10;
        gameState.jobs -= 100;
        addAction("increaseBusinessTax");
        addEventItem({
            name: "Gewerbesteuererhöhung",
            description: "Die Gewerbesteuer wurde erhöht, was lokale Unternehmen belastet.",
            budgetEffect: 0,
            satisfactionEffect: -10,
            jobsEffect: -100,
            type: "negative"
        });
        updateUI();
    }

    function increaseParking() {
        gameState.actions.parkingFeeRaised = true;
        gameState.satisfaction -= 5;
        addAction("increaseParking");
        addEventItem({
            name: "Parkgebühren erhöht",
            description: "Die Parkgebühren in der Innenstadt wurden angehoben.",
            budgetEffect: 0,
            satisfactionEffect: -5,
            type: "negative"
        });
        updateUI();
    }

    function sellProperty() {
        gameState.actions.propertySold = true;
        gameState.budget += 200000;
        gameState.jobs -= 20;
        addAction("sellProperty");
        addEventItem({
            name: "Grundstücksverkauf",
            description: "Ein städtisches Grundstück wurde verkauft, um kurzfristig Einnahmen zu generieren.",
            budgetEffect: 200000,
            jobsEffect: -20,
            type: "mixed"
        });
        updateUI();
    }

    // Aktion zur aktuellen Runde hinzufügen
    function addAction(actionName) {
        gameState.currentRoundActions.push(actionName);
    }

    // Spiel zurücksetzen
    function restartGame() {
        // Spielzustand zurücksetzen
        gameState.round = 1;
        gameState.budget = gameState.initialBudget;
        gameState.debt = gameState.initialDebt;
        gameState.satisfaction = 75;
        gameState.jobs = 2000;
        gameState.stats = {
            previousBudget: gameState.initialBudget,
            previousDebt: gameState.initialDebt,
            previousSatisfaction: 75,
            previousJobs: 2000,
            budgetChanges: [],
            debtChanges: [],
            satisfactionChanges: [],
            jobsChanges: []
        };
        gameState.actions = {
            libraryOpen: true,
            poolOpen: true,
            youthCenterOpen: true,
            staffCuts: false,
            propertyTaxRaised: false,
            businessTaxRaised: false,
            parkingFeeRaised: false,
            propertySold: false
        };
        gameState.currentRoundActions = [];
        gameState.history = [];

        // Kontextuelle Ereignisse zurücksetzen
        contextualEvents.forEach(event => {
            if (event.hasOccurred) delete event.hasOccurred;
        });

        // UI zurücksetzen
        elements.events.innerHTML = `
            <div class="event-item neutral">
                <div class="event-title">
                    <span class="event-name">Willkommen im Amt</span>
                    <span class="event-round">Runde 0</span>
                </div>
                <div class="event-description">
                    Willkommen Herr/Frau Bürgermeister:in! Die finanzielle Lage unserer Stadt ist kritisch.
                    Das Bundesland droht mit einer Haushaltsaufsicht, wenn wir die Finanzen nicht in Ordnung bringen.
                    Sie haben 10 Runden Zeit, einen ausgeglichenen Haushalt zu schaffen oder die Schulden deutlich zu reduzieren.
                </div>
            </div>
        `;
        
        elements.gameOver.style.display = 'none';
        elements.nextRoundButton.disabled = false;
        resetActionButtonsForNewRound();
        updateUI();
    }

    // Event-Listener
    actionButtons.closeLibrary.addEventListener('click', closeLibrary);
    actionButtons.closePool.addEventListener('click', closePool);
    actionButtons.closeYouth.addEventListener('click', closeYouthCenter);
    actionButtons.reduceStaff.addEventListener('click', reduceStaff);
    actionButtons.increasePropertyTax.addEventListener('click', increasePropertyTax);
    actionButtons.increaseBusinessTax.addEventListener('click', increaseBusinessTax);
    actionButtons.increaseParking.addEventListener('click', increaseParking);
    actionButtons.sellProperty.addEventListener('click', sellProperty);
    elements.nextRoundButton.addEventListener('click', nextRound);
    elements.restartButton.addEventListener('click', restartGame);

    // Spiel initialisieren
    updateUI();

    // CSS für Dilemma-Optionen hinzufügen
    const style = document.createElement('style');
    style.textContent = `
        .dilemma-option {
            padding: 15px;
            background-color: #ecf0f1;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-align: left;
            font-size: 1em;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .dilemma-option:hover {
            background-color: #3498db;
            color: white;
            transform: translateY(-2px);
        }
        
        .option-effects {
            margin-top: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            font-size: 0.9em;
        }
        
        .option-effects .positive {
            color: #2ecc71;
        }
        
        .option-effects .negative {
            color: #e74c3c;
        }
        
        .dilemma-option:hover .option-effects .positive,
        .dilemma-option:hover .option-effects .negative {
            color: white;
        }
        
        .final-stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .final-stat {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .final-stat.positive {
            border-left: 4px solid #2ecc71;
        }
        
        .final-stat.negative {
            border-left: 4px solid #e74c3c;
        }
        
        .final-stat-title {
            font-size: 0.9em;
            color: #7f8c8d;
            margin-bottom: 5px;
        }
        
        .final-stat-value {
            font-size: 1.4em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .final-stat-change {
            font-size: 0.9em;
            font-weight: bold;
        }
        
        .final-stat.positive .final-stat-change {
            color: #2ecc71;
        }
        
        .final-stat.negative .final-stat-change {
            color: #e74c3c;
        }
    `;
    document.head.appendChild(style);
});