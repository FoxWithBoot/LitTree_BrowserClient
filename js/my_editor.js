//Скрипт для работы с Editot.js

var url = 'http://127.0.0.1:8000/api/pages/'
//var url = 'http://127.0.0.1:8000/api/v1.0/pages/'
var url_block = 'http://127.0.0.1:8000/api/block/'
//var url_block = 'http://127.0.0.1:8000/api/v1.0/block/'
var data_for_editor = ''
var editor

var mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        console.log(mutation);
        if (mutation.type === "characterData") {
            page_id = location.hash.substr(1)
            xhr = new XMLHttpRequest()
            xhr.open('PUT', url + page_id + '/', true)
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({ 'title': mutation.target.data }))
            xhr.addEventListener('readystatechange', function () {
                if (xhr.readyState == 4) {
                    if (xhr.status != 200) {
                        alert(xhr.status + ': ' + xhr.statusText + '. ' + xhr.responseText); // пример вывода: 404: Not Found
                    } else {
                        //alert(xhr.responseText)
                    }
                }
            })
        }
    });
});
mutationObserver.observe(document.getElementById('page_title'), {
    //attributes: true,
    characterData: true,
    //childList: true,
    subtree: true,
    //attributeOldValue: true,
    //characterDataOldValue: true
});


class DataForEdit { // Класс описывающий данные, которые передаются в Editor
    constructor(time, blocks, version) {
        this.time = time
        this.blocks = blocks
        this.version = version
    }
}
class BlockEditor { // Класс описывающий блок для Editor
    constructor(id, type, data) {
        this.id = id
        this.type = type
        this.data = data
    }
}
class DataParagraph { // Класс описывающий блок обычного абзаца
    constructor(text, alignment) {
        this.text = text
        this.alignment = alignment
    }
}
class DataHeader { // Класс описывающий блок заголовка без выравнивания
    constructor(text, level) {
        this.text = text
        this.level = level
    }
}


class Block { // Класс описывающий блок, передаваемый серверу от Editor
    constructor(pre_block_id, id, type, content, next_block_id) {
        this.pre_block_id = pre_block_id
        this.id = id
        //this.is_start = is_start
        this.type = type
        this.content = content
        this.next_block_id = next_block_id
        //this.next_block = next_block
    }
}
class TypeParagraph { // Класс описывающий тип блока, который передается серверу
    constructor(type, alignment) {
        this.type = type
        this.alignment = alignment
    }
}
class TypeHeader { // Класс описывающий тип блока, который передается серверу
    constructor(type, level) {
        this.type = type
        this.level = level
    }
}

class MoveBlock { // Класс описывающий блок, который передвигается и передается серверу 
    constructor(new_pre_block_id, pre_block_id, block_id, next_block_id, new_next_block_id) {
        this.new_pre_block_id = new_pre_block_id
        this.pre_block_id = pre_block_id
        this.block_id = block_id
        this.next_block_id = next_block_id
        this.new_next_block_id = new_next_block_id
    }
}

function to_page(id, title) { // "Переход" (отрисовка новых данных) на страницу
    location.hash = id
    let xhr = new XMLHttpRequest()
    xhr.open('GET', url + id + '/', true)
    xhr.send()
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState == 4) {
            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText + '. ' + xhr.responseText);
            } else {
                document.getElementById('content').style.display = 'block'
                document.getElementById('page_title').innerText = ' ' + title
                let blocks = parsing_blocks_for_editor(JSON.parse(xhr.responseText).pages_content, new Array())
            /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Создание Editor.js>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
                try {
                    document.getElementById('editorjs').innerHTML = ''
                    editor = new EditorJS({
                        holderId: 'editorjs',
                        placeholder: 'Let`s write an awesome story!',
                        autofocus: true,
                        tools: {
                            header: Header,
                            list: List,
                            //delimiter: Delimiter,
                            paragraph: {
                                class: Paragraph,
                                inlineToolbar: true,
                            },
                            image: SimpleImage,
                        },
                        data: new DataForEdit(new Date().getTime, blocks, "2.25.0"),

                        onChange: (api, event) => {
                            /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<При изменении>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.>*/
                            console.log('Now I know that Editor\'s content changed!', event)
                            if (event.type === "block-added") add_block(api, event, id, title) //Добавли новый блок
                            if (event.type === "block-changed") change_block(api, event)
                            if (event.type === "block-moved") move_block(api, event)
                            if (event.type === "block-removed") delete_block(api, event)
                        } 
                    });

                    editor.isReady
                        .then(() => {
                            console.log("Editor.js is ready to work!");
                        })
                        .catch((reason) => {
                            console.log(`Editor.js initialization failed because of ${reason}`);
                        });

                } catch (reason) {
                    console.log(`Editor.js initialization failed because of ${reason}`);
                }
            }
        }
    })
}

function delete_block(api, event) { // Удаление блока
    let block_id = event.detail.target.id
    let block_index = event.detail.index

    let pre_block
    if (block_index > 0) pre_block = api.blocks.getBlockByIndex(block_index - 1)
    alert(pre_block)
    let next_block = api.blocks.getBlockByIndex(block_index)
    alert(next_block)
    let db = new MoveBlock(
        null,
        (pre_block) ? pre_block.id : null,
        block_id,
        (next_block) ? next_block.id : null,
        null)

    let xhr = new XMLHttpRequest();
    xhr.open('DELETE', url_block + block_id + '/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(db))
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState == 4) {
            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText + '. ' + xhr.responseText); 
            } else {
                //alert('GOOD')
            }
        }
    })
}

function move_block(api, event) { // Перемещение блока
    let pre_block
    if (event.detail.fromIndex > 0) pre_block = api.blocks.getBlockByIndex(event.detail.fromIndex - 1)
    if (event.detail.fromIndex > event.detail.toIndex) pre_block = api.blocks.getBlockByIndex(event.detail.fromIndex)
    let block = api.blocks.getById(event.detail.target.id)
    let next_block = api.blocks.getBlockByIndex(event.detail.fromIndex + 1)
    if (event.detail.fromIndex < event.detail.toIndex) next_block = api.blocks.getBlockByIndex(event.detail.fromIndex)
    let new_pre_block
    if (event.detail.toIndex>0) new_pre_block = api.blocks.getBlockByIndex(event.detail.toIndex - 1)
    let new_next_block = api.blocks.getBlockByIndex(event.detail.toIndex + 1)

    mb = new MoveBlock(
        (new_pre_block) ? new_pre_block.id : null,
        (pre_block) ? pre_block.id : null,
        block.id,
        (next_block) ? next_block.id : null,
        (new_next_block) ? new_next_block.id : null)

    let xhr = new XMLHttpRequest();
    xhr.open('PATCH', url_block + block.id + '/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(mb));
    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState == 4) {
            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText + '. ' + xhr.responseText);
            } else {
                //alert('GOOD')
            }
        }
    });
}

function change_block(api, event) { //Изменение блока
    let block_id = event.detail.target.id
    let block_index = event.detail.index
    let block = api.blocks.getById(block_id)

    let pre_block
    if (block_index > 0) pre_block = api.blocks.getBlockByIndex(block_index - 1)
    let next_block
    if (block_index < api.blocks.getBlocksCount() - 1) next_block = api.blocks.getBlockByIndex(block_index + 1)

    block.save().then((outputData) => {
        let xhr = new XMLHttpRequest();
        xhr.open('PUT', url_block + block_id + '/', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(parsing_block_from_editor(pre_block, outputData, next_block)))
        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState == 4) {
                if (xhr.status != 200) {
                    alert(xhr.status + ': ' + xhr.statusText + '. ' + xhr.responseText);
                } else {
                    //alert('GOOD')
                }
            }
        })
    })
}

function add_block(api, event, id, title) { //Добавление нового блока
    let new_block_id = event.detail.target.id
    let new_block_index = event.detail.index
    let new_block = api.blocks.getById(new_block_id)

    let old_pre_block
    if (new_block_index > 0) old_pre_block = api.blocks.getBlockByIndex(new_block_index - 1)
    let old_next_block
    if (new_block_index < api.blocks.getBlocksCount() - 1) old_next_block = api.blocks.getBlockByIndex(new_block_index + 1)

    new_block.save().then((outputData) => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url_block + id + '/', true)
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(parsing_block_from_editor(old_pre_block, outputData, old_next_block)))
        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState == 4) {
                if (xhr.status != 200) {
                    alert(xhr.status + ': ' + xhr.statusText + '. ' + xhr.responseText); // пример вывода: 404: Not Found
                } else {
                    to_page(id, title)
                }
            }
        })
    });
}

function parsing_blocks_for_editor(obj, blocks_arr) {
    if (obj[0]) {
        let data = ''
        if (obj[0].type.type === "header") { data = new DataHeader(obj[0].content, obj[0].type.level) }
        if (obj[0].type.type === "paragraph") { data = new DataParagraph(obj[0].content, obj[0].type.alignment) }
        let block = new BlockEditor(obj[0].id, obj[0].type.type, data)
        blocks_arr.push(block)
        blocks_arr = parsing_blocks_for_editor(obj[0].next_blocks, blocks_arr)
    }
    return blocks_arr
}
/*
function parsing_blocks_for_server(blocks_arr) {
    let type = ''
    let obj_arr = new Array()
    for (let i = 1; i < blocks_arr.length; i++) {

        if (blocks_arr[i - 1].type === "header") { type = new TypeHeader(blocks_arr[i - 1].type, blocks_arr[i - 1].data.level) }
        if (blocks_arr[i - 1].type === "paragraph") { type = new TypeHeader(blocks_arr[i - 1].type, blocks_arr[i - 1].data.alignment) }

        block = new Block(blocks_arr[i - 1].id, *is_start,* type, blocks_arr[i - 1].data.text, blocks_arr[i].id)
        obj_arr.push(block)
    }

    let p = blocks_arr.length - 1
    if (blocks_arr[p].type === "header") { type = new TypeHeader(blocks_arr[p].type, blocks_arr[p].data.level) }
    if (blocks_arr[p].type === "paragraph") { type = new TypeHeader(blocks_arr[p].type, blocks_arr[p].data.alignment) }
    obj_arr.push(new Block(blocks_arr[p].id, *false,* type, blocks_arr[p].data.text, ''))
    return obj_arr
}
*/
function parsing_block_from_editor(pre_block, block, next_block) {
    let type

    if (typeof block.id != "integer") block.id = -1
    if (pre_block) { if (typeof pre_block.id != "integer") pre_block.id = -1 }
    if (next_block) { if (typeof next_block.id != "integer") next_block.id = -1 }

    if (block.tool === "header") type = new TypeHeader(block.tool, block.data.level)
    if (block.tool === "paragraph") type = new TypeParagraph(block.tool, block.data.alignment)
    if (pre_block && next_block) return new Block(pre_block.id, block.id, type, block.data.text, next_block.id)
    if (pre_block && !next_block) return new Block(pre_block.id, block.id, type, block.data.text, null)
    if (!pre_block && next_block) return new Block(null, block.id, type, block.data.text, next_block.id)
    return new Block(null, block.id, type, block.data.text, null)
}