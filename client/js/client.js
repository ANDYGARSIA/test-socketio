var socket = io();
var gamelist = {};

document.addEventListener('DOMContentLoaded', init);

function init() {
    fetch('/api/gamelist')
        .then(response => response.json())
        .then(json => build(json))
        .then(() => {
            let path = window.location.pathname.replaceAll('/', '');
            console.log(path);
            if (Object.hasOwn(gamelist, path))
                document.querySelector('#gamelist a[data-name="' + path + '"]').click();
        });

    window.addEventListener('popstate', () => { window.location.href = window.location.href; });
}

function build(json) {
    console.log(json);

    gamelist = json;

    let lis = '';
    for (const prop in json) {
        lis += `<li><a data-name="${prop}" href="${json[prop].url}">${prop}</a></li>`;
    }

    document.body.innerHTML = `
        <header></header>
        <main>
            <div class="page gamelist current">
                <h1>Game Room</h1>
                <ul id="gamelist">${lis}</ul>
            </div>
            <div class="page game" id="game"></div>
        </main>
        <footer>
            <div id="status" class="status"><div>
        </footer>
    `;

    binds();

    fetch('/api/stats')
        .then(response => response.text())
        .then(text => document.querySelector('#status').innerText = text);
}

function binds() {
    document.querySelectorAll("#gamelist a").forEach(a => {
        a.addEventListener('click', start);
    })
}

function start(e) {
    e.preventDefault();

    let name = e.currentTarget.getAttribute('data-name');
    let href = e.currentTarget.getAttribute('href');
    console.log('start game ' + name);

    fetch('/api/start', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
            {
                name: name,
                sid: socket.id,
            }
        )
    })
        .then(() => {
            window.history.pushState('game', name, '/' + name);

            gamelist[name].css.forEach(css => { addCSS(href + '/' + css); });
            gamelist[name].js.forEach(js => { addScript(href + '/' + js); });

            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('current');
            })
            document.querySelector('.page.game').classList.add('current');

            fetch('/api/stats')
                .then(response => response.text())
                .then(text => document.querySelector('#status').innerText = text);
        });
}

function join(e) {
    e.preventDefault();

    let rid = e.currentTarget.getAttribute('data-room');
    let name = e.currentTarget.getAttribute('data-name');

    fetch('/api/join', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
            {
                sid: socket.id,
                rid: rid
            }
        )
    })
        .then(() => {
            gamelist[name].css.forEach(css => { addCSS(css); })
            gamelist[name].js.forEach(js => { addScript(js); })
        });
}

function addScript(src) {
    let s = document.createElement('script');
    s.setAttribute('src', src);
    s.setAttribute('type', 'module');

    document.body.appendChild(s);
}

function addCSS(href) {
    let link = document.createElement("link");
    link.href = href;
    link.type = "text/css";
    link.rel = "stylesheet";

    document.head.appendChild(link)
}