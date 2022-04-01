const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form'); // $.. is used just to signinfy that this dom element
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = document.querySelector('#send-message');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
// const {
//     username,
//     room
// } = qs.parse(location.search, {
//     ignoreQueryPrefix: true
// });

const username = location.search.substring(1).split('&')[0].split('=')[1];
const room = location.search.substring(1).split('&')[1].split('=')[1];
 
const autoScroll = () => {
    // New Message Element
    $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;
    
    // height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far Have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    // console.log($messages.scrollTop);

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;    // this code is for actually scrolling to bottom
    }

}

socket.on('message', (mssg) => { // listen for any message from server
    console.log(mssg);
    const html = Mustache.render(messageTemplate, {
        username : mssg.username,
        message: mssg.text,
        createdAt: moment(mssg.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html); // allows other html adjacet to selected element
    autoScroll();
})


socket.on('locationMessage', (location) => {
    console.log(location);
    const html = Mustache.render(locationMessageTemplate, {
        username : location.username,
        locationURL: location.url,
        createdAt: moment(location.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})


socket.on('roomdata', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room, users
    })
    document.querySelector('#sidebar').innerHTML = html;
}) 


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // disable form once clicked
    $messageForm.setAttribute('disabled', 'disabled');
    const message = e.target.elements.message.value;

    // sends this message to server, get acknowledment via callback
    socket.emit('sendMessage', message, (error) => {

        $messageForm.removeAttribute('disabled'); // enable back once work done
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }
        console.log('Message delivered');
    });
})


$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('GeoLocation not supported by your browser');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {

            $sendLocationButton.removeAttribute('disabled');
            console.log('Location Shared !');
        });
    })
})


socket.emit('join', {username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})