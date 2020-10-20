const electron = require('electron');
const path = require('path');
const url = require('url');
const pyshell = require('python-shell');

const { app } = electron;
const { BrowserWindow } = electron;

let mainWindow;
let packages = {
    args: ['click', 'Flask', 'itsdangerous', 'Jinja2', 'MarkupSafe', 'python-dotenv', 'Werkzeug', 'flask-cors', 'flask-mysql', 'pandas', 'pytrends', 'scipy', 'DateTime', 'waitress', 'gunicorn', 'recordtype']
}

function createWindow() {
    pyshell.PythonShell.run('../api/install_packages.py', packages, function(err, results) {
        if (err) console.log(err);
        else console.log(results);
    })

    pyshell.PythonShell.run('../api/api.py', {}, function(err, results) {
        if (err) console.log(err);
        else console.log(results);
    });

    const startUrl = process.env.DEV
        ? 'http://localhost:3000'
        : url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true,
        });
    mainWindow = new BrowserWindow();

    mainWindow.loadURL(startUrl);
    process.env.DEV && mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});