require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const immutable = require('immutable')

const app = express()
const port = 3000
const BASE_API_URL = "https://api.nasa.gov/mars-photos/api/v1/"

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

//https://api.nasa.gov/mars-photos/api/v1/manifests/curiosity?api_key=tM5cXiCcc0SYbFxyIepUWfQQGFebzO4EBnwacnCG
app.get('/rover/info', async (req, res) => {
    try {
        let info = await fetch(`${BASE_API_URL}manifests/${req.query.rover}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
            .then(data => {
                let lastThreeDatePhotos = data.photo_manifest.photos.slice(-1)
                data = Object.assign(data, {
                    photo_manifest: {
                        ...data.photo_manifest,
                        photos: lastThreeDatePhotos
                    }
                })
                return data
            })
        res.send({ info })
    } catch (err) {
        console.log('error:', err);
    }
})

//https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2022-07-23&page=1&api_key=tM5cXiCcc0SYbFxyIepUWfQQGFebzO4EBnwacnCG
app.get('/rover/photos', async (req, res) => {
    try {
        let images = await fetch(`${BASE_API_URL}rovers/${req.query.rover}/photos?earth_date=${req.query.date}&page=1&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
            .then(data => {
                let photos = data.photos
                let constructPhotos = photos.map(photo => ({id: photo.id, img_src: photo.img_src}))

                return constructPhotos;
            })
        res.send({ images })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))