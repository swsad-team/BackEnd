import app from './app'

const server = app.listen(app.get('port'), () => {
    console.log(`App is running at port ${app.get('port')}`)
})