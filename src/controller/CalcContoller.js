class CalcController {
	
	constructor() {

		this._audio = new Audio('meow.mp3'); //cria um novo objeto de áudio com o arquivo meow.mp3 | API Audio do JavaScript
		this._audioOnOff = false;

		this._lastOperator = '';
		this._lastNumber = '';
		this._operation = [];

		this._locale = 'pt-BR';
		this._displayCalcEl = document.querySelector("#display");
		this._dateEl = document.querySelector("#data");
		this._timeEl = document.querySelector("#hora");
		this._currentDate;

		this.initialize();
		this.initButtonsEvents();
		this.initKeyboard();
	}

	pasteFromClipboard() {

		document.addEventListener('paste', e => { //adiciona um evento de colar na tela, letra e controla as informações do evento
			let text = e.clipboardData.getData('Text'); //pega o dado do clipboard (área de transferência) no formato texto
			this.displayCalc = parseFloat(text); //joga o valor do texto no display como número
		});
	}

	copytoClipboard() {

		let input = document.createElement('input'); //cria um input invisível na tela
		input.value = this.displayCalc; //pega o valor do display e joga no input
		document.body.appendChild(input); //adiciona o input no corpo do documento e deixa visível
		input.select(); //seleciona o conteúdo do input
		document.execCommand("Copy"); //copia o conteúdo selecionado
		input.remove(); //remove o input da tela
	}

	initialize() {
		
		this.setDisplayDateTime();

		setInterval(() => { // A função foi colocada em uma variavel pois ela tem um novo Id a cada atualização.

			this.setDisplayDateTime(); 

		}, 1000) //1000 milisegundo = 1 segundo - Vai atualizar nesse tempo

		this.setLastNumberToDisplay();
		this.pasteFromClipboard();

	}

	toggleAudio() { //método para ativar/desativar o áudio

		this._audioOnOff = (this._audioOnOff) ? false : true; //inverte o valor booleano da variável, se for true, vira false e vice-versa
		console.log('Áudio Ligado:', this._audioOnOff);
	}

	playAudio() { //método para tocar o áudio
		
		if(this._audioOnOff) { //verifica se o áudio está ativado
			this._audio.currentTime = 0; //volta para o início do áudio
			this._audio.play(); //toca o áudio
		
		}
	}

	initKeyboard() {

		document.addEventListener('keyup', (e) => { //keyup -> evento de teclado, quando a tecla é solta

			this.playAudio(); //toca o áudio ao pressionar uma tecla do teclado

			switch(e.key) { 

				case 'Escape':
					this.clearAll();
					break;
				case 'Backspace':
					this.clearEntry();
					break;

				case '+':
				case '-':
				case '/':
				case '*':
				case '%':
					this.addOperation(e.key);
					break;

				case 'Enter':
				case '=':
					this.calc();
					break;

				case '.':
				case ',':
					this.addDot('.');
					break;

				case '0': //break é colocado só no último número para ir juntando na hora das operações.
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9': //vai vir até aqui e depois vai colocar a operação antes do break.
					this.addOperation(parseInt(e.key)); //parseInt -> transforma em int (numerico) | e.key -> pega o valor da tecla pressionada
					break;

				case 'c': 
					if (e.ctrlKey) this.copytoClipboard(); //verifica se a tecla ctrl está pressionada junto com o c
					break;

				
			}
		}); 
	}

	addEventListenerAll(element, events, fn){ //método para tratar multiplos eventos.

		events.split(' ').forEach(event => { //pega a lista de eventos e a cada ' ' (vazio), separa e coloca no array, depois percorre esse array, elemento por elemento e faz a função

			element.addEventListener(event, fn, false); //false para não duplicar o evento no momento que é executado
		});
	}

	clearAll(){ //método para limpar tudo

		this._operation = []; //recebe um array vazio, pois ele limpa tudo.
		this._lastNumber = '';
		this._lastOperator = '';
		this.setLastNumberToDisplay(); //atualiza o display
	}

	clearEntry(){ //método para limpar a ultima entrada (valor digitado)

		this._operation.pop(); //.pop -> método para excluir o último elemento de um array.
		this.setLastNumberToDisplay(); //atualiza o display
	}

	getLastOperation(){

		return this._operation[this._operation.length-1];

	}

	setLastOperation(value){

		this._operation[this._operation.length-1] = value; //subistitui o operador antigo por um novo

	}

	isOperator(value){

		return (['+', '-', '*', '%', '/'].indexOf(value) > -1); //verifica e retorna se o valor está dentro do array pelo index. Se menor que -1, não retorna.

	}

	pushOperation(value){

		this._operation.push(value);

		if (this._operation.length > 3) {

			this.calc();
		}
	}

	getResult(){
		try{
			return eval(this._operation.join("")); //eval -> função que avalia uma string como código javascript. 
			// Join -> junta os elementos do array em uma string.

		} catch(e){
			setTimeout(() => {
				this.setError();
			}, 1);
		}

	}

	calc(){

		let last = '';
		this._lastOperator = this.getLastItem(); //pega o último operador e joga na variável lastOperator

		if (this._operation.length < 3) { //verifica se tem menos de 3 elementos no array
			
			let firstItem = this._operation[0]; //pega o primeiro elemento do array
			this._operation = [firstItem, this._lastOperator, this._lastNumber]; //joga o primeiro elemento, o último operador e o último número no array novamente.
		}

		if (this._operation.length > 3) { //verifica se tem mais de 3 elementos no array
			last = this._operation.pop();
			this._lastNumber = this.getResult(); //pega o resultado da operação e joga na variável lastNumber
		} else if (this._operation.length == 3) {
			this._lastNumber = this.getLastItem(false); //pega o último número
		}
		
		let result = this.getResult();

		if (last == '%') {

			result = result / 100; //transforma em porcentagem - Pode escrever também como result /= 100
			this._operation = [result]; 

		} else {
			
			this._operation = [result]; 
			if (last) this._operation.push(last); //se tiver um último elemento, joga ele de volta para o array.

		}

		this.setLastNumberToDisplay();

	}

	getLastItem(isOperator = true){ //se isOperator for true, procura o último operador, se for false, procura o último número.
		
		let lastItem;

		for (let i = this._operation.length -1; i >= 0; i--){ //percorre o array de trás para frente, começando do último elemento

			if(this.isOperator(this._operation[i]) == isOperator) { //compara se o elemento é um operador ou não, dependendo do parâmetro passado na função.
				lastItem = this._operation[i]; //se for igual, joga o elemento na variável lastItem
				break; //interrompe o laço
			}
		}

		if (!lastItem) { //se não tiver nenhum elemento, atribui um valor padrão
			lastItem = (isOperator) ? this._lastOperator : this._lastNumber; 
		}

		return lastItem; //retorna o último item
	}

	setLastNumberToDisplay() {

		let lastNumber = this.getLastItem(false); //pega o último número

		if (!lastNumber) lastNumber = 0; 
		this.displayCalc = lastNumber;

	}

	addOperation(value){

		if (isNaN(this.getLastOperation())) { //se o último elemento não é um numérico, faz tal coisa.

			if(this.isOperator(value)){ //se o último é um operador
				
				this.setLastOperation(value); 

			} else if(isNaN(value)){

				console.log('outra coisa');

			} else {
				
				this.pushOperation(value);
				this.setLastNumberToDisplay();
			}

		} else { //se for um número, junta os elementos

			if (this.isOperator(value)) {

				this.pushOperation(value);

			} else {

				let newValue = this.getLastOperation().toString() + value.toString();//transforma números em texto para juntar e não somar.

				this.setLastOperation(newValue); //transforma em número 
				this.setLastNumberToDisplay();

			}
		}
	}

	setError(){

		this.displayCalc = "Error";
	}

	addDot(){

		let lastOperation = this.getLastOperation();

		if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return; 
		//verifica se é uma string, se for, divide a string em um array de caracteres e 
		// verifica se já existe um ponto. Se existir, sai da função.

		if (this.isOperator(lastOperation) || !lastOperation) { //se for um operador ou se não existir nenhum valor
			this.pushOperation('0.'); //adiciona o 0 antes do ponto
		} else { //se for um número
			this.setLastOperation(lastOperation.toString() + '.'); //concatena o ponto ao número existente
		}

		this.setLastNumberToDisplay();
	}

	execBtn(value){

		this.playAudio(); //toca o áudio ao clicar no botão

		switch(value) {
			case 'ac':
				this.clearAll();
				break;
			case 'ce':
				this.clearEntry();
				break;
			case 'soma':
				this.addOperation('+');
				break;
			case 'subtracao':
				this.addOperation('-');
				break;
			case 'divisao':
				this.addOperation('/');
				break;
			case 'multiplicacao':
				this.addOperation('*');
				break;
			case 'igual':
				this.calc();
				break;
			case 'porcento':
				this.addOperation('%');
				break;
			case 'ponto':
				this.addDot('.');
				break;

			case '0': //break é colocado só no último número para ir juntando na hora das operações.
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9': //vai vir até aqui e depois vai colocar a operação antes do break.
				this.addOperation(parseInt(value)); //parseInt -> transforma em int (numerico)
				break;
			default:
				this.setError;
		}
	}

	initButtonsEvents(){

		let buttons = document.querySelectorAll("#buttons > g, #parts > g");

		buttons.forEach((btn, index) => { 
			
			this.addEventListenerAll(btn, "click drag", e => { //e - está sendo usado como parâmetro da função, se precisar falar sobre o click, vamos chamar e
				
				let textBtn = btn.className.baseVal.replace("btn-", "");

				this.execBtn(textBtn); //método para executar a ação de um botão.
			});

			this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => { 

				btn.style.cursor = "pointer"; //muda o estilo do cursor do mouse para a mãozinha de click.

			});

			this.addEventListenerAll(btn, "dblclick", e => {
                 let textBtn = btn.className.baseVal.replace("btn-", "");
				 console.log("Botão clicado 2x:", textBtn);
                 
                 if(textBtn.indexOf('ac') > -1 ) { //verifica se o texto do botão contém 'ac' e chama o toggleAudio
                     this.toggleAudio();
                 }
            });
		});
	}

	setDisplayDateTime(){

		this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
			day: "2-digit", //dia vai aparecer em 2 digitos
			month: "long", //escreve o nome completo - short (abrevia o nome)
			year: "numeric" //ano em 4 digitos 
		});
		this.displayTime = this.currentDate.toLocaleTimeString(this._locale);

	}

	get displayDate(){
		return this._timeEl.innerHTML;
	}

	set displayDate(value){
		this._dateEl.innerHTML = value;
	}

	get displayTime(){
		return this._dateEl.innerHTML;
	}

	set displayTime(value){
		this._timeEl.innerHTML = value;
	}

	get displayCalc(){
		return this._displayCalcEl.innerHTML;
	}

	set displayCalc(value){
		if (value.toString().length > 10) { //verifica se o valor é maior que 10, se for, chama o método setError
            this.setError();
            return false;
        }
		this._displayCalcEl.innerHTML = value; 
	}

	get currentDate(){
		return new Date;
	}

	set currentDate(date){
		this._currentDate = date;
	}
	
}