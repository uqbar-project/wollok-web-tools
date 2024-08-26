const parent = document.getElementById('game')

fetch('pepita.txt')
    .then(response => response.text())
    .then(content => ({ name: 'pepita.wlk', content }))
    .then(file => ({
        main: 'pepita', sources: [file], images: [], sounds: [
            { possiblePaths: ['musica.mp3'], url: './musica.mp3' }
        ]
    }))
    .then(project => new LocalGame(project).start(parent))
