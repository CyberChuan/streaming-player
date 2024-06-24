const express = require('express');
const {getNewLicense} = require('./license-calculator');
const app = express();

app.use(express.static('./'));
app.use(express.json({ type: 'application/json' }));

app.get('/', (req, res) => {
    res.redirect('./index.html')
});

// 用于 clearKey 的 license 计算
app.post('/license', (req, res) => {
    const newLicense = getNewLicense(req.body);
    res.send(newLicense)
});

const PORT = 80;
app.listen(PORT, () => {
    console.log('页面地址为 http://localhost')
});
