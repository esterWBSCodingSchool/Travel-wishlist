const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

let countries = [
    { id: 1, name: 'Afghanistan', alpha2Code: 'AF', alpha3Code: 'AFG', visited: false },
    { id: 2, name: 'Albania', alpha2Code: 'AL', alpha3Code: 'ALB', visited: false },
    { id: 3, name: 'Algeria', alpha2Code: 'DZ', alpha3Code: 'DZA', visited: false },
    { id: 4, name: 'American Samoa', alpha2Code: 'AS', alpha3Code: 'ASM', visited: false },
    { id: 5, name: 'Andorra', alpha2Code: 'AD', alpha3Code: 'AND', visited: false },
];

//Middleware
const validateData = [
    body('name').isString(),
    body('alpha2Code').isLength({ min: 2, max: 2 }),
    body('alpha3Code').isLength({ min: 3, max: 3 }),
]

const countryExists = (req, res, next) => {
    const code = req.params.code?.toUpperCase();
    const country = countries.find((country) => country.alpha2Code === code || country.alpha3Code === code)
    
    if (!country) {
        return res.status(404).json({ error: 'Country not found' })
    };

    const index = countries.findIndex((country) => country.alpha2Code === code || country.alpha3Code === code);

    req.country = country;
    req.index = index;
    next();
}



app.get('/api/countries', (req, res) => {
    let result = [...countries];

    if (req.query.sort?.toLocaleLowerCase() === 'true') {
        result = result.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (req.query.visited?.toLocaleLowerCase() === 'true') {
        result = result.filter((c) => c.visited);
    }

    res.json(result);
});


app.get('/api/countries/:code', countryExists, (req, res) => {
    console.log(req.country)
    res.json(req.country);
});

app.post('/api/countries', validateData, (req, res) => {
    const newCountry = {
        id: countries.length + 1,
        name: req.body.name,
        alpha2Code: req.body.alpha2Code.toUpperCase(),
        alpha3Code: req.body.alpha3Code.toUpperCase(),
        visited: req.body.visited || false,

    }

    countries.push(newCountry);
    res.status(201).json(newCountry);
});

app.put('/api/countries/:code', countryExists, (req, res) => {
    const updatedCountry = {
        id: req.country.id,
        name: req.body.name || req.country.name,
        alpha2Code: req.body.alpha2Code.toUpperCase() || req.country.alpha2Code,
        alpha3Code: req.body.alpha3Code.toUpperCase() || req.country.alpha3Code,
        visited: req.body.visited || req.country.visited,

    };
    countries[req.index] = updatedCountry;
    res.json(updatedCountry);
});

app.delete('/api/countries/:code', countryExists, (req, res) => {
    req.country.visited = !req.country.visited;
    countries[req.index] = req.country;
    res.json(req.country);
})

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}/api/countries`);
});
