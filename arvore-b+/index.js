var arvoreHTML;
var useCanvas = !!document.createElement('canvas').getContext;
var arv = null;
var historico = [];
var conjunto = [];
var maxDisplay;

//Structs utilizadas ao longo do algoritmo
folha = function () 
{
	this.valorChave = [];
	this.recNum = [];
	this.folhaEsq = null;
	this.folhaDir = null;
};

no = function () 
{
	this.valorChave = [];
	this.ponteiroNo = [];
};

arvore = function (ordem) 
{
	this.raiz = new folha();
	this.chaveMax = ordem - 1;
	this.chaveMaxE = Math.floor(ordem / 2);
	this.chaveMaxD = Math.floor(this.chaveMax / 2);
	this.folha = null;
	this.item = -1;
	this.valorChave = '';
	this.recNum = -1;
	this.length = 0;
	this.eof = true;
	this.encontrado = false;
};

//Função que recebe os eventos do html e dispara as funções 
rodarAcao = function(acao, num) 
{
	num = parseInt(num,10);
	if (isNaN(num)) 
		num = 0;

	var txt = '';

	if ('gerarNova~gerarChaveAleatoria'.search(acao) ==- 1 && arv === null) 
	{
		txt = 'Erro: você precisa construir a árvore primeiro.';
	} 
	else if (acao=='gerarNova' && (num < 3 || num > 10)) {
		txt = 'Erro: você precisa ter ao menos uma ordem maior ou igual a 3 e menor ou igual a 10.';
	} 
	else if ('adicionar~procurar~gerarChaveAleatoria~adicionarChavesAleatorias'.search(acao) != -1 && num <= 0) 
	{
		txt = 'Erro: Número inválido. As entradas devem ser de números maiores que zero';
	}
	if (txt.length > 0) 
		acao = 'error';

	var foc = '';
	switch (acao) 
	{
		case 'error':
			break;
		case 'gerarNova':
			arv = new arvore(num);
			maxDisplay = num * 100;
			historico = [];
			historico[0] = 'arv = new arvore(' + num + ');'; 
			getObj('valoresAleatorios').innerHTML = '';
			break;
		case 'adicionar':
			arv.inserir(num,num);
			historico.push('arv.inserir(' + num + ',' + num + ');');
			foc = 'num';
			getObj('num').value = '';
			break;
		case 'deletar':
			if (num == 0) {
				arv.deletar();
				historico.push('arv.deletar();');
			} else {
				arv.deletar(num);
				historico.push('arv.deletar(' + num + ');');
			}
			foc = 'num';
			getObj('num').value = '';
			break;
		case 'procurar':
			arv.procurar(num);
			historico.push('arv.procurar(' + num + ');');
			foc = 'num';
			break;
		case 'reorganizar':
			arv.reorganizar();
			historico.push('arv.reorganizar();');
			break;		
		case 'gerarChaveAleatoria':
			conjunto = [];
			for (i = 0; i < num; i++) {
				conjunto[i] = i + 1;
			}
			conjunto.shuffle();
			getObj('valoresAleatorios').innerHTML = 'Valores aleatórios \n [' + conjunto + ']';
			txt = 'Conjunto criado com ' + regex(num) + ' chaves.<br>\r\n';
			break;
		case 'adicionarChavesAleatorias':
			var i = 0;
			while (i < num && conjunto.length > 0) 
			{
				arv.inserir(conjunto.pop(),'');
				if (!arv.encontrado) 
					i++;
			}
			if (i < num) 
				txt = 'Erro:  Quantidade de chaves únicas insuficientes no conjunto. Nenhuma chave foi adicionada.';
			historico.push('adicionarChavesAleatorias - ' + i + ' chaves foram adicionadas à árvore');
			
			if (conjunto.length > 0)  			
				getObj('valoresAleatorios').innerHTML = 'Valores aleatórios \n [' + conjunto + ']';
			else
				getObj('valoresAleatorios').innerHTML = '';
			arv.reorganizar();
			break;		
		case 'historico':
			for (var i = 0, len = historico.length; i < len; i++) {
				txt += historico[i] + '<br>\r\n';
			}
			break;
	}

	if (arv !== null) {
		if (txt.length == 0) 
			txt = arv.exibir('canvas');
		else
			arv.mostrar('canvas');
	}
	if (typeof txt == 'undefined')	
		getObj('msg').innerHTML = '';
	else
		getObj('msg').innerHTML = txt;
	
	if (foc != 'num' && foc != '') 
		getObj(foc).focus();
	else
	{
		//getObj('valoresAleatorios').innerHTML = '';
		clean(getObj('num'));
	}
}
//Função para gerar valores aleatórios
Array.prototype.shuffle = function () 
{
	for (var i = this.length - 1; i > 0; i--) 
	{
		var j = Math.floor(Math.random() * (i + 1));
		var tmp = this[i];
		this[i] = this[j];
		this[j] = tmp;
	}
	return this;
}

//Função para normalizar um determinado valor de entrada
regex = function (x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Função utilizada para retornar o objeto pelo nome ou id
function getObj(d) 
{
	var x = document.getElementById(d);
	if (!x) 
	{
		var y = document.getElementsByName(d);
		if (y.length > 0) x = y[0];
	}
	return x;
}

//Função para limpar e dar foco em um elemento
function clean(elemento) 
{
	elemento.focus();
	elemento.value = '';
}

//Método para retornar que o nó é um nó folha
folha.prototype.ehFolha = function() 
{
	return true;
};

//Método para buscar uma determinada folha pela sua chave
folha.prototype.getItem = function (chave) 
{
	var vals = this.valorChave;
	for (var i = 0, len = vals.length; i < len; i++) 
	{
		if (chave === vals[i]) 
			return i;
	}
	return -1;
};

//Método para adicionar uma chave em uma folha da árvore validando a duplicidade
folha.prototype.addChave = function (chave, rec) 
{
	var vals = this.valorChave;
	var itm = vals.length;
	for (var i = 0, len = itm; i < len; i++) 
	{
		if (chave === vals[i]) 
		{
			itm = -1;
			break;
		}
		if (chave <= vals[i]) 
		{
			itm = i;
			break;
		}
	}
	if (itm != -1) 
	{
		for (var i = vals.length; i > itm; i--) 
		{
			vals[i] = vals[i-1];
			this.recNum[i] = this.recNum[i-1];
		}
		vals[itm] = chave;
		this.recNum[itm] = rec;
	}
	return itm;
};

//Método para dividir e gravar uma nova folha na árvore
folha.prototype.dividir = function () 
{
	var mov = Math.floor(this.valorChave.length / 2);
	var novaFolha = new folha();
	for (var i=mov-1; i>=0; i--) 
	{
		novaFolha.valorChave[i] = this.valorChave.pop();
		novaFolha.recNum[i] = this.recNum.pop();
	}
	novaFolha.folhaEsq = this;
	novaFolha.folhaDir = this.folhaDir;
	if (this.folhaDir !== null) 
		this.folhaDir.folhaEsq = novaFolha;
	this.folhaDir = novaFolha;
	return novaFolha;
};

//Método para fazer a mesclagem de uma nova folha na árvore
folha.prototype.mesclar = function (novoNo, noPai, novaChave) 
{
	for (var i = 0, len = novoNo.valorChave.length; i < len; i++) 
	{
		this.valorChave.push(novoNo.valorChave[i]);
		this.recNum.push(novoNo.recNum[i]);
	}
	this.folhaDir = novoNo.folhaDir;
	if (novoNo.folhaDir !== null) 
		novoNo.folhaDir.folhaEsq = this;
	novoNo.folhaEsq = null;
	novoNo.folhaDir = null;
	var itm = noPai.valorChave.length-1;
	for (var i = itm; i >= 0; i--) 
	{
		if (noPai.valorChave[i] == novaChave) {
			itm = i;
			break;
		}
	}
	for (var i = itm, len = noPai.valorChave.length-1; i < len; i++)
	{
		noPai.valorChave[i] = noPai.valorChave[i+1];
		noPai.ponteiroNo[i + 1] = noPai.ponteiroNo[i+2];
	}
	noPai.valorChave.pop();
	noPai.ponteiroNo.pop();
};

//Método para retornar que o nó não é um nó folha
no.prototype.ehFolha = function() 
{
	return false;
};

//Método para buscar um determinado nó pela sua chave
no.prototype.getItem = function (chave) 
{
	var vals = this.valorChave;
	for (var i = 0, len = vals.length; i < len; i++) 
	{
		if (chave < vals[i]) 
			return i;
	}
	return vals.length;
};

//Método para adicionar uma chave em um nó da árvore validando a duplicidade
no.prototype.addChave = function (chave, ptrE, ptrD) 
{
	var vals = this.valorChave;
	var itm = vals.length;
	for (var i = 0, len = vals.length; i < len; i++) 
	{
		if (chave <= vals[i]) 
		{
			itm = i;
			break;
		}
	}
	for (var i = vals.length; i > itm; i--) 
	{
		vals[i] = vals[i-1];
		this.ponteiroNo[i+1] = this.ponteiroNo[i];
	}
	vals[itm] = chave;
	this.ponteiroNo[itm] = ptrE;
	this.ponteiroNo[itm + 1] = ptrD;
};

//Método para dividir e gravar um novo nó na árvore
no.prototype.dividir = function () 
{
	var mov = Math.ceil(this.valorChave.length / 2) - 1;
	var newN = new no();
	newN.ponteiroNo[mov] = this.ponteiroNo.pop();
	for (var i = mov - 1; i >= 0; i--) 
	{
		newN.valorChave[i] = this.valorChave.pop();
		newN.ponteiroNo[i] = this.ponteiroNo.pop();
	}
	return newN;
};

//Método para fazer a mesclagem de uma nova folha na árvore
no.prototype.mesclar = function (novoNo, noPai, paItm) 
{
	var del = noPai.valorChave[paItm];
	this.valorChave.push(del);
	for (var i=0, len=novoNo.valorChave.length; i<len; i++) 
	{
		this.valorChave.push(novoNo.valorChave[i]);
		this.ponteiroNo.push(novoNo.ponteiroNo[i]);
	}
	this.ponteiroNo.push(novoNo.ponteiroNo[novoNo.ponteiroNo.length-1]);
	for (var i=paItm, len=noPai.valorChave.length-1; i<len; i++) 
	{
		noPai.valorChave[i] = noPai.valorChave[i+1];
		noPai.ponteiroNo[i+1] = noPai.ponteiroNo[i+2];
	}
	noPai.valorChave.pop();
	noPai.ponteiroNo.pop();
	return del;
};

//Método para inserir uma nova chave na árvore
arvore.prototype.inserir = function (chave, rec) 
{
	var pilha = [];
	this.folha = this.raiz;
	while (!this.folha.ehFolha()) 
	{
		pilha.push(this.folha);
		this.item = this.folha.getItem(chave);
		this.folha = this.folha.ponteiroNo[this.item];
	}
	this.item = this.folha.addChave(chave, rec);
	this.valorChave = chave;
	this.eof = false;
	if (this.item === -1) 
	{
		this.encontrado = true;
		this.item = this.folha.getItem(chave,false);
		this.recNum = this.folha.recNum[this.item];
	} else 
	{
		this.encontrado = false;
		this.recNum = rec;
		this.length++;
		if (this.folha.valorChave.length > this.chaveMax) 
		{
			var pL = this.folha;
			var pR = this.folha.dividir();
			var ky = pR.valorChave[0];
			this.item = this.folha.getItem(chave,false);
			if (this.item === -1) 
			{
				this.folha = this.folha.folhaDir;
				this.item = this.folha.getItem(chave,false);
			}
			while (true) 
			{
				if (pilha.length === 0) 
				{
					var newN = new no();
					newN.valorChave[0] = ky;
					newN.ponteiroNo[0] = pL;
					newN.ponteiroNo[1] = pR;
					this.raiz = newN;
					break;
				}
				var nod = pilha.pop();
				nod.addChave(ky, pL, pR);
				if (nod.valorChave.length <= this.chaveMax) 
					break;
				pL = nod;
				pR = nod.dividir();
				ky = nod.valorChave.pop();
			}
		}
	}
	
	return (!this.encontrado);
	
};

//Método para deletar uma chave da árvore
arvore.prototype.deletar = function (chave) 
{
	if (typeof chave == 'undefined') 
	{
		if (this.item === -1) 
		{
			this.eof = true;
			this.encontrado = false;
			return false;
		}
		chave = this.folha.valorChave[this.item];
	}
	this._del(chave);
	if (!this.encontrado) 
	{
		this.item = -1;
		this.eof = true;
		this.valorChave = '';
		this.recNum = -1;
	} 
	else 
	{
		this.procurar(chave, true);
		this.encontrado = true;
	}
	return (this.encontrado);
};

//Método para procurar uma chave na árvore
arvore.prototype.procurar = function (chave) 
{
	this.folha = this.raiz;
	while (!this.folha.ehFolha()) 
	{
		this.item = this.folha.getItem(chave);
		this.folha = this.folha.ponteiroNo[this.item];
	}
	this.item = this.folha.getItem(chave);
	if (this.item == -1 && this.folha.folhaDir !== null) 
	{
		this.folha = this.folha.folhaDir;
		this.item = 0;
	}
	if (this.item === -1) 
	{
		this.eof = true;
		this.valorChave = '';
		this.encontrado = false;
		this.recNum = -1;
	} 
	else 
	{
		this.eof = false;
		this.encontrado = (this.folha.valorChave[this.item] === chave);
		this.valorChave = this.folha.valorChave[this.item];
		this.recNum = this.folha.recNum[this.item];
	}
	return (!this.eof);
};

//Método para retornar o topo da árvore
arvore.prototype.goTop = function () 
{
	this.folha = this.raiz;
	while (!this.folha.ehFolha()) 
	{
		this.folha = this.folha.ponteiroNo[0];
	}
	if (this.folha.valorChave.length === 0) 
	{
		this.item = -1;
		this.eof = true;
		this.encontrado = false;
		this.valorChave = '';
		this.recNum = -1;
	} 
	else 
	{
		this.item = 0;
		this.eof = false;
		this.encontrado = true;
		this.valorChave = this.folha.valorChave[0];
		this.recNum = this.folha.recNum[0];
	}
	return (this.encontrado);
};

//Método para reorganizar os nós e otimizar a altura/largura da árvore
arvore.prototype.reorganizar = function () 
{
	this.goTop(0);
	if (this.folha == this.raiz) return;

	// Pack leaves
	var toN = new folha();
	var toI = 0;
	var frN = this.folha;
	var frI = 0;
	var parKey = [];
	var parNod = [];
	while (true) 
	{
		toN.valorChave[toI] = frN.valorChave[frI];
		toN.recNum[toI] = frN.recNum[frI];
		if (toI === 0) parNod.push(toN);
		if (frI == frN.valorChave.length-1) 
		{
			if (frN.folhaDir === null) break;
			frN = frN.folhaDir;
			frI = 0;
		} 
		else 
		{
			frI++;
		}
		if (toI == this.chaveMax-1) 
		{
			var tmp = new folha();
			toN.folhaDir = tmp;
			tmp.folhaEsq = toN;
			toN = tmp;
			toI = 0;
		} 
		else 
		{
			toI++;
		}
	}
	var mov = this.chaveMaxE - toN.valorChave.length;
	frN = toN.folhaEsq;
	if (mov > 0 && frN !== null) 
	{
		for (var i=toN.valorChave.length-1; i>=0; i--) 
		{
			toN.valorChave[i+mov] = toN.valorChave[i];
			toN.recNum[i+mov] = toN.recNum[i];
		}
		for (var i=mov-1; i>=0; i--) 
		{
			toN.valorChave[i] = frN.valorChave.pop();
			toN.recNum[i] = frN.recNum.pop();
		}
	}
	for (i=1, len=parNod.length; i<len; i++) 
	{
		parKey.push(parNod[i].valorChave[0]);
	}
	parKey[parKey.length] = null;

	// Rebuild nodes
	var kidKey, kidNod;
	while (parKey[0] !== null) 
	{
		kidKey = parKey;
		kidNod = parNod;
		parKey = [];
		parNod = [];
		var toI = this.chaveMax+1;
		for (var i=0, len=kidKey.length; i<len; i++) 
		{
			if (toI > this.chaveMax) 
			{
				toN = new no();
				toI = 0;
				parNod.push(toN);
			}
			toN.valorChave[toI] = kidKey[i];
			toN.ponteiroNo[toI] = kidNod[i];
			toI++;
		}
		mov = this.chaveMaxD - toN.valorChave.length + 1;
		if (mov > 0 && parNod.length > 1) {
			for (var i=toN.valorChave.length-1; i>=0; i--) 
			{
				toN.valorChave[i+mov] = toN.valorChave[i];
				toN.ponteiroNo[i+mov] = toN.ponteiroNo[i];
			}
			frN = parNod[parNod.length-2];
			for (var i=mov-1; i>=0; i--) 
			{
				toN.valorChave[i] = frN.valorChave.pop();
				toN.ponteiroNo[i] = frN.ponteiroNo.pop();
			}
		}
		for (var i=0, len=parNod.length; i<len; i++) 
		{
			parKey.push(parNod[i].valorChave.pop());
		}
	}
	this.raiz = parNod[0];
	this.goTop();
	return (this.encontrado);
};

//Método de apoio do Método deletar para que seja feita a busca de todos 
//os registros da chave na árvore e apagá-los
arvore.prototype._del = function (chave) 
{
	var stack = [];
	var parNod = null;
	var parPtr = -1;
	this.folha = this.raiz;
	while (!this.folha.ehFolha()) 
	{
		stack.push(this.folha);
		parNod = this.folha;
		parPtr = this.folha.getItem(chave);
		this.folha = this.folha.ponteiroNo[parPtr];
	}
	this.item = this.folha.getItem(chave, false);
	if (this.item === -1) 
	{
		this.encontrado = false;
		return;
	}
	this.encontrado = true;

	for (var i = this.item, len = this.folha.valorChave.length - 1; i < len; i++) 
	{
		this.folha.valorChave[i] = this.folha.valorChave[i+1];
		this.folha.recNum[i] = this.folha.recNum[i+1];
	}
	this.folha.valorChave.pop();
	this.folha.recNum.pop();
	this.length--;

	if (this.folha == this.raiz) return;
	if (this.folha.valorChave.length >= this.chaveMaxE) 
	{
		if (this.item === 0) this._ajustarNos(stack, chave, this.folha.valorChave[0]);
		return;
	}
	var delKey;
	
	var sibL = (parPtr === 0) ? null : parNod.ponteiroNo[parPtr-1];
	if (sibL !== null && sibL.valorChave.length > this.chaveMaxE) 
	{
		delKey = (this.item === 0) ? chave : this.folha.valorChave[0];
		for (var i=this.folha.valorChave.length; i>0; i--) {
			this.folha.valorChave[i] = this.folha.valorChave[i-1];
			this.folha.recNum[i] = this.folha.recNum[i-1];
		}
		this.folha.valorChave[0] = sibL.valorChave.pop();
		this.folha.recNum[0] = sibL.recNum.pop();
		this._ajustarNos(stack, delKey, this.folha.valorChave[0]);
		return;
	}

	var sibR = (parPtr == parNod.valorChave.length) ? null : parNod.ponteiroNo[parPtr+1];
	if (sibR !== null && sibR.valorChave.length > this.chaveMaxE) 
	{
		this.folha.valorChave.push(sibR.valorChave.shift());
		this.folha.recNum.push(sibR.recNum.shift());
		if (this.item === 0) this._ajustarNos(stack, chave, this.folha.valorChave[0]);
		this._ajustarNos(stack, this.folha.valorChave[this.folha.valorChave.length-1], sibR.valorChave[0]);
		return;
	}

	if (sibL !== null) 
	{
		delKey = (this.item === 0) ? chave : this.folha.valorChave[0];
		sibL.mesclar(this.folha, parNod, delKey);
		this.folha = sibL;
	} 
	else 
	{
		delKey = sibR.valorChave[0];
		this.folha.mesclar(sibR, parNod, delKey);
		if (this.item === 0) this._ajustarNos(stack, chave, this.folha.valorChave[0]);
	}

	if (stack.length === 1 && parNod.valorChave.length === 0) 
	{
		this.raiz = this.folha;
		return;
	}

	var curNod = stack.pop();
	var parItm;

	while (curNod.valorChave.length < this.chaveMaxD && stack.length > 0) 
	{

		parNod = stack.pop();
		parItm = parNod.getItem(delKey);
		
		sibR = (parItm == parNod.valorChave.length) ? null : parNod.ponteiroNo[parItm+1];
		if (sibR !== null && sibR.valorChave.length > this.chaveMaxD) 
		{
			curNod.valorChave.push(parNod.valorChave[parItm]);
			parNod.valorChave[parItm] = sibR.valorChave.shift();
			curNod.ponteiroNo.push(sibR.ponteiroNo.shift());
			break;
		}
		
		sibL = (parItm === 0) ? null : parNod.ponteiroNo[parItm-1];
		if (sibL !== null && sibL.valorChave.length > this.chaveMaxD) 
		{
			for (var i=curNod.valorChave.length; i>0; i--) 
			{
				curNod.valorChave[i] = curNod.valorChave[i-1];
			}
			for (var i=curNod.ponteiroNo.length; i>0; i--) 
			{
				curNod.ponteiroNo[i] = curNod.ponteiroNo[i-1];
			}
			curNod.valorChave[0] = parNod.valorChave[parItm-1];
			parNod.valorChave[parItm-1] = sibL.valorChave.pop();
			curNod.ponteiroNo[0] = sibL.ponteiroNo.pop();
			break;
		}
		
		if (sibL !== null) 
		{
			delKey = sibL.mesclar(curNod, parNod, parItm-1);
			curNod = sibL;
		} 
		else if (sibR !== null) 
		{
			delKey = curNod.mesclar(sibR, parNod, parItm);
		}
		
		if (stack.length === 0 && parNod.valorChave.length === 0) 
		{
			this.raiz = curNod;
			break;
		}
		curNod = parNod;
	}
};

//Método para ajustar as posições dos nós em relação a altura, por exemplo
arvore.prototype._ajustarNos = function (pilha, chave, novaChave) 
{
	var vals, altura = pilha.length, mor = true;
	do 
	{
		altura--;
		vals = pilha[altura].valorChave;
		for (var i = vals.length - 1; i >= 0; i--) 
		{
			if (vals[i] == chave) 
			{
				vals[i] = novaChave;
				mor = false;
				break;
			}
		}
	} while (mor && altura > 0);
};

//Método para validar a criação do desenho da árvore
arvore.prototype.exibir = function (canvasId) 
{
	if (this.length > maxDisplay) 
	{
		arvoreHTML += '<br><br>\r\n'+'Árvore é muito grande com ' + regex(this.length) + ' chaves).';
		if (!this.eof) arvoreHTML += ' Chave atual: ' + this.folha.valorChave[this.item];
		arvoreHTML += '<br>\r\n';
		this.mostrar(canvasId);
		return arvoreHTML;
	}
	if (useCanvas) 
	{
		this.criarArvore(canvasId);
		this.desenhaNo(this.raiz, 0);
	}
	return arvoreHTML;
};

//Método para instanciar o desenho da árvore na tag do html
arvore.prototype.mostrar = function (canvasId) 
{
	if (useCanvas) 
	{
		var canv = getObj(canvasId);
		canv.width = 1;
		canv.height = 1;
	}
};

//Método para desenhar a árvore inicial
arvore.prototype.criarArvore = function (cId) {
	// Canvas
	this.canvas = getObj(cId);
	this.contex = this.canvas.getContext('2d');

	// Colours
	this.Nfill = '#D2B48C';
	this.Nline = '#8C6414';
	this.Pfill = '#880015';
	this.Pline = '#880015';
	this.Lfill = '#90EE90';
	this.Lline = '#008000';
	this.Cfill = '#FFAAAA';
	this.Cline = '#CC0000';
	this.Tline = '#000000';

	// Position and sizes
	this.Tfont = '20px arial';
	this.alturaCampo = 20;
	this.curLeft = 0;
	this.linhaVertical = this.chaveMax * 10;
	this.linhaHorizontal = 15;

	var d = 0, w = 0;
	var ptr = this.raiz;
	while (!ptr.ehFolha()) 
	{
		ptr = ptr.ponteiroNo[0];
		d++;
	}
	this.contex.font = this.Tfont;
	while (true) 
	{
		for (var i = 0, len = ptr.valorChave.length; i < len; i++) 
		{
			w += this.contex.measureText(ptr.valorChave[i]).width + 4;
		}
		w += ((this.chaveMax - ptr.valorChave.length) * 9) + 1;
		if (ptr.folhaDir === null) break;
		ptr = ptr.folhaDir;
		w += this.linhaHorizontal;
	}

	this.canvas.width = w;
	this.canvas.height = this.altura(d) + this.alturaCampo + 20;
	this.contex.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.contex.font = this.Tfont;
	this.contex.lineWidth = 1;
	this.contex.strokeStyle = this.Pline;
};

//Método para retornar a altura calculada da árvore
arvore.prototype.altura = function (altura) 
{
	var oneRow = this.alturaCampo + 13 + this.linhaVertical;
	return (10 + (altura * oneRow));
};

//Método para desenhar os nós da árvore
arvore.prototype.desenhaNo = function (ptr, altura) 
{
	var ret = [];
	var y = this.altura(altura);
	if (ptr.ehFolha()) {
		ret[0] = this.curLeft;
		ret[1] = this.desenhaFolha(ptr, y);
		return ret;
	}
	var KL=[], KR=[];
	for (var i=0, len=ptr.ponteiroNo.length; i<len; i++) 
	{
		ret = this.desenhaNo(ptr.ponteiroNo[i], altura + 1);
		KL[i] = ret[0];
		KR[i] = ret[1];
	}

	var cA = this.contex;
	var h = this.alturaCampo;
	var x, p, xb, yb, w=0;
	for (var i = 0, len = ptr.valorChave.length; i < len; i++) 
	{
		w += cA.measureText(ptr.valorChave[i]).width + 4;
	}
	w += ((this.chaveMax - ptr.valorChave.length) * 10) + 1;
	x = Math.floor((KR[KR.length-1]-KL[0]-w)/2) + KL[0];
	ret[0] = x;
	ret[1] = x + w;

	yb = this.altura(altura + 1);
	cA.beginPath();
	for (var i = 0, len=this.chaveMax + 1; i < len; i++) 
	{
		w = (i >= ptr.valorChave.length) ? 6 : cA.measureText(ptr.valorChave[i]).width;
		cA.fillStyle = this.Nline;
		if (i < this.chaveMax)
			cA.fillRect(x, y, w+5, h+13);
		else
			cA.fillRect(x, y+h+5, w+5, 8);
		cA.fillStyle = this.Nfill;
		if (i < this.chaveMax)
			cA.fillRect(x+1, y+1, w+3, h+4);
		cA.fillRect(x+1, y+h+6, w+3, 6);
		if (i < ptr.valorChave.length) {
			cA.fillStyle = this.Tline;
			cA.fillText(ptr.valorChave[i],x+2,y+h+2);
		}
		if (i < ptr.ponteiroNo.length) {
			cA.fillStyle = this.Pfill;
			p = Math.floor((w-4)/2);
			cA.fillRect(x+p+2, y+h+8, 4, 4);
			xb = Math.floor((KR[i]-KL[i])/2) + KL[i];
			cA.moveTo(x+p+4, y+h+13);
			cA.lineTo(xb, yb);
		}
		x += w+4;
	}
	cA.stroke();
	return ret;
};

//Método para desenhar as folhas da árvore
arvore.prototype.desenhaFolha = function(ptr, y) 
{
	var cA = this.contex;
	var x = this.curLeft;
	var h = this.alturaCampo;
	var w;
	var sx = -1;
	for (var i = 0, len = this.chaveMax; i < len; i++) 
	{
		if (ptr !== null && ptr == this.folha && i == this.item) sx = x;
		w = (i >= ptr.valorChave.length) ? 5 : cA.measureText(ptr.valorChave[i]).width;
		cA.fillStyle = this.Lline;
		cA.fillRect(x, y, w+5, h + 10);
		cA.fillStyle = this.Lfill;
		cA.fillRect(x + 1, y + 1, w + 3, h + 8);
		x += w+4;
	}
	if (sx != -1) 
	{
		w = cA.measureText(ptr.valorChave[this.item]).width;
		cA.fillStyle = this.Cline;
		cA.fillRect(sx, y, w+5, h+10);
		cA.fillStyle = this.Cfill;
		cA.fillRect(sx+1, y+1, w+3, h+8);
	}
	cA.fillStyle = this.Tline;
	sx = this.curLeft;
	for (var i=0, len=ptr.valorChave.length; i<len; i++) 
	{
		w = cA.measureText(ptr.valorChave[i]).width;
		cA.fillText(ptr.valorChave[i],sx+2,y+h+4);
		sx += w+4;
	}
	this.curLeft = x+this.linhaHorizontal;
	return x;
};
