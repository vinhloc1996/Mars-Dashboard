let store = Immutable.Map({
  rovers: Immutable.List(["curiosity", "opportunity", "spirit"]),
  info: Immutable.Map({
    curiosity: null,
    opportunity: null,
    spirit: null,
  }),
  photos: Immutable.Map({
    curiosity: null,
    opportunity: null,
    spirit: null,
  }),
});
const BACK_END_URL = "http://localhost:3000/";

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (state, newState) => {
  store = state.merge(newState);
  // console.log(store);
  render(root, store);
};

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  let { rovers } = state.toJS();

  return `
        <div class="card text-center">
          ${showTabsOfRovers(rovers, renderImages)}
        </div>
    `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  const AllApiCalls = store
    .get("rovers")
    // .take(1)
    .map(
      (rover) => getRoverInfo(rover).then(() => getPhotos(rover))
    );
  Promise.all(AllApiCalls)
    .then(() => render(root, store))
});

// ------------------------------------------------------  COMPONENTS

const showTabsOfRovers = (rovers, renderImageFn) => {
  let tabsHtml = `
            <ul class="nav nav-tabs" id="nav-tab" role="tablist">
                <li class="nav-item" role="tab">
                    ${rovers.map(
                      (rover, i) => (
                        `<button class="nav-link text-capitalize ${
                          i == 0 ? "active" : ''
                        }" id="nav-${rover}-tab" data-bs-toggle="tab" data-bs-target="#nav-${rover}" type="button" role="tab" aria-controls="nav-${rover}" aria-selected="${i == 0 ? 'true' : 'false'}">${rover}</button>`)
                    ).join('')}
                </li>
            </ul>
            <div class="tab-content" id="nav-tabContent">
                ${rovers.map(
                  (rover, i) =>
                    (`<div class="tab-pane fade ${
                      i == 0 ? "show active" : ""
                    }" id="nav-${rover}" role="tabpanel" aria-labelledby="nav-${rover}-tab">${contentOfRover(rover)()}
                    ${renderImageFn(rover)}
                    </div>`)
                ).join('')}
            </div>
    `;
  return tabsHtml;
};

const contentOfRover = (rover) => {
  if (!store.get("info").get(rover)) {
    return () => (``);
  }
  const {
    name,
    landing_date,
    launch_date,
    status,
    max_sol,
    max_date,
    total_photos,
  } = store.get("info").get(rover).toObject();
  return (() => (`
        <div class="container">
            <h3>Rover ${name} Information</h3>
            <p class="font-monospace">Landing Date: ${landing_date}</p>
            <p class="font-monospace">Launch Date: ${launch_date}</p>
            <p class="font-monospace">Current Status: ${status}</p>
            <p class="font-monospace">Latest Sent Date: ${max_date}</p>
        </div>
    `));
};

const renderImages = (rover) => {
  const photoArray = store.get("photos").get(rover);
  return `
        <div class="container">
            ${renderRows(photoArray)}
        </div>
    `;
};

const renderRows = (photos) => {
  let html = "";
  photos?.map((photo, i, arr) => {
    if (i % 3 == 0) {
      html += `
                <div class="row">
                `;
    }

    html += `
            <div class="col-4"><img src="${photo.img_src}" class="img-thumbnail small" alt="Image of Rover - ${photo.id}"></div>
        `;

    if (i % 3 == 2 && i !== arr.size - 1) {
      html += `
                </div>
            `;
    }

    if (i === arr.size - 1) {
      html += `
                </div>
            `;
    }
  });
  return html;
};

// ------------------------------------------------------  API CALLS

const getRoverInfo = (rover) => {
  return fetch(`${BACK_END_URL}rover/info?rover=${rover}`)
    .then((res) => res.json())
    .then((data) => {
      let newstate = store
        .get("info")
        .set(rover, Immutable.Map({
          ...data["info"]["photo_manifest"],
          photos: Immutable.List(data["info"]["photo_manifest"]["photos"])
        }));
      let newInfo = store.set("info", newstate);
      updateStore(store, newInfo);
      return data;
    });
};

const getPhotos = (rover) => {
  let earth_date = store.get('info').get(rover)?.get('photos')?.get(0)?.earth_date
  if (!earth_date) {
    return;
  }
  
  return fetch(
    `${BACK_END_URL}rover/photos?rover=${rover}&date=${
      earth_date
    }`
  )
    .then((res) => res.json())
    .then((data) => {
      let newstate = store
        .get("photos")
        .set(rover, Immutable.List(data["images"]));
      let newPhotos = store.set("photos", newstate);
      updateStore(store, newPhotos);
      return data;
    });
};
