const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room, activeroom } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('showMessage', (ob) => {
    console.log(ob.text, ob.createdAt)
    const html = Mustache.render(messageTemplate, {
        user: ob.username,
        message: ob.text,
        createdAt: moment(ob.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('showLocationMessage', (ob) => {
    console.log(ob)
    const html = Mustache.render(locationMessageTemplate, {
        user: ob.username,
        url: ob.text,
        createdAt: moment(ob.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', (ob) => {
    const html = Mustache.render(sidebarTemplate, {
        room: ob.room,
        users: ob.users
    })
    document.getElementById('sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    $messageFormButton.setAttribute('disabled', 'disabled')
    e.preventDefault()
    const msg = e.target.elements.message.value
    socket.emit('sendMessagetoAll', msg, (error) => {
        $messageFormButton.removeAttribute('disabled', 'disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error) {
            alert('use of bad words not allowed!!')
            return console.log(error)
        }
        console.log('message sent!')
    })
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation)
        return console.log('Geolocation not supported!')
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit('sendingLocation', {
            lat: pos.coords.latitude,
            long: pos.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled', 'disabled')
            console.log('location shared!')
        })
    })
})

socket.emit('join', {
    username,
    room,
    activeroom
}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})