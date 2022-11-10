let c = 0;
const f = document.querySelector('form');
f.addEventListener('submit', adicionarTarefa);

document.querySelector('#visualizarConcluidos').addEventListener('click', evento => {
    const estilo = document.querySelector('#oculto');
    estilo.disabled = !estilo.disabled;
});

function inputTexto (f) {
    const i = f.querySelector('input[type=text]');
    const txt = i.value;
    i.value = '';
    i.focus();
    return txt;
}

function inserirTarefa(evento) {
    evento.preventDefault();
    const texto = inputTexto(evento.target);
    if (texto == '') return;
    const t = novaTarefa(texto);
    document.querySelector('#lista').append(t);

    withDB(db => {
        let req = db.add({'texto': texto, 'feito': false});
        req.onsucess = evento => {
            t.setAtributte('id', `task-${evento.target.result}`);
        }
    })
}

function novaTarefa(texto) {
    const trf = document.createElement('p');
    trf.append(gerarCheckbox())
    trf.append(texto + " ");
    trf.append(criarLixeira());
        trf.append(criaEatualiza());
    return trf
}

function gerarCheckbox() {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type','checkbox');
    checkbox.addEventListener('click', salvarCheck);
    checkbox.addEventListener('click', estiloOculto);
    return checkbox;
}

function estiloOculto(evento) {
    if (evento.target.checked) {
        evento.target.parentNode.classList.add('oculto');
    }
    else {
        evento.target.parentNode.classList.remove('oculto');
    }
}

function salvarCheck(eventoCheckbox) {
    withDB(db => {
        let id = evento.eventoCheckbox.target.parentNode.id;
        let key = parseInt(id.slice(5));
        let r = db.get(key);
        r.onsucess = eventoReq => {
            let registrar = eventoReq.target.result;
            registrar['concluído'] = eventoCheckbox.target.checked;
            db.put(registrar, key)
        }
    })
}

function criarLixeira() {
    const lixo = document.createElement('span');
    lixo.classList.add('fa');
    lixo.classList.add('fa-trash-o');
    lixo.addEventListener('click', removerTarefa);
    return lixo;
}

function criaEatualiza() {
    const atualizar = document.createElement('span');
    atualizar.classList.add('fa');
    atualizar.classList.add('fa-trash-o');
    atualizar.addEventListener('click', atualizarTarefa);
    return atualizar;
}

function removerTarefa(evento) {
    const lix = evento.target;
    const tarefa = lix.parentNode;
    tarefa.remove();
    withDB(db => {
        let id = tarefa.id;
        let key = parseInt(id.slice(5));
        db.delete(parseInt(key));
    })
}

function atualizarTarefa(evento) {
    const at = evento.target;
    const tarefa = at.parentNode;
    const el = tarefa.firstElementChild;
    const texto = el.nextSibling.textContent;
    const b = document.getElementById('barraDigitacao');
    const form = document.querySelector('form')
    b.value = texto;
    if (con == 0) {
        const botao = document.createElement('button');
        botao.innerHTML = 'atualizar'
        botao.setAttribute('id','atualizar');
        botao.addEventListener('click', function() {
        atualizarBtn(tarefa)
        })
        form.after(botao);
        con = 1;
    }
}
