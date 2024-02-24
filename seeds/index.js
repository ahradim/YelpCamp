const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log('Connection opened');
    })
    .catch(err => {
        console.log(err);
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6591655cec0400623977b6d5',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minus quia exercitationem possimus voluptatibus repellat incidunt deserunt temporibus laboriosam cumque. Facere, autem? Tenetur odio obcaecati voluptas eligendi quis neque inventore facilis.',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/ddrvtm3r1/image/upload/v1704546789/YelpCamp/m6nkipctjeigqnnceyww.jpg',
                    filename: 'YelpCamp/m6nkipctjeigqnnceyww',
                },
                {
                    url: 'https://res.cloudinary.com/ddrvtm3r1/image/upload/v1704546778/YelpCamp/ox808a7kx37cfoo9o96v.jpg',
                    filename: 'YelpCamp/ox808a7kx37cfoo9o96v',
                }
            ],
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
});
