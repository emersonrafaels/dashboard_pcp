// IBS 360 - Sistema de Gestão de Incidentes Itaú
class IBSApp {
    constructor() {
        this.incidents = [];
        this.filteredIncidents = [];
        this.currentPage = 1;
        this.itemsPerPage = 15;
        this.charts = {};
        this.filters = {
            equipment: '',
            severity: '',
            status: '',
            period: 90
        };

        // Data from JSON
        this.equipamentos = [
            {"nome": "Guia TV", "icon": "📺", "cor": "#4F46E5"},
            {"nome": "ATM Saque", "icon": "🏧", "cor": "#059669"},
            {"nome": "ATM Depósito", "icon": "💳", "cor": "#DC2626"},
            {"nome": "Notebook", "icon": "💻", "cor": "#7C3AED"},
            {"nome": "Link/Conectividade", "icon": "🌐", "cor": "#EA580C"},
            {"nome": "WiFi", "icon": "📶", "cor": "#0891B2"},
            {"nome": "Equipamentos de Segurança", "icon": "🔒", "cor": "#BE123C"},
            {"nome": "Impressoras", "icon": "🖨️", "cor": "#65A30D"},
            {"nome": "Tablets", "icon": "📱", "cor": "#C026D3"},
            {"nome": "Ar Condicionado", "icon": "❄️", "cor": "#0369A1"}
        ];

        this.severidades = [
            {"nome": "Crítico", "cor": "#DC2626", "prioridade": 1},
            {"nome": "Alto", "cor": "#EA580C", "prioridade": 2},
            {"nome": "Médio", "cor": "#CA8A04", "prioridade": 3},
            {"nome": "Baixo", "cor": "#0891B2", "prioridade": 4},
            {"nome": "Menor", "cor": "#059669", "prioridade": 5}
        ];

        this.status = [
            {"nome": "Aberto", "cor": "#DC2626"},
            {"nome": "Em Andamento", "cor": "#EA580C"},
            {"nome": "Aguardando", "cor": "#CA8A04"},
            {"nome": "Resolvido", "cor": "#059669"},
            {"nome": "Fechado", "cor": "#6B7280"}
        ];

        this.agencias = [
            "1001 - Vila Olímpia", "1002 - Faria Lima", "1003 - Paulista", "1004 - Moema",
            "1005 - Itaim Bibi", "1006 - Brooklin", "1007 - Santo Amaro", "1008 - Pinheiros",
            "1009 - Vila Madalena", "1010 - Perdizes", "2001 - Copacabana", "2002 - Ipanema",
            "2003 - Leblon", "2004 - Barra da Tijuca", "2005 - Tijuca", "3001 - Savassi BH",
            "3002 - Centro BH", "4001 - Boa Viagem", "4002 - Casa Forte", "5001 - Meireles",
            "5002 - Aldeota"
        ];

        this.responsaveis = [
            "João Silva - Técnico TI", "Maria Santos - Suporte N2", "Pedro Costa - Especialista ATM",
            "Ana Oliveira - Técnico Redes", "Carlos Lima - Suporte Segurança", "Fernanda Alves - Técnico Hardware",
            "Ricardo Souza - Especialista Conectividade", "Juliana Pereira - Suporte N1", 
            "Bruno Martins - Técnico Audiovisual", "Camila Rocha - Especialista Climatização"
        ];

        this.init();
    }

    init() {
        this.generateMockData();
        this.setupEventListeners();
        this.setupFilters();
        this.applyFilters();
        this.updateDashboard();
        
        // Wait for DOM to be ready before creating charts
        setTimeout(() => {
            this.createCharts();
        }, 100);
    }

    generateMockData() {
        const incidents = [];
        const now = new Date();
        
        for (let i = 0; i < 280; i++) {
            const equipment = this.equipamentos[Math.floor(Math.random() * this.equipamentos.length)];
            const severity = this.severidades[Math.floor(Math.random() * this.severidades.length)];
            const statusObj = this.status[Math.floor(Math.random() * this.status.length)];
            const agency = this.agencias[Math.floor(Math.random() * this.agencias.length)];
            const responsible = this.responsaveis[Math.floor(Math.random() * this.responsaveis.length)];
            
            // Generate random date within last 90 days
            const daysAgo = Math.floor(Math.random() * 90);
            const hoursAgo = Math.floor(Math.random() * 24);
            const minutesAgo = Math.floor(Math.random() * 60);
            
            const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
            
            // Calculate resolution time based on severity
            let resolutionHours = 0;
            const isResolved = statusObj.nome === 'Resolvido' || statusObj.nome === 'Fechado';
            
            if (isResolved) {
                switch (severity.nome) {
                    case 'Crítico': resolutionHours = Math.random() * 4 + 1; break;
                    case 'Alto': resolutionHours = Math.random() * 12 + 2; break;
                    case 'Médio': resolutionHours = Math.random() * 24 + 4; break;
                    case 'Baixo': resolutionHours = Math.random() * 48 + 8; break;
                    case 'Menor': resolutionHours = Math.random() * 72 + 12; break;
                }
            }
            
            const resolutionDate = isResolved ? new Date(startDate.getTime() + (resolutionHours * 60 * 60 * 1000)) : null;
            
            // Detection time (how long it took to detect the issue)
            const detectionMinutes = Math.random() * 60 + 5;
            
            const incident = {
                id: `INC-${String(i + 1).padStart(4, '0')}`,
                equipment: equipment.nome,
                equipmentIcon: equipment.icon,
                equipmentColor: equipment.cor,
                agency: agency,
                severity: severity.nome,
                severityColor: severity.cor,
                severityPriority: severity.prioridade,
                status: statusObj.nome,
                statusColor: statusObj.cor,
                startDate: startDate,
                resolutionDate: resolutionDate,
                responsible: responsible,
                mttr: resolutionHours, // Mean Time To Resolution
                mttd: detectionMinutes / 60, // Mean Time To Detection in hours
                description: this.generateIncidentDescription(equipment.nome, severity.nome)
            };
            
            incidents.push(incident);
        }
        
        this.incidents = incidents.sort((a, b) => b.startDate - a.startDate);
    }

    generateIncidentDescription(equipment, severity) {
        const descriptions = {
            "Guia TV": [
                "Tela apresentando falha na exibição de informações",
                "Sistema de guia não responde ao toque",
                "Conteúdo desatualizado na tela principal"
            ],
            "ATM Saque": [
                "Falha na dispensação de cédulas",
                "Erro de comunicação com sistema central",
                "Travamento durante transação de saque"
            ],
            "ATM Depósito": [
                "Problema no mecanismo de depósito",
                "Falha na leitura de cheques",
                "Erro na contagem de cédulas"
            ],
            "Notebook": [
                "Sistema operacional apresentando lentidão",
                "Falha na inicialização do sistema",
                "Problema de conectividade com rede"
            ],
            "Link/Conectividade": [
                "Perda de conexão com internet",
                "Latência elevada na rede",
                "Falha no link principal de dados"
            ],
            "WiFi": [
                "Rede sem fio indisponível",
                "Sinal fraco em determinadas áreas",
                "Problema de autenticação na rede"
            ],
            "Equipamentos de Segurança": [
                "Falha na câmera de segurança",
                "Sensor de movimento não funcionando",
                "Problema no sistema de alarme"
            ],
            "Impressoras": [
                "Atolamento de papel frequente",
                "Qualidade de impressão degradada",
                "Falha na comunicação com sistema"
            ],
            "Tablets": [
                "Tela touch não responsiva",
                "Bateria não carregando adequadamente",
                "Aplicativo travando constantemente"
            ],
            "Ar Condicionado": [
                "Temperatura ambiente inadequada",
                "Ruído excessivo no equipamento",
                "Falha no sistema de refrigeração"
            ]
        };
        
        const equipmentDescriptions = descriptions[equipment] || ["Falha geral no equipamento"];
        return equipmentDescriptions[Math.floor(Math.random() * equipmentDescriptions.length)];
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
            });
        });

        // Filters
        document.getElementById('equipmentFilter').addEventListener('change', (e) => {
            this.filters.equipment = e.target.value;
            this.applyFilters();
        });

        document.getElementById('severityFilter').addEventListener('change', (e) => {
            this.filters.severity = e.target.value;
            this.applyFilters();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('periodFilter').addEventListener('change', (e) => {
            this.filters.period = parseInt(e.target.value);
            this.applyFilters();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updateTable();
            }
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredIncidents.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.updateTable();
            }
        });

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('incidentModal').classList.add('hidden');
        });

        // Click outside modal to close
        document.getElementById('incidentModal').addEventListener('click', (e) => {
            if (e.target.id === 'incidentModal') {
                document.getElementById('incidentModal').classList.add('hidden');
            }
        });

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });
    }

    setupFilters() {
        // Equipment filter
        const equipmentFilter = document.getElementById('equipmentFilter');
        this.equipamentos.forEach(eq => {
            const option = document.createElement('option');
            option.value = eq.nome;
            option.textContent = `${eq.icon} ${eq.nome}`;
            equipmentFilter.appendChild(option);
        });

        // Severity filter
        const severityFilter = document.getElementById('severityFilter');
        this.severidades.forEach(sev => {
            const option = document.createElement('option');
            option.value = sev.nome;
            option.textContent = sev.nome;
            severityFilter.appendChild(option);
        });

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        this.status.forEach(st => {
            const option = document.createElement('option');
            option.value = st.nome;
            option.textContent = st.nome;
            statusFilter.appendChild(option);
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).parentElement.classList.add('active');

        // Show/hide sections
        if (section === 'incidents') {
            document.getElementById('dashboard-section').style.display = 'none';
            document.getElementById('incidents-section').style.display = 'block';
            this.updateTable();
        } else {
            document.getElementById('dashboard-section').style.display = 'block';
            document.getElementById('incidents-section').style.display = 'none';
        }
    }

    applyFilters() {
        const now = new Date();
        const periodStart = new Date(now.getTime() - (this.filters.period * 24 * 60 * 60 * 1000));

        this.filteredIncidents = this.incidents.filter(incident => {
            const matchesPeriod = incident.startDate >= periodStart;
            const matchesEquipment = !this.filters.equipment || incident.equipment === this.filters.equipment;
            const matchesSeverity = !this.filters.severity || incident.severity === this.filters.severity;
            const matchesStatus = !this.filters.status || incident.status === this.filters.status;

            return matchesPeriod && matchesEquipment && matchesSeverity && matchesStatus;
        });

        this.currentPage = 1;
        this.updateDashboard();
        this.updateCharts();
        this.updateTable();
    }

    clearFilters() {
        this.filters = {
            equipment: '',
            severity: '',
            status: '',
            period: 90
        };

        document.getElementById('equipmentFilter').value = '';
        document.getElementById('severityFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('periodFilter').value = '90';

        this.applyFilters();
    }

    updateDashboard() {
        const total = this.filteredIncidents.length;
        const resolved = this.filteredIncidents.filter(inc => inc.status === 'Resolvido' || inc.status === 'Fechado').length;
        const active = this.filteredIncidents.filter(inc => inc.status !== 'Resolvido' && inc.status !== 'Fechado').length;

        // Calculate MTTR (Mean Time To Resolution)
        const resolvedIncidents = this.filteredIncidents.filter(inc => inc.resolutionDate);
        const avgMTTR = resolvedIncidents.length > 0 
            ? resolvedIncidents.reduce((sum, inc) => sum + inc.mttr, 0) / resolvedIncidents.length 
            : 0;

        // Calculate MTTD (Mean Time To Detection)
        const avgMTTD = this.filteredIncidents.length > 0 
            ? this.filteredIncidents.reduce((sum, inc) => sum + inc.mttd, 0) / this.filteredIncidents.length 
            : 0;

        document.getElementById('totalIncidents').textContent = total;
        document.getElementById('resolvedIncidents').textContent = resolved;
        document.getElementById('activeIncidents').textContent = active;
        document.getElementById('resolvedPercentage').textContent = total > 0 ? `${Math.round((resolved / total) * 100)}% do total` : '0% do total';
        document.getElementById('activePercentage').textContent = total > 0 ? `${Math.round((active / total) * 100)}% do total` : '0% do total';
        document.getElementById('averageMTTR').textContent = `${avgMTTR.toFixed(1)}h`;
        document.getElementById('averageMTTD').textContent = `${(avgMTTD * 60).toFixed(0)}min`;
    }

    createCharts() {
        this.createSeverityChart();
        this.createEquipmentChart();
        this.createMonthlyTrendChart();
        this.createMTTRChart();
    }

    updateCharts() {
        if (this.charts.severity) this.updateSeverityChart();
        if (this.charts.equipment) this.updateEquipmentChart();
        if (this.charts.monthlyTrend) this.updateMonthlyTrendChart();
        if (this.charts.mttr) this.updateMTTRChart();
    }

    createSeverityChart() {
        const ctx = document.getElementById('severityChart').getContext('2d');
        const severityData = this.getSeverityData();

        this.charts.severity = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: severityData.labels,
                datasets: [{
                    label: 'Incidentes',
                    data: severityData.data,
                    backgroundColor: severityData.colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateSeverityChart() {
        const severityData = this.getSeverityData();
        this.charts.severity.data.datasets[0].data = severityData.data;
        this.charts.severity.update();
    }

    getSeverityData() {
        const severityCounts = {};
        this.severidades.forEach(sev => {
            severityCounts[sev.nome] = this.filteredIncidents.filter(inc => inc.severity === sev.nome).length;
        });

        return {
            labels: this.severidades.map(sev => sev.nome),
            data: this.severidades.map(sev => severityCounts[sev.nome]),
            colors: this.severidades.map(sev => sev.cor)
        };
    }

    createEquipmentChart() {
        const ctx = document.getElementById('equipmentChart').getContext('2d');
        const equipmentData = this.getEquipmentData();

        this.charts.equipment = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: equipmentData.labels,
                datasets: [{
                    label: 'Incidentes',
                    data: equipmentData.data,
                    backgroundColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45
                        }
                    }
                }
            }
        });
    }

    updateEquipmentChart() {
        const equipmentData = this.getEquipmentData();
        this.charts.equipment.data.datasets[0].data = equipmentData.data;
        this.charts.equipment.update();
    }

    getEquipmentData() {
        const equipmentCounts = {};
        this.equipamentos.forEach(eq => {
            equipmentCounts[eq.nome] = this.filteredIncidents.filter(inc => inc.equipment === eq.nome).length;
        });

        const sortedEquipment = this.equipamentos
            .map(eq => ({ name: eq.nome, count: equipmentCounts[eq.nome] }))
            .sort((a, b) => b.count - a.count);

        return {
            labels: sortedEquipment.map(eq => eq.name),
            data: sortedEquipment.map(eq => eq.count)
        };
    }

    createMonthlyTrendChart() {
        const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
        const monthlyData = this.getMonthlyData();

        this.charts.monthlyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Incidentes por Mês',
                    data: monthlyData.data,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateMonthlyTrendChart() {
        const monthlyData = this.getMonthlyData();
        this.charts.monthlyTrend.data.datasets[0].data = monthlyData.data;
        this.charts.monthlyTrend.update();
    }

    getMonthlyData() {
        const now = new Date();
        const months = [];
        const monthlyCounts = [];

        for (let i = 2; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            months.push(monthName);

            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const count = this.filteredIncidents.filter(inc => 
                inc.startDate >= monthStart && inc.startDate <= monthEnd
            ).length;

            monthlyCounts.push(count);
        }

        return {
            labels: months,
            data: monthlyCounts
        };
    }

    createMTTRChart() {
        const ctx = document.getElementById('mttrChart').getContext('2d');
        const mttrData = this.getMTTRData();

        this.charts.mttr = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mttrData.labels,
                datasets: [{
                    label: 'MTTR Médio (horas)',
                    data: mttrData.data,
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + 'h';
                            }
                        }
                    }
                }
            }
        });
    }

    updateMTTRChart() {
        const mttrData = this.getMTTRData();
        this.charts.mttr.data.datasets[0].data = mttrData.data;
        this.charts.mttr.update();
    }

    getMTTRData() {
        const now = new Date();
        const months = [];
        const mttrValues = [];

        for (let i = 2; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            months.push(monthName);

            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const monthIncidents = this.filteredIncidents.filter(inc => 
                inc.startDate >= monthStart && inc.startDate <= monthEnd && inc.resolutionDate
            );

            const avgMTTR = monthIncidents.length > 0 
                ? monthIncidents.reduce((sum, inc) => sum + inc.mttr, 0) / monthIncidents.length 
                : 0;

            mttrValues.push(parseFloat(avgMTTR.toFixed(1)));
        }

        return {
            labels: months,
            data: mttrValues
        };
    }

    updateTable() {
        const tableBody = document.getElementById('incidentsTableBody');
        tableBody.innerHTML = '';

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageIncidents = this.filteredIncidents.slice(startIndex, endIndex);

        pageIncidents.forEach(incident => {
            const row = document.createElement('tr');
            
            // Normalize severity and status for CSS classes
            const severityClass = incident.severity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const statusClass = incident.status.toLowerCase().replace(/\s+/g, '-');
            
            row.innerHTML = `
                <td><strong>${incident.id}</strong></td>
                <td>
                    <span class="equipment-icon">${incident.equipmentIcon}</span>
                    ${incident.equipment}
                </td>
                <td>${incident.agency}</td>
                <td>
                    <span class="severity-badge severity-${severityClass}">${incident.severity}</span>
                </td>
                <td>
                    <span class="status-badge status-${statusClass}">${incident.status}</span>
                </td>
                <td>${incident.startDate.toLocaleDateString('pt-BR')} ${incident.startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${this.getElapsedTime(incident)}</td>
                <td>${incident.responsible}</td>
                <td>
                    <button class="btn-view" onclick="window.app.showIncidentDetail('${incident.id}')">
                        Ver Detalhes
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        this.updatePagination();
    }

    getElapsedTime(incident) {
        const endTime = incident.resolutionDate || new Date();
        const elapsedMs = endTime - incident.startDate;
        const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
        const elapsedDays = Math.floor(elapsedHours / 24);
        const remainingHours = elapsedHours % 24;

        if (elapsedDays > 0) {
            return `${elapsedDays}d ${remainingHours}h`;
        } else {
            return `${elapsedHours}h`;
        }
    }

    updatePagination() {
        const totalItems = this.filteredIncidents.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
        const endItem = Math.min(startItem + this.itemsPerPage - 1, totalItems);

        document.getElementById('paginationInfo').textContent = 
            `Mostrando ${startItem} a ${endItem} de ${totalItems} incidentes`;

        // Update page numbers
        const pageNumbers = document.getElementById('pageNumbers');
        pageNumbers.innerHTML = '';

        if (totalPages > 1) {
            const maxVisiblePages = 5;
            let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.textContent = i;
                pageBtn.className = `page-number ${i === this.currentPage ? 'active' : ''}`;
                pageBtn.addEventListener('click', () => {
                    this.currentPage = i;
                    this.updateTable();
                });
                pageNumbers.appendChild(pageBtn);
            }
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (this.currentPage === 1 || totalPages === 0) {
            prevBtn.disabled = true;
        } else {
            prevBtn.disabled = false;
        }
        
        if (this.currentPage === totalPages || totalPages === 0) {
            nextBtn.disabled = true;
        } else {
            nextBtn.disabled = false;
        }
    }

    showIncidentDetail(incidentId) {
        const incident = this.incidents.find(inc => inc.id === incidentId);
        if (!incident) return;

        const statusClass = incident.status.toLowerCase().replace(/\s+/g, '-');
        const severityClass = incident.severity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">ID do Incidente:</span>
                <span class="detail-value"><strong>${incident.id}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Equipamento:</span>
                <span class="detail-value">${incident.equipmentIcon} ${incident.equipment}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Agência:</span>
                <span class="detail-value">${incident.agency}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Severidade:</span>
                <span class="detail-value">
                    <span class="severity-badge severity-${severityClass}">${incident.severity}</span>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                    <span class="status-badge status-${statusClass}">${incident.status}</span>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Data de Início:</span>
                <span class="detail-value">${incident.startDate.toLocaleDateString('pt-BR')} às ${incident.startDate.toLocaleTimeString('pt-BR')}</span>
            </div>
            ${incident.resolutionDate ? `
            <div class="detail-row">
                <span class="detail-label">Data de Resolução:</span>
                <span class="detail-value">${incident.resolutionDate.toLocaleDateString('pt-BR')} às ${incident.resolutionDate.toLocaleTimeString('pt-BR')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tempo de Resolução:</span>
                <span class="detail-value">${incident.mttr.toFixed(1)} horas</span>
            </div>
            ` : `
            <div class="detail-row">
                <span class="detail-label">Tempo Decorrido:</span>
                <span class="detail-value">${this.getElapsedTime(incident)}</span>
            </div>
            `}
            <div class="detail-row">
                <span class="detail-label">Responsável:</span>
                <span class="detail-value">${incident.responsible}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Descrição:</span>
                <span class="detail-value">${incident.description}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tempo de Detecção:</span>
                <span class="detail-value">${(incident.mttd * 60).toFixed(0)} minutos</span>
            </div>
        `;

        document.getElementById('incidentModal').classList.remove('hidden');
    }

    exportData() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `incidentes_itau_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    generateCSV() {
        const headers = ['ID', 'Equipamento', 'Agência', 'Severidade', 'Status', 'Data Início', 'Data Resolução', 'Responsável', 'Descrição'];
        const rows = this.filteredIncidents.map(incident => [
            incident.id,
            incident.equipment,
            incident.agency,
            incident.severity,
            incident.status,
            incident.startDate.toLocaleDateString('pt-BR') + ' ' + incident.startDate.toLocaleTimeString('pt-BR'),
            incident.resolutionDate ? incident.resolutionDate.toLocaleDateString('pt-BR') + ' ' + incident.resolutionDate.toLocaleTimeString('pt-BR') : '',
            incident.responsible,
            incident.description
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return '\ufeff' + csvContent; // Add BOM for Excel compatibility
    }
}

// Initialize the application
window.app = new IBSApp();