 export function valida(input) {
    const tipoDeInput = input.dataset.tipo //acessando um tipo de data-attribute de um elemento
    if(validadores[tipoDeInput]) {
        validadores[tipoDeInput](input)
    }

    if(input.validity.valid) { //aplicando o layout css específico apenas se houver erro 
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
    } else { //escondendo os layouts nos demais casos
        input.parentElement.classList.add('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoDeInput, input)
    }
}

const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

const mensagensDeErro = {
    nome: {
        valueMissing: 'O campo nome não pode estar vazio'
    },
    email: {
        valueMissing: 'O campo email não pode estar vazio',
        typeMismatch: 'O email digitado não é válido'
    }, 
    senha: {
        valueMissing: 'O campo senha não pode estar vazio',
        patternMismatch: 'A senha deve conter entre 6 a 12 caracteres, pelo menos uma letra maiúscula, pelo menos um número e não deve conter símbolos'
    },
    dataNascimento: {
        valueMissing: 'O campo de data de nascimento não pode estar vazio',
        customError: 'Você deve ser maior de 18 anos para se cadastrar'
    },
    cpf: {
        valueMissing: 'O campo CPF não pode estar vazio',
        customError: 'O CPF digitado não é válido'
    }, 
    cep: {
        valueMissing: 'O campo CEP não pode estar vazio',
        patternMismatch: 'O CEP digitado não é válido',
        customError: 'Não foi possível buscar o CEP'
    },
    logradouro: {
        valueMissing: 'O campo logradouro não pode estar vazio'
    }, 
    cidade: {
        valueMissing: 'O campo cidade não pode estar vazio'
    },
    estado: {
        valueMissing: 'O campo estado não pode estar vazio'
    },
    preco: {
        valueMissing: 'O campo preco não pode estar vazio'
    }
   
} 

function mostraMensagemDeErro(tipoDeInput, input) {
    let mensagem = ''
    tiposDeErro.forEach(erro => {
        if(input.validity[erro]) {
            mensagem = mensagensDeErro[tipoDeInput][erro]// a mensagem será acessada de acordo com o tipo de input e o erro que ocorreu
        }
    })
    return mensagem
}

const validadores = {
    dataNascimento:input => validaDataNascimento(input), //a propriedade dataNascimento recebe o valor do input e em seguida é passada como argumento de uma arrow function contendo a função validaDataNascimento recebendo o input como argumento
    cpf:input => validaCPF(input), //a propriedade cpf recebe o valor do input e em seguida é passada como argumento de uma arrow function contendo a função validaCPF recebendo o input como argumento
    cep:input => recuperarCEP(input)//a propriedade cep recebe o valor do input e em seguida é passada como argumento de uma arrow function contendo a função recuperarCEP recebendo o input como argumento
}

function validaDataNascimento(input) {
    const dataRecebida = new Date(input.value) //objeto Date instanciado recebendo como parâmetro o valor do input(recebido como parâmetro da função)
    let mensagem = ''
    if(!maiorQue18(dataRecebida)) { // função recebendo a constante que guarda a data capturada do input para realizar a validação da idade
        mensagem= 'Você deve ser maior que 18 anos para se cadastrar' //mensagem de erro
    } 
    
    input.setCustomValidity(mensagem) //customizaçãpo da validação do input
}

function maiorQue18(data) {
    const dataAtual = new Date() // objeto Date instanciado sem parâmetro para receber a data de hoje
    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())
    return dataMais18 <= dataAtual
}

function validaCPF(input) {
    const cpfFormatado = input.value.replace(/\D/g, '') // capturando tudo dentro da nossa string que não for um dígito e vamos trocá-los por uma string vazia
    let mensagem = ''

    if(!chaecaCPFRepetido(cpfFormatado) || !checaEstruturaCPF(cpfFormatado)) {
        mensagem = 'O CPF formatado não é válido'
    }

    input.setCustomValidity(mensagem)
}

function chaecaCPFRepetido(cpf) {
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]

    let cpfValido = true;

    valoresRepetidos.forEach(valor => {
        if(valor == cpf) {
            cpfValido = false
        }
    })

    return cpfValido
}

function checaEstruturaCPF(cpf) {
    const multiplicador = 10 

    return checaDigitoVerificador(cpf, multiplicador)
}

function checaDigitoVerificador(cpf, multiplicador) {
    if(multiplicador >= 12) {
        return true
    }

    let multiplicadorInicial = multiplicador
    let soma = 0
    const cpfSemDigitos = cpf.substring(0, multiplicador - 1).split('')
    const digitoVerificador = cpf.charAt(multiplicador - 1)
    for(let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
        soma = soma + cpfSemDigitos[contador] * multiplicadorInicial
        contador++
    }

    if(digitoVerificador == confirmaDigito(soma)) {
        return checaDigitoVerificador(cpf, multiplicador + 1)
    }

    return false
}   

function confirmaDigito(soma) {
    return 11 - (soma % 11)
}

function recuperarCEP(input) {
    const cep = input.value.replace(/\D/g, '') // substituindo tudo que não for números por uma string vazia
    const url = `https://viacep.com.br/ws/${cep}/json/` //url da ViaCEP recebendo o CEP que será passada como argumento da função fetch()
    const options = { // instanciando o objeto options que será passado como argumento da função fetch()
        method: 'GET', // indica o tipo de requisição que será feita
        mode: 'cors', // indica que a comunicação será feita entre aplicações diferentes
        headers: {
            'content-type': 'application/json;charset=utf-8' // diz como queremos receber as informações da API
        }
    }

    if(!input.validity.patternMismatch && !input.validity.valueMissing) {
        // utilizando  a fetch API para se conectar com a API da Via CEP
        fetch(url, options) .then( response => response.json()). then( data => {
            if(data.erro) {
                input.setCustomValidity('Não foi possível buscar o CEP')
                return
            }
            input.setCustomValidity('')
            preencheCamposComCEP(data)
            return
        })
    }
}

function preencheCamposComCEP(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')

    logradouro.value = data.logradouro // substituindo o valor do input logradouro pelo valor da propriedade logradouro do objeto data
    cidade.value = data.localidade // substituindo o valor do input cidade pelo valor da propriedade localidade do objeto data
    estado.value = data.uf // substituindo o valor do input estado pelo valor da propriedade uf do objeto data
}