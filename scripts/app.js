// Constantes para chaves do localStorage
const INVESTMENTS_KEY = 'investments';

// Variável para armazenar o índice do investimento em edição
let editingIndex = -1;

// Funções de utilidade para localStorage
const getInvestments = () => {
    const investments = localStorage.getItem(INVESTMENTS_KEY);
    return investments ? JSON.parse(investments) : [];
};

// Salva no localstorage
const saveInvestments = (investments) => {
    localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(investments));
};

// Função para formatar valor monetário
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Função para formatar data de aaaa/mm/dd para dd/mm/aaaa
function formatarData(dataISO) {
    // Verifica se a data está no formato esperado (AAAA-MM-DD)
    const regexDataISO = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexDataISO.test(dataISO)) {
        return "Formato de data inválido. Use AAAA-MM-DD.";
    }

    // Divide a string da data em partes (ano, mês, dia)
    const partesData = dataISO.split('-');
    const ano = partesData[0];
    const mes = partesData[1];
    const dia = partesData[2];

    // Retorna a data formatada no formato DD/MM/AAAA
    return `${dia}/${mes}/${ano}`;
}

// Renderiza os investimentos na tabela
const showInvestments = () => {
    const investments = getInvestments();
    const tableBody = document.querySelector('#tabelaInvestimentos tbody');
    tableBody.innerHTML = '';

    investments.forEach((investment, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${investment.nome}</td>
            <td>${investment.tipo}</td>
            <td>${formatCurrency(investment.valor)}</td>
            <td>${investment.dataInicio}</td>
            <td>${investment.dataVencimento}</td>
            <td>
                <button onclick="editInvestment(${index})" ${editingIndex !== -1 && editingIndex !== index ? 'disabled' : ''}>Editar</button>
                <button onclick="deleteInvestment(${index})" ${editingIndex !== -1 ? 'disabled' : ''}>Deletar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
};

// Cadastra um novo investimento
document.getElementById('formCadastro').addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const tipo = document.getElementById('tipo').value;
    const valor = parseFloat(document.getElementById('valor').value);
    let dataInicio = document.getElementById('dataInicio').value;
    let dataVencimento = document.getElementById('dataVencimento').value;

    if (nome && tipo && !isNaN(valor) && dataInicio && dataVencimento) {
        // Formata as datas antes de criar o investimento
        dataInicio = formatarData(dataInicio);
        dataVencimento = formatarData(dataVencimento);

        const newInvestment = { nome, tipo, valor, dataInicio, dataVencimento };
        const investments = getInvestments();
        investments.push(newInvestment);
        saveInvestments(investments);
        showInvestments();
        document.getElementById('formCadastro').reset();
        window.alert('Investimento cadastrado com sucesso!');

        // Chama a função para atualizar o gráfico
        showInvestmentsChart();
    } else {
        window.alert('Erro ao cadastrar investimento. Verifique os campos.');
    }
});

// Edita um investimento
const editInvestment = (index) => {
    editingIndex = index;
    const investments = getInvestments();
    const investment = investments[index];

    document.getElementById('nome').value = investment.nome;
    document.getElementById('tipo').value = investment.tipo;
    document.getElementById('valor').value = investment.valor;
    document.getElementById('dataInicio').value = investment.dataInicio;
    document.getElementById('dataVencimento').value = investment.dataVencimento;

    showInvestments();
};

// Exclui um investimento
const deleteInvestment = (index) => {
    const investments = getInvestments();
    investments.splice(index, 1);
    saveInvestments(investments);
    showInvestments();
    window.alert('Investimento excluído com sucesso!');
};

// Mostra o Gráfico
function showInvestmentsChart() {
    const investments = getInvestments();
    const types = {};

    investments.forEach(investment => {
        if (types[investment.tipo]) {
            types[investment.tipo]++;
        } else {
            types[investment.tipo] = 1;
        }
    });

    const labels = Object.keys(types);
    const data = Object.values(types);

    const ctx = document.getElementById('investmentsChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribuição de Investimentos',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(0, 89, 255, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(21, 58, 75, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)'
                ],
                borderWidth: 1 // Remove as bordas
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuição de Tipos de Investimentos',
                    color: 'black',
                    font: {
                        size: 38
                    }
                },
                legend: {
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        padding: 20,
                        color: 'black',
                        font: {
                            size: 25
                        }
                    }
                }
            }
        }
    });
}

// Inicializar a lista de investimentos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    showInvestments();
    showInvestmentsChart();
});