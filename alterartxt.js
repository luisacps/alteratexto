let con = 0;
const formulario = document.querySelector("form");
formulario.addEventListener("submit", insereTarefa);

document.querySelector("#mostraEscondeConcluidos").addEventListener( "click", evento => {
	const estilo = document.querySelector("#estiloOculto");
	estilo.disabled = !estilo.disabled;
});
function pegaTextoInput(formulario) {
    const input = formulario.querySelector("input[type=text]"); //"input[type=text]" modo CSS de pegar o texto do input
    const texto = input.value;
    input.value = "";
    input.focus();
    return texto;
}

function insereTarefa(evento) {
    evento.preventDefault();
    const texto = pegaTextoInput(evento.target);
    if (texto == "") return;
    const tarefa = novaTarefa(texto);
    document.querySelector("#lista").append(tarefa);
    // salva tarefa
    withDB(db => {
		let req = db.add({"texto": texto, "feito": false});
		req.onsuccess = evento => {
			tarefa.setAttribute('id', `task-${evento.target.result}`);
		}
    });
}

function novaTarefa(texto) {
	const tarefa = document.createElement("p");
    tarefa.append(criaCheckbox());
    tarefa.append(texto + " ");
    tarefa.append(criaLixeira());
	tarefa.append(criaAtualiza());
    return tarefa;
}

function criaCheckbox() {
    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.addEventListener("click", salvaChecagem);
    checkbox.addEventListener("click", atribuiEstiloOculto);
    return checkbox;
}

function atribuiEstiloOculto(evento) {
    if (evento.target.checked) {
		evento.target.parentNode.classList.add("oculto");
    } else {
        evento.target.parentNode.classList.remove("oculto");
    }
}

function salvaChecagem(eventoCheckbox) {
    withDB(db => {
        let id = eventoCheckbox.target.parentNode.id;
        let key = parseInt(id.slice(5));
        let req = db.get(key);
        req.onsuccess = eventoReq => {
            let registro = eventoReq.target.result;
            registro["feito"] = eventoCheckbox.target.checked;
            db.put(registro, key);
        }
    });
}

function criaLixeira() {
    const lixeira = document.createElement("span");
    lixeira.classList.add("fa");
    lixeira.classList.add("fa-trash-o");
    lixeira.addEventListener("click", removeTarefa);
    return lixeira;
}
function criaAtualiza() {
	const atualiza = document.createElement("span");
	atualiza.classList.add('fa');
	atualiza.classList.add('fa-refresh');
	atualiza.addEventListener('click', atualizaTarefa);
	return atualiza;
}
function removeTarefa(evento) {
    const lixeira = evento.target;
    const tarefa = lixeira.parentNode;
    tarefa.remove();
    withDB(db => {
        let id = tarefa.id;
        let key = parseInt(id.slice(5));
        db.delete(parseInt(key));
    });
}
function atualizaTarefa(evento) {
	const atualiza = evento.target;
	const tarefa = atualiza.parentNode;
	const elemento = tarefa.firstElementChild;
	const texto = elemento.nextSibling.textContent;
	const barra = document.getElementById('barraDigitar');
	const form = document.querySelector('form');
	barra.value = texto;
	if (con == 0) {
		const botao = document.createElement('button');
		botao.innerHTML = 'Atualizar';
		botao.setAttribute('id','atualizar');
		botao.addEventListener('click',function () {
		btnAtualiza(tarefa)
		});
		form.after(botao);
		con = 1;	
	}
	
}

function btnAtualiza (eventoAtualiza) {
	const barra = document.getElementById('barraDigitar')
	let tt = barra.value;
	let id = eventoAtualiza.id;
	texto = document.getElementById(id);
	a = texto.childNodes[1];
	a.textContent = tt + ' ';
	barra.value = '';
	barra.focus();
	withDB(db => {
        let key = parseInt(id.slice(5));
		let req = db.get(key);
        req.onsuccess = eventoReq => {
            let registro = eventoReq.target.result;
            registro["texto"] = tt;
            db.put(registro, key);
        }
	});
	g = document.getElementById('atualizar');
	g.remove();
	con = 0;
}

function withDB(callback) {
    let request = indexedDB.open("listaTarefas", 1);
    request.onerror = console.error;
    request.onsuccess = () => {
        let db = request.result;
        callback(getStore(db));
    }
    request.onupgradeneeded = () => {
        let db = request.result;
        db.createObjectStore("tarefas", {autoIncrement: true});
    }
	function getStore(db) {
		return db.transaction(["tarefas"], "readwrite").objectStore("tarefas");
    }
}

function carregaTarefas(db) {
    db.openCursor().onsuccess = evento => {
		let cursor = evento.target.result;
        if (cursor) {
            const tarefa = novaTarefa(cursor.value.texto);
            document.querySelector("#lista").append(tarefa);
            const id = cursor.key;
            tarefa.setAttribute("id", `task-${id}`);
            if (cursor.value.feito) {
				tarefa.firstElementChild.click();
            }
			cursor.continue();
        }
        }
}
