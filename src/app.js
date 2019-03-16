import express from 'express'

const app = express()

app.set("port", process.env.PORT || 3000);

app.all('*', (req, res) => {
    res.send('Hello, world!')
})

export default app