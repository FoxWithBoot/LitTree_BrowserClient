// Скрипт для создания выпадающего списка страниц и работы с ним

var url = 'http://127.0.0.1:8000/api/pages/'
//var url = 'http://127.0.0.1:8000/api/v1.0/pages/'


    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true)
    xhr.send();
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState == 4) {
            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText + '. ' + xhr.responseText);
            } else {
                let subpages_list = JSON.parse(xhr.responseText)
                let asaid = document.getElementById("left-aside")
                var details = document.createElement("details")
                create_list(details, subpages_list.pages_tree)
                asaid.appendChild(details)
            }
        }
    })


function create_list(det, arr) {
    for (i in arr) {
        if (arr[i].subpages.length > 0) {
            let details = document.createElement('details')
            let sum = document.createElement('summary')
            add_a(sum, arr[i].id, arr[i].title)
            add_lit_menu(sum, arr[i].id, arr[i].title)

            details.appendChild(document.createElement('br'))
            details.appendChild(sum)

            create_list(details, arr[i].subpages)
            det.appendChild(details)
        } else {
            let p = document.createElement('p')
            add_a(p, arr[i].id, arr[i].title)
            add_lit_menu(p, arr[i].id, arr[i].title)

            det.appendChild(p)
        }
    }
}

function add_a(tag, id, title) {
    let a = document.createElement('a')
    a.innerText = title + ' '
    a.setAttribute('onclick', 'to_page(' + id + ', "' + title + '");')
    tag.appendChild(a)
}

function add_lit_menu(parent_tag, id, title) {
    let div = document.createElement('div')
    add_create_but(div, id)
    add_del_but(div, id, title)
    parent_tag.appendChild(div)
}

function add_del_but(tag, id, title) {
    let del_but = document.createElement('button')
    del_but.type = "button"
    del_but.className = "btn btn-secondary btn-sm"
    del_but.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16"><path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"></path></svg >'
    del_but.setAttribute('onclick', 'delete_page(' + id + ', "' + title + '");')
    del_but.setAttribute('style', 'display: inline-block;')
    tag.appendChild(del_but)
}

function add_create_but(tag, id) {
    let create_but = document.createElement('button')
    create_but.type = "button"
    create_but.className = "btn btn-secondary btn-sm"
    create_but.innerText = '+'
    create_but.setAttribute('onclick', 'create_page(' + id + ');')
    create_but.setAttribute('style', 'display: inline-block;')
    tag.appendChild(create_but)
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function delete_page(id, titel) {
    if (confirm("Удалить " + titel + " ?")) {
        let xhr = new XMLHttpRequest()
        xhr.open('DELETE', url + id + '/', true)
        xhr.send()
        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState == 4) {
                if (xhr.status != 200) {
                    alert(xhr.status + ': ' + xhr.statusText + '. ' + xhr.responseText); // пример вывода: 404: Not Found
                } else {
                    location.reload();
                }
            }
        })
    }
}

function create_page(parent) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({'parent': parent }))
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState == 4) {
            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText + '. ' + xhr.responseText); // пример вывода: 404: Not Found
            } else {
                location.reload();
            }
        }
    })
}
