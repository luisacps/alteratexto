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
