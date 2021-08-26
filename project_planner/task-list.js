const task_list_id = "task-list"
const button_id = "add-to-list"
const storage_id = "list-items"
const text_box_id = "item-to-add"
const desc = "desc-area"
const desc_id = "desc_id"
const sep = ";"

function ReadData(id) {
    return localStorage.getItem(id) ? localStorage.getItem(id) : ""
}

function RemoveFromList(item) {
    const ol = document.getElementById(task_list_id)
    let index = 0

    for (let i of ol.childNodes) {
        if (i === item) {
            break
        }
        index++
    }

    ol.removeChild(item)
    Remove(index)
}

function Remove(index) {
    const items = Read(false)
    const save_items = []

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item && i !== index) {
            save_items.push(item)
        }
    }

    window.localStorage.setItem(storage_id, "")
    for (let i of save_items) {
        Save(i)
    }
}


function AddToList(item = undefined) {
    if (item === undefined) {
        const txt_box = document.getElementById(text_box_id)
        item = txt_box.value
        txt_box.value = ""
    }

    if (item.length > 0) {
        const li = document.createElement("li")
        li.innerText = item

        const rm_btn = document.createElement("button")
        rm_btn.innerText = "Remove item"
        rm_btn.style = "margin-left: 20px"
        rm_btn.onclick = () => { RemoveFromList(li) }

        const ol = document.getElementById(task_list_id)

        li.appendChild(rm_btn)
        ol.appendChild(li)
    }

    return item
}

function Save(item = undefined) {

    const storage = window.localStorage
    const data = ReadData(storage_id)
    let save_data

    if (data) {
        save_data = `${data}${sep}${item}`
    }
    else {
        save_data = item
    }

    storage.setItem(storage_id, save_data)

}

function Add(save = true, item = undefined) {
    if (item === undefined) {
        item = AddToList()
    }
    else {
        AddToList(item)
    }

    if (save && item.length > 0) {
        Save(item)
    }
}

function InitTextArea() {
    const txt = ReadData(desc_id)
    const txt_area = document.getElementById(desc)
    txt_area.value = txt
    txt_area.onchange = () => {
        const storage = window.localStorage
        storage.setItem(desc_id, txt_area.value)
    }
}

function Read(add_to_list) {
    const lis = ReadData(storage_id)
    const items = lis.split(sep)
    InitTextArea()
    
    if (lis.length > 0 && add_to_list) {
        for (let i of items) {
            Add(false, i)
        }
    }
    return items
}

Read(true)