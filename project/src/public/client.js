let store = Immutable.Map({
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    info: Immutable.Map({
        'curiosity': null,
        'opportunity': null,
        'spirit': null
    }),
    photos: Immutable.Map({
        'curiosity': null,
        'opportunity': null,
        'spirit': null
    })    
})
const BACK_END_URL = 'http://localhost:3000/';

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    store = state.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let { rovers, apod } = state

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const showTabsOfRovers = (rovers) => {
    let tabsHtml = `
        <div class="container">
            <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                    ${rovers.map((rover, i) => (`<button class="nav-link ${i == 0 ? 'active' : ''}" id="pills-${rover}-tab" data-bs-toggle="pill" data-bs-target="#pills-${rover}" type="button" role="tab" aria-controls="pills-${rover}" aria-selected="true">${rover}</button>`))}
                </li>
            </ul>
            <div class="tab-content" id="pills-tabContent">
                ${rovers.map((rover, i) => (`<div class="tab-pane fade show ${i == 0 ? 'active' : ''}" id="pills-${rover}" role="tabpanel" aria-labelledby="pills-${rover}-tab">${contentOfRover(rover)}</div>`))}
            </div>
        </div>
    `
    return tabsHtml
}

const contentOfRover = (rover) => {
    const {photo_manifest: {name, landing_date, launch_date, status, max_sol, max_date, total_photos}} = rover
    return (`
        <div class="container">
            <h3>${name} Information</h3>
            <p class="font-monospace">Landing Date: ${landing_date}</p>
            <p class="font-monospace">Launch Date: ${launch_date}</p>
            <p class="font-monospace">Current Status: ${status}</p>
            <p class="font-monospace">Latest Sent Date: ${max_date}</p>
        </div>
    `)
}


// ------------------------------------------------------  API CALLS

const getRoverInfo = (rover) => {
    return fetch(`${BACK_END_URL}rover/info?rover=${rover}`)
        .then(res => res.json())
        .then(data => {
            updateStore(store, store.toJS().info.set(rover.toLowerCase(), data.photo_manifest))
            return data;
        })
}

const getPhotos = (rover) => {
    console.log('earth date', store.toJS().info[rover].toJS().photos[0].earth_date)
    return fetch(`${BACK_END_URL}rover/photos?rover=${rover}&earth_date=${store.toJS().info[rover].toJS().photos[0].earth_date}`)
        .then(res => res.json())
        .then(data => {
            updateStore(store, store.get('photos').set(rover.toLowerCase(), Immutable.List(data)))
            return data;
        })
}

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`${BACK_END_URL}apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return data
}
